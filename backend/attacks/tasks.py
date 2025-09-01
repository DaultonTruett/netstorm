import random
from celery import shared_task
from .models import AttackSession, GeoIP_Network
from faker import Faker
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from django.db import connection

ATTACK_TYPES = ['DDoS', 'Phishing', 'Malware', 'Ransomware', 'SQL Injection', 'Exploit', 'Worm']

@shared_task
def generate_attack():        
    faker = Faker()
    source = GeoIP_Network.objects.order_by('?').first()
    target = GeoIP_Network.objects.order_by('?').first()
    
    attack = AttackSession.objects.create(
        source_ip = faker.ipv4(),
        source_lat = float(source.latitude),
        source_lon = float(source.longitude),
        
        target_ip = faker.ipv4(),
        target_lat = float(target.latitude),
        target_lon = float(target.longitude),
        
        attack_type = random.choice(ATTACK_TYPES)
    );
    
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        'attacks',
        {
            'id': attack.id,
            'type': 'new_attack',
            
            'source_ip': attack.source_ip,
            'source_lat': attack.source_lat,
            'source_lon': attack.source_lon,
            
            'target_ip': attack.target_ip,
            'target_lat': attack.target_lat,
            'target_lon': attack.target_lon,
            
            'attack_type': attack.attack_type,

        }
    )
    
    print(f'Created {attack.attack_type} with id: {attack.id} sucessfully')
    
    return attack.id