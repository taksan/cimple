from typing import Dict

from fastapi import WebSocket, WebSocketDisconnect


class WebSocketManager:
    def __init__(self):
        self.connected_clients: Dict[str, WebSocket] = {}

    async def handle_client(self, websocket: WebSocket):
        await websocket.accept()
        client_id = (await websocket.receive_json())['clientId']
        self.connected_clients[client_id] = websocket
        print(f"Client {client_id} connected")
        await websocket.send_json({"type": "handshake", "message": f"Welcome {client_id}"})
        try:
            while True:
                message = await websocket.receive_text()
                print(f"Received message '{message}' from client {client_id}")
        except WebSocketDisconnect:
            await self.disconnect_client(client_id)

    async def disconnect_client(self, client_id: str):
        del self.connected_clients[client_id]
        print(f"Client {client_id} disconnected")

    async def send_message_to_client(self, client_id: str, message: Dict):
        if client_id in self.connected_clients:
            websocket = self.connected_clients[client_id]
            await websocket.send_json(message)
        else:
            print(f"client {client_id} not found, unable to send message '{message}'")
