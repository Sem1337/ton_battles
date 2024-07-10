type EventCallback = (balance: number) => void;

class WebSocketClient {
  private socket: WebSocket | null = null;
  private eventListeners: { [key: string]: EventCallback | null } = {};
  private messageQueue: string[] = [];
  private isConnected: boolean = false;

  connect(url: string, token: string) {
    this.socket = new WebSocket(`${url}?token=${token}`);

    this.socket.onopen = () => {
      console.log('WebSocket connection opened');
    };

    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.handleMessage(data);
    };

    this.socket.onclose = () => {
      console.log('WebSocket connection closed');
      this.isConnected = false;
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  on(eventType: string, callback: EventCallback) {
    this.eventListeners[eventType] = callback;
  }

  off(eventType: string) {
    delete this.eventListeners[eventType];
  }

  getBalance() {
    this.sendMessage({ type: 'GET_BALANCE' });
  }

  sendMessage(message: any) {
    const messageString = JSON.stringify(message);

    if (this.isConnected && this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(messageString);
    } else {
      this.messageQueue.push(messageString);
    }
  }

  handleMessage(data: any) {
    switch (data.type) {
      case 'BALANCE_UPDATE':
        if (this.eventListeners['balanceUpdate']) {
          this.eventListeners['balanceUpdate'](data.balance);
        }
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
        break;
      default:
        console.log('Unknown message type:', data);
    }
  }
}

export const webSocketClient = new WebSocketClient();
