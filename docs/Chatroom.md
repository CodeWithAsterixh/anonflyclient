# Chatroom Module

The Chatroom module is the core of the Anonfly experience, handling room discovery, real-time updates, and message delivery.

## Architecture

The module uses a multi-layered approach for real-time communication:
1. **REST API**: For room discovery, joining, and management.
2. **Server-Sent Events (SSE)**: For real-time updates to the chatroom list.
3. **WebSockets**: For high-frequency message exchange within a specific room.

## Key Components

### `useChatroom` Hook
The [index.ts](file:///c:/Users/Asterixh/Desktop/Anonfly-chat-app/anonflyclient/hooks/useChatroom/index.ts) in `useChatroom` is an orchestrator that combines multiple sub-hooks:
- `useChatroomConnection`: Manages the WebSocket lifecycle.
- `useChatroomMessages`: Handles the local message state and history.
- `useChatroomParticipants`: Tracks who is currently in the room.
- `useChatroomEncryption`: Manages the room's symmetric encryption key.

### Real-time Updates

#### Chatroom List (SSE)
The application listens for updates on the `/chatrooms` SSE endpoint to keep the sidebar up-to-date with new rooms and participant counts without polling.
Implementation: [useChatroomSSE.ts](file:///c:/Users/Asterixh/Desktop/Anonfly-chat-app/anonflyclient/hooks/useChatroom/parts/useChatroomSSE.ts).

#### Messaging (WebSockets)
Once a user joins a room, a WebSocket connection is established. This connection handles:
- Incoming encrypted messages.
- Typing indicators.
- Participant join/leave notifications.
- Reactions and message deletions.

## Messaging Flow

1. **User Types**: Content is captured in [MessageInput.tsx](file:///c:/Users/Asterixh/Desktop/Anonfly-chat-app/anonflyclient/components/messageInput/index.tsx).
2. **Encryption**: The `useChatroom` hook encrypts the message using the room's AES key.
3. **Sending**: The encrypted blob is sent over the WebSocket via [websocketController.ts](file:///c:/Users/Asterixh/Desktop/Anonfly-chat-app/anonflyclient/lib/controllers/websocketController.ts).
4. **Broadcast**: The server broadcasts the encrypted blob to all other connected participants.
5. **Reception**: Receiving clients decrypt the blob and add it to their local history.

## Management

Room owners can:
- **Edit**: Change room name and description.
- **Moderate**: Kick or ban participants.
- **Share**: Generate invite links with embedded tokens.

Implementation: [chatroomController.ts](file:///c:/Users/Asterixh/Desktop/Anonfly-chat-app/anonflyclient/lib/controllers/chatroomController.ts).
