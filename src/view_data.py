import pandas as pd

print("Loading pickle file...")
df = pd.read_pickle('vayudrishty_features_final.pkl')

print("\n--- DATASET OVERVIEW ---")
df.info()

print("\n--- FIRST 5 ROWS ---")
# Set pandas options to show all columns in the terminal
pd.set_option('display.max_columns', None)
print(df.head())

print("\n--- SAVING SAMPLE ---")
# Save just the first 1,000 rows to a CSV so you can click and open it in VS Code
sample_path = 'features_sample_view.csv'
df.head(1000).to_csv(sample_path, index=False)
print(f"Saved a 1,000-row sample to {sample_path}.")
print("You can now open this CSV file directly in VS Code to see all your new features!")