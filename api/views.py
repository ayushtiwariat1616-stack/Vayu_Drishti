from rest_framework import viewsets, permissions, generics, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils.dateparse import parse_datetime
from .serializers import SensorReadingSerializer, StationSerializer, TelemetrySerializer, AnomalyEventSerializer
from .models import SensorReading, Station, Telemetry, AnomalyEvent
from .predict import detect_anomaly
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync


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


class TelemetryViewSet(viewsets.ModelViewSet):
    """
    Telemetry endpoint — POST to ingest new readings, GET to list/filter history.
    Supports: ?station=, ?limit=, ?from=, ?to=
    """
    queryset = Telemetry.objects.all().order_by('-timestamp')
    serializer_class = TelemetrySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        station = self.request.query_params.get('station')
        limit = self.request.query_params.get('limit')
        from_dt = self.request.query_params.get('from')
        to_dt = self.request.query_params.get('to')

        if station:
            qs = qs.filter(station_id=station)
        if from_dt:
            parsed = parse_datetime(from_dt)
            if parsed:
                qs = qs.filter(timestamp__gte=parsed)
        if to_dt:
            parsed = parse_datetime(to_dt)
            if parsed:
                qs = qs.filter(timestamp__lte=parsed)
        if limit:
            try:
                qs = qs[:int(limit)]
            except (ValueError, TypeError):
                pass
        return qs

    def perform_create(self, serializer):
        # Save the incoming hardware data
        telemetry_instance = serializer.save()

        # Feed the raw data to the ML Engine
        prediction = detect_anomaly(
            temperature=telemetry_instance.temperature,
            humidity=telemetry_instance.humidity,
            pressure=telemetry_instance.pressure
        )

        channel_layer = get_channel_layer()

        # 🛑 FIX: Check prediction["is_anomaly"], NOT the dict itself!
        if prediction.get("is_anomaly"):
            anomaly = AnomalyEvent.objects.create(
                station=telemetry_instance.station,
                reading=telemetry_instance,
                anomaly_type=prediction.get("type", "UNKNOWN"),
                severity=prediction.get("severity", "MEDIUM"),
                score=prediction.get("score", 0.0),
                confidence=prediction.get("confidence", 0.0),
                description=prediction.get("explanation", f"Anomaly detected at {telemetry_instance.station.station_id}"),
                status="active",
            )

            # Broadcast structured anomaly via WebSocket
            if channel_layer:
                anomaly_payload = {
                    "id": anomaly.id,
                    "stationId": telemetry_instance.station.station_id,
                    "timestamp": str(anomaly.timestamp),
                    "type": anomaly.anomaly_type,
                    "severity": anomaly.severity,
                    "score": anomaly.score,
                    "confidence": anomaly.confidence,
                    "status": anomaly.status,
                    "description": anomaly.description,
                    "detectionLayers": prediction.get("detection_layers", {}),
                    "rootCauses": prediction.get("root_causes", []),
                    "affectedSensors": prediction.get("affected_sensors", []),
                    "explanation": prediction.get("explanation", ""),
                }
                async_to_sync(channel_layer.group_send)(
                    'telemetry_alerts',
                    {
                        'type': 'send_anomaly',
                        'message': anomaly_payload,
                    }
                )

    @action(detail=False, methods=['get'])
    def latest(self, request):
        station_id = request.query_params.get('station')
        if not station_id:
            return Response({"error": "Station ID required"}, status=400)

        latest_reading = Telemetry.objects.filter(
            station_id=station_id
        ).order_by('-timestamp').first()

        if not latest_reading:
            return Response({"error": "No readings found"}, status=404)

        serializer = self.get_serializer(latest_reading)
        return Response(serializer.data)


class AnomalyEventViewSet(viewsets.ModelViewSet):
    """
    API endpoint for anomaly events.
    Supports: ?station=, ?severity=, ?status=
    """
    queryset = AnomalyEvent.objects.all().order_by('-timestamp')
    serializer_class = AnomalyEventSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        station = self.request.query_params.get('station')
        severity = self.request.query_params.get('severity')
        anomaly_status = self.request.query_params.get('status')

        if station:
            qs = qs.filter(station_id=station)
        if severity:
            qs = qs.filter(severity=severity)
        if anomaly_status:
            qs = qs.filter(status=anomaly_status)
        return qs