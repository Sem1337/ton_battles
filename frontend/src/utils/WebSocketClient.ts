type EventCallback = (balance: number) => void;

class WebSocketClient {
  private socket: WebSocket | null = null;
  private eventListeners: { [key: string]: EventCallback | null } = {};

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
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  on(eventType: 'balanceUpdate', callback: EventCallback) {
    if (eventType === 'balanceUpdate') {
      this.eventListeners[eventType] = callback;
    }
  }

  off(eventType: 'balanceUpdate') {
    if (eventType === 'balanceUpdate') {
      this.eventListeners[eventType] = null;
    }
  }

  getBalance() {
    if (this.socket) {
      this.socket.send(JSON.stringify({ type: 'GET_BALANCE' }));
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
      default:
        console.log('Unknown message type:', data);
    }
  }
}

export const webSocketClient = new WebSocketClient();
