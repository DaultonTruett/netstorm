from django.db import models

# Create your models here.
class AttackSession(models.Model):
    ATTACK_TYPES = [
        ('DDoS', 'DDoS'), 
        ('Phishing', 'Phishing'),
        ('Malware', 'Malware'),
        ('Ransomware', 'Ransomware'),
        ('SQL Injection', 'SQL Injection'),
        ('Exploit', 'Exploit'),
        ('Worm', 'Worm')
    ]
    
    source_ip = models.GenericIPAddressField()
    source_lat = models.FloatField(null=True, blank=True)
    source_lon = models.FloatField(null=True, blank=True)
    
    target_ip = models.GenericIPAddressField()
    target_lat = models.FloatField(null=True, blank=True)
    target_lon = models.FloatField(null=True, blank=True)
    
    attack_type = models.CharField(max_length=100, choices=ATTACK_TYPES)
    current_phase = models.CharField(max_length=100, default='Recon')
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.attack_type} from {self.source_ip} to {self.target_ip} started at {self.start_time}"
    

class GeoIP_Network(models.Model):
    id = models.BigAutoField(primary_key=True)
    network = models.TextField()
    geoname_id = models.IntegerField()
    registered_country_geoname_id = models.IntegerField()
    represented_country_geoname_id = models.IntegerField()
    is_anonymous_proxy = models.BooleanField()
    is_satellite_provider = models.BooleanField()
    postal_code = models.TextField()
    latitude = models.FloatField()
    longitude = models.FloatField()
    accuracy_radius = models.IntegerField()
    is_anycast = models.BooleanField()
    
    class Meta:
        db_table = 'geoip2_network'
        managed = False
    
