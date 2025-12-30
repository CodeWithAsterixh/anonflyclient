export interface Chatroom {
  id: string;
  roomname: string;
  description: string;
  hostAid: string;
  participantCount: number;
  lastMessage: string | null;
  isLocked: boolean;
}

export interface UseChatroomListReturn {
  chatrooms: Chatroom[];
  loading: boolean;
  error: string | null;
  retryCountdown: number | null;
}
