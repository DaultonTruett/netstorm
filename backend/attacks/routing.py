from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/attacks/$', consumers.AttackConsumer.as_asgi())
]