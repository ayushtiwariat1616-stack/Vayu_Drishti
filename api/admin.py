from django.contrib import admin
from .models import Station, SensorReading,Telemetry,AnomalyEvent
# Register your models here.
admin.site.register(Station)
admin.site.register(SensorReading)
admin.site.register(Telemetry)
admin.site.register(AnomalyEvent)