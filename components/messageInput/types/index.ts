export interface MessageInputProps {
  onSendMessage: (content: string) => void;
  onEditMessage?: (content: string) => void;
  isDisabled: boolean;
  replyingTo?: {
    messageId: string;
    senderUsername: string;
    content: string;
  } | null;
  onCancelReply?: () => void;
  editingMessage?: {
    messageId: string;
    content: string;
  } | null;
  onCancelEdit?: () => void;
}
