from django.shortcuts import render
from rest_framework import viewsets,permissions,generics
from .serializers import SensorReadingSerializer,StationSerializer,TelemetrySerializer
from .models import SensorReading,Station,Telemetry,AnomalyEvent
from .predict import detect_anomaly
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
# Create your views here.

class SensorReadingViewSet(viewsets.ModelViewSet):
    
    """
    API endpoint that allows Sensor Readings to be viewed or edited.
    """
    
    queryset = SensorReading.objects.all()
    serializer_class = SensorReadingSerializer
    permission_classes = [permissions.IsAuthenticated]
    
class StationViewSet(viewsets.ModelViewSet):
    
    """
    API endpoint that allows Stations to be viewed or edited.
    """
    
    queryset = Station.objects.all()
    serializer_class = StationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
class TelementryViewSet(generics.CreateAPIView):
    queryset = Telemetry.objects.all()
    serializer_class = TelemetrySerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        # Saved the incoming hardware data 
        telemetry_instance = serializer.save()

        # Feeded the raw data to the ML Engine
        is_anomaly = detect_anomaly(
            temperature=telemetry_instance.temperature,
            humidity=telemetry_instance.humidity,
            pressure=telemetry_instance.pressure
        )

        # If the engine screams, log the threat in the database!
        if is_anomaly:
            AnomalyEvent.objects.create(
                station=telemetry_instance.station,
                reading=telemetry_instance,
                description=f"Critical Threshold Exceeded! Temp: {telemetry_instance.temperature}C"
            )
            
            # FIRE THE WEBSOCKET TURRET!
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                'telemetry_alerts', # This MUST match the group_name in your consumers.py!
                {
                    'type': 'send_alert', # This MUST match the method name in your consumers.py!
                    'message': f"🚨 URGENT: Station {telemetry_instance.station.station_id} is overheating at {telemetry_instance.temperature}°C!"
                }
            )