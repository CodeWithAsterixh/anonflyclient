export interface OutletContext {
  onBack: () => void;
  isMobile: boolean;
}

export interface ReplyingTo {
  messageId: string;
  senderUsername: string;
  content: string;
  senderAid: string;
}

export interface EditingMessage {
  messageId: string;
  content: string;
}
