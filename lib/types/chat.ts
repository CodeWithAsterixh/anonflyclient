import { type Emoji } from "../assets/emojis";

export interface Message {
  id?: string;
  senderAid: string;
  senderUsername: string;
  content: string;
  timestamp: string;
  type?: "message" | "system";
  isEncrypted?: boolean;
  isEdited?: boolean;
  isDeleted?: boolean;
  reactions?: {
    userAid: string;
    username: string;
    emojiId: string;
    emojiValue: string;
    emojiType: string;
  }[];
  replyTo?: {
    messageId: string;
    senderUsername: string;
    content: string;
    userAid?: string;
  };
}

export interface Participant {
  userAid: string;
  username: string;
  publicKey?: string;
  exchangePublicKey?: string;
  allowedFeatures?: string[];
}

export interface ChatroomDetail {
  roomId: string;
  roomname: string;
  description: string;
  hostAid: string;
  creatorAid: string;
  isCreatorOnline?: boolean;
  isLocked: boolean;
  isPrivate: boolean;
  participants: Participant[];
  participantCount?: number;
  allowedFeatures?: string[];
}
