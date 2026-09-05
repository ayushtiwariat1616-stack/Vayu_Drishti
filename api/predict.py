def detect_anomaly(temperature, humidity, pressure):
    """
    Simulated ML Engine for SIH Phase 2.
    Returns a structured dictionary matching the frontend contract.
    """
    critical_temp = 45.0
    critical_hum = 90.0

    if temperature > critical_temp:
        return {
            "is_anomaly": True,
            "type": "TEMPERATURE_SPIKE",
            "severity": "HIGH",
            "score": 0.96,
            "confidence": 0.92,
            "detection_layers": {"ruleEngine": 0.9, "temporalAnalysis": 0.8},
            "root_causes": ["EXTREME_HEAT", "SENSOR_FAULT"],
            "affected_sensors": ["temperature"],
            "explanation": f"Temperature spiked to {temperature}°C, exceeding operational limits.",
            "corrected_estimate": {"temperature": 35.0, "humidity": humidity}
        }
        
    if humidity > critical_hum:
        return {
            "is_anomaly": True,
            "type": "HUMIDITY_SPIKE",
            "severity": "HIGH",
            "score": 0.91,
            "confidence": 0.88,
            "detection_layers": {"ruleEngine": 0.8, "multivariate": 0.7},
            "root_causes": ["WATER_INGRESS"],
            "affected_sensors": ["humidity"],
            "explanation": f"Humidity reached critical level of {humidity}%.",
            "corrected_estimate": {"temperature": temperature, "humidity": 60.0}
        }

    # Normal Reading
    return {
        "is_anomaly": False,
        "score": 0.05,
        "confidence": 0.99
    }