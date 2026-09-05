import pandas as pd
import numpy as np
from pathlib import Path


# ============================================================
# VAYUDRISHTY
# ENGINE 1 - DATA QUALITY & VALIDATION ENGINE
# ============================================================

INPUT_FILE = Path(
    "data/cleaned/weather_common_final.csv"
)

OUTPUT_FILE = Path(
    "outputs/data_quality_report.csv"
)


# ============================================================
# CONFIGURATION
# ============================================================

# Reasonable physical limits for AWS weather observations.
TEMP_MIN = -90
TEMP_MAX = 60

DEW_MIN = -90
DEW_MAX = 60

PRESSURE_MIN = 800
PRESSURE_MAX = 1100

RH_MIN = 0
RH_MAX = 100


# ============================================================
# LOAD DATA
# ============================================================

print("=" * 70)
print("VAYUDRISHTY - ENGINE 1")
print("DATA QUALITY & VALIDATION ENGINE")
print("=" * 70)

print()
print(f"Input file: {INPUT_FILE}")
print()

if not INPUT_FILE.exists():
    print("ERROR: Input dataset was not found.")
    print()
    print("Expected:")
    print(INPUT_FILE.resolve())
    raise SystemExit(1)


print("Loading dataset...")

df = pd.read_csv(INPUT_FILE)

print("Dataset loaded successfully.")
print()


# ============================================================
# BASIC INFORMATION
# ============================================================

total_rows = len(df)

print("-" * 70)
print("BASIC DATASET INFORMATION")
print("-" * 70)

print(f"Total observations : {total_rows:,}")
print(f"Total columns      : {len(df.columns)}")
print(
    f"Unique stations    : "
    f"{df['station_id'].nunique():,}"
)

print()


# ============================================================
# TIMESTAMP VALIDATION
# ============================================================

print("-" * 70)
print("TIMESTAMP VALIDATION")
print("-" * 70)

df["timestamp"] = pd.to_datetime(
    df["timestamp"],
    errors="coerce"
)

invalid_timestamp = df["timestamp"].isna().sum()

print(
    f"Invalid timestamps : "
    f"{invalid_timestamp:,}"
)

print()


# ============================================================
# NUMERIC CONVERSION
# ============================================================

numeric_columns = [
    "latitude",
    "longitude",
    "elevation_m",
    "temperature_C",
    "dew_point_C",
    "relative_humidity_pct",
    "pressure_hPa"
]

for column in numeric_columns:

    df[column] = pd.to_numeric(
        df[column],
        errors="coerce"
    )


# ============================================================
# MISSING VALUE CHECK
# ============================================================

print("-" * 70)
print("MISSING VALUE CHECK")
print("-" * 70)

missing_counts = df.isna().sum()

missing_percentages = (
    missing_counts / total_rows * 100
)

for column in df.columns:

    print(
        f"{column:25s} : "
        f"{missing_counts[column]:10,} "
        f"({missing_percentages[column]:6.2f}%)"
    )

print()


# ============================================================
# TEMPERATURE VALIDATION
# ============================================================

invalid_temperature = (
    (df["temperature_C"] < TEMP_MIN)
    |
    (df["temperature_C"] > TEMP_MAX)
).sum()

print("-" * 70)
print("TEMPERATURE VALIDATION")
print("-" * 70)

print(
    f"Invalid temperature values : "
    f"{invalid_temperature:,}"
)

print()


# ============================================================
# DEW POINT VALIDATION
# ============================================================

invalid_dew_point = (
    (df["dew_point_C"] < DEW_MIN)
    |
    (df["dew_point_C"] > DEW_MAX)
).sum()

# Dew point should generally not exceed
# air temperature by a significant amount.

invalid_dew_relationship = (
    df["dew_point_C"].notna()
    &
    df["temperature_C"].notna()
    &
    (
        df["dew_point_C"]
        >
        df["temperature_C"] + 0.5
    )
).sum()

print("-" * 70)
print("DEW POINT VALIDATION")
print("-" * 70)

print(
    f"Invalid dew point values : "
    f"{invalid_dew_point:,}"
)

print(
    f"Dew point > temperature  : "
    f"{invalid_dew_relationship:,}"
)

print()


# ============================================================
# RELATIVE HUMIDITY VALIDATION
# ============================================================

invalid_rh = (
    (df["relative_humidity_pct"] < RH_MIN)
    |
    (df["relative_humidity_pct"] > RH_MAX)
).sum()

print("-" * 70)
print("RELATIVE HUMIDITY VALIDATION")
print("-" * 70)

print(
    f"Invalid RH values : "
    f"{invalid_rh:,}"
)

print()


# ============================================================
# PRESSURE VALIDATION
# ============================================================

invalid_pressure = (
    (df["pressure_hPa"] < PRESSURE_MIN)
    |
    (df["pressure_hPa"] > PRESSURE_MAX)
).sum()

print("-" * 70)
print("PRESSURE VALIDATION")
print("-" * 70)

print(
    f"Invalid pressure values : "
    f"{invalid_pressure:,}"
)

print()


# ============================================================
# LOCATION VALIDATION
# ============================================================

invalid_latitude = (
    (df["latitude"] < -90)
    |
    (df["latitude"] > 90)
).sum()

invalid_longitude = (
    (df["longitude"] < -180)
    |
    (df["longitude"] > 180)
).sum()

print("-" * 70)
print("LOCATION VALIDATION")
print("-" * 70)

print(
    f"Invalid latitude  : "
    f"{invalid_latitude:,}"
)

print(
    f"Invalid longitude : "
    f"{invalid_longitude:,}"
)

print()


# ============================================================
# DUPLICATE VALIDATION
# ============================================================

duplicate_rows = df.duplicated(
    subset=[
        "station_id",
        "timestamp"
    ]
).sum()

print("-" * 70)
print("DUPLICATE VALIDATION")
print("-" * 70)

print(
    f"Duplicate station/timestamp rows : "
    f"{duplicate_rows:,}"
)

print()


# ============================================================
# REPORT TYPE CHECK
# ============================================================

print("-" * 70)
print("REPORT TYPE DISTRIBUTION")
print("-" * 70)

print(
    df["report_type"]
    .value_counts(dropna=False)
    .to_string()
)

print()


# ============================================================
# PRESSURE SOURCE CHECK
# ============================================================

print("-" * 70)
print("PRESSURE SOURCE DISTRIBUTION")
print("-" * 70)

print(
    df["pressure_source"]
    .value_counts(dropna=False)
    .to_string()
)

print()


# ============================================================
# CREATE QUALITY FLAGS
# ============================================================

df["quality_timestamp"] = (
    df["timestamp"].notna()
)

df["quality_temperature"] = (
    df["temperature_C"].isna()
    |
    df["temperature_C"].between(
        TEMP_MIN,
        TEMP_MAX
    )
)

df["quality_dew_point"] = (
    df["dew_point_C"].isna()
    |
    df["dew_point_C"].between(
        DEW_MIN,
        DEW_MAX
    )
)

df["quality_rh"] = (
    df["relative_humidity_pct"].isna()
    |
    df["relative_humidity_pct"].between(
        RH_MIN,
        RH_MAX
    )
)

df["quality_pressure"] = (
    df["pressure_hPa"].isna()
    |
    df["pressure_hPa"].between(
        PRESSURE_MIN,
        PRESSURE_MAX
    )
)

df["quality_location"] = (
    df["latitude"].between(-90, 90)
    &
    df["longitude"].between(-180, 180)
)


# ============================================================
# OVERALL QUALITY STATUS
# ============================================================

quality_columns = [
    "quality_timestamp",
    "quality_temperature",
    "quality_dew_point",
    "quality_rh",
    "quality_pressure",
    "quality_location"
]

df["overall_quality"] = df[
    quality_columns
].all(axis=1)


# ============================================================
# QUALITY SUMMARY
# ============================================================

valid_rows = df["overall_quality"].sum()

invalid_rows = total_rows - valid_rows

quality_percentage = (
    valid_rows / total_rows * 100
)

print("-" * 70)
print("OVERALL DATA QUALITY")
print("-" * 70)

print(
    f"Quality-valid observations : "
    f"{valid_rows:,}"
)

print(
    f"Quality-review observations: "
    f"{invalid_rows:,}"
)

print(
    f"Quality-valid percentage   : "
    f"{quality_percentage:.2f}%"
)

print()


# ============================================================
# CREATE REPORT
# ============================================================

report = pd.DataFrame({

    "metric": [
        "total_observations",
        "unique_stations",
        "invalid_timestamps",
        "invalid_temperature",
        "invalid_dew_point",
        "dew_point_above_temperature",
        "invalid_relative_humidity",
        "invalid_pressure",
        "invalid_latitude",
        "invalid_longitude",
        "duplicate_station_timestamp",
        "quality_valid_observations",
        "quality_review_observations",
        "quality_valid_percentage"
    ],

    "value": [
        total_rows,
        df["station_id"].nunique(),
        invalid_timestamp,
        invalid_temperature,
        invalid_dew_point,
        invalid_dew_relationship,
        invalid_rh,
        invalid_pressure,
        invalid_latitude,
        invalid_longitude,
        duplicate_rows,
        valid_rows,
        invalid_rows,
        quality_percentage
    ]
})


# ============================================================
# SAVE REPORT
# ============================================================

OUTPUT_FILE.parent.mkdir(
    parents=True,
    exist_ok=True
)

report.to_csv(
    OUTPUT_FILE,
    index=False
)


# ============================================================
# FINAL RESULT
# ============================================================

print("=" * 70)
print("ENGINE 1 COMPLETE")
print("=" * 70)

print()
print("Data Quality & Validation Engine successfully executed.")

print()
print("Quality report:")
print(
    OUTPUT_FILE.resolve()
)

print()
print("=" * 70)