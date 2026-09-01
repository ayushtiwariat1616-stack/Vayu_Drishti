from django.shortcuts import render
from rest_framework import viewsets,permissions
from .serializers import SensorReadingSerializer,StationSerializer
from .models import SensorReading,Station
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