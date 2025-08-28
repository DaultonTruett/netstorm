import json
from channels.generic.websocket import AsyncJsonWebsocketConsumer

class AttackConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        await self.channel_layer.group_add('attacks', self.channel_name)
        await self.accept()
        
    async def disconnect(self, close_code):
        await self.channel_layer.group_discard('attacks', self.channel_name)
        print('code: ', close_code)
        
    async def receive(self, text_data):
        pass
    
    async def new_attack(self, event):
        await self.send_json(event)
        