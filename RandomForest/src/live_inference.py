import os
from pathlib import Path
import pandas as pd
import numpy as np
import joblib
import json

class VayudrishtyLiveInference:
    def __init__(self):
        print("Initializing Vayudrishty Live Inference Engine...")
        base_dir = Path(__file__).resolve().parent.parent
        models_dir = base_dir / 'models'
        
        self.model = joblib.load(models_dir / 'vayudrishty_xgb_model.pkl')
        self.features = joblib.load(models_dir / 'vayudrishty_feature_names.pkl')
        self.le = joblib.load(models_dir / 'vayudrishty_label_encoder.pkl')
        
    def _calculate_live_features(self, history_df):
        """Engineers features for the newest row using the provided history buffer."""
        df = history_df.copy()
        
        # 1. Provide station coordinate defaults if missing
        if 'latitude' not in df.columns:
            df['latitude'] = 28.6139
        if 'longitude' not in df.columns:
            df['longitude'] = 77.2090
        if 'elevation_m' not in df.columns:
            df['elevation_m'] = 216.0
        
        # 2. Datetime & Cyclic Features
        df['timestamp'] = pd.to_datetime(df['timestamp'])
        df['month_sin'] = np.sin(2 * np.pi * df['timestamp'].dt.month / 12.0)
        df['month_cos'] = np.cos(2 * np.pi * df['timestamp'].dt.month / 12.0)
        df['hour_sin'] = np.sin(2 * np.pi * df['timestamp'].dt.hour / 24.0)
        df['hour_cos'] = np.cos(2 * np.pi * df['timestamp'].dt.hour / 24.0)
        
        # 3. Time Gaps & Missing Flags
        df['time_gap_minutes'] = df['timestamp'].diff().dt.total_seconds() / 60.0
        df['is_temp_missing'] = df['temperature_C'].isna().astype(int)
        df['is_pressure_missing'] = df['pressure_hPa'].isna().astype(int)
        df['is_rh_missing'] = df['relative_humidity_pct'].isna().astype(int)
        df['is_large_time_gap'] = (df['time_gap_minutes'] > 360).astype(int)
        
        # 4. Barometric Pressure Conversion
        kelvin = df['temperature_C'] + 273.15
        df['station_pressure_hPa'] = df['pressure_hPa'] * (1 - (0.0065 * df['elevation_m']) / kelvin) ** 5.2561
        
        # 5. Rates and Deltas
        sensor_cols = ['temperature_C', 'relative_humidity_pct', 'station_pressure_hPa']
        for col in sensor_cols:
            df[f'delta_{col}'] = df[col].diff()
            df[f'rate_{col}_per_hr'] = (df[f'delta_{col}'] / (df['time_gap_minutes'] + 1e-5)) * 60.0
            
        # 6. Time-Aware Rolling Windows
        df = df.set_index('timestamp')
        for col in sensor_cols:
            rolling_24h = df[col].rolling('24h', min_periods=2)
            rolling_6h = df[col].rolling('6h', min_periods=2)
            
            df[f'{col}_rolling_mean_24h'] = rolling_24h.mean()
            df[f'{col}_rolling_std_24h'] = rolling_24h.std()
            df[f'{col}_rolling_std_6h'] = rolling_6h.std()
            
            df[f'{col}_local_zscore'] = (df[col] - df[f'{col}_rolling_mean_24h']) / (df[f'{col}_rolling_std_24h'] + 1e-5)
            df[f'is_frozen_{col}'] = (df[f'{col}_rolling_std_6h'] < 1e-4).astype(int)
            
        # 7. Atmospheric Consistency
        df['dew_point_depression'] = df['temperature_C'] - df['dew_point_C']
        
        # Fill missing values with sentinel
        df = df.fillna(-9999.0).reset_index()
        
        # Ensure every feature expected by the model exists in the dataframe
        for feat in self.features:
            if feat not in df.columns:
                df[feat] = -9999.0
                
        newest_row = df.iloc[[-1]][self.features]
        return newest_row, df.iloc[[-1]]

    def generate_human_explanation(self, anomaly_type, live_features_df):
        """Translates engineered features into human-readable text."""
        time_gap = round(live_features_df['time_gap_minutes'].iloc[0], 1)
        temp_rate = round(live_features_df['rate_temperature_C_per_hr'].iloc[0], 2)
        temp_zscore = round(live_features_df['temperature_C_local_zscore'].iloc[0], 2)
        dew_depression = round(live_features_df['dew_point_depression'].iloc[0], 2)
        rh_std_6h = round(live_features_df['relative_humidity_pct_rolling_std_6h'].iloc[0], 4)
        press_rate = round(live_features_df['rate_station_pressure_hPa_per_hr'].iloc[0], 2)

        if anomaly_type == "NORMAL":
            return "All sensor readings and rates of change are consistent with historical and seasonal weather patterns."
        elif anomaly_type == "COMMUNICATION_ERROR":
            return f"The station failed to transmit data for {time_gap} minutes, causing an unnatural time gap in telemetry."
        elif anomaly_type == "MISSING_DATA":
            return "The data packet was received on time, but sensor values were null or corrupt."
        elif anomaly_type == "SPIKE":
            return f"Unnatural spike detected. Temperature changed at {temp_rate}°C/hr with a local z-score of {temp_zscore}."
        elif anomaly_type == "DROP":
            return f"Sudden drop detected. Pressure dropped at {press_rate} hPa/hr, exceeding normal meteorological shifts."
        elif anomaly_type == "MULTIVARIATE_FAULT":
            if dew_depression < 0:
                return f"Physical inconsistency detected: Temperature is {abs(dew_depression)}°C below dew point, indicating sensor failure."
            return "The combination of temperature, pressure, and humidity violates normal atmospheric physical laws."
        elif anomaly_type == "FROZEN_SENSOR":
            return f"Sensor freeze detected. Humidity shows zero variance over 6 hours (Std: {rh_std_6h})."
        elif anomaly_type == "DRIFT":
            return f"Gradual sensor drift detected with a steady z-score offset of {temp_zscore}."
        elif anomaly_type == "BIAS":
            return "Persistent baseline calibration bias detected with near-zero change rate."
        elif anomaly_type == "NOISE":
            return f"High-frequency erratic fluctuations detected (6h variance: {rh_std_6h})."
        
        return "Anomaly detected based on atypical multi-sensor dynamics."
        
    def process_live_reading(self, history_buffer):
        """Processes a live telemetry buffer and returns a JSON report."""
        X_live, live_full_df = self._calculate_live_features(history_buffer)
        
        pred_encoded = self.model.predict(X_live)[0]
        probabilities = self.model.predict_proba(X_live)[0]
        
        anomaly_type = self.le.inverse_transform([pred_encoded])[0]
        confidence = float(probabilities[pred_encoded] * 100)
        
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

if __name__ == "__main__":
    engine = VayudrishtyLiveInference()
    
    simulated_stream = pd.DataFrame({
        'station_id': [420270, 420270, 420270],
        'timestamp': ['2026-09-04 10:00:00', '2026-09-04 11:00:00', '2026-09-04 12:00:00'],
        'latitude': [28.6139, 28.6139, 28.6139],
        'longitude': [77.2090, 77.2090, 77.2090],
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