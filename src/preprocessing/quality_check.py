from pathlib import Path
import pandas as pd
import numpy as np


# ============================================================
# VAYUDRISHTY - DATA QUALITY DIAGNOSIS
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parent.parent

INPUT_FILE = (
    PROJECT_ROOT
    / "data"
    / "merged"
    / "weather_merged.csv"
)


print("=" * 70)
print("VAYUDRISHTY DATA QUALITY DIAGNOSIS")
print("=" * 70)

print(f"Input: {INPUT_FILE}")
print()


# ------------------------------------------------------------
# Read dataset
# ------------------------------------------------------------

df = pd.read_csv(
    INPUT_FILE,
    low_memory=False
)

print(f"Rows loaded: {len(df):,}")
print()


# ============================================================
# 1. INVALID TEMPERATURE VALUES
# ============================================================

print("=" * 70)
print("1. TEMPERATURE QUALITY")
print("=" * 70)

invalid_temp = (
    df["temperature_C"].isna()
    | (df["temperature_C"] >= 900)
    | (df["temperature_C"] <= -100)
)

print(
    f"Invalid temperature values: "
    f"{invalid_temp.sum():,}"
)

print(
    f"Valid temperature values:   "
    f"{(~invalid_temp).sum():,}"
)

print()

print("Temperature range after excluding invalid values:")

valid_temp = df.loc[~invalid_temp, "temperature_C"]

print(f"Minimum: {valid_temp.min()}")
print(f"Maximum: {valid_temp.max()}")
print()


# ============================================================
# 2. INVALID DEW POINT VALUES
# ============================================================

print("=" * 70)
print("2. DEW POINT QUALITY")
print("=" * 70)

invalid_dew = (
    df["dew_point_C"].isna()
    | (df["dew_point_C"] >= 900)
    | (df["dew_point_C"] <= -100)
)

print(
    f"Invalid dew point values: "
    f"{invalid_dew.sum():,}"
)

print(
    f"Valid dew point values:   "
    f"{(~invalid_dew).sum():,}"
)

print()

valid_dew = df.loc[~invalid_dew, "dew_point_C"]

print("Dew point range after excluding invalid values:")

print(f"Minimum: {valid_dew.min()}")
print(f"Maximum: {valid_dew.max()}")
print()


# ============================================================
# 3. PRESSURE QUALITY
# ============================================================

print("=" * 70)
print("3. PRESSURE QUALITY")
print("=" * 70)

valid_pressure = df[
    df["pressure_hPa"].notna()
    & (df["pressure_hPa"] > 0)
    & (df["pressure_hPa"] < 1200)
]["pressure_hPa"]

print(
    f"Valid pressure observations: "
    f"{len(valid_pressure):,}"
)

print(
    f"Minimum pressure: "
    f"{valid_pressure.min()}"
)

print(
    f"Maximum pressure: "
    f"{valid_pressure.max()}"
)

print()

print("Pressure source counts:")

print(
    df["pressure_source"]
    .value_counts(dropna=False)
)

print()


# ============================================================
# 4. DUPLICATE ANALYSIS
# ============================================================

print("=" * 70)
print("4. DUPLICATE ANALYSIS")
print("=" * 70)

duplicate_mask = df.duplicated(
    subset=["station_id", "timestamp"],
    keep=False
)

duplicate_rows = df[duplicate_mask].copy()

print(
    f"Rows belonging to duplicate "
    f"station/timestamp groups: "
    f"{len(duplicate_rows):,}"
)

print()


# ------------------------------------------------------------
# Exact duplicates
# ------------------------------------------------------------

exact_duplicate_count = df.duplicated(
    keep=False
).sum()

print(
    f"Rows belonging to exact duplicate "
    f"records: {exact_duplicate_count:,}"
)

print()


# ------------------------------------------------------------
# Duplicate groups
# ------------------------------------------------------------

duplicate_group_count = (
    duplicate_rows
    .groupby(["station_id", "timestamp"])
    .ngroups
)

print(
    f"Duplicate station/timestamp groups: "
    f"{duplicate_group_count:,}"
)

print()


# ============================================================
# 5. SAMPLE DUPLICATES
# ============================================================

print("=" * 70)
print("5. SAMPLE DUPLICATE RECORDS")
print("=" * 70)

if len(duplicate_rows) > 0:

    sample = (
        duplicate_rows
        .sort_values(
            ["station_id", "timestamp"]
        )
        .head(20)
    )

    print(
        sample[
            [
                "station_id",
                "timestamp",
                "temperature_C",
                "dew_point_C",
                "pressure_hPa",
                "pressure_source",
            ]
        ].to_string(index=False)
    )

else:

    print("No duplicates found.")


print()


# ============================================================
# 6. CONFLICTING DUPLICATES
# ============================================================

print("=" * 70)
print("6. CONFLICTING DUPLICATES")
print("=" * 70)

if len(duplicate_rows) > 0:

    duplicate_variation = (
        duplicate_rows
        .groupby(["station_id", "timestamp"])
        .agg(
            temperature_unique=(
                "temperature_C",
                "nunique"
            ),
            dew_unique=(
                "dew_point_C",
                "nunique"
            ),
            pressure_unique=(
                "pressure_hPa",
                "nunique"
            ),
        )
    )

    conflicting_groups = duplicate_variation[
        (duplicate_variation["temperature_unique"] > 1)
        | (duplicate_variation["dew_unique"] > 1)
        | (duplicate_variation["pressure_unique"] > 1)
    ]

    print(
        "Duplicate groups with different "
        "sensor values: "
        f"{len(conflicting_groups):,}"
    )

else:

    print("No duplicate groups found.")


print()


# ============================================================
# 7. RELATIONSHIP BETWEEN TEMPERATURE AND DEW POINT
# ============================================================

print("=" * 70)
print("7. TEMPERATURE / DEW POINT CONSISTENCY")
print("=" * 70)

valid_td = df[
    (~invalid_temp)
    & (~invalid_dew)
].copy()

dew_above_temp = (
    valid_td["dew_point_C"]
    > valid_td["temperature_C"] + 0.5
)

print(
    "Rows where dew point is more than "
    "0.5°C above temperature: "
    f"{dew_above_temp.sum():,}"
)

print()


# ============================================================
# COMPLETE
# ============================================================

print("=" * 70)
print("QUALITY DIAGNOSIS COMPLETE")
print("=" * 70)