import { io, Socket } from 'socket.io-client';

type EventCallback = (data?: any) => void;

class WebSocketManager {
  private socket: Socket | null = null;
  private eventCallbacks: Map<string, Map<EventCallback, EventCallback>> = new Map();

  connect(url: string, token: string) {
    this.socket = io(url, {
      query: { token },
      transports: ['websocket'],
    });

    this.socket.on('connect', () => {
      console.log('Connected to WebSocket server');
      this.invokeCallbacks('connect');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
      this.invokeCallbacks('disconnect');
    });

    this.socket.on('message', (data: { type: string, payload?: any }) => {
      console.log(`Received message of type ${data.type}`);
      this.invokeCallbacks(data.type, data.payload);
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
    if (!this.eventCallbacks.has(event)) {
      this.eventCallbacks.set(event, new Map());
    }
    this.eventCallbacks.get(event)!.set(callback, callback);
  }

  off(event: string, callback?: EventCallback) {
    if (callback) {
      const callbacks = this.eventCallbacks.get(event);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.eventCallbacks.delete(event);
        }
      }
    } else {
      this.eventCallbacks.delete(event);
    }
  }

  private invokeCallbacks(event: string, data?: any) {
    const callbacks = this.eventCallbacks.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error handling ${event}:`, error);
        }
      });
    } else {
      console.warn(`No callback registered for event: ${event}`);
    }
  }
}

export const webSocketManager = new WebSocketManager();
