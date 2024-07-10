type EventCallback = (data: any) => void;

class WebSocketClient {
  private socket: WebSocket | null = null;
  private eventListeners: { [key: string]: EventCallback[] } = {};
  private messageQueue: string[] = [];
  private isConnected: boolean = false;

  connect(url: string, token: string) {
    this.socket = new WebSocket(`${url}?token=${token}`);

    this.socket.onopen = () => {
      console.log('WebSocket connection opened');
      this.isConnected = true;
      // Send all queued messages
      while (this.messageQueue.length > 0) {
        const queuedMessage = this.messageQueue.shift();
        if (queuedMessage && this.socket) {
          this.socket.send(queuedMessage);
        }
      }
    };

    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.handleMessage(data);
    };

    this.socket.onclose = () => {
      console.log('WebSocket connection closed');
      this.isConnected = false;
    };

    this.socket.onerror = (error: Event) => {
      console.error('WebSocket error:', error);
      if (error instanceof ErrorEvent) {
        console.error('WebSocket error message:', error.message);
      } else {
        console.error('WebSocket error occurred');
      }
    };
  }

  on(eventType: string, callback: EventCallback) {
    if (!this.eventListeners[eventType]) {
      this.eventListeners[eventType] = [];
    }
    this.eventListeners[eventType].push(callback);
    console.log('enabled callback for ', eventType);
  }

  off(eventType: string, callback?: EventCallback) {
    if (callback) {
      this.eventListeners[eventType] = this.eventListeners[eventType]?.filter(cb => cb !== callback) || [];
    } else {
      this.eventListeners[eventType] = [];
    }
    console.log('disabled callback for ', eventType);
  }

  getBalance() {
    this.sendMessage({ type: 'GET_BALANCE' });
  }

  sendMessage(message: any) {
    const messageString = JSON.stringify(message);
    console.log('sending message: ', messageString);
    if (this.isConnected && this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(messageString);
    } else {
      this.messageQueue.push(messageString);
    }
  }

  triggerEvent(eventType: string, data: any) {
    if (this.eventListeners[eventType]) {
      this.eventListeners[eventType].forEach(callback => callback(data));
    }
  }

  handleMessage(data: any) {
    switch (data.type) {
      case 'BALANCE_UPDATE':
        this.triggerEvent('BALANCE_UPDATE', data.balance);
        break;
      case 'BET_MADE':
        this.triggerEvent('BET_MADE', data);
        break;
      case 'GAME_COMPLETED':
        alert(`Game completed! Winner: ${data.winner.name}`);
        // Handle game completion, update UI, etc.
        break;
      case 'ERROR':
        console.log('error from ws: ', data.message);
        break;
      case 'CONNECTED':
        this.isConnected = true;
        // Send all queued messages
        while (this.messageQueue.length > 0) {
          const queuedMessage = this.messageQueue.shift();
          if (queuedMessage && this.socket) {
            this.socket.send(queuedMessage);
          }
        }
        this.triggerEvent('CONNECTED', data);
        break;
      default:
        console.log('Unknown message type:', data);
    }
  }
}

export const webSocketClient = new WebSocketClient();
