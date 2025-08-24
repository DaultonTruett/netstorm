from django.shortcuts import render
from rest_framework import generics
from .models import AttackSession
from .serializers import AttackSessionSerializer

# Create your views here.
class AttackSessionList(generics.ListAPIView):
    queryset = AttackSession.objects.all().order_by('-start_time')
    serializer_class = AttackSessionSerializer