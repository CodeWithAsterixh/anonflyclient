import { type Emoji } from "../../../lib/assets/emojis";
import { type Message } from "../../../lib/types/chat";

export interface MessageDisplayProps {
  message: Message;
  onReply?: (replyInfo: {
    messageId: string;
    senderUsername: string;
    content: string;
    senderAid: string;
  }) => void;
  onReact?: (messageId: string, emoji: Emoji) => void;
  onEdit?: (messageId: string, content: string) => void;
  onDelete?: (messageId: string) => void;
  portalRoot?: HTMLElement | null;
}
