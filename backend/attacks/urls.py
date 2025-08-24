from django.urls import path
from .views import AttackSessionList

urlpatterns = [
    path('api/attacks/', AttackSessionList.as_view(), name='attack-list')
]