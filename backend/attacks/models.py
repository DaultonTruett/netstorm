from django.db import models

# Create your models here.
class AttackSession(models.Model):
    source_ip = models.GenericIPAddressField()
    target_ip = models.GenericIPAddressField()
    attack_type = models.CharField(max_length=100)
    current_phase = models.CharField(max_length=100, default='Recon')
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.attack_type} from {self.source_ip} to {self.target_ip} started at {self.start_time}"
