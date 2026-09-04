import pandas as pd
import numpy as np
from pathlib import Path


# ============================================================
# VAYUDRISHTY - MERGE NOAA WEATHER DATA
# ============================================================

RAW_DIR = Path("data/raw")
OUTPUT_FILE = Path("data/merged/weather_merged.csv")

# Process one CSV at a time
OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)


# ============================================================
# NOAA decoding functions
# ============================================================

def decode_temperature(value):
    """
    Decode NOAA TMP/DEW values.

    Example:
        +0250,1 -> 25.0 C
        -0030,1 -> -3.0 C
        99999,9 -> missing
    """

    if pd.isna(value):
        return np.nan

    try:
        text = str(value).strip()

        if not text:
            return np.nan

        # Take the main value before quality flag
        raw = text.split(",")[0]

        value_num = int(raw)

        # NOAA missing/invalid values
        if value_num >= 90000 or value_num <= -90000:
            return np.nan

        # NOAA temperature is reported in tenths of degrees C
        temperature = value_num / 10.0

        # Additional protection against invalid values
        if temperature < -90 or temperature > 60:
            return np.nan

        return temperature

    except Exception:
        return np.nan


def decode_pressure(value):
    """
    Decode NOAA pressure values.

    Example:
        10170,1 -> 1017.0 hPa
        99999,9 -> missing
    """

    if pd.isna(value):
        return np.nan

    try:
        text = str(value).strip()

        if not text:
            return np.nan

        raw = text.split(",")[0]

        value_num = int(raw)

        # NOAA missing pressure
        if value_num >= 99990:
            return np.nan

        pressure = value_num / 10.0

        # Basic physical validation
        if pressure <= 0 or pressure >= 1200:
            return np.nan

        return pressure

    except Exception:
        return np.nan


# ============================================================
# Find all CSV files
# ============================================================

csv_files = sorted(RAW_DIR.rglob("*.csv"))

print("=" * 70)
print("VAYUDRISHTY - MERGING DATA")
print("=" * 70)

print(f"Files found: {len(csv_files):,}")
print()


# ============================================================
# Remove previous merged file
# ============================================================

if OUTPUT_FILE.exists():
    OUTPUT_FILE.unlink()


# ============================================================
# Statistics
# ============================================================

files_processed = 0
rows_read = 0
rows_written = 0
failed_files = []

first_file = True


# ============================================================
# Process each CSV
# ============================================================

for file_path in csv_files:

    try:

        # ------------------------------------------------------
        # Read only required columns
        # ------------------------------------------------------

        df = pd.read_csv(
            file_path,
            usecols=lambda column: column in {
                "STATION",
                "DATE",
                "NAME",
                "LATITUDE",
                "LONGITUDE",
                "ELEVATION",
                "REPORT_TYPE",
                "TMP",
                "DEW",
                "STP",
                "SLP"
            },
            low_memory=False
        )

        rows_read += len(df)

        # ------------------------------------------------------
        # Make sure required columns exist
        # ------------------------------------------------------

        required_columns = [
            "STATION",
            "DATE",
            "NAME",
            "LATITUDE",
            "LONGITUDE",
            "ELEVATION",
            "REPORT_TYPE",
            "TMP",
            "DEW"
        ]

        for column in required_columns:
            if column not in df.columns:
                df[column] = np.nan

        # ------------------------------------------------------
        # Timestamp
        # ------------------------------------------------------

        timestamp = pd.to_datetime(
            df["DATE"],
            errors="coerce"
        )

        # ------------------------------------------------------
        # Temperature
        # ------------------------------------------------------

        temperature = df["TMP"].apply(
            decode_temperature
        )

        # ------------------------------------------------------
        # Dew point
        # ------------------------------------------------------

        dew_point = df["DEW"].apply(
            decode_temperature
        )

        # ------------------------------------------------------
        # Pressure
        #
        # Prefer STP if available.
        # Otherwise use SLP.
        # ------------------------------------------------------

        if "STP" in df.columns:

            station_pressure = df["STP"].apply(
                decode_pressure
            )

        else:

            station_pressure = pd.Series(
                np.nan,
                index=df.index
            )

        if "SLP" in df.columns:

            sea_level_pressure = df["SLP"].apply(
                decode_pressure
            )

        else:

            sea_level_pressure = pd.Series(
                np.nan,
                index=df.index
            )

        # Start with STP
        pressure = station_pressure.copy()

        pressure_source = pd.Series(
            np.where(
                station_pressure.notna(),
                "STP",
                np.where(
                    sea_level_pressure.notna(),
                    "SLP",
                    "missing"
                )
            ),
            index=df.index
        )

        # Where STP is missing, use SLP
        pressure = pressure.fillna(
            sea_level_pressure
        )

        # ------------------------------------------------------
        # Create standardized output
        # ------------------------------------------------------

        output_df = pd.DataFrame({

            "station_id": df["STATION"],

            # PRESERVE NOAA PLACE/STATION NAME
            "station_name": df["NAME"],

            "timestamp": timestamp,

            "latitude": pd.to_numeric(
                df["LATITUDE"],
                errors="coerce"
            ),

            "longitude": pd.to_numeric(
                df["LONGITUDE"],
                errors="coerce"
            ),

            "elevation_m": pd.to_numeric(
                df["ELEVATION"],
                errors="coerce"
            ),

            "report_type": df["REPORT_TYPE"],

            "temperature_C": temperature,

            "dew_point_C": dew_point,

            "pressure_hPa": pressure,

            "pressure_source": pressure_source
        })

        # ------------------------------------------------------
        # Write to merged CSV
        # ------------------------------------------------------

        output_df.to_csv(
            OUTPUT_FILE,
            mode="w" if first_file else "a",
            header=first_file,
            index=False
        )

        first_file = False

        files_processed += 1
        rows_written += len(output_df)

        print(
            f"Processed {files_processed:,}/{len(csv_files):,}",
            end="\r"
        )

    except Exception as error:

        failed_files.append(
            (
                str(file_path),
                str(error)
            )
        )


# ============================================================
# Final report
# ============================================================

print()
print()
print("=" * 70)
print("MERGING COMPLETE")
print("=" * 70)

print(f"Files found       : {len(csv_files):,}")
print(f"Files processed   : {files_processed:,}")
print(f"Rows read         : {rows_read:,}")
print(f"Rows written      : {rows_written:,}")
print(f"Failed/skipped    : {len(failed_files):,}")

print()
print(f"Output:")
print(OUTPUT_FILE.resolve())


if failed_files:

    print()
    print("FAILED / SKIPPED FILES")
    print("-" * 70)

    for file_name, reason in failed_files:

        print(file_name)
        print(f"Reason: {reason}")
        print()


print("=" * 70)