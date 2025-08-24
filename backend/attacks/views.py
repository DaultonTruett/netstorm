from django.shortcuts import render
from rest_framework import generics, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import AttackSession
from .serializers import AttackSessionSerializer

# Create your views here.
class AttackSessionList(generics.ListAPIView):
    queryset = AttackSession.objects.all().order_by('-start_time')
    serializer_class = AttackSessionSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['attack_type']