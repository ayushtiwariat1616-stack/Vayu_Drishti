import pandas as pd
import numpy as np

def build_temporal_features(input_path, output_path):
    print("1. Loading dataset...")
    df = pd.read_csv(
        input_path, 
        dtype={'station_id': 'int64', 'elevation_m': 'float32', 'temperature_C': 'float32', 
               'relative_humidity_pct': 'float32', 'pressure_hPa': 'float32'},
        parse_dates=['timestamp']
    )
    
    print("2. Fixing sentinels and estimating Station Pressure...")
    # Replace the NOAA sentinel value for elevation
    df['elevation_m'] = df['elevation_m'].replace(-999.9, np.nan)
    
    # Barometric conversion: SLP to Station Pressure (STP)
    # Formula: STP = SLP * (1 - (0.0065 * elevation) / (Temp + 273.15)) ^ 5.2561
    kelvin = df['temperature_C'] + 273.15
    lapse_rate = 0.0065
    
    # Only calculate where we have SLP, Temperature, and valid elevation
    valid_mask = df['pressure_hPa'].notna() & df['temperature_C'].notna() & df['elevation_m'].notna()
    df['station_pressure_hPa'] = np.nan
    df.loc[valid_mask, 'station_pressure_hPa'] = df.loc[valid_mask, 'pressure_hPa'] * (
        1 - (lapse_rate * df.loc[valid_mask, 'elevation_m']) / kelvin[valid_mask]
    ) ** 5.2561
    
    print("3. Sorting chronologically per station...")
    df = df.sort_values(by=['station_id', 'timestamp']).reset_index(drop=True)
    
    print("4. Generating Time Gaps and Missing Flags...")
    # Actual elapsed time in minutes
    df['time_gap_minutes'] = df.groupby('station_id')['timestamp'].diff().dt.total_seconds() / 60.0
    
    # Missing flags (Crucial for detecting COMMUNICATION_ERROR)
    df['is_pressure_missing'] = df['station_pressure_hPa'].isna().astype(int)
    df['is_temp_missing'] = df['temperature_C'].isna().astype(int)
    df['is_rh_missing'] = df['relative_humidity_pct'].isna().astype(int)
    
    # Flag large gaps (> 6 hours) to prevent bad rolling feature calculations later
    df['is_large_time_gap'] = (df['time_gap_minutes'] > 360).astype(int)
    
    print("5. Generating Station-Wise Rate of Change Features...")
    sensor_cols = ['temperature_C', 'relative_humidity_pct', 'station_pressure_hPa']
    
    for col in sensor_cols:
        # Step-change from previous observation
        df[f'delta_{col}'] = df.groupby('station_id')[col].diff()
        
        # True Rate of Change: Units per Hour
        # (Added 1e-5 to prevent division-by-zero on duplicate timestamps)
        df[f'rate_{col}_per_hr'] = (df[f'delta_{col}'] / (df['time_gap_minutes'] + 1e-5)) * 60.0
        
        # If there's a huge gap (e.g., 5 years), the delta and rate are meteorologically meaningless
        df.loc[df['is_large_time_gap'] == 1, f'delta_{col}'] = np.nan
        df.loc[df['is_large_time_gap'] == 1, f'rate_{col}_per_hr'] = np.nan

    print("6. Saving checkpoint dataset...")
    df.to_pickle(output_path) # Pickle is ~5x faster to read/write than CSV and preserves datetime types
    print(f"Success! Temporal features engineered. Dataset saved to {output_path}")

# Execute
build_temporal_features('weather_common_final.csv', 'vayudrishty_features_step1.pkl')