import pandas as pd
import numpy as np
import joblib

from pathlib import Path
from sklearn.metrics import classification_report, confusion_matrix


# ============================================================
# VAYUDRISHTY
# ENGINE 3 - ISOLATION FOREST VALIDATION
#
# PURPOSE:
# Validate Isolation Forest using realistic synthetic
# sensor-fault patterns.
#
# IMPORTANT:
# Synthetic faults are injected into actual observations.
# Temporal features such as change, rate, rolling mean,
# rolling standard deviation, and deviation are recalculated.
# ============================================================


# ============================================================
# FILE PATHS
# ============================================================

FEATURE_FILE = Path(
    "data/features/weather_features.csv"
)

MODEL_FILE = Path(
    "models/isolation_forest.pkl"
)

OUTPUT_FILE = Path(
    "outputs/anomaly_validation_results.csv"
)


# ============================================================
# CONFIGURATION
# ============================================================

RANDOM_STATE = 42

# Number of normal sequences used for validation.
NUM_SEQUENCES = 100

# Number of observations in each sequence.
SEQUENCE_LENGTH = 20

# Fault is inserted around the middle of each sequence.
FAULT_POSITION = 10

# How many sequences are generated for each fault type.
# Total synthetic anomalies:
#
# 100 sequences × 5 fault types = 500 sequences
#
# Each sequence contains one faulty observation.
FAULT_TYPES = [
    "temperature_spike",
    "temperature_drop",
    "frozen_sensor",
    "humidity_fault",
    "multivariate_inconsistency"
]


# ============================================================
# ENGINE 2 FEATURE DEFINITIONS
# ============================================================

# These are the same behavioral features used by Engine 3.

MODEL_FEATURES = [
    "temperature_C",
    "relative_humidity_pct",
    "pressure_hPa",
    "dew_point_C",

    "dew_point_depression_C",

    "hour_sin",
    "hour_cos",
    "day_of_year_sin",
    "day_of_year_cos",

    "minutes_since_previous",

    "temperature_change_C",
    "humidity_change_pct",
    "pressure_change_hPa",

    "temperature_rate_C_per_hour",
    "humidity_rate_pct_per_hour",
    "pressure_rate_hPa_per_hour",

    "temperature_recent_mean",
    "temperature_recent_std",

    "humidity_recent_mean",
    "humidity_recent_std",

    "pressure_recent_mean",
    "pressure_recent_std",

    "temperature_deviation",
    "humidity_deviation",
    "pressure_deviation",

    "temperature_available",
    "humidity_available",
    "pressure_available"
]


# ============================================================
# LOAD TRAINED MODEL
# ============================================================

print("=" * 72)
print("VAYUDRISHTY - ENGINE 3")
print("CORRECTED ISOLATION FOREST VALIDATION")
print("=" * 72)

print()

print("Loading trained Isolation Forest...")

package = joblib.load(
    MODEL_FILE
)

model = package["model"]

imputer = package["imputer"]

trained_features = package["feature_columns"]

print("Model loaded successfully.")

print()


# ============================================================
# VERIFY MODEL FEATURES
# ============================================================

if trained_features != MODEL_FEATURES:

    print("WARNING:")
    print("Model feature list differs from expected Engine 3 list.")
    print()

    print("Model features:")

    for feature in trained_features:
        print(
            f"  {feature}"
        )

    print()

    MODEL_FEATURES = trained_features


# ============================================================
# LOAD FEATURE DATA
# ============================================================

print("Loading feature dataset...")

# We load more rows than necessary because we need to find
# complete station sequences.

USE_COLUMNS = [
    "station_id",
    "station_name",
    "timestamp",
    "temperature_C",
    "dew_point_C",
    "relative_humidity_pct",
    "pressure_hPa",
    "latitude",
    "longitude",
    "elevation_m"
]

# Add model features that may already exist.
USE_COLUMNS = list(
    dict.fromkeys(
        USE_COLUMNS + MODEL_FEATURES
    )
)

df = pd.read_csv(
    FEATURE_FILE,
    usecols=USE_COLUMNS,
    nrows=300_000
)

print(
    f"Rows loaded: {len(df):,}"
)

print()


# ============================================================
# TIMESTAMP
# ============================================================

df["timestamp"] = pd.to_datetime(
    df["timestamp"],
    errors="coerce"
)

df = df.dropna(
    subset=[
        "station_id",
        "timestamp"
    ]
)


# ============================================================
# SORT CHRONOLOGICALLY
# ============================================================

df = df.sort_values(
    [
        "station_id",
        "timestamp"
    ]
).reset_index(
    drop=True
)


# ============================================================
# FIND SUITABLE TIME SEQUENCES
# ============================================================

print("Searching for suitable station time sequences...")

rng = np.random.default_rng(
    RANDOM_STATE
)

candidate_sequences = []

station_groups = df.groupby(
    "station_id",
    sort=False
)


for station_id, station_df in station_groups:

    station_df = station_df.sort_values(
        "timestamp"
    )

    # Need enough observations.
    if len(station_df) < SEQUENCE_LENGTH:

        continue

    # Convert timestamps to numpy array.
    timestamps = (
        station_df["timestamp"]
        .values
    )

    # Look for sequences with approximately regular spacing.
    for start in range(
        0,
        len(station_df) - SEQUENCE_LENGTH + 1,
        SEQUENCE_LENGTH
    ):

        end = (
            start
            +
            SEQUENCE_LENGTH
        )

        sequence = station_df.iloc[
            start:end
        ].copy()

        if len(sequence) != SEQUENCE_LENGTH:
            continue

        # Check that temperature and humidity are available.
        if sequence[
            "temperature_C"
        ].isna().any():

            continue

        if sequence[
            "relative_humidity_pct"
        ].isna().any():

            continue

        candidate_sequences.append(
            sequence
        )

        if len(candidate_sequences) >= (
            NUM_SEQUENCES * len(FAULT_TYPES)
        ):

            break

    if len(candidate_sequences) >= (
        NUM_SEQUENCES * len(FAULT_TYPES)
    ):

        break


if len(candidate_sequences) == 0:

    raise RuntimeError(
        "Could not find suitable station sequences."
    )


print(
    f"Suitable sequences found: "
    f"{len(candidate_sequences):,}"
)

print()


# ============================================================
# RANDOMLY SELECT SEQUENCES
# ============================================================

required_sequences = (
    NUM_SEQUENCES
    *
    len(FAULT_TYPES)
)

if len(candidate_sequences) < required_sequences:

    required_sequences = len(
        candidate_sequences
    )

    print(
        "Using available sequences:"
        f" {required_sequences:,}"
    )

else:

    selected_indices = rng.choice(
        len(candidate_sequences),
        size=required_sequences,
        replace=False
    )

    candidate_sequences = [
        candidate_sequences[i]
        for i in selected_indices
    ]


# ============================================================
# FEATURE RECOMPUTATION FUNCTION
# ============================================================

def calculate_behavior_features(data):

    """
    Recalculate the important temporal and behavioral
    features used by Engine 3.

    The calculation uses only previous observations for
    rolling baselines, preventing current-value leakage.
    """

    data = data.copy()

    data = data.sort_values(
        [
            "station_id",
            "timestamp"
        ]
    ).reset_index(
        drop=True
    )

    # --------------------------------------------------------
    # Availability
    # --------------------------------------------------------

    data[
        "temperature_available"
    ] = (
        data["temperature_C"]
        .notna()
        .astype(int)
    )

    data[
        "humidity_available"
    ] = (
        data["relative_humidity_pct"]
        .notna()
        .astype(int)
    )

    data[
        "pressure_available"
    ] = (
        data["pressure_hPa"]
        .notna()
        .astype(int)
    )

    # --------------------------------------------------------
    # Dew point depression
    # --------------------------------------------------------

    data[
        "dew_point_depression_C"
    ] = (
        data["temperature_C"]
        -
        data["dew_point_C"]
    )

    # --------------------------------------------------------
    # Time features
    # --------------------------------------------------------

    data["hour"] = (
        data["timestamp"]
        .dt.hour
    )

    data["day_of_year"] = (
        data["timestamp"]
        .dt.dayofyear
    )

    data["hour_sin"] = np.sin(
        2
        *
        np.pi
        *
        data["hour"]
        /
        24
    )

    data["hour_cos"] = np.cos(
        2
        *
        np.pi
        *
        data["hour"]
        /
        24
    )

    data["day_of_year_sin"] = np.sin(
        2
        *
        np.pi
        *
        data["day_of_year"]
        /
        365.25
    )

    data["day_of_year_cos"] = np.cos(
        2
        *
        np.pi
        *
        data["day_of_year"]
        /
        365.25
    )

    # --------------------------------------------------------
    # Time difference
    # --------------------------------------------------------

    data[
        "minutes_since_previous"
    ] = (
        data["timestamp"]
        .diff()
        .dt.total_seconds()
        /
        60
    )

    # --------------------------------------------------------
    # Change features
    # --------------------------------------------------------

    data[
        "temperature_change_C"
    ] = data[
        "temperature_C"
    ].diff()

    data[
        "humidity_change_pct"
    ] = data[
        "relative_humidity_pct"
    ].diff()

    data[
        "pressure_change_hPa"
    ] = data[
        "pressure_hPa"
    ].diff()

    # --------------------------------------------------------
    # Rate features
    # --------------------------------------------------------

    hours_elapsed = (
        data[
            "minutes_since_previous"
        ]
        /
        60
    )

    valid_hours = (
        hours_elapsed
        .where(
            hours_elapsed > 0
        )
    )

    data[
        "temperature_rate_C_per_hour"
    ] = (
        data[
            "temperature_change_C"
        ]
        /
        valid_hours
    )

    data[
        "humidity_rate_pct_per_hour"
    ] = (
        data[
            "humidity_change_pct"
        ]
        /
        valid_hours
    )

    data[
        "pressure_rate_hPa_per_hour"
    ] = (
        data[
            "pressure_change_hPa"
        ]
        /
        valid_hours
    )

    # --------------------------------------------------------
    # Previous-observation rolling baseline
    # --------------------------------------------------------

    data[
        "temperature_recent_mean"
    ] = (
        data[
            "temperature_C"
        ]
        .shift(1)
        .rolling(
            window=6,
            min_periods=2
        )
        .mean()
    )

    data[
        "temperature_recent_std"
    ] = (
        data[
            "temperature_C"
        ]
        .shift(1)
        .rolling(
            window=6,
            min_periods=2
        )
        .std()
    )

    data[
        "humidity_recent_mean"
    ] = (
        data[
            "relative_humidity_pct"
        ]
        .shift(1)
        .rolling(
            window=6,
            min_periods=2
        )
        .mean()
    )

    data[
        "humidity_recent_std"
    ] = (
        data[
            "relative_humidity_pct"
        ]
        .shift(1)
        .rolling(
            window=6,
            min_periods=2
        )
        .std()
    )

    data[
        "pressure_recent_mean"
    ] = (
        data[
            "pressure_hPa"
        ]
        .shift(1)
        .rolling(
            window=6,
            min_periods=2
        )
        .mean()
    )

    data[
        "pressure_recent_std"
    ] = (
        data[
            "pressure_hPa"
        ]
        .shift(1)
        .rolling(
            window=6,
            min_periods=2
        )
        .std()
    )

    # --------------------------------------------------------
    # Deviation from recent baseline
    # --------------------------------------------------------

    data[
        "temperature_deviation"
    ] = (
        data["temperature_C"]
        -
        data[
            "temperature_recent_mean"
        ]
    )

    data[
        "humidity_deviation"
    ] = (
        data[
            "relative_humidity_pct"
        ]
        -
        data[
            "humidity_recent_mean"
        ]
    )

    data[
        "pressure_deviation"
    ] = (
        data["pressure_hPa"]
        -
        data[
            "pressure_recent_mean"
        ]
    )

    return data


# ============================================================
# CREATE SYNTHETIC DATASETS
# ============================================================

print("Creating realistic synthetic sensor faults...")

all_validation_sequences = []

ground_truth = []

fault_names = []


# ------------------------------------------------------------
# NORMAL SEQUENCES
# ------------------------------------------------------------

normal_count = min(
    NUM_SEQUENCES,
    len(candidate_sequences)
)

normal_sequences = candidate_sequences[
    :normal_count
]

for sequence in normal_sequences:

    sequence = sequence.copy()

    # Recalculate features to ensure consistency.
    sequence = calculate_behavior_features(
        sequence
    )

    all_validation_sequences.append(
        sequence
    )

    ground_truth.extend(
        [0] * len(sequence)
    )

    fault_names.extend(
        ["normal"] * len(sequence)
    )


# ============================================================
# SYNTHETIC FAULTS
# ============================================================

fault_sequence_source = candidate_sequences[
    :normal_count
]


for fault_type in FAULT_TYPES:

    print(
        f"  Creating {fault_type}..."
    )

    for base_sequence in fault_sequence_source:

        sequence = base_sequence.copy()

        fault_index = FAULT_POSITION

        # ----------------------------------------------------
        # TEMPERATURE SPIKE
        # ----------------------------------------------------

        if fault_type == "temperature_spike":

            original_temperature = (
                sequence.iloc[
                    fault_index
                ]["temperature_C"]
            )

            sequence.loc[
                sequence.index[
                    fault_index
                ],
                "temperature_C"
            ] = (
                original_temperature
                +
                25.0
            )

        # ----------------------------------------------------
        # TEMPERATURE DROP
        # ----------------------------------------------------

        elif fault_type == "temperature_drop":

            original_temperature = (
                sequence.iloc[
                    fault_index
                ]["temperature_C"]
            )

            sequence.loc[
                sequence.index[
                    fault_index
                ],
                "temperature_C"
            ] = (
                original_temperature
                -
                25.0
            )

        # ----------------------------------------------------
        # FROZEN SENSOR
        # ----------------------------------------------------

        elif fault_type == "frozen_sensor":

            # Freeze the sensor from the fault position
            # until the end of the sequence.

            frozen_value = (
                sequence.iloc[
                    fault_index
                ]["temperature_C"]
            )

            indices = sequence.index[
                fault_index:
            ]

            sequence.loc[
                indices,
                "temperature_C"
            ] = frozen_value

        # ----------------------------------------------------
        # HUMIDITY SENSOR FAULT
        # ----------------------------------------------------

        elif fault_type == "humidity_fault":

            # Force an extreme but valid sensor reading.

            sequence.loc[
                sequence.index[
                    fault_index
                ],
                "relative_humidity_pct"
            ] = 0.0

        # ----------------------------------------------------
        # MULTIVARIATE INCONSISTENCY
        # ----------------------------------------------------

        elif fault_type == "multivariate_inconsistency":

            current_temperature = (
                sequence.iloc[
                    fault_index
                ]["temperature_C"]
            )

            # Dew point becomes greater than temperature.
            sequence.loc[
                sequence.index[
                    fault_index
                ],
                "dew_point_C"
            ] = (
                current_temperature
                +
                20.0
            )

            # RH forced to maximum.
            sequence.loc[
                sequence.index[
                    fault_index
                ],
                "relative_humidity_pct"
            ] = 100.0

        # ----------------------------------------------------
        # RECOMPUTE FEATURES
        # ----------------------------------------------------

        sequence = calculate_behavior_features(
            sequence
        )

        all_validation_sequences.append(
            sequence
        )

        # Only the injected observation is the ground-truth
        # anomaly.
        #
        # Other observations remain normal.
        for i in range(
            len(sequence)
        ):

            if i == fault_index:

                ground_truth.append(1)

                fault_names.append(
                    fault_type
                )

            else:

                ground_truth.append(0)

                fault_names.append(
                    "normal"
                )


# ============================================================
# COMBINE EVERYTHING
# ============================================================

validation_df = pd.concat(
    all_validation_sequences,
    ignore_index=True
)

ground_truth = np.array(
    ground_truth
)

fault_names = np.array(
    fault_names
)


print()

print(
    f"Total validation observations: "
    f"{len(validation_df):,}"
)

print(
    f"Ground-truth anomalies: "
    f"{ground_truth.sum():,}"
)

print()


# ============================================================
# PREPARE MODEL INPUT
# ============================================================

X = validation_df[
    MODEL_FEATURES
].copy()


for column in MODEL_FEATURES:

    X[column] = pd.to_numeric(
        X[column],
        errors="coerce"
    )


X = X.replace(
    [np.inf, -np.inf],
    np.nan
)


# ============================================================
# APPLY TRAINED IMPUTER
# ============================================================

print(
    "Applying trained imputer..."
)

X_imputed = imputer.transform(
    X
)


# ============================================================
# RUN ISOLATION FOREST
# ============================================================

print(
    "Running Isolation Forest..."
)

predictions = model.predict(
    X_imputed
)

predicted_anomaly = (
    predictions == -1
).astype(int)


# ============================================================
# OVERALL RESULTS
# ============================================================

print()

print("=" * 72)
print("OVERALL VALIDATION RESULTS")
print("=" * 72)

print()

print(
    classification_report(
        ground_truth,
        predicted_anomaly,
        target_names=[
            "NORMAL",
            "ANOMALY"
        ],
        digits=4,
        zero_division=0
    )
)


# ============================================================
# CONFUSION MATRIX
# ============================================================

cm = confusion_matrix(
    ground_truth,
    predicted_anomaly
)

print(
    "Confusion Matrix:"
)

print()

print(
    "                 Predicted"
)

print(
    "                 Normal  Anomaly"
)

print(
    f"Actual Normal    "
    f"{cm[0,0]:7d}  "
    f"{cm[0,1]:7d}"
)

print(
    f"Actual Anomaly   "
    f"{cm[1,0]:7d}  "
    f"{cm[1,1]:7d}"
)

print()


# ============================================================
# FAULT-SPECIFIC DETECTION
# ============================================================

print("=" * 72)
print("FAULT-SPECIFIC DETECTION")
print("=" * 72)

print()

results = []


for fault_type in FAULT_TYPES:

    # Find the actual injected anomaly positions.
    mask = (
        fault_names
        ==
        fault_type
    )

    total_faults = int(
        mask.sum()
    )

    detected_faults = int(
        predicted_anomaly[
            mask
        ].sum()
    )

    detection_rate = (
        detected_faults
        /
        total_faults
        *
        100
    )

    results.append(
        {
            "fault_type": fault_type,
            "total_fault_observations": total_faults,
            "detected_anomalies": detected_faults,
            "detection_rate_percent": round(
                detection_rate,
                2
            )
        }
    )

    print(
        f"{fault_type:30s}"
        f"{detection_rate:8.2f}%"
    )


# ============================================================
# FALSE POSITIVE RATE
# ============================================================

normal_mask = (
    ground_truth
    ==
    0
)

normal_total = int(
    normal_mask.sum()
)

normal_false_alarms = int(
    predicted_anomaly[
        normal_mask
    ].sum()
)

false_positive_rate = (
    normal_false_alarms
    /
    normal_total
    *
    100
)

print()

print(
    f"False positive rate: "
    f"{false_positive_rate:.2f}%"
)


# ============================================================
# SAVE RESULTS
# ============================================================

results_df = pd.DataFrame(
    results
)

results_df.to_csv(
    OUTPUT_FILE,
    index=False
)


# ============================================================
# FINAL MESSAGE
# ============================================================

print()

print("=" * 72)
print("ENGINE 3 VALIDATION COMPLETE")
print("=" * 72)

print()

print(
    "Validation summary saved to:"
)

print(
    OUTPUT_FILE.resolve()
)

print()

print(
    "IMPORTANT:"
)

print(
    "These results measure detection of synthetic"
)

print(
    "sensor-fault scenarios, not real-world weather-event accuracy."
)

print()

print("=" * 72)