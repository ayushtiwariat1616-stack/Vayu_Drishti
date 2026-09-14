import pandas as pd
import numpy as np
import joblib
import json

class VayudrishtyLiveInference:
    def __init__(self):
        print("Initializing Vayudrishty Live Inference Engine...")
        self.model = joblib.load('vayudrishty_xgb_model.pkl')
        self.features = joblib.load('vayudrishty_feature_names.pkl')
        self.le = joblib.load('vayudrishty_label_encoder.pkl')
        
    def _calculate_live_features(self, history_df):
        """Engineers features for the newest row using the provided history buffer."""
        df = history_df.copy()
        
        # 1. Base Datetime & Cyclic Features
        df['timestamp'] = pd.to_datetime(df['timestamp'])
        df['month_sin'] = np.sin(2 * np.pi * df['timestamp'].dt.month / 12.0)
        df['month_cos'] = np.cos(2 * np.pi * df['timestamp'].dt.month / 12.0)
        df['hour_sin'] = np.sin(2 * np.pi * df['timestamp'].dt.hour / 24.0)
        df['hour_cos'] = np.cos(2 * np.pi * df['timestamp'].dt.hour / 24.0)
        
        # 2. Time Gaps & Missing Flags
        df['time_gap_minutes'] = df['timestamp'].diff().dt.total_seconds() / 60.0
        df['is_temp_missing'] = df['temperature_C'].isna().astype(int)
        df['is_large_time_gap'] = (df['time_gap_minutes'] > 360).astype(int)
        
        # 3. Barometric Pressure Conversion (Assuming SLP provided, convert to STP)
        kelvin = df['temperature_C'] + 273.15
        df['station_pressure_hPa'] = df['pressure_hPa'] * (1 - (0.0065 * df['elevation_m']) / kelvin) ** 5.2561
        
        # 4. Rates and Deltas
        sensor_cols = ['temperature_C', 'relative_humidity_pct', 'station_pressure_hPa']
        for col in sensor_cols:
            df[f'delta_{col}'] = df[col].diff()
            df[f'rate_{col}_per_hr'] = (df[f'delta_{col}'] / (df['time_gap_minutes'] + 1e-5)) * 60.0
            
        # 5. Time-Aware Rolling Windows (Requires datetime index)
        df = df.set_index('timestamp')
        for col in sensor_cols:
            rolling_24h = df[col].rolling('24h', min_periods=2)
            rolling_6h = df[col].rolling('6h', min_periods=2)
            
            df[f'{col}_rolling_mean_24h'] = rolling_24h.mean()
            df[f'{col}_rolling_std_24h'] = rolling_24h.std()
            df[f'{col}_rolling_std_6h'] = rolling_6h.std()
            
            df[f'{col}_local_zscore'] = (df[col] - df[f'{col}_rolling_mean_24h']) / (df[f'{col}_rolling_std_24h'] + 1e-5)
            df[f'is_frozen_{col}'] = (df[f'{col}_rolling_std_6h'] < 1e-4).astype(int)
            
        # 6. Multivariate Consistency
        df['dew_point_depression'] = df['temperature_C'] - df['dew_point_C']
        
        # Fill NaNs with sentinel for XGBoost
        df = df.fillna(-9999.0).reset_index()
        
        # Return only the newest engineered row formatted exactly for the model
        newest_row = df.iloc[[-1]][self.features]
        return newest_row, df.iloc[[-1]]

    def generate_human_explanation(self, anomaly_type, live_features_df):
        """Translates the engineered features into a human-readable explanation."""
        time_gap = round(live_features_df['time_gap_minutes'].iloc[0], 1)
        temp_rate = round(live_features_df['rate_temperature_C_per_hr'].iloc[0], 2)
        temp_zscore = round(live_features_df['temperature_C_local_zscore'].iloc[0], 2)
        dew_depression = round(live_features_df['dew_point_depression'].iloc[0], 2)
        rh_std_6h = round(live_features_df['relative_humidity_pct_rolling_std_6h'].iloc[0], 4)
        press_rate = round(live_features_df['rate_station_pressure_hPa_per_hr'].iloc[0], 2)

        if anomaly_type == "NORMAL":
            return "All sensor readings and rates of change are consistent with historical and seasonal weather patterns."
        elif anomaly_type == "COMMUNICATION_ERROR":
            return f"The station failed to transmit data for {time_gap} minutes, causing an unnatural time gap in the telemetry stream."
        elif anomaly_type == "MISSING_DATA":
            return "The data packet was received on time, but the sensor payload contained missing or corrupt values (NaN/-9999.0)."
        elif anomaly_type == "SPIKE":
            return f"An unnatural spike was detected. The temperature changed at a rate of {temp_rate}°C per hour, reaching a local z-score of {temp_zscore}, which statistically deviates from the 24-hour baseline."
        elif anomaly_type == "DROP":
            return f"A sudden drop was detected. The pressure plunged at a rate of {press_rate} hPa per hour, which is too rapid for natural atmospheric changes."
        elif anomaly_type == "MULTIVARIATE_FAULT":
            if dew_depression < 0:
                return f"Physical inconsistency detected. The temperature is {abs(dew_depression)}°C below the dew point, which is an impossible atmospheric state (humidity > 100%), indicating sensor hardware failure."
            return "The combination of temperature, pressure, and humidity violates normal atmospheric consistency rules."
        elif anomaly_type == "FROZEN_SENSOR":
            return f"Sensor freeze detected. The humidity sensor has shown zero natural variance over the last 6 hours (Standard Deviation: {rh_std_6h}), indicating it is stuck."
        elif anomaly_type == "DRIFT":
            return f"The sensor is gradually deviating from its expected baseline. It has reached a z-score of {temp_zscore} without a sudden environmental event."
        elif anomaly_type == "BIAS":
            return "The sensor is reporting a persistent offset from expected local baselines, but the rate of change remains near zero, indicating a severe calibration error rather than a sudden spike."
        elif anomaly_type == "NOISE":
            return f"High-frequency erratic fluctuations detected. The 6-hour variance has spiked unnaturally to {rh_std_6h}."
        
        return "Anomaly detected based on unusual feature interactions."
        
    def process_live_reading(self, history_buffer):
        """Processes a live ESP32 buffer and returns a JSON classification report."""
        X_live, live_full_df = self._calculate_live_features(history_buffer)
        
        pred_encoded = self.model.predict(X_live)[0]
        probabilities = self.model.predict_proba(X_live)[0]
        
        anomaly_type = self.le.inverse_transform([pred_encoded])[0]
        confidence = probabilities[pred_encoded] * 100
        
        severity = "HIGH" if anomaly_type in ["COMMUNICATION_ERROR", "MULTIVARIATE_FAULT", "FROZEN_SENSOR", "MISSING_DATA"] else "MEDIUM"
        if anomaly_type == "NORMAL":
            severity = "NONE"
            
        explanation = self.generate_human_explanation(anomaly_type, live_full_df)
        
        result = {
            "status": "success",
            "timestamp": str(history_buffer['timestamp'].iloc[-1]),
            "station_id": int(history_buffer['station_id'].iloc[-1]),
            "anomaly_analysis": {
                "detected_root_cause": anomaly_type,
                "confidence_score_pct": round(confidence, 2),
                "severity_level": severity
            },
            "explainability": {
                "human_readable_reason": explanation
            },
            "system_recommendation": "Dispatch maintenance crew to inspect sensor hardware." if severity == "HIGH" else "Monitor continuously." if severity == "MEDIUM" else "No action required."
        }
        
        return json.dumps(result, indent=4)

# ==========================================
# SIMULATING LIVE ESP32 INFERENCE FOR DEMO
# ==========================================
if __name__ == "__main__":
    engine = VayudrishtyLiveInference()
    
    # Simulate a history buffer containing a multivariate fault in the latest reading
    # (Temperature artificially drops well below the dew point)
    simulated_stream = pd.DataFrame({
        'station_id': [420270, 420270, 420270],
        'timestamp': ['2026-09-04 10:00:00', '2026-09-04 11:00:00', '2026-09-04 12:00:00'],
        'elevation_m': [1587.0, 1587.0, 1587.0],
        'temperature_C': [22.1, 22.5, 0.5], 
        'dew_point_C': [12.0, 12.2, 12.2],
        'relative_humidity_pct': [55.0, 54.5, 54.0],
        'pressure_hPa': [1012.5, 1012.3, 1012.0]
    })
    
    print("\nProcessing incoming ESP32 data stream...")
    dashboard_json = engine.process_live_reading(simulated_stream)
    print("\n--- FINAL DASHBOARD API OUTPUT ---")
    print(dashboard_json)