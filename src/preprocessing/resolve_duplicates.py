import pandas as pd
from pathlib import Path


# ============================================================
# VAYUDRISHTY - DUPLICATE RESOLUTION
# ============================================================

INPUT_FILE = Path("data/cleaned/weather_cleaned.csv")
OUTPUT_FILE = Path("data/cleaned/weather_common_clean.csv")

CHUNK_SIZE = 100_000


print("=" * 70)
print("VAYUDRISHTY - DUPLICATE RESOLUTION")
print("=" * 70)

print(f"Input : {INPUT_FILE}")
print(f"Output: {OUTPUT_FILE}")
print()


# ------------------------------------------------------------
# Remove previous output if it exists
# ------------------------------------------------------------

if OUTPUT_FILE.exists():
    OUTPUT_FILE.unlink()


# ------------------------------------------------------------
# Statistics
# ------------------------------------------------------------

total_rows = 0
duplicate_rows_found = 0
rows_removed = 0
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
    # Report type priority
    #
    # FM-12 gets priority when the same station has
    # both FM-12 and FM-15 at exactly the same timestamp.
    # --------------------------------------------------------

    chunk["report_priority"] = (
        chunk["report_type"]
        .astype(str)
        .str.upper()
        .eq("FM-12")
        .astype(int)
    )

    # --------------------------------------------------------
    # Identify duplicates inside the current chunk
    # --------------------------------------------------------

    duplicate_mask = chunk.duplicated(
        subset=[
            "station_id",
            "timestamp"
        ],
        keep=False
    )

    duplicate_rows_found += int(
        duplicate_mask.sum()
    )

    # --------------------------------------------------------
    # Sort:
    # station → timestamp → report priority
    # --------------------------------------------------------

    chunk = chunk.sort_values(
        by=[
            "station_id",
            "timestamp",
            "report_priority"
        ],
        ascending=[
            True,
            True,
            False
        ]
    )

    # --------------------------------------------------------
    # Keep one record per station + timestamp
    # --------------------------------------------------------

    before = len(chunk)

    chunk = chunk.drop_duplicates(
        subset=[
            "station_id",
            "timestamp"
        ],
        keep="first"
    )

    rows_removed += (
        before - len(chunk)
    )

    # --------------------------------------------------------
    # Remove temporary column
    # --------------------------------------------------------

    chunk = chunk.drop(
        columns=["report_priority"]
    )

    # --------------------------------------------------------
    # Write output
    # --------------------------------------------------------

    chunk.to_csv(
        OUTPUT_FILE,
        mode="w" if first_chunk else "a",
        header=first_chunk,
        index=False
    )

    first_chunk = False


# ============================================================
# COMPLETE
# ============================================================

print()
print()

print("=" * 70)
print("DUPLICATE RESOLUTION COMPLETE")
print("=" * 70)

print(
    f"Rows processed             : {total_rows:,}"
)

print(
    f"Rows involved in duplicates: "
    f"{duplicate_rows_found:,}"
)

print(
    f"Rows removed               : "
    f"{rows_removed:,}"
)

print()
print("Output:")
print(OUTPUT_FILE.resolve())

print("=" * 70)