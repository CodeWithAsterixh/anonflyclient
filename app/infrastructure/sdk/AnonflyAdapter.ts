import { Anonfly, type AnonflyConfig } from '@anonfly/sdk';

/**
 * Domain-specific adapter for the Anonfly SDK.
 * This layer abstracts the SDK and provides a clean interface for the application features.
 * It ensures that UI components never directly depend on the SDK.
 */
export class AnonflyAdapter {
    private readonly sdk: Anonfly;

    constructor(config: AnonflyConfig) {
        this.sdk = new Anonfly(config);
    }

    // --- Auth Domain ---

    async authenticate(aid: string, challenge: string, signature: string, username: string, publicKey: string, exchangePublicKey: string) {
        return this.sdk.auth.verify({
            challenge,
            signature,
            identity: {
                aid,
                username,
                publicKey,
                exchangePublicKey
            }
        });
    }

    async getChallenge(aid: string) {
        return this.sdk.auth.generateChallenge(aid);
    }

    // --- Conversations Domain ---

    async getConversations(region?: string) {
        return this.sdk.rooms.list(region);
    }

    async createConversation(data: { roomname: string; isPrivate?: boolean; description?: string; password?: string }) {
        return this.sdk.rooms.create(data);
    }

    // --- Messages Domain ---

    async getMessages(roomId: string, options?: { limit?: number; before?: string }) {
        return this.sdk.messages.list(roomId, options);
    }

    async sendMessage(roomId: string, content: string) {
        return this.sdk.messages.send(roomId, content);
    }

    // --- Presence / WebSocket Domain ---

    subscribeToMessages(roomId: string, handler: (msg: any) => void) {
        if (!this.sdk.ws) throw new Error('WebSocket client not initialized');
        this.sdk.ws.subscribe(`room:${roomId}`, handler);
        return () => this.sdk.ws?.unsubscribe(`room:${roomId}`, handler);
    }
}
