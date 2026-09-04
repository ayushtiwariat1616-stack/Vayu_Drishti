import sys
from pathlib import Path

import numpy as np
import pandas as pd


# ============================================================
# VAYUDRISHTY
# ENGINE 2 - FEATURE & ATMOSPHERIC INTELLIGENCE ENGINE
# ============================================================

INPUT_FILE = Path(
    "data/cleaned/weather_common_final.csv"
)

OUTPUT_FILE = Path(
    "data/features/weather_features.csv"
)

SUMMARY_FILE = Path(
    "outputs/feature_engine_summary.csv"
)


# ============================================================
# CONFIGURATION
# ============================================================

CHUNK_SIZE = 100_000

# Number of previous observations used to describe
# recent sensor/weather behaviour.
ROLLING_WINDOW = 6

# If two observations are separated by more than this,
# we do not calculate change/rate/rolling behaviour across
# the gap.
MAX_GAP_MINUTES = 360   # 6 hours

# Test mode processes only the first 300,000 observations.
TEST_ROWS = 300_000

TEST_MODE = "--test" in sys.argv


# ============================================================
# INPUT COLUMNS
# ============================================================

RAW_COLUMNS = [
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


# ============================================================
# OUTPUT COLUMNS
# ============================================================

OUTPUT_COLUMNS = [

    # --------------------------------------------------------
    # Identification / metadata
    # --------------------------------------------------------
    "station_id",
    "station_name",
    "timestamp",
    "latitude",
    "longitude",
    "elevation_m",
    "report_type",

    # --------------------------------------------------------
    # Original weather measurements
    # --------------------------------------------------------
    "temperature_C",
    "dew_point_C",
    "relative_humidity_pct",
    "pressure_hPa",
    "pressure_source",

    # --------------------------------------------------------
    # Availability indicators
    # --------------------------------------------------------
    "temperature_available",
    "humidity_available",
    "pressure_available",

    # --------------------------------------------------------
    # Atmospheric relationship
    # --------------------------------------------------------
    "dew_point_depression_C",

    # --------------------------------------------------------
    # Temporal features
    # --------------------------------------------------------
    "hour",
    "month",
    "day_of_year",
    "hour_sin",
    "hour_cos",
    "day_of_year_sin",
    "day_of_year_cos",

    # --------------------------------------------------------
    # Time since previous observation
    # --------------------------------------------------------
    "minutes_since_previous",

    # --------------------------------------------------------
    # Change features
    # --------------------------------------------------------
    "temperature_change_C",
    "humidity_change_pct",
    "pressure_change_hPa",

    # --------------------------------------------------------
    # Rate-of-change features
    # --------------------------------------------------------
    "temperature_rate_C_per_hour",
    "humidity_rate_pct_per_hour",
    "pressure_rate_hPa_per_hour",

    # --------------------------------------------------------
    # Recent behaviour / rolling statistics
    # --------------------------------------------------------
    "temperature_recent_mean",
    "temperature_recent_std",

    "humidity_recent_mean",
    "humidity_recent_std",

    "pressure_recent_mean",
    "pressure_recent_std",

    # --------------------------------------------------------
    # Deviation from recent behaviour
    # --------------------------------------------------------
    "temperature_deviation",
    "humidity_deviation",
    "pressure_deviation"
]


# ============================================================
# START
# ============================================================

print("=" * 72)
print("VAYUDRISHTY - ENGINE 2")
print("FEATURE & ATMOSPHERIC INTELLIGENCE ENGINE")
print("=" * 72)

print()
print(f"Input : {INPUT_FILE}")

if TEST_MODE:
    print("Mode  : TEST")
    print(f"Rows  : First {TEST_ROWS:,} observations")
    print(
        "Output: data/features/weather_features_TEST.csv"
    )
else:
    print("Mode  : FULL DATASET")
    print(f"Output: {OUTPUT_FILE}")

print()


# ============================================================
# VALIDATE INPUT
# ============================================================

if not INPUT_FILE.exists():

    print("ERROR: Common cleaned dataset was not found.")
    print()
    print("Expected:")
    print(INPUT_FILE.resolve())

    raise SystemExit(1)


# ============================================================
# OUTPUT FILE
# ============================================================

if TEST_MODE:

    CURRENT_OUTPUT_FILE = Path(
        "data/features/weather_features_TEST.csv"
    )

else:

    CURRENT_OUTPUT_FILE = OUTPUT_FILE


CURRENT_OUTPUT_FILE.parent.mkdir(
    parents=True,
    exist_ok=True
)

SUMMARY_FILE.parent.mkdir(
    parents=True,
    exist_ok=True
)


# Remove previous output
if CURRENT_OUTPUT_FILE.exists():
    CURRENT_OUTPUT_FILE.unlink()


# ============================================================
# STATE STORAGE
#
# We keep only a few previous observations for each station.
# This allows rolling features to continue across CSV chunks
# without loading all 5.56 million rows into RAM.
# ============================================================

station_history = {}


# ============================================================
# STATISTICS
# ============================================================

rows_processed = 0
rows_written = 0
chunks_processed = 0

rows_with_temperature = 0
rows_with_humidity = 0
rows_with_pressure = 0

first_write = True


# ============================================================
# FEATURE CREATION FUNCTION
# ============================================================

def create_station_features(
    station_df,
    previous_history=None
):

    """
    Create temporal and atmospheric features for one
    weather station.

    previous_history contains only a small number of previous
    observations so rolling calculations can continue across
    CSV chunks.
    """

    # --------------------------------------------------------
    # Current observations
    # --------------------------------------------------------

    current = station_df.copy()

    current["_current_row"] = True


    # --------------------------------------------------------
    # Add previous observations if available
    # --------------------------------------------------------

    if previous_history is not None:

        history = previous_history.copy()

        history["_current_row"] = False

        combined = pd.concat(
            [
                history,
                current
            ],
            ignore_index=True
        )

    else:

        combined = current.copy()


    # --------------------------------------------------------
    # Sort chronologically
    # --------------------------------------------------------

    combined = combined.sort_values(
        "timestamp"
    ).reset_index(drop=True)


    # ========================================================
    # TEMPORAL FEATURES
    # ========================================================

    combined["hour"] = (
        combined["timestamp"].dt.hour
    )

    combined["month"] = (
        combined["timestamp"].dt.month
    )

    combined["day_of_year"] = (
        combined["timestamp"].dt.dayofyear
    )


    # --------------------------------------------------------
    # Cyclic time encoding
    #
    # 23:00 and 00:00 should be close to each other.
    # December and January should also be seasonally close.
    # --------------------------------------------------------

    combined["hour_sin"] = np.sin(
        2 * np.pi
        * combined["hour"]
        / 24.0
    )

    combined["hour_cos"] = np.cos(
        2 * np.pi
        * combined["hour"]
        / 24.0
    )

    combined["day_of_year_sin"] = np.sin(
        2 * np.pi
        * combined["day_of_year"]
        / 365.25
    )

    combined["day_of_year_cos"] = np.cos(
        2 * np.pi
        * combined["day_of_year"]
        / 365.25
    )


    # ========================================================
    # AVAILABILITY FEATURES
    # ========================================================

    combined["temperature_available"] = (
        combined["temperature_C"]
        .notna()
        .astype("int8")
    )

    combined["humidity_available"] = (
        combined["relative_humidity_pct"]
        .notna()
        .astype("int8")
    )

    combined["pressure_available"] = (
        combined["pressure_hPa"]
        .notna()
        .astype("int8")
    )


    # ========================================================
    # ATMOSPHERIC RELATIONSHIP
    # ========================================================

    combined["dew_point_depression_C"] = (
        combined["temperature_C"]
        - combined["dew_point_C"]
    )


    # ========================================================
    # TIME DIFFERENCE
    # ========================================================

    combined["minutes_since_previous"] = (
        combined["timestamp"]
        .diff()
        .dt.total_seconds()
        / 60.0
    )


    # --------------------------------------------------------
    # Break time series when observations are separated by
    # more than six hours.
    #
    # This prevents us from comparing two observations that
    # may be days/months apart.
    # --------------------------------------------------------

    new_segment = (
        combined["minutes_since_previous"].isna()
        |
        (
            combined["minutes_since_previous"]
            <= 0
        )
        |
        (
            combined["minutes_since_previous"]
            > MAX_GAP_MINUTES
        )
    )

    combined["_segment"] = (
        new_segment.cumsum()
    )


    # ========================================================
    # CHANGE FEATURES
    # ========================================================

    combined["temperature_change_C"] = (
        combined
        .groupby("_segment")[
            "temperature_C"
        ]
        .diff()
    )

    combined["humidity_change_pct"] = (
        combined
        .groupby("_segment")[
            "relative_humidity_pct"
        ]
        .diff()
    )

    combined["pressure_change_hPa"] = (
        combined
        .groupby("_segment")[
            "pressure_hPa"
        ]
        .diff()
    )


    # ========================================================
    # RATE OF CHANGE
    # ========================================================

    elapsed_hours = (
        combined["minutes_since_previous"]
        / 60.0
    )

    valid_elapsed = (
        (elapsed_hours > 0)
        &
        (
            combined["minutes_since_previous"]
            <= MAX_GAP_MINUTES
        )
    )


    combined["temperature_rate_C_per_hour"] = np.nan

    combined.loc[
        valid_elapsed,
        "temperature_rate_C_per_hour"
    ] = (
        combined.loc[
            valid_elapsed,
            "temperature_change_C"
        ]
        /
        elapsed_hours.loc[valid_elapsed]
    )


    combined["humidity_rate_pct_per_hour"] = np.nan

    combined.loc[
        valid_elapsed,
        "humidity_rate_pct_per_hour"
    ] = (
        combined.loc[
            valid_elapsed,
            "humidity_change_pct"
        ]
        /
        elapsed_hours.loc[valid_elapsed]
    )


    combined["pressure_rate_hPa_per_hour"] = np.nan

    combined.loc[
        valid_elapsed,
        "pressure_rate_hPa_per_hour"
    ] = (
        combined.loc[
            valid_elapsed,
            "pressure_change_hPa"
        ]
        /
        elapsed_hours.loc[valid_elapsed]
    )


    # ========================================================
    # ROLLING / RECENT BEHAVIOUR
    #
    # IMPORTANT:
    # The current observation is NOT used when calculating
    # its baseline.
    #
    # We use previous observations only.
    # ========================================================

    def rolling_previous_mean(series):

        return (
            series
            .shift(1)
            .rolling(
                window=ROLLING_WINDOW,
                min_periods=3
            )
            .mean()
        )


    def rolling_previous_std(series):

        return (
            series
            .shift(1)
            .rolling(
                window=ROLLING_WINDOW,
                min_periods=3
            )
            .std()
        )


    grouped = combined.groupby(
        "_segment",
        group_keys=False
    )


    # --------------------------------------------------------
    # Temperature
    # --------------------------------------------------------

    combined["temperature_recent_mean"] = (
        grouped["temperature_C"]
        .transform(
            rolling_previous_mean
        )
    )

    combined["temperature_recent_std"] = (
        grouped["temperature_C"]
        .transform(
            rolling_previous_std
        )
    )


    # --------------------------------------------------------
    # Humidity
    # --------------------------------------------------------

    combined["humidity_recent_mean"] = (
        grouped["relative_humidity_pct"]
        .transform(
            rolling_previous_mean
        )
    )

    combined["humidity_recent_std"] = (
        grouped["relative_humidity_pct"]
        .transform(
            rolling_previous_std
        )
    )


    # --------------------------------------------------------
    # Pressure
    # --------------------------------------------------------

    combined["pressure_recent_mean"] = (
        grouped["pressure_hPa"]
        .transform(
            rolling_previous_mean
        )
    )

    combined["pressure_recent_std"] = (
        grouped["pressure_hPa"]
        .transform(
            rolling_previous_std
        )
    )


    # ========================================================
    # DEVIATION FROM RECENT BEHAVIOUR
    # ========================================================

    combined["temperature_deviation"] = (
        combined["temperature_C"]
        -
        combined["temperature_recent_mean"]
    )

    combined["humidity_deviation"] = (
        combined["relative_humidity_pct"]
        -
        combined["humidity_recent_mean"]
    )

    combined["pressure_deviation"] = (
        combined["pressure_hPa"]
        -
        combined["pressure_recent_mean"]
    )


    # ========================================================
    # KEEP CURRENT ROWS ONLY
    # ========================================================

    result = combined[
        combined["_current_row"]
    ].copy()


    # ========================================================
    # SAVE SMALL HISTORY FOR NEXT CHUNK
    # ========================================================

    history_columns = RAW_COLUMNS

    new_history = (
        combined[
            history_columns
        ]
        .tail(
            ROLLING_WINDOW + 1
        )
        .copy()
    )


    # ========================================================
    # OUTPUT
    # ========================================================

    result = result[
        OUTPUT_COLUMNS
    ]

    return result, new_history


# ============================================================
# READ DATASET IN CHUNKS
# ============================================================

print("Starting feature engineering...")
print()


for chunk_number, chunk in enumerate(

    pd.read_csv(
        INPUT_FILE,
        chunksize=CHUNK_SIZE
    ),

    start=1
):


    # --------------------------------------------------------
    # TEST MODE LIMIT
    # --------------------------------------------------------

    if TEST_MODE:

        remaining = (
            TEST_ROWS - rows_processed
        )

        if remaining <= 0:
            break

        if len(chunk) > remaining:
            chunk = chunk.iloc[
                :remaining
            ].copy()


    chunks_processed += 1

    rows_processed += len(chunk)


    print(
        f"Processing chunk {chunk_number} "
        f"| Rows processed: "
        f"{rows_processed:,}",
        end="\r"
    )


    # ========================================================
    # BASIC TYPE CONVERSION
    # ========================================================

    chunk["timestamp"] = pd.to_datetime(
        chunk["timestamp"],
        errors="coerce"
    )


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

        chunk[column] = pd.to_numeric(
            chunk[column],
            errors="coerce"
        )


    # Remove invalid timestamp rows if somehow present.
    chunk = chunk.dropna(
        subset=[
            "station_id",
            "timestamp"
        ]
    )


    # ========================================================
    # AVAILABILITY STATISTICS
    # ========================================================

    rows_with_temperature += int(
        chunk["temperature_C"]
        .notna()
        .sum()
    )

    rows_with_humidity += int(
        chunk["relative_humidity_pct"]
        .notna()
        .sum()
    )

    rows_with_pressure += int(
        chunk["pressure_hPa"]
        .notna()
        .sum()
    )


    # ========================================================
    # PROCESS EACH STATION
    # ========================================================

    chunk_results = []


    for station_id, station_df in chunk.groupby(
        "station_id",
        sort=False
    ):

        previous_history = (
            station_history.get(
                station_id
            )
        )


        station_features, new_history = (
            create_station_features(
                station_df,
                previous_history
            )
        )


        station_history[
            station_id
        ] = new_history


        chunk_results.append(
            station_features
        )


    # ========================================================
    # COMBINE FEATURE DATA
    # ========================================================

    if chunk_results:

        output_chunk = pd.concat(
            chunk_results,
            ignore_index=True
        )


        # ----------------------------------------------------
        # Save incrementally
        # ----------------------------------------------------

        output_chunk.to_csv(
            CURRENT_OUTPUT_FILE,
            mode=(
                "w"
                if first_write
                else "a"
            ),
            header=first_write,
            index=False
        )


        first_write = False

        rows_written += len(
            output_chunk
        )


# ============================================================
# FINISHED
# ============================================================

print()
print()


# ============================================================
# CREATE SUMMARY
# ============================================================

temperature_pct = (
    rows_with_temperature
    / rows_processed
    * 100
)

humidity_pct = (
    rows_with_humidity
    / rows_processed
    * 100
)

pressure_pct = (
    rows_with_pressure
    / rows_processed
    * 100
)


summary = pd.DataFrame({

    "metric": [

        "rows_processed",
        "rows_written",
        "chunks_processed",
        "stations_seen",

        "temperature_available_rows",
        "temperature_available_pct",

        "humidity_available_rows",
        "humidity_available_pct",

        "pressure_available_rows",
        "pressure_available_pct",

        "feature_columns"

    ],

    "value": [

        rows_processed,
        rows_written,
        chunks_processed,
        len(station_history),

        rows_with_temperature,
        temperature_pct,

        rows_with_humidity,
        humidity_pct,

        rows_with_pressure,
        pressure_pct,

        len(OUTPUT_COLUMNS)

    ]

})


summary.to_csv(
    SUMMARY_FILE,
    index=False
)


# ============================================================
# FINAL REPORT
# ============================================================

print("=" * 72)
print("ENGINE 2 COMPLETE")
print("=" * 72)

print()

print(
    f"Rows processed        : "
    f"{rows_processed:,}"
)

print(
    f"Rows written          : "
    f"{rows_written:,}"
)

print(
    f"Stations encountered  : "
    f"{len(station_history):,}"
)

print(
    f"Output columns        : "
    f"{len(OUTPUT_COLUMNS)}"
)

print()

print(
    f"Temperature available : "
    f"{temperature_pct:.2f}%"
)

print(
    f"Humidity available    : "
    f"{humidity_pct:.2f}%"
)

print(
    f"Pressure available    : "
    f"{pressure_pct:.2f}%"
)

print()

print("Feature dataset:")
print(
    CURRENT_OUTPUT_FILE.resolve()
)

print()

print("Feature summary:")
print(
    SUMMARY_FILE.resolve()
)

print()

print("=" * 72)

if TEST_MODE:

    print()
    print(
        "TEST MODE COMPLETED SUCCESSFULLY."
    )

    print(
        "If the output looks correct, "
        "run again WITHOUT --test "
        "to process the complete dataset."
    )

    print()