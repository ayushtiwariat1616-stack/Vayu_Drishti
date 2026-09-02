from rest_framework import serializers
from .models import Station,SensorReading,Telemetry

class StationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Station
        fields = '__all__'

class SensorReadingSerializer(serializers.ModelSerializer):
    class Meta:
        model = SensorReading
        fields = '__all__'
        
class TelemetrySerializer(serializers.ModelSerializer):
    
    class Meta:
        model = Telemetry
        fields = '__all__'