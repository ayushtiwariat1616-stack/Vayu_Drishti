def detect_anomaly(temperature, humidity, pressure):
    """
    Simulated ML Engine for SIH Phase 2.
    This function acts as a placeholder until the ML team delivers the actual model.
    It returns True if a critical anomaly is detected, and False otherwise.
    """
    # Threshold logic: If it's as hot as the Gravity Chamber, sound the alarm!
    critical_temp_threshold = 45.0
    critical_humidity_threshold = 90.0

    if temperature > critical_temp_threshold:
        print(f"⚠️ WARNING: Critical Temperature Detected: {temperature}°C")
        return True
        
    if humidity > critical_humidity_threshold:
        print(f"⚠️ WARNING: Critical Humidity Detected: {humidity}%")
        return True

    # If readings are normal
    return False