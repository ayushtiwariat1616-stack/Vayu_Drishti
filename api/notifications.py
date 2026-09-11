from twilio.rest import Client
import os

def send_anomaly_sms(anomaly_event):
    """
    Sends an SMS alert to the 3 maintainers of a station when an anomaly occurs.
    """
    account_sid = os.environ.get('TWILIO_ACCOUNT_SID')
    auth_token = os.environ.get('TWILIO_AUTH_TOKEN')
    twilio_number = os.environ.get('TWILIO_PHONE_NUMBER')

    # If Twilio isn't configured, skip sending
    if not account_sid or not auth_token or not twilio_number:
        print("Twilio credentials not found. Skipping SMS alert.")
        return

    client = Client(account_sid, auth_token)

    station = anomaly_event.station
    
    maintainers = [
        station.maintainer_1_phone,
        station.maintainer_2_phone,
        station.maintainer_3_phone
    ]

    # Filter out empty or null numbers
    valid_numbers = [num for num in maintainers if num]

    if not valid_numbers:
        print(f"No valid maintainer numbers found for station {station.station_id}")
        return

    # Format the message exactly as requested
    message_body = (
        f"🚨 VAYU DRISHTI ALERT 🚨\n"
        f"Station: {station.station_id}\n"
        f"Timestamp: {anomaly_event.timestamp.strftime('%Y-%m-%d %H:%M:%S UTC')}\n"
        f"Severity: {anomaly_event.severity} (Score: {anomaly_event.score})\n"
        f"Type: {anomaly_event.anomaly_type}\n"
        f"ML Diagnosis: {anomaly_event.description}"
    )

    for number in valid_numbers:
        try:
            message = client.messages.create(
                body=message_body,
                from_=twilio_number,
                to=number
            )
            print(f"Alert sent to {number}. SID: {message.sid}")
        except Exception as e:
            print(f"Failed to send alert to {number}: {str(e)}")
