import pandas as pd
import numpy as np
from pathlib import Path


# ============================================================
# VAYUDRISHTY - DATA QUALITY CLEANING
# ============================================================

INPUT_FILE = Path("data/merged/weather_merged.csv")
OUTPUT_FILE = Path("data/cleaned/weather_cleaned.csv")

CHUNK_SIZE = 100_000


# ------------------------------------------------------------
# Relative Humidity calculation
# ------------------------------------------------------------
def calculate_relative_humidity(temperature, dew_point):

    a = 17.625
    b = 243.04

    rh = 100 * np.exp(
        (a * dew_point) / (b + dew_point)
        - (a * temperature) / (b + temperature)
    )

    return rh.clip(0, 100)


# ------------------------------------------------------------
# Create output directory
# ------------------------------------------------------------
OUTPUT_FILE.parent.mkdir(
    parents=True,
    exist_ok=True
)


# ------------------------------------------------------------
# Remove previous cleaned file
# ------------------------------------------------------------
if OUTPUT_FILE.exists():
    OUTPUT_FILE.unlink()


print("=" * 70)
print("VAYUDRISHTY - QUALITY CLEANING")
print("=" * 70)

print(f"Input : {INPUT_FILE}")
print(f"Output: {OUTPUT_FILE}")
print()


# ------------------------------------------------------------
# Statistics
# ------------------------------------------------------------
total_rows = 0
invalid_temperature = 0
invalid_dew_point = 0
invalid_pressure = 0
duplicate_rows = 0
written_rows = 0

first_chunk = True


# ------------------------------------------------------------
# Process CSV in chunks
# ------------------------------------------------------------
for chunk_number, chunk in enumerate(
    pd.read_csv(
        INPUT_FILE,
        chunksize=CHUNK_SIZE
    ),
    start=1
):

    print(
        f"Processing chunk {chunk_number}...",
        end="\r"
    )

    total_rows += len(chunk)

    # --------------------------------------------------------
    # Convert timestamp
    # --------------------------------------------------------
    chunk["timestamp"] = pd.to_datetime(
        chunk["timestamp"],
        errors="coerce"
    )

    # --------------------------------------------------------
    # Convert numeric columns
    # --------------------------------------------------------
    numeric_columns = [
        "latitude",
        "longitude",
        "elevation_m",
        "temperature_C",
        "dew_point_C",
        "pressure_hPa"
    ]

    for column in numeric_columns:

        chunk[column] = pd.to_numeric(
            chunk[column],
            errors="coerce"
        )

    # --------------------------------------------------------
    # Invalid temperature
    # --------------------------------------------------------
    invalid_temp_mask = (
        (chunk["temperature_C"] < -90) |
        (chunk["temperature_C"] > 60)
    )

    invalid_temperature += int(
        invalid_temp_mask.sum()
    )

    chunk.loc[
        invalid_temp_mask,
        "temperature_C"
    ] = np.nan

    # --------------------------------------------------------
    # Invalid dew point
    # --------------------------------------------------------
    invalid_dew_mask = (
        (chunk["dew_point_C"] < -90) |
        (chunk["dew_point_C"] > 60)
    )

    invalid_dew_point += int(
        invalid_dew_mask.sum()
    )

    chunk.loc[
        invalid_dew_mask,
        "dew_point_C"
    ] = np.nan

    # --------------------------------------------------------
    # Invalid pressure
    # --------------------------------------------------------
    invalid_pressure_mask = (
        (chunk["pressure_hPa"] <= 0) |
        (chunk["pressure_hPa"] > 1100)
    )

    invalid_pressure += int(
        invalid_pressure_mask.sum()
    )

    chunk.loc[
        invalid_pressure_mask,
        "pressure_hPa"
    ] = np.nan

    # --------------------------------------------------------
    # Dew point should not be significantly greater
    # than temperature.
    # --------------------------------------------------------
    invalid_dew_relation = (
        chunk["dew_point_C"].notna()
        &
        chunk["temperature_C"].notna()
        &
        (
            chunk["dew_point_C"]
            >
            chunk["temperature_C"] + 0.5
        )
    )

    chunk.loc[
        invalid_dew_relation,
        "dew_point_C"
    ] = np.nan

    # --------------------------------------------------------
    # Calculate Relative Humidity
    # --------------------------------------------------------
    valid_rh_mask = (
        chunk["temperature_C"].notna()
        &
        chunk["dew_point_C"].notna()
    )

    chunk["relative_humidity_pct"] = np.nan

    chunk.loc[
        valid_rh_mask,
        "relative_humidity_pct"
    ] = calculate_relative_humidity(
        chunk.loc[
            valid_rh_mask,
            "temperature_C"
        ],
        chunk.loc[
            valid_rh_mask,
            "dew_point_C"
        ]
    )

    # --------------------------------------------------------
    # Remove exact duplicate records inside this chunk
    # --------------------------------------------------------
    before_duplicates = len(chunk)

    chunk = chunk.drop_duplicates()

    duplicate_rows += (
        before_duplicates - len(chunk)
    )

    # --------------------------------------------------------
    # Remove rows with invalid timestamps
    # --------------------------------------------------------
    chunk = chunk.dropna(
        subset=["timestamp"]
    )

    # --------------------------------------------------------
    # IMPORTANT:
    # Preserve station_name / original NAME information
    # --------------------------------------------------------
    desired_columns = [
        "station_id",
        "station_name",
        "timestamp",
        "latitude",
        "longitude",
        "elevation_m",
        "report_type",
        "temperature_C",
        "dew_point_C",
        "relative_humidity_pct",
        "pressure_hPa",
        "pressure_source"
    ]

    chunk = chunk[desired_columns]

    # --------------------------------------------------------
    # Write chunk
    # --------------------------------------------------------
    chunk.to_csv(
        OUTPUT_FILE,
        mode="w" if first_chunk else "a",
        header=first_chunk,
        index=False
    )

    first_chunk = False

    written_rows += len(chunk)


# ============================================================
# COMPLETE
# ============================================================

print()
print()

print("=" * 70)
print("QUALITY CLEANING COMPLETE")
print("=" * 70)

print(
    f"Rows read               : {total_rows:,}"
)

print(
    f"Rows written            : {written_rows:,}"
)

print(
    f"Invalid temperature     : {invalid_temperature:,}"
)

print(
    f"Invalid dew point       : {invalid_dew_point:,}"
)

print(
    f"Invalid pressure        : {invalid_pressure:,}"
)

print(
    f"Exact duplicates removed: {duplicate_rows:,}"
)

print()
print("Output:")
print(OUTPUT_FILE.resolve())

print("=" * 70)