import pandas as pd
from pathlib import Path


# ============================================================
# VAYUDRISHTY
# ENGINE 3 - ANOMALY INSPECTION
# ============================================================

INPUT_FILE = Path(
    "outputs/anomaly_results.csv"
)

OUTPUT_FILE = Path(
    "outputs/top_anomalies.csv"
)

TOP_N = 200


print("=" * 72)
print("VAYUDRISHTY - ENGINE 3")
print("ANOMALY INSPECTION")
print("=" * 72)

print()
print("Loading anomaly results...")

df = pd.read_csv(
    INPUT_FILE
)

print(
    f"Rows loaded: {len(df):,}"
)

print()


# ============================================================
# SELECT MOST SUSPICIOUS OBSERVATIONS
# ============================================================

top = df.nlargest(
    TOP_N,
    "anomaly_score"
).copy()


# ============================================================
# DISPLAY SUMMARY
# ============================================================

print("=" * 72)
print(f"TOP {TOP_N} MOST SUSPICIOUS OBSERVATIONS")
print("=" * 72)

display_columns = [
    "station_id",
    "station_name",
    "timestamp",
    "temperature_C",
    "dew_point_C",
    "relative_humidity_pct",
    "pressure_hPa",
    "anomaly_prediction",
    "anomaly_status",
    "anomaly_score"
]

print(
    top[display_columns]
    .to_string(index=False)
)


# ============================================================
# SAVE
# ============================================================

top[
    display_columns
].to_csv(
    OUTPUT_FILE,
    index=False
)


print()
print("=" * 72)

print(
    f"Saved top anomalies to:"
)

print(
    OUTPUT_FILE.resolve()
)

print("=" * 72)