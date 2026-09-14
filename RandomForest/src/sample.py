import pandas as pd
import os

# ============================================================
# CHANGE THIS TO ONE OF YOUR CLEANED CSV FILES
# ============================================================

FILE_PATH = r"weather_common_final.csv"


# ============================================================
# READ ONLY 1000 ROWS
# ============================================================

df = pd.read_csv(
    FILE_PATH,
    nrows=1000,
    low_memory=False
)


# ============================================================
# BASIC INFORMATION
# ============================================================

print("\n" + "=" * 70)
print("DATASET INSPECTION")
print("=" * 70)

print("\nFile:")
print(FILE_PATH)

print("\nColumns:")
print(df.columns.tolist())

print("\nNumber of columns:")
print(len(df.columns))

print("\nSample size:")
print(len(df))


# ============================================================
# DATA TYPES
# ============================================================

print("\n" + "=" * 70)
print("DATA TYPES")
print("=" * 70)

print(df.dtypes)


# ============================================================
# FIRST 10 ROWS
# ============================================================

print("\n" + "=" * 70)
print("FIRST 10 ROWS")
print("=" * 70)

print(
    df.sample(10).to_string(index=False)
)


# ============================================================
# MISSING VALUES
# ============================================================

print("\n" + "=" * 70)
print("MISSING VALUES")
print("=" * 70)

print(
    df.isna().sum()
)


# ============================================================
# UNIQUE STATIONS
# ============================================================

if "station_id" in df.columns:

    print("\n" + "=" * 70)
    print("STATION INFORMATION")
    print("=" * 70)

    print(
        "Unique stations in sample:",
        df["station_name"].nunique()
    )

    print(
        "Stations:",
        df["station_name"].dropna().unique()
    )


# ============================================================
# TIMESTAMP INFORMATION
# ============================================================

if "timestamp" in df.columns:

    print("\n" + "=" * 70)
    print("TIMESTAMP INFORMATION")
    print("=" * 70)

    timestamp = pd.to_datetime(
        df["timestamp"],
        errors="coerce"
    )

    print("Minimum timestamp:")
    print(timestamp.min())

    print("\nMaximum timestamp:")
    print(timestamp.max())

    print("\nFirst 20 timestamps:")

    print(
        timestamp.head(20).to_string(
            index=False
        )
    )

    # Time difference
    time_diff = timestamp.diff().dropna()

    print("\nMost common time intervals:")

    print(
        time_diff
        .value_counts()
        .head(10)
    )


# ============================================================
# NUMERICAL SUMMARY
# ============================================================

numeric_columns = [

    "temperature_C",
    "dew_point_C",
    "relative_humidity_pct",
    "pressure_hPa",
    "elevation_m"

]

existing_numeric = [

    col for col in numeric_columns
    if col in df.columns

]

if existing_numeric:

    print("\n" + "=" * 70)
    print("NUMERICAL SUMMARY")
    print("=" * 70)

    print(
        df[existing_numeric].describe()
    )


# ============================================================
# REPORT TYPE
# ============================================================

if "report_type" in df.columns:

    print("\n" + "=" * 70)
    print("REPORT TYPES")
    print("=" * 70)

    print(
        df["report_type"]
        .value_counts()
        .head(20)
    )


# ============================================================
# PRESSURE SOURCE
# ============================================================

if "pressure_source" in df.columns:

    print("\n" + "=" * 70)
    print("PRESSURE SOURCES")
    print("=" * 70)

    print(
        df["pressure_source"]
        .value_counts(dropna=False)
    )


print("\n" + "=" * 70)
print("INSPECTION COMPLETED")
print("=" * 70)