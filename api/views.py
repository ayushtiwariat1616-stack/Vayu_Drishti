from rest_framework import viewsets, permissions, generics, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils.dateparse import parse_datetime
from .serializers import SensorReadingSerializer, StationSerializer, TelemetrySerializer, AnomalyEventSerializer
from .models import SensorReading, Station, Telemetry, AnomalyEvent
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
import pandas as pd
import json
import sys

# 1. Global ML Initialization
print("Loading Vayudrishti Model 2 into memory...")
try:
    from RandomForest.src.live_inference import VayudrishtyLiveInference
    ml_engine = VayudrishtyLiveInference()
except Exception as e:
    print(f"Warning: ML Engine failed to load ({e}).", file=sys.stderr)
    ml_engine = None

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

        channel_layer = get_channel_layer()

        if ml_engine:
            try:
                # 1. Fetch recent history buffer
                recent_readings = Telemetry.objects.filter(
                    station=telemetry_instance.station
                ).order_by('-timestamp')[:50]
                
                # Format as DataFrame (Oldest first to newest)
                data = []
                for r in reversed(recent_readings):
                    data.append({
                        "station_id": r.station.station_id,
                        "timestamp": r.timestamp,
                        "temperature_C": r.temperature,
                        "relative_humidity_pct": r.humidity,
                        "pressure_hPa": r.pressure,
                        "dew_point_C": r.temperature - ((100 - r.humidity) / 5) # Approximation
                    })
                
                history_df = pd.DataFrame(data)
                
                # 2. Run Inference
                json_result = ml_engine.process_live_reading(history_df)
                result = json.loads(json_result)
                
                # Extract anomaly details
                anomaly_analysis = result.get("anomaly_analysis", {})
                severity = anomaly_analysis.get("severity_level", "NONE")
                
                if severity != "NONE":
                    anomaly = AnomalyEvent.objects.create(
                        station=telemetry_instance.station,
                        reading=telemetry_instance,
                        anomaly_type=anomaly_analysis.get("detected_root_cause", "UNKNOWN"),
                        severity=severity,
                        score=anomaly_analysis.get("confidence_score_pct", 0.0) / 100.0,
                        confidence=anomaly_analysis.get("confidence_score_pct", 0.0) / 100.0,
                        description=result.get("explainability", {}).get("human_readable_reason", ""),
                        status="active",
                    )
                    
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
                        }
                        async_to_sync(channel_layer.group_send)(
                            'telemetry_alerts',
                            {
                                'type': 'send_anomaly',
                                'message': anomaly_payload,
                            }
                        )
            except Exception as e:
                import traceback
                traceback.print_exc()
                print(f"Error during ML inference: {e}")

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