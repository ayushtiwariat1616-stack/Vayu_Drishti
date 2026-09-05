import sys
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.impute import SimpleImputer


# ============================================================
# VAYUDRISHTY
# ENGINE 3 - ANOMALY DETECTION ENGINE
# MODEL: ISOLATION FOREST
# ============================================================

INPUT_FILE = Path(
    "data/features/weather_features.csv"
)

MODEL_FILE = Path(
    "models/isolation_forest.pkl"
)

OUTPUT_FILE = Path(
    "outputs/anomaly_results.csv"
)

TEST_OUTPUT_FILE = Path(
    "outputs/anomaly_results_TEST.csv"
)


# ============================================================
# CONFIGURATION
# ============================================================

# Test mode:
# python src/engine3_anomaly_detection/anomaly_detector.py --test

TEST_MODE = "--test" in sys.argv

TEST_ROWS = 300_000

# Fraction of observations treated as anomalies.
#
# 0.02 means approximately 2% of observations will be
# classified as anomalous by the initial model.
#
# This is a starting point, NOT a claim that 2% of your
# weather observations are actually faulty.
CONTAMINATION = 0.02

# Number of trees in Isolation Forest.
N_ESTIMATORS = 150

RANDOM_STATE = 42

# Maximum number of training samples.
#
# Isolation Forest does not need all 5.56 million rows
# to learn the general normal pattern.
MAX_TRAINING_ROWS = 500_000


# ============================================================
# FEATURES USED BY ISOLATION FOREST
# ============================================================

FEATURE_COLUMNS = [

    # --------------------------------------------------------
    # Current atmospheric measurements
    # --------------------------------------------------------
    "temperature_C",
    "relative_humidity_pct",
    "pressure_hPa",
    "dew_point_C",

    # --------------------------------------------------------
    # Atmospheric relationship
    # --------------------------------------------------------
    "dew_point_depression_C",

    # --------------------------------------------------------
    # Time / seasonal behaviour
    # --------------------------------------------------------
    "hour_sin",
    "hour_cos",
    "day_of_year_sin",
    "day_of_year_cos",

    # --------------------------------------------------------
    # Time spacing
    # --------------------------------------------------------
    "minutes_since_previous",

    # --------------------------------------------------------
    # Change behaviour
    # --------------------------------------------------------
    "temperature_change_C",
    "humidity_change_pct",
    "pressure_change_hPa",

    # --------------------------------------------------------
    # Rate of change
    # --------------------------------------------------------
    "temperature_rate_C_per_hour",
    "humidity_rate_pct_per_hour",
    "pressure_rate_hPa_per_hour",

    # --------------------------------------------------------
    # Recent behaviour
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
    "pressure_deviation",

    # --------------------------------------------------------
    # Data availability
    # --------------------------------------------------------
    "temperature_available",
    "humidity_available",
    "pressure_available"
]


# ============================================================
# START
# ============================================================

print("=" * 72)
print("VAYUDRISHTY - ENGINE 3")
print("ANOMALY DETECTION ENGINE")
print("MODEL: ISOLATION FOREST")
print("=" * 72)

print()

print(f"Input : {INPUT_FILE}")

if TEST_MODE:

    print("Mode  : TEST")
    print(
        f"Rows  : First {TEST_ROWS:,} observations"
    )

    CURRENT_OUTPUT = TEST_OUTPUT_FILE

else:

    print("Mode  : FULL DATASET")

    CURRENT_OUTPUT = OUTPUT_FILE


print(
    f"Output: {CURRENT_OUTPUT}"
)

print()


# ============================================================
# CHECK INPUT
# ============================================================

if not INPUT_FILE.exists():

    print(
        "ERROR: Feature dataset not found."
    )

    print(
        INPUT_FILE.resolve()
    )

    raise SystemExit(1)


# ============================================================
# CREATE DIRECTORIES
# ============================================================

MODEL_FILE.parent.mkdir(
    parents=True,
    exist_ok=True
)

CURRENT_OUTPUT.parent.mkdir(
    parents=True,
    exist_ok=True
)


# ============================================================
# LOAD FEATURE DATA
# ============================================================

print("Loading feature dataset...")

if TEST_MODE:

    df = pd.read_csv(
        INPUT_FILE,
        nrows=TEST_ROWS
    )

else:

    df = pd.read_csv(
        INPUT_FILE
    )

print(
    f"Rows loaded: {len(df):,}"
)

print()


# ============================================================
# CHECK REQUIRED FEATURES
# ============================================================

missing_features = [
    column
    for column in FEATURE_COLUMNS
    if column not in df.columns
]

if missing_features:

    print(
        "ERROR: Required feature columns are missing:"
    )

    for column in missing_features:
        print(
            f"  - {column}"
        )

    raise SystemExit(1)


# ============================================================
# PREPARE ML INPUT
# ============================================================

print("Preparing ML features...")

X = df[
    FEATURE_COLUMNS
].copy()


# ------------------------------------------------------------
# Convert everything to numeric
# ------------------------------------------------------------

for column in FEATURE_COLUMNS:

    X[column] = pd.to_numeric(
        X[column],
        errors="coerce"
    )


# ============================================================
# REMOVE INFINITE VALUES
# ============================================================

X = X.replace(
    [np.inf, -np.inf],
    np.nan
)


# ============================================================
# IMPUTE MISSING VALUES
# ============================================================

print(
    "Handling missing feature values..."
)

imputer = SimpleImputer(
    strategy="median"
)

X_imputed = imputer.fit_transform(
    X
)


# ============================================================
# TRAINING SAMPLE
# ============================================================

print()

print(
    "Preparing Isolation Forest training sample..."
)

total_available = len(X_imputed)

training_size = min(
    MAX_TRAINING_ROWS,
    total_available
)


if training_size < total_available:

    rng = np.random.default_rng(
        RANDOM_STATE
    )

    training_indices = rng.choice(
        total_available,
        size=training_size,
        replace=False
    )

    X_train = X_imputed[
        training_indices
    ]

else:

    X_train = X_imputed


print(
    f"Training observations: "
    f"{len(X_train):,}"
)

print()


# ============================================================
# TRAIN ISOLATION FOREST
# ============================================================

print(
    "Training Isolation Forest..."
)

model = IsolationForest(

    n_estimators=N_ESTIMATORS,

    contamination=CONTAMINATION,

    random_state=RANDOM_STATE,

    n_jobs=-1

)


model.fit(
    X_train
)


print(
    "Isolation Forest training complete."
)

print()


# ============================================================
# SAVE MODEL + IMPUTER + FEATURE LIST
# ============================================================

model_package = {

    "model": model,

    "imputer": imputer,

    "feature_columns": FEATURE_COLUMNS,

    "contamination": CONTAMINATION,

    "random_state": RANDOM_STATE

}


joblib.dump(
    model_package,
    MODEL_FILE
)


print(
    f"Model saved:"
)

print(
    MODEL_FILE.resolve()
)

print()


# ============================================================
# GENERATE ANOMALY PREDICTIONS
# ============================================================

print(
    "Generating anomaly predictions..."
)


# Isolation Forest:
#
# prediction =  1  -> normal
# prediction = -1  -> anomaly

predictions = model.predict(
    X_imputed
)


# decision_function:
#
# Higher value = more normal
# Lower value = more anomalous

decision_scores = model.decision_function(
    X_imputed
)


# Convert to an intuitive anomaly score.
#
# Higher score = more anomalous.
#
# This is a relative model score, NOT a probability.
anomaly_scores = -decision_scores


# ============================================================
# CREATE RESULT DATAFRAME
# ============================================================

results = df[
    [
        "station_id",
        "station_name",
        "timestamp",
        "latitude",
        "longitude",
        "elevation_m",
        "temperature_C",
        "dew_point_C",
        "relative_humidity_pct",
        "pressure_hPa"
    ]
].copy()


results["anomaly_prediction"] = predictions

results["anomaly_status"] = np.where(
    predictions == -1,
    "ANOMALY",
    "NORMAL"
)

results["anomaly_score"] = (
    anomaly_scores
)


# ============================================================
# SORT BY ANOMALY SCORE
#
# Highest anomaly score first.
# ============================================================

results = results.sort_values(
    "anomaly_score",
    ascending=False
)


# ============================================================
# SAVE RESULTS
# ============================================================

print(
    "Saving anomaly results..."
)

results.to_csv(
    CURRENT_OUTPUT,
    index=False
)


# ============================================================
# SUMMARY
# ============================================================

total_predictions = len(
    results
)

anomaly_count = (
    results["anomaly_status"]
    .eq("ANOMALY")
    .sum()
)

normal_count = (
    results["anomaly_status"]
    .eq("NORMAL")
    .sum()
)

anomaly_percentage = (
    anomaly_count
    /
    total_predictions
    *
    100
)


# ============================================================
# FINAL REPORT
# ============================================================

print()

print("=" * 72)
print("ENGINE 3 COMPLETE")
print("=" * 72)

print()

print(
    f"Observations analysed : "
    f"{total_predictions:,}"
)

print(
    f"Normal observations   : "
    f"{normal_count:,}"
)

print(
    f"Anomalies detected    : "
    f"{anomaly_count:,}"
)

print(
    f"Anomaly percentage    : "
    f"{anomaly_percentage:.2f}%"
)

print()

print(
    "IMPORTANT:"
)

print(
    "The anomaly score is a relative Isolation Forest score."
)

print(
    "It is NOT a probability that the sensor is faulty."
)

print()

print(
    f"Model:"
)

print(
    MODEL_FILE.resolve()
)

print()

print(
    f"Results:"
)

print(
    CURRENT_OUTPUT.resolve()
)

print()

print("=" * 72)