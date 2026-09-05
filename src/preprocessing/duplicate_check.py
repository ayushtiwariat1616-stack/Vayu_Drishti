from pathlib import Path
import pandas as pd


# ============================================================
# VAYUDRISHTY - DUPLICATE SOURCE CHECK
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parent.parent
RAW_DATA = PROJECT_ROOT / "data" / "raw"

print("=" * 70)
print("VAYUDRISHTY DUPLICATE SOURCE CHECK")
print("=" * 70)


# We will inspect a known example station from the
# quality-check output.
STATION_ID = "42071099999"
TARGET_DATE = "2019-01-01"


files = list(RAW_DATA.rglob(f"{STATION_ID}.csv"))

print(f"Files found for station {STATION_ID}: {len(files)}")
print()


for file in files:

    print("-" * 70)
    print(f"FILE: {file}")

    try:

        df = pd.read_csv(
            file,
            low_memory=False
        )

        # Convert DATE to string for comparison
        df["DATE"] = df["DATE"].astype(str)

        sample = df[
            df["DATE"].str.startswith(TARGET_DATE)
        ].copy()

        if len(sample) == 0:
            print("No records for target date.")
            continue

        # Show the fields that help explain duplicate records
        columns_to_show = [
            col
            for col in [
                "STATION",
                "DATE",
                "SOURCE",
                "NAME",
                "REPORT_TYPE",
                "CALL_SIGN",
                "TMP",
                "DEW",
                "SLP",
                "STP",
            ]
            if col in sample.columns
        ]

        print()
        print(
            sample[columns_to_show]
            .to_string(index=False)
        )

    except Exception as e:

        print(f"Could not read file: {e}")


print()
print("=" * 70)
print("DUPLICATE SOURCE CHECK COMPLETE")
print("=" * 70)