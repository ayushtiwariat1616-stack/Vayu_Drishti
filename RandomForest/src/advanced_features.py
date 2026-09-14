import pandas as pd
import numpy as np

def build_advanced_features(input_path, output_path):
    print("1. Loading base feature dataset...")
    df = pd.read_pickle(input_path)
    
    # CRITICAL: Pandas time-based rolling windows require a datetime index
    df = df.set_index('timestamp')
    
    print("2. Calculating Time-Aware Rolling Features (24h and 6h windows)...")
    sensor_cols = ['temperature_C', 'relative_humidity_pct', 'station_pressure_hPa']
    
    for col in sensor_cols:
        print(f"   -> Processing {col}...")
        
        # Group by station, then apply time-based rolling windows
        # min_periods=2 means we need at least 2 readings in the window to calculate a std deviation
        # UPDATED: Using lowercase 'h' for Pandas 2.2+ compatibility
        rolling_24h = df.groupby('station_id')[col].rolling('24h', min_periods=2)
        rolling_6h = df.groupby('station_id')[col].rolling('6h', min_periods=2)
        
        # Rolling means and standard deviations
        df[f'{col}_rolling_mean_24h'] = rolling_24h.mean().reset_index(level=0, drop=True)
        df[f'{col}_rolling_std_24h'] = rolling_24h.std().reset_index(level=0, drop=True)
        df[f'{col}_rolling_std_6h'] = rolling_6h.std().reset_index(level=0, drop=True)
        
        # Local Statistical Features (Z-Score)
        df[f'{col}_local_zscore'] = (df[col] - df[f'{col}_rolling_mean_24h']) / (df[f'{col}_rolling_std_24h'] + 1e-5)
        
        # Sensor Behavior (Frozen Sensor Indicator)
        df[f'is_frozen_{col}'] = (df[f'{col}_rolling_std_6h'] < 1e-4).astype(int)

    print("3. Generating Multivariate Consistency Features...")
    # Dew Point Depression: Temperature should logically be >= Dew Point. 
    df['dew_point_depression'] = df['temperature_C'] - df['dew_point_C']
    
    print("4. Resetting index and cleaning up...")
    df = df.reset_index()
    
    print("5. Saving final feature dataset...")
    df.to_pickle(output_path)
    print(f"Success! Advanced features engineered. Dataset saved to {output_path}")

# Execute
build_advanced_features('vayudrishty_features_step1.pkl', 'vayudrishty_features_final.pkl')