"""
URL configuration for vayudhrishti project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.1/topics/http/urls/
"""
from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse

async def health_check(request):
    return HttpResponse("Vayu Drishti API is running smoothly.")

urlpatterns = [
    path('', health_check),
    path('admin/', admin.site.urls),
    path('api/v1/', include('api.urls')),
]
