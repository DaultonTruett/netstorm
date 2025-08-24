from rest_framework import serializers
from .models import AttackSession

class AttackSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AttackSession
        fields = '__all__'