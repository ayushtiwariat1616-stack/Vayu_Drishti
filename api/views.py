from django.shortcuts import render
from rest_framework import viewsets,permissions,generics
from .serializers import SensorReadingSerializer,StationSerializer,TelemetrySerializer
from .models import SensorReading,Station,Telemetry,AnomalyEvent
from .predict import detect_anomaly
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from rest_framework.decorators import action
from rest_framework.response import Response
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
    @action(detail=False, methods=['get'])
    def latest(self, request):
        station_id = request.query_params.get('station')
        if not station_id:
            return Response({"error": "Station ID required"}, status=400)
        
        # Grab the single most recent reading for this station
        latest_reading = self.queryset.filter(station_id=station_id).order_by('-timestamp').first()
        
        if not latest_reading:
            return Response({"error": "No readings found"}, status=404)
            
        serializer = self.get_serializer(latest_reading)
        return Response(serializer.data)