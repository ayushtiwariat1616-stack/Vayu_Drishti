import os
from django.core.asgi import get_asgi_application

# 1. SET THE POWER CORE FIRST!
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'vayudhrishti.settings')

# 2. INITIALIZE DJANGO (This loads the settings and apps)
django_asgi_app = get_asgi_application()

# 3. ONLY NOW CAN YOU IMPORT THE ROUTING AND MIDDLEWARE!
from channels.routing import ProtocolTypeRouter, URLRouter
import api.routing
from api.middleware import TokenAuthMiddleware

# 4. ASSEMBLE THE BATTLESTATION
application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": TokenAuthMiddleware(
        URLRouter(
            api.routing.websocket_urlpatterns
        )
    ),
})