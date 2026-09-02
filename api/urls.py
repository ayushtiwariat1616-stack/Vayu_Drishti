from django.urls import include,path
from rest_framework import routers

from .views import SensorReadingViewSet,StationViewSet,TelementryViewSet

router = routers.DefaultRouter()
router.register(r"stations",StationViewSet)
router.register(r"sensors",SensorReadingViewSet)

urlpatterns = [
    path('',include(router.urls)),
    path('telemetry/', TelementryViewSet.as_view(), name='telemetry-ingest'),
]