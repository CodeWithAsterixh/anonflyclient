import { getChatWSURL } from '../../lib/constants/api';

/**
 * Shared WebSocket client wrapper for real-time features.
 * Provides basic event handling and reconnect logic.
 */
export class WebSocketClient {
    private ws: WebSocket | null = null;
    private handlers: Set<(data: any) => void> = new Set();
    private reconnectTimeout: any = null;

    constructor(private url: string = getChatWSURL()) { }

    connect() {
        this.ws = new WebSocket(this.url);

        this.ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                this.handlers.forEach((handler) => handler(data));
            } catch {
                this.handlers.forEach((handler) => handler(event.data));
            }
        };

        this.ws.onclose = () => {
            this.scheduleReconnect();
        };

        this.ws.onerror = (error) => {
            console.error('WebSocket Error:', error);
            this.ws?.close();
        };
    }

    private scheduleReconnect() {
        if (this.reconnectTimeout) return;
        this.reconnectTimeout = setTimeout(() => {
            this.reconnectTimeout = null;
            this.connect();
        }, 3000);
    }

    subscribe(handler: (data: any) => void) {
        this.handlers.add(handler);
        return () => this.handlers.delete(handler);
    }

    send(data: any) {
        if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(typeof data === 'string' ? data : JSON.stringify(data));
        }
    }

    disconnect() {
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
        }
        this.ws?.close();
        this.handlers.clear();
    }
}

export const wsClient = new WebSocketClient();
