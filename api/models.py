from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

# Create your models here.
class Station(models.Model):
    station_id = models.CharField(max_length=50, primary_key=True)
    name = models.CharField(max_length=100, blank=True, null=True)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    sensor_health = models.IntegerField(default=100)
    status = models.CharField(max_length=20, default='HEALTHY')
    last_seen = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.station_id
    
class Telemetry(models.Model):
    # The Link: Which station sent this data?
    station = models.ForeignKey(Station, on_delete=models.CASCADE, related_name='telemetry_data')
    
    # The Payload: The actual sensor readings (FloatField allows decimals!)
    temperature = models.FloatField()
    humidity = models.FloatField()
    pressure = models.FloatField()
    
    # The Timestamp: When did the attack happen? Auto-records the exact millisecond!
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Station {self.station.station_id} - Temp: {self.temperature} at {self.timestamp}"
    
    @receiver(post_save, sender=Telemetry) 
    def broadcast_new_reading(sender, instance, created, **kwargs):
        if created:
            channel_layer = get_channel_layer()
            
            # 1. Format the blast payload
            payload = {
                # Make sure this matches how your model accesses the station ID!
                "station_id": instance.station.station_id if hasattr(instance.station, 'station_id') else instance.station.id,
                "temperature": instance.temperature,
                "humidity": instance.humidity,
                "pressure": instance.pressure,
                "timestamp": str(instance.timestamp)
            }
            
            # 2. Fire the blast into Redis using YOUR exact group name!
            async_to_sync(channel_layer.group_send)(
                "telemetry_alerts",  # <-- The group name from your connect() method!
                {
                    "type": "send_alert",  # <-- The exact name of your function at the bottom!
                    "message": payload     # <-- What your event['message'] is looking for!
                }
            )
    
class SensorReading(models.Model):
    reading_id = models.CharField(max_length=50, primary_key=True)
    station = models.ForeignKey(Station, on_delete=models.CASCADE)
    device_id = models.CharField(max_length=50, null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    temperature = models.FloatField()
    pressure = models.FloatField()
    humidity = models.FloatField()
    is_corrected = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.station_id} - {self.timestamp}"
    
class AnomalyEvent(models.Model):
    station = models.ForeignKey(Station, on_delete=models.CASCADE, related_name='anomalies')
    reading = models.ForeignKey(Telemetry, on_delete=models.CASCADE)
    description = models.CharField(max_length=255)
    timestamp = models.DateTimeField(auto_now_add=True)
    is_resolved = models.BooleanField(default=False)
    
    def __str__(self):
        return f"🚨 ANOMALY at {self.station.station_id}: {self.description}"