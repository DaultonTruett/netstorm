import json
from channels.generic.websocket import AsyncWebsocketConsumer

class AttackConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.channel_layer.group_add('attacks', self.channel_name)
        await self.accept()
        
    async def disconnect(self, close_code):
        await self.channel_layer.group_discard('attacks', self.channel_name)
        
    async def receive(self, text_data):
        pass
    
    async def new_attack(self, event):
        await self.send(text_data=json.dumps(event['attack']))
        