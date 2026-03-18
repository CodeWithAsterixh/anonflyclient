import type { Emoji } from "~/shared/assets/emojis";
import type { Message } from "~/shared/types/chat";
import { type Reaction } from "../components/ReactionList";

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
  onDelete?: (messageId: string, mode?: "everyone" | "me") => void;
  onShowReactionDetails?: (reactions: Reaction[], messageId: string) => void;
  portalRoot?: HTMLElement | null;
}
