# VAYUDRISHTY: Model 2 - Root Cause Anomaly Classification

## Overview
This repository contains the architecture, training pipeline, and live inference engine for **Model 2** of the VAYUDRISHTY ecosystem, developed for the Smart India Hackathon (SIH) 2026. 

While traditional anomaly detection systems flag outliers (Stage 1), they often fail to distinguish between legitimate extreme weather events and hardware degradation, leading to false alarms. Model 2 solves this by acting as a **Root Cause Classification Engine**. It consumes the telemetry flagged by Stage 1 and utilizes multivariate atmospheric physics and temporal feature engineering to pinpoint exactly *why* the anomaly occurred across 10 distinct classes.

## Technical Architecture
* **Algorithm:** Extreme Gradient Boosting (`XGBClassifier`)
* **Optimization:** Fast hyperparameter tuning via `Optuna` (sampled search to balance compute constraints with performance).
* **Scaling:** Utilizes `tree_method='hist'` (Histogram-based algorithm) to efficiently process a 4.4+ million row training dataset while remaining lightweight enough for edge-server deployment.
* **Evaluation:** Strict chronological station-aware splitting (80/20) prevents temporal leakage, ensuring the model generalizes to unseen future weather patterns. Achieves a ~1.00 Macro F1-Score on the test set.

## Engineered Feature Space
The model does not rely on raw telemetry. It ingests a live stream from an ESP32+BME280 hardware setup and dynamically calculates 30+ engineered features:
* **Cyclic Temporal Features:** Sine/Cosine encoding of hours and months to capture natural daily and seasonal weather cycles.
* **Telemetry Integrity:** `time_gap_minutes` and missing data flags (using -9999.0 sentinels) to instantly isolate network/communication failures.
* **Time-Aware Rolling Windows:** 6-hour and 24-hour rolling means and standard deviations to establish local baselines and detect "frozen" or stuck sensors.
* **Multivariate Physics:** Calculation of the `dew_point_depression` and barometric pressure conversions to enforce strict atmospheric consistency rules (e.g., flagging scenarios where humidity exceeds 100%).

## The 10-Class Taxonomy
The model categorizes incoming data into one of the following states:
1. `NORMAL` (Valid extreme weather or standard baseline)
2. `COMMUNICATION_ERROR` (Severe time-gap violations)
3. `MISSING_DATA` (Corrupt or dropped packet payloads)
4. `SPIKE` (High-rate, high-z-score deviations)
5. `DROP` (Unnatural rapid descents in values)
6. `FROZEN_SENSOR` (Zero variance over rolling windows)
7. `DRIFT` (Gradual deviation without sudden events)
8. `BIAS` (Persistent offset with zero rate-of-change)
9. `NOISE` (High-frequency erratic fluctuations)
10. `MULTIVARIATE_FAULT` (Violation of atmospheric physics boundaries)

## Explainability and Trust (SHAP)
To satisfy SIH compliance for AI interpretability, Model 2 integrates **SHAP (SHapley Additive exPlanations)**. The system is provably explainable: it maps global feature importance to specific anomaly types. For example, SHAP validates that the model strictly uses `time_gap_minutes` to predict communication errors and `dew_point_depression` to flag multivariate physical faults.

## Live Inference Engine
The `live_inference.py` script houses the `VayudrishtyLiveInference` class, designed for seamless integration with backend APIs (FastAPI/Flask). It maintains a transient history buffer, engineers features on-the-fly in milliseconds, and translates mathematical predictions into human-readable JSON alerts for the UI dashboard.

### Example API Output
```json
{
    "status": "success",
    "timestamp": "2026-09-04 12:00:00",
    "station_id": 420270,
    "anomaly_analysis": {
        "detected_root_cause": "MULTIVARIATE_FAULT",
        "confidence_score_pct": 99.8,
        "severity_level": "HIGH"
    },
    "explainability": {
        "human_readable_reason": "Physical inconsistency detected. The temperature is 12.5°C below the dew point, which is an impossible atmospheric state (humidity > 100%), indicating sensor hardware failure."
    },
    "system_recommendation": "Dispatch maintenance crew to inspect sensor hardware."
}