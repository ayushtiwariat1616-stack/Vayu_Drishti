import pandas as pd
import numpy as np

def inject_comprehensive_anomalies(input_path, output_path):
    print("1. Loading advanced feature dataset...")
    df = pd.read_pickle(input_path)
    
    df['anomaly_label'] = 'NORMAL'
    total_rows = len(df)
    np.random.seed(42) 
    
    # Allocating ~2% of data to each fault (Total ~18% anomalies, 82% normal)
    fault_size = int(total_rows * 0.02)
    shuffled_indices = np.random.permutation(total_rows)
    
    idx_spike = shuffled_indices[0 : fault_size]
    idx_drop  = shuffled_indices[fault_size : fault_size*2]
    idx_frozen = shuffled_indices[fault_size*2 : fault_size*3]
    idx_drift = shuffled_indices[fault_size*3 : fault_size*4]
    idx_bias  = shuffled_indices[fault_size*4 : fault_size*5]
    idx_noise = shuffled_indices[fault_size*5 : fault_size*6]
    idx_missing = shuffled_indices[fault_size*6 : fault_size*7]
    idx_comm  = shuffled_indices[fault_size*7 : fault_size*8]
    idx_multi = shuffled_indices[fault_size*8 : fault_size*9]

    print("2. Injecting SPIKE...")
    df.loc[idx_spike, 'anomaly_label'] = 'SPIKE'
    df.loc[idx_spike, 'temperature_C'] += 25.0
    df.loc[idx_spike, 'temperature_C_local_zscore'] = np.random.uniform(5.0, 10.0, size=fault_size)
    df.loc[idx_spike, 'rate_temperature_C_per_hr'] = np.random.uniform(20.0, 50.0, size=fault_size)

    print("3. Injecting DROP...")
    df.loc[idx_drop, 'anomaly_label'] = 'DROP'
    df.loc[idx_drop, 'station_pressure_hPa'] -= 40.0
    df.loc[idx_drop, 'station_pressure_hPa_local_zscore'] = np.random.uniform(-10.0, -5.0, size=fault_size)
    df.loc[idx_drop, 'rate_station_pressure_hPa_per_hr'] = np.random.uniform(-30.0, -50.0, size=fault_size)
    
    print("4. Injecting FROZEN_SENSOR...")
    df.loc[idx_frozen, 'anomaly_label'] = 'FROZEN_SENSOR'
    df.loc[idx_frozen, 'relative_humidity_pct_rolling_std_6h'] = 0.0
    df.loc[idx_frozen, 'is_frozen_relative_humidity_pct'] = 1
    df.loc[idx_frozen, 'rate_relative_humidity_pct_per_hr'] = 0.0

    print("5. Injecting DRIFT...")
    df.loc[idx_drift, 'anomaly_label'] = 'DRIFT'
    df.loc[idx_drift, 'temperature_C'] += 3.5
    df.loc[idx_drift, 'temperature_C_local_zscore'] = np.random.uniform(2.0, 4.0, size=fault_size)
    df.loc[idx_drift, 'rate_temperature_C_per_hr'] = np.random.uniform(0.5, 2.0, size=fault_size)

    print("6. Injecting BIAS...")
    df.loc[idx_bias, 'anomaly_label'] = 'BIAS'
    df.loc[idx_bias, 'station_pressure_hPa'] += 15.0
    df.loc[idx_bias, 'station_pressure_hPa_local_zscore'] = np.random.uniform(4.0, 7.0, size=fault_size)
    df.loc[idx_bias, 'rate_station_pressure_hPa_per_hr'] = np.random.uniform(-0.1, 0.1, size=fault_size)

    print("7. Injecting NOISE...")
    df.loc[idx_noise, 'anomaly_label'] = 'NOISE'
    df.loc[idx_noise, 'relative_humidity_pct_rolling_std_6h'] = np.random.uniform(20.0, 40.0, size=fault_size)
    df.loc[idx_noise, 'rate_relative_humidity_pct_per_hr'] = np.random.uniform(50.0, 100.0, size=fault_size)

    print("8. Injecting MISSING_DATA (Fixing NaNs for Scikit-Learn)...")
    df.loc[idx_missing, 'anomaly_label'] = 'MISSING_DATA'
    df.loc[idx_missing, 'is_temp_missing'] = 1
    df.loc[idx_missing, 'temperature_C'] = -9999.0 # RF safe sentinel
    df.loc[idx_missing, 'temperature_C_local_zscore'] = 0.0 
    df.loc[idx_missing, 'is_large_time_gap'] = 0 

    print("9. Injecting COMMUNICATION_ERROR...")
    df.loc[idx_comm, 'anomaly_label'] = 'COMMUNICATION_ERROR'
    df.loc[idx_comm, 'time_gap_minutes'] = np.random.uniform(720, 2880, size=fault_size)
    df.loc[idx_comm, 'is_large_time_gap'] = 1

    print("10. Injecting MULTIVARIATE_FAULT...")
    df.loc[idx_multi, 'anomaly_label'] = 'MULTIVARIATE_FAULT'
    df.loc[idx_multi, 'relative_humidity_pct'] = 20.0
    df.loc[idx_multi, 'dew_point_depression'] = np.random.uniform(-15.0, -5.0, size=fault_size)

    print("\n--- CLASS DISTRIBUTION ---")
    print(df['anomaly_label'].value_counts())

    print("\n11. Final NaN cleanup for Scikit-Learn...")
    # Any genuinely missing historical data needs a sentinel too, or model.fit() will fail
    df = df.fillna(-9999.0)

    print("12. Saving labeled dataset for Random Forest...")
    df.to_pickle(output_path)
    print(f"Success! Labeled data saved to {output_path}")

# Execute
inject_comprehensive_anomalies('vayudrishty_features_final.pkl', 'vayudrishty_labeled_data.pkl')