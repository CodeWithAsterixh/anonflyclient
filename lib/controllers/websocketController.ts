import { getChatWSURL } from "lib/constants/api";

interface WebSocketMessage {
  type: string;
  [key: string]: any;
}

class WebSocketController {
  private ws: WebSocket | null = null;
  private messageHandlers: Map<string, ((data: any) => void)[]> = new Map();

  public connect(onOpen?: () => void, onClose?: () => void, onError?: (event: Event) => void) {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    const wsUrl = typeof window !== 'undefined' ? getChatWSURL() : getChatWSURL();
    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      if (onOpen) onOpen();
    };

    this.ws.onmessage = (event) => {
      try {
        const parsedMessage: WebSocketMessage = JSON.parse(event.data as string);
        const handlers = this.messageHandlers.get(parsedMessage.type);
        if (handlers) {
          handlers.forEach(handler => handler(parsedMessage));
        }
      } catch (error) {
        // Silently fail parsing
      }
    };

    this.ws.onclose = () => {
      if (onClose) onClose();
    };

    this.ws.onerror = (event) => {
      if (onError) onError(event);
    };
  }

  public disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  public sendMessage(message: WebSocketMessage) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  public on(messageType: string, handler: (data: any) => void) {
    if (!this.messageHandlers.has(messageType)) {
      this.messageHandlers.set(messageType, []);
    }
    this.messageHandlers.get(messageType)?.push(handler);
  }

  public off(messageType: string, handler: (data: any) => void) {
    const handlers = this.messageHandlers.get(messageType);
    if (handlers) {
      this.messageHandlers.set(messageType, handlers.filter(h => h !== handler));
    }
  }

  // Specific message sending functions
  public sendChatMessage(chatroomId: string, content: string, userAid: string, username: string, signature?: string) {
    this.sendMessage({
      type: 'message',
      chatroomId,
      content, // This is now the encrypted blob
      userAid,
      username,
      signature,
    });
  }

  public joinChatroom(chatroomId: string, userAid: string, username: string) {
    this.sendMessage({
      type: 'joinChatroom',
      chatroomId,
      userAid,
      username,
    });
  }

  public leaveChatroom(chatroomId: string) {
    this.sendMessage({
      type: 'leaveChatroom',
      chatroomId,
    });
  }
}

export const webSocketController = new WebSocketController();