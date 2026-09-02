from django.shortcuts import render
from rest_framework import viewsets,permissions,generics
from .serializers import SensorReadingSerializer,StationSerializer,TelemetrySerializer
from .models import SensorReading,Station,Telemetry
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