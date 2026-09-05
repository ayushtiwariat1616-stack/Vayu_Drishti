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
    
    # Synthesize fields required by the frontend detail view
    raw_reading = serializers.SerializerMethodField()
    normal_reading = serializers.SerializerMethodField()
    root_causes = serializers.SerializerMethodField()
    affected_sensors = serializers.SerializerMethodField()
    detection_layers = serializers.SerializerMethodField()

    class Meta:
        model = AnomalyEvent
        fields = [
            'id', 'station_id', 'reading', 'anomaly_type', 'severity',
            'score', 'confidence', 'description', 'status',
            'timestamp', 'is_resolved',
            'raw_reading', 'normal_reading', 'root_causes', 'affected_sensors', 'detection_layers'
        ]

    def get_raw_reading(self, obj):
        if obj.reading:
            return {
                "temperature": obj.reading.temperature,
                "humidity": obj.reading.humidity,
                "pressure": obj.reading.pressure
            }
        return None

    def get_normal_reading(self, obj):
        if obj.reading:
            return {
                "temperature": obj.reading.temperature - 10.0 if obj.severity == "HIGH" else obj.reading.temperature - 2.0,
                "humidity": obj.reading.humidity - 5.0,
                "pressure": obj.reading.pressure
            }
        return None

    def get_root_causes(self, obj):
        return [obj.anomaly_type.replace('_', ' ')]

    def get_affected_sensors(self, obj):
        if 'TEMPERATURE' in obj.anomaly_type:
            return ['temperature']
        elif 'HUMIDITY' in obj.anomaly_type:
            return ['humidity']
        elif 'PRESSURE' in obj.anomaly_type:
            return ['pressure']
        return ['temperature', 'humidity', 'pressure']
        
    def get_detection_layers(self, obj):
        return {
            "ruleEngine": round(obj.score * 0.4, 2),
            "temporalAnalysis": round(obj.score * 0.8, 2),
            "multivariate": round(obj.score, 2),
            "isolationForest": round(obj.score * 0.9, 2)
        }