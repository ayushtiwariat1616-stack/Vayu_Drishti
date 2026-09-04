from pathlib import Path
import pandas as pd
from collections import Counter

# ============================================================
# VAYUDRISHTY - DATASET INSPECTION
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parent.parent
RAW_DATA = PROJECT_ROOT / "data" / "raw"

print("=" * 70)
print("        VAYUDRISHTY DATASET INSPECTION")
print("=" * 70)

# ------------------------------------------------------------
# 1. Find all CSV files
# ------------------------------------------------------------

csv_files = list(RAW_DATA.rglob("*.csv"))

print(f"\nTotal CSV files found: {len(csv_files)}")

# ------------------------------------------------------------
# 2. Count files by year
# ------------------------------------------------------------

year_counts = Counter()

for file in csv_files:

    # Find the year folder
    for year in ["2019", "2020", "2021", "2022",
                 "2023", "2024", "2025"]:

        if year in file.parts:
            year_counts[year] += 1
            break

print("\nFILES BY YEAR")
print("-" * 40)

for year in sorted(year_counts):

    print(f"{year}: {year_counts[year]} files")

# ------------------------------------------------------------
# 3. Inspect every CSV
# ------------------------------------------------------------

total_rows = 0
stations = set()

column_structures = Counter()

failed_files = []

# Count availability of important fields
field_presence = Counter()

# Count missing values in important fields
missing_counts = Counter()

# ------------------------------------------------------------
# Process files one at a time
# This is important because your laptop has 8 GB RAM.
# ------------------------------------------------------------

for i, file in enumerate(csv_files, start=1):

    try:

        # Read one CSV at a time
        df = pd.read_csv(file)

        # Number of observations
        total_rows += len(df)

        # ----------------------------------------------------
        # Station IDs
        # ----------------------------------------------------

        if "STATION" in df.columns:

            stations.update(
                df["STATION"]
                .dropna()
                .astype(str)
                .unique()
            )

        # ----------------------------------------------------
        # Column structure
        # ----------------------------------------------------

        column_structures[
            tuple(df.columns)
        ] += 1

        # ----------------------------------------------------
        # Important fields
        # ----------------------------------------------------

        important_columns = [
            "STATION",
            "DATE",
            "LATITUDE",
            "LONGITUDE",
            "ELEVATION",
            "TMP",
            "DEW",
            "SLP",
            "STP"
        ]

        for col in important_columns:

            if col in df.columns:

                field_presence[col] += 1

                # Count missing values
                missing_counts[col] += df[col].isna().sum()

        # Progress indicator
        if i % 100 == 0:

            print(
                f"Processed {i}/{len(csv_files)} files..."
            )

    except Exception as e:

        failed_files.append(
            (str(file), str(e))
        )

# ------------------------------------------------------------
# 4. SUMMARY
# ------------------------------------------------------------

print("\n")
print("=" * 70)
print("                    SUMMARY")
print("=" * 70)

print(f"\nTotal CSV files:       {len(csv_files):,}")
print(f"Total observations:    {total_rows:,}")
print(f"Unique stations:       {len(stations):,}")
print(
    f"Different structures:  {len(column_structures)}"
)

# ------------------------------------------------------------
# 5. IMPORTANT COLUMN AVAILABILITY
# ------------------------------------------------------------

print("\n")
print("=" * 70)
print("IMPORTANT COLUMN AVAILABILITY")
print("=" * 70)

for col in [
    "STATION",
    "DATE",
    "LATITUDE",
    "LONGITUDE",
    "ELEVATION",
    "TMP",
    "DEW",
    "SLP",
    "STP"
]:

    print(
        f"{col:15} : "
        f"{field_presence[col]:5} files"
    )

# ------------------------------------------------------------
# 6. MISSING VALUES
# ------------------------------------------------------------

print("\n")
print("=" * 70)
print("MISSING VALUES")
print("=" * 70)

for col in [
    "STATION",
    "DATE",
    "LATITUDE",
    "LONGITUDE",
    "ELEVATION",
    "TMP",
    "DEW",
    "SLP",
    "STP"
]:

    print(
        f"{col:15} : "
        f"{missing_counts[col]:,} missing"
    )

# ------------------------------------------------------------
# 7. COLUMN STRUCTURES
# ------------------------------------------------------------

print("\n")
print("=" * 70)
print("COLUMN STRUCTURES")
print("=" * 70)

for number, (columns, count) in enumerate(
    column_structures.items(),
    start=1
):

    print(f"\nStructure {number}")
    print(f"Used by {count} files")

    print("Columns:")

    for col in columns:

        print(f"  - {col}")

# ------------------------------------------------------------
# 8. FAILED FILES
# ------------------------------------------------------------

print("\n")
print("=" * 70)
print("FAILED FILES")
print("=" * 70)

print(
    f"Files that could not be read: "
    f"{len(failed_files)}"
)

for file, error in failed_files[:20]:

    print("\n", file)
    print(error)

# ------------------------------------------------------------
# END
# ------------------------------------------------------------

print("\n")
print("=" * 70)
print("              INSPECTION COMPLETE")
print("=" * 70)