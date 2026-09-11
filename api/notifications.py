import logging
from twilio.rest import Client
import os

logger = logging.getLogger(__name__)

def send_anomaly_sms(anomaly_event):
    """
    Sends an SMS alert to the 3 maintainers of a station when an anomaly occurs.
    """
    account_sid = os.environ.get('TWILIO_ACCOUNT_SID')
    auth_token = os.environ.get('TWILIO_AUTH_TOKEN')
    twilio_number = os.environ.get('TWILIO_PHONE_NUMBER')

    # If Twilio isn't configured, skip sending
    if not account_sid or not auth_token or not twilio_number:
        logger.warning("Twilio credentials not found. Skipping SMS alert.")
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
        logger.warning(f"No valid maintainer numbers found for station {station.station_id}")
        return

    # Format the message to look like a friendly human message to bypass strict Indian SMS spam filters
    message_body = (
        f"Hi Maintainer! Just a quick heads up: Station {station.station_id} is showing a {anomaly_event.anomaly_type}. "
        f"The ML system gave it a score of {anomaly_event.score}. Please check the dashboard when you can!"
    )

    for number in valid_numbers:
        # Strip any existing 'whatsapp:' prefix just in case the user added it to the DB
        clean_number = number.replace("whatsapp:", "")
        clean_twilio = twilio_number.replace("whatsapp:", "")
        
        try:
            message = client.messages.create(
                body=message_body,
                from_=f"whatsapp:{clean_twilio}",
                to=f"whatsapp:{clean_number}"
            )
            success_msg = f"SUCCESS: WhatsApp Alert sent to {clean_number}. Twilio SID: {message.sid}"
            print(success_msg, flush=True)
            logger.info(success_msg)
        except Exception as e:
            error_msg = f"ERROR: Failed to send WhatsApp alert to {clean_number}: {str(e)}"
            print(error_msg, flush=True)
            logger.error(error_msg)
