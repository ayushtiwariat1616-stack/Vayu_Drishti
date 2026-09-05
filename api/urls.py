from django.urls import include, path
from rest_framework import routers

from .views import SensorReadingViewSet, StationViewSet, TelemetryViewSet, AnomalyEventViewSet

router = routers.DefaultRouter()
router.register(r"stations", StationViewSet)
router.register(r"sensors", SensorReadingViewSet)
router.register(r"telemetry", TelemetryViewSet)
router.register(r"anomalies", AnomalyEventViewSet)

urlpatterns = [
    path('', include(router.urls)),
]