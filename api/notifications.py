import logging
import os
from django.core.mail import send_mail
from django.conf import settings

logger = logging.getLogger(__name__)

def send_anomaly_email(anomaly_event):
    """
    Sends an email alert to the maintainers of a station when an anomaly occurs.
    """
    logger.info(f"--- STARTING EMAIL ALERT PROCESS FOR STATION {anomaly_event.station.station_id} ---")

    station = anomaly_event.station
    
    maintainers = [
        station.maintainer_1_email,
        station.maintainer_2_email,
        station.maintainer_3_email
    ]

    # Filter out empty or null emails
    valid_emails = [email for email in maintainers if email]

    if not valid_emails:
        logger.warning(f"No valid maintainer emails found for station {station.station_id}")
        return

    subject = f"🚨 VAYU DRISHTI ALERT: {station.station_id} ({anomaly_event.severity} Severity)"
    
    message_body = (
        f"VAYU DRISHTI ML ALERT\n\n"
        f"Station: {station.station_id}\n"
        f"Timestamp: {anomaly_event.timestamp.strftime('%Y-%m-%d %H:%M:%S UTC')}\n"
        f"Severity: {anomaly_event.severity} (Score: {anomaly_event.score})\n"
        f"Type: {anomaly_event.anomaly_type}\n\n"
        f"ML Diagnosis: {anomaly_event.description}\n\n"
        f"Please check the command center dashboard immediately."
    )

    try:
        send_mail(
            subject,
            message_body,
            settings.DEFAULT_FROM_EMAIL,
            valid_emails,
            fail_silently=False,
        )
        success_msg = f"SUCCESS: Email alert sent to {valid_emails}"
        print(success_msg, flush=True)
        logger.info(success_msg)
    except Exception as e:
        error_msg = f"ERROR: Failed to send email alert: {str(e)}"
        print(error_msg, flush=True)
        logger.error(error_msg)
