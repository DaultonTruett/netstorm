import random
from django.core.management.base import BaseCommand
from attacks.models import AttackSession
from django.db import connection

ATTACK_TYPES = ['DDoS', 'Phishing', 'Malware', 'Ransomware', 'SQL Injection', 'Exploit', 'Worm']

def random_ip():
    return ".".join(str(random.randint(0, 255)) for _ in range(4))

def ip_to_location(ip):
    with connection.cursor() as cursor:
        cursor.execute("""
                       SELECT latitude, longitude
                       FROM geoip2_network
                       WHERE %s::inet << network
                       LIMIT 1;
                       """, [ip])
        
        row = cursor.fetchone()
        if row:
            return row[0], row[1]
        
        return 0.0, 0.0


class Command(BaseCommand):
    help = 'Generate fake attack sessions'


    def add_arguments(self, parser):
        parser.add_argument('--count', type=int, default=50, help='Number of fake attacks to create')


    def handle(self, *args, **options):
        count = options['count']
        
        for _ in range(count):
            source_ip = random_ip()
            src_lat, src_lon = ip_to_location(source_ip)
            
            target_ip = random_ip()
            tgt_lat, tgt_lon = ip_to_location(target_ip)
            
            attack_type = random.choice(ATTACK_TYPES)
            
            AttackSession.objects.create(
                source_ip=source_ip,
                source_lat=src_lat,
                source_lon=src_lon,
                
                target_ip=target_ip,
                target_lat=tgt_lat,
                target_lon=tgt_lon,
                
                attack_type=attack_type
            )
            
        self.stdout.write(self.style.SUCCESS(f'Successfully created {count} attack sessions'))