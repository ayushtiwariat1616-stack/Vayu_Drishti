import pandas as pd
import numpy as np

def audit_cleaned_dataset(filepath):
    print("1. Loading dataset with optimized memory types...")
    
    # Enforce memory-efficient data types
    optimized_dtypes = {
        'station_id': 'int64',
        'station_name': 'category', 
        'report_type': 'category',
        'pressure_source': 'category',
        'latitude': 'float32',
        'longitude': 'float32',
        'elevation_m': 'float32',
        'temperature_C': 'float32',
        'dew_point_C': 'float32',
        'relative_humidity_pct': 'float32',
        'pressure_hPa': 'float32'
    }
    
    df = pd.read_csv(
        filepath, 
        dtype=optimized_dtypes, 
        parse_dates=['timestamp']
    )
    
    print("\n--- GENERAL DATASET SHAPE ---")
    print(f"Total Rows: {len(df):,}")
    print(f"Total Columns: {len(df.columns)}")
    print(f"Memory Usage: {df.memory_usage(deep=True).sum() / 1024**2:.2f} MB")
    
    print("\n--- MISSING VALUES ---")
    missing_stats = df.isna().sum()
    print(missing_stats[missing_stats > 0])
    
    print("\n--- STATION STATISTICS ---")
    unique_stations = df['station_id'].nunique()
    print(f"Unique Stations: {unique_stations}")
    print("Top 5 stations by row count:")
    print(df['station_name'].value_counts().head(5))
    
    print("\n--- PRESSURE SOURCE DISTRIBUTION ---")
    print(df['pressure_source'].value_counts(dropna=False))
    
    print("\n--- NUMERICAL RANGES (Min to Max) ---")
    sensor_cols = ['temperature_C', 'dew_point_C', 'relative_humidity_pct', 'pressure_hPa', 'elevation_m']
    for col in sensor_cols:
        print(f"{col}: {df[col].min():.2f} to {df[col].max():.2f}")
        
    print("\n--- TEMPORAL & GAP ANALYSIS ---")
    # CRITICAL: Sort chronologically within each station
    df = df.sort_values(by=['station_id', 'timestamp']).reset_index(drop=True)
    
    # Calculate actual elapsed time between consecutive rows PER STATION
    df['time_gap_minutes'] = df.groupby('station_id')['timestamp'].diff().dt.total_seconds() / 60.0
    
    print("Most common sampling intervals (in minutes):")
    print(df['time_gap_minutes'].value_counts().head(10))
    
    print("\nTime Gap Statistics (Minutes):")
    print(f"Median gap: {df['time_gap_minutes'].median():.1f}")
    print(f"Mean gap: {df['time_gap_minutes'].mean():.1f}")
    print(f"Max gap: {df['time_gap_minutes'].max():.1f}")
    
    print("\nAudit complete. Awaiting results.")

# Execute the audit
# Replace with your actual file path if different
audit_cleaned_dataset('weather_common_final.csv')