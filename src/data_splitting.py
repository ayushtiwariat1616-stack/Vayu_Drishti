import pandas as pd

def split_chronological_data(input_path, train_path, test_path):
    print("1. Loading labeled dataset...")
    df = pd.read_pickle(input_path)
    
    print("2. Sorting chronologically by station to prevent time leakage...")
    df = df.sort_values(by=['station_id', 'timestamp'])
    
    print("3. Calculating chronological split point per station (80% Train, 20% Test)...")
    # Assign a row number to each reading within its specific station
    df['row_num'] = df.groupby('station_id').cumcount()
    # Count total rows for that specific station
    df['total_rows'] = df.groupby('station_id')['station_id'].transform('count')
    # Calculate the percentile of time that has passed for that station
    df['time_percentile'] = df['row_num'] / df['total_rows']
    
    print("4. Splitting the dataset...")
    # First 80% of time goes to Training
    train_df = df[df['time_percentile'] < 0.8].copy()
    # Final 20% of time goes to Testing (The unseen future)
    test_df = df[df['time_percentile'] >= 0.8].copy()
    
    # Drop the temporary calculation columns
    train_df = train_df.drop(columns=['row_num', 'total_rows', 'time_percentile'])
    test_df = test_df.drop(columns=['row_num', 'total_rows', 'time_percentile'])
    
    print(f"\n--- SPLIT RESULTS ---")
    print(f"Training Rows: {len(train_df):,} ({(len(train_df)/len(df))*100:.1f}%)")
    print(f"Testing Rows:  {len(test_df):,} ({(len(test_df)/len(df))*100:.1f}%)")
    
    print("\n5. Saving Train and Test datasets...")
    train_df.to_pickle(train_path)
    test_df.to_pickle(test_path)
    print("Success! Data is securely split without temporal leakage.")

# Execute
split_chronological_data(
    'vayudrishty_labeled_data.pkl', 
    'vayudrishty_train.pkl', 
    'vayudrishty_test.pkl'
)