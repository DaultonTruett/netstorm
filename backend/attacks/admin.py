from django.contrib import admin
from .models import AttackSession, GeoIP_Network

# Register your models here.
admin.site.register(AttackSession)
admin.site.register(GeoIP_Network)