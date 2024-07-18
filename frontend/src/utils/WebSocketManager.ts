import { io, Socket } from 'socket.io-client';

type EventCallback = (data?: any) => void;

class WebSocketManager {
  private socket: Socket | null = null;
  private eventCallbacks: Map<string, EventCallback> = new Map();

  connect(url: string, token: string) {
    this.socket = io(url, {
      query: { token },
      transports: ['websocket'],
    });

    this.socket.on('connect', () => {
      console.log('Connected to WebSocket server');
      const callback = this.eventCallbacks.get('connect');
      if (callback) {
        callback();
      }
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
      const callback = this.eventCallbacks.get('disconnect');
      if (callback) {
        callback();
      }
    });

    this.socket.on('message', (data: { type: string, payload?: any }) => {
      console.log(`Received message of type ${data.type}`);
      const callback = this.eventCallbacks.get(data.type);
      if (callback) {
        try {
          callback(data.payload);
        } catch (error) {
          console.error(`Error handling ${data.type}:`, error);
        }
      } else {
        console.warn(`No callback registered for message type: ${data.type}`);
      }
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  sendMessage(type: string, payload?: any) {
    if (this.socket) {
      console.log('send message: ', type);
      this.socket.emit('message', { type, payload });
    }
  }

  on(event: string, callback: EventCallback) {
    this.eventCallbacks.set(event, callback);
  }

  off(event: string) {
    this.eventCallbacks.delete(event);
  }
}

export const webSocketManager = new WebSocketManager();
