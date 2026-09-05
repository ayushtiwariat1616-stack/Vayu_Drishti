import pandas as pd
from pathlib import Path

INPUT_FILE = Path("data/cleaned/weather_common_clean.csv")

print("=" * 70)
print("VAYUDRISHTY - FINAL DATASET VALIDATION")
print("=" * 70)

print(f"File: {INPUT_FILE}")
print()

# ------------------------------------------------------------
# Load dataset
# ------------------------------------------------------------
df = pd.read_csv(INPUT_FILE)

print(f"Rows              : {len(df):,}")
print(f"Columns            : {len(df.columns)}")
print()

print("Columns:")
for col in df.columns:
    print(f"  - {col}")

print()

# ------------------------------------------------------------
# Timestamp
# ------------------------------------------------------------
df["timestamp"] = pd.to_datetime(
    df["timestamp"],
    errors="coerce"
)

print("-" * 70)
print("TIMESTAMP CHECK")
print("-" * 70)

print(f"Invalid timestamps : {df['timestamp'].isna().sum():,}")

if df["timestamp"].notna().any():
    print(f"Start date         : {df['timestamp'].min()}")
    print(f"End date           : {df['timestamp'].max()}")

print()

# ------------------------------------------------------------
# Station check
# ------------------------------------------------------------
print("-" * 70)
print("STATION CHECK")
print("-" * 70)

print(f"Unique stations    : {df['station_id'].nunique():,}")

print()

# ------------------------------------------------------------
# Duplicate check
# ------------------------------------------------------------
duplicates = df.duplicated(
    subset=["station_id", "timestamp"]
).sum()

print("-" * 70)
print("DUPLICATE CHECK")
print("-" * 70)

print(
    f"Duplicate station/timestamp rows : {duplicates:,}"
)

print()

# ------------------------------------------------------------
# Temperature
# ------------------------------------------------------------
print("-" * 70)
print("TEMPERATURE CHECK")
print("-" * 70)

print(
    f"Missing temperature : "
    f"{df['temperature_C'].isna().sum():,}"
)

valid_temp = df["temperature_C"].dropna()

if len(valid_temp) > 0:
    print(f"Minimum temperature : {valid_temp.min():.2f} °C")
    print(f"Maximum temperature : {valid_temp.max():.2f} °C")

print()

# ------------------------------------------------------------
# Dew point
# ------------------------------------------------------------
print("-" * 70)
print("DEW POINT CHECK")
print("-" * 70)

print(
    f"Missing dew point : "
    f"{df['dew_point_C'].isna().sum():,}"
)

valid_dew = df["dew_point_C"].dropna()

if len(valid_dew) > 0:
    print(f"Minimum dew point : {valid_dew.min():.2f} °C")
    print(f"Maximum dew point : {valid_dew.max():.2f} °C")

print()

# ------------------------------------------------------------
# Relative humidity
# ------------------------------------------------------------
print("-" * 70)
print("RELATIVE HUMIDITY CHECK")
print("-" * 70)

print(
    f"Missing RH : "
    f"{df['relative_humidity_pct'].isna().sum():,}"
)

valid_rh = df["relative_humidity_pct"].dropna()

if len(valid_rh) > 0:
    print(f"Minimum RH : {valid_rh.min():.2f} %")
    print(f"Maximum RH : {valid_rh.max():.2f} %")

print()

# ------------------------------------------------------------
# Pressure
# ------------------------------------------------------------
print("-" * 70)
print("PRESSURE CHECK")
print("-" * 70)

print(
    f"Missing pressure : "
    f"{df['pressure_hPa'].isna().sum():,}"
)

valid_pressure = df["pressure_hPa"].dropna()

if len(valid_pressure) > 0:
    print(
        f"Minimum pressure : "
        f"{valid_pressure.min():.2f} hPa"
    )

    print(
        f"Maximum pressure : "
        f"{valid_pressure.max():.2f} hPa"
    )

print()

# ------------------------------------------------------------
# Pressure source
# ------------------------------------------------------------
print("-" * 70)
print("PRESSURE SOURCE")
print("-" * 70)

print(
    df["pressure_source"]
    .value_counts(dropna=False)
    .to_string()
)

print()

# ------------------------------------------------------------
# Report type
# ------------------------------------------------------------
print("-" * 70)
print("REPORT TYPE")
print("-" * 70)

print(
    df["report_type"]
    .value_counts(dropna=False)
    .to_string()
)

print()

# ------------------------------------------------------------
# Missing values summary
# ------------------------------------------------------------
print("-" * 70)
print("MISSING VALUES")
print("-" * 70)

missing = df.isna().sum()

for column, count in missing.items():
    percentage = (count / len(df)) * 100

    print(
        f"{column:25s} : "
        f"{count:10,} "
        f"({percentage:6.2f}%)"
    )

print()

# ------------------------------------------------------------
# Final verdict
# ------------------------------------------------------------
print("=" * 70)
print("FINAL VALIDATION COMPLETE")
print("=" * 70)

if duplicates == 0:
    print("Duplicate check       : PASS")
else:
    print("Duplicate check       : REVIEW")

if df["timestamp"].isna().sum() == 0:
    print("Timestamp check       : PASS")
else:
    print("Timestamp check       : REVIEW")

if valid_rh.between(0, 100).all():
    print("Relative humidity    : PASS")
else:
    print("Relative humidity    : REVIEW")

print()
print("Common dataset:")
print(INPUT_FILE.resolve())

print("=" * 70)