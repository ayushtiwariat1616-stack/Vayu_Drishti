import logging
import os
import urllib.request
import json

logger = logging.getLogger(__name__)

def send_anomaly_email(anomaly_event):
    """
    Sends an email alert by proxying through the Vercel frontend Serverless Function
    to completely bypass Render's SMTP port 587 block.
    """
    station = anomaly_event.station
    logger.info(f"--- STARTING VERCEL EMAIL ALERT PROCESS FOR STATION {station.station_id} ---")

    maintainers = [
        station.maintainer_1_email,
        station.maintainer_2_email,
        station.maintainer_3_email
    ]
    valid_emails = [email for email in maintainers if email]

    if not valid_emails:
        logger.warning(f"No valid maintainer emails found for station {station.station_id}")
        return

    message_body = (
        f"🚨 VAYU DRISHTI ML ALERT 🚨\n\n"
        f"Station: {station.station_id}\n"
        f"Timestamp: {anomaly_event.timestamp.strftime('%Y-%m-%d %H:%M:%S UTC')}\n"
        f"Severity: {anomaly_event.severity} (Score: {anomaly_event.score})\n"
        f"Type: {anomaly_event.anomaly_type}\n\n"
        f"ML Diagnosis: {anomaly_event.description}\n\n"
        f"Please check the command center dashboard immediately."
    )

    # Use the live Vercel frontend domain to hit the new proxy endpoint
    # Vercel operates on HTTPS (Port 443), which Render does not block!
    vercel_url = "https://vayu-drishti-chi.vercel.app/api/send-email"
    
    payload = json.dumps({
        "to": valid_emails,
        "subject": f"Vayu Drishti Alert: {station.station_id}",
        "text": message_body
    }).encode('utf-8')

    headers = {
        "Content-Type": "application/json"
    }

    try:
        req = urllib.request.Request(vercel_url, data=payload, headers=headers, method="POST")
        with urllib.request.urlopen(req) as response:
            res_data = json.loads(response.read().decode())
            success_msg = f"SUCCESS: Vercel Proxy sent Email alert to {valid_emails}. Response: {res_data}"
            print(success_msg, flush=True)
            logger.info(success_msg)
    except urllib.error.HTTPError as e:
        error_body = e.read().decode()
        error_msg = f"ERROR: Failed to send Vercel Email alert: HTTP {e.code} - {error_body}"
        print(error_msg, flush=True)
        logger.error(error_msg)
    except Exception as e:
        error_msg = f"ERROR: Failed to send Vercel Email alert: {str(e)}"
        print(error_msg, flush=True)
        logger.error(error_msg)
