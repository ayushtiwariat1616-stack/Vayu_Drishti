from rest_framework import serializers
from .models import Station, SensorReading, Telemetry, AnomalyEvent


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


class AnomalyEventSerializer(serializers.ModelSerializer):
    # Expose station_id as a flat string instead of nested object
    station_id = serializers.CharField(source='station.station_id', read_only=True)

    class Meta:
        model = AnomalyEvent
        fields = [
            'id', 'station_id', 'reading', 'anomaly_type', 'severity',
            'score', 'confidence', 'description', 'status',
            'timestamp', 'is_resolved',
        ]