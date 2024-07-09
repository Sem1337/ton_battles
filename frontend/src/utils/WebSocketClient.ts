class WebSocketClient {
    private socket: WebSocket | null = null;
  
    connect(url: string) {
      this.socket = new WebSocket(url);
  
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
  
    joinRoom(roomId: string) {
      if (this.socket) {
        this.socket.send(JSON.stringify({ type: 'JOIN_ROOM', roomId }));
      }
    }
  
    handleMessage(data: any) {
      switch (data.type) {
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
  