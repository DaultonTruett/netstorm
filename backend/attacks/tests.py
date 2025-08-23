from django.test import TestCase
from .models import AttackSession

# Create your tests here.
class AttackSessionModelTest(TestCase):
    def setUp(self):
        self.attack_session = AttackSession.objects.create(
            source_ip='128.0.0.2',
            target_ip='128.128.0.0',
            attack_type='DDoS',
            current_phase='Recon',
            start_time='2023-10-01 12:00:00',
            end_time='2023-10-01 12:30:00'
        )
        
    def test_attack_session_creation(self):
        self.assertEqual(self.attack_session.source_ip, '128.0.0.2')
        self.assertEqual(self.attack_session.target_ip, '128.128.0.0')
        self.assertEqual(self.attack_session.attack_type, 'DDoS')
        self.assertEqual(self.attack_session.current_phase, 'Recon')
        #self.assertEqual(self.attack_session.__str__, "DDoS from 128.0.0.2 to 128.128.0.0 started at 2023-10-01 12:00:00")