import json
from channels.generic.websocket import AsyncWebsocketConsumer


class TelemetryConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.group_name = 'telemetry_alerts'

        # Join the broadcast group
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )
        await self.accept()
        print("🟢 TARGET LOCKED: React Frontend Connected to Live Feed!")

    async def disconnect(self, close_code):
        # Leave the broadcast group
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )
        print("🔴 CONNECTION LOST: React Frontend Disconnected.")

    # Handler for normal telemetry readings (from models.py signal)
    async def send_alert(self, event):
        message = event['message']
        await self.send(text_data=json.dumps({
            'type': 'reading',
            'stationId': message.get('station_id', ''),
            'data': message
        }))

    # Handler for anomaly events (from views.py)
    async def send_anomaly(self, event):
        message = event['message']
        await self.send(text_data=json.dumps({
            'type': 'anomaly',
            'stationId': message.get('stationId', ''),
            'data': message
        }))