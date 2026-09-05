import pandas as pd
from pathlib import Path


# ============================================================
# VAYUDRISHTY - FINAL DEDUPLICATION
# ============================================================

INPUT_FILE = Path("data/cleaned/weather_common_clean.csv")
OUTPUT_FILE = Path("data/cleaned/weather_common_final.csv")


print("=" * 70)
print("VAYUDRISHTY - FINAL DEDUPLICATION")
print("=" * 70)

print(f"Input : {INPUT_FILE}")
print(f"Output: {OUTPUT_FILE}")
print()


# ------------------------------------------------------------
# Load the common cleaned dataset
# ------------------------------------------------------------

df = pd.read_csv(INPUT_FILE)


# ------------------------------------------------------------
# Rows before deduplication
# ------------------------------------------------------------

rows_before = len(df)


# ------------------------------------------------------------
# Convert timestamp consistently
# ------------------------------------------------------------

df["timestamp"] = pd.to_datetime(
    df["timestamp"],
    errors="coerce"
)


# ------------------------------------------------------------
# Final duplicate removal
#
# Keep exactly ONE observation for each:
# station_id + timestamp
#
# FM-12 was already prioritized in the previous step.
# ------------------------------------------------------------

df = df.drop_duplicates(
    subset=[
        "station_id",
        "timestamp"
    ],
    keep="first"
)


# ------------------------------------------------------------
# Rows after deduplication
# ------------------------------------------------------------

rows_after = len(df)

rows_removed = (
    rows_before - rows_after
)


# ------------------------------------------------------------
# Final duplicate check
# ------------------------------------------------------------

remaining_duplicates = df.duplicated(
    subset=[
        "station_id",
        "timestamp"
    ]
).sum()


# ------------------------------------------------------------
# Save final common dataset
# ------------------------------------------------------------

df.to_csv(
    OUTPUT_FILE,
    index=False
)


# ============================================================
# FINAL REPORT
# ============================================================

print("=" * 70)
print("FINAL DEDUPLICATION COMPLETE")
print("=" * 70)

print(
    f"Rows before          : {rows_before:,}"
)

print(
    f"Rows after           : {rows_after:,}"
)

print(
    f"Rows removed         : {rows_removed:,}"
)

print(
    f"Remaining duplicates : "
    f"{remaining_duplicates:,}"
)

print()

print("Columns in final dataset:")
for column in df.columns:
    print(f"  - {column}")

print()

print("Final common dataset:")
print(OUTPUT_FILE.resolve())

print("=" * 70)