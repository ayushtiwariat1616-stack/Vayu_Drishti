from django.urls import re_path
from . import consumers

# This is the exact path your React frontend will strike tomorrow!
websocket_urlpatterns = [
    re_path(r'ws/telemetry/$', consumers.TelemetryConsumer.as_asgi()),
]