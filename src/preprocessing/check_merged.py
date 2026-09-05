from pathlib import Path
import pandas as pd


# ============================================================
# VAYUDRISHTY - MERGED DATASET CHECK
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parent.parent

INPUT_FILE = PROJECT_ROOT / "data" / "merged" / "weather_merged.csv"


print("=" * 70)
print("VAYUDRISHTY MERGED DATASET CHECK")
print("=" * 70)

print(f"File: {INPUT_FILE}")
print()


# ------------------------------------------------------------
# Read the merged dataset
# ------------------------------------------------------------

df = pd.read_csv(
    INPUT_FILE,
    low_memory=False
)


# ------------------------------------------------------------
# Basic information
# ------------------------------------------------------------

print("BASIC INFORMATION")
print("-" * 70)

print(f"Rows    : {len(df):,}")
print(f"Columns : {len(df.columns)}")

print()


# ------------------------------------------------------------
# Column names
# ------------------------------------------------------------

print("COLUMNS")
print("-" * 70)

for column in df.columns:
    print(f"- {column}")

print()


# ------------------------------------------------------------
# Data types
# ------------------------------------------------------------

print("DATA TYPES")
print("-" * 70)

print(df.dtypes)

print()


# ------------------------------------------------------------
# Missing values
# ------------------------------------------------------------

print("MISSING VALUES")
print("-" * 70)

missing = df.isna().sum()

for column, count in missing.items():

    percentage = (count / len(df)) * 100

    print(
        f"{column:30s} "
        f"{count:12,} "
        f"({percentage:6.2f}%)"
    )

print()


# ------------------------------------------------------------
# Number of stations
# ------------------------------------------------------------

print("STATION INFORMATION")
print("-" * 70)

print(
    f"Unique stations: "
    f"{df['station_id'].nunique():,}"
)

print()


# ------------------------------------------------------------
# Date range
# ------------------------------------------------------------

print("TIME RANGE")
print("-" * 70)

df["timestamp"] = pd.to_datetime(
    df["timestamp"],
    errors="coerce"
)

print(f"Start: {df['timestamp'].min()}")
print(f"End  : {df['timestamp'].max()}")

print()


# ------------------------------------------------------------
# Duplicate rows
# ------------------------------------------------------------

print("DUPLICATES")
print("-" * 70)

duplicate_count = df.duplicated(
    subset=["station_id", "timestamp"]
).sum()

print(
    "Duplicate station/timestamp rows: "
    f"{duplicate_count:,}"
)

print()


# ------------------------------------------------------------
# Numeric summary
# ------------------------------------------------------------

print("NUMERIC SUMMARY")
print("-" * 70)

numeric_columns = [
    "latitude",
    "longitude",
    "elevation_m",
    "temperature_C",
    "dew_point_C",
    "pressure_hPa",
]

print(
    df[numeric_columns].describe().T
)

print()


# ------------------------------------------------------------
# Pressure sources
# ------------------------------------------------------------

print("PRESSURE SOURCES")
print("-" * 70)

print(
    df["pressure_source"]
    .value_counts(dropna=False)
)

print()


# ------------------------------------------------------------
# Sample rows
# ------------------------------------------------------------

print("FIRST 10 ROWS")
print("-" * 70)

print(
    df.head(10).to_string(index=False)
)

print()


print("=" * 70)
print("CHECK COMPLETE")
print("=" * 70)