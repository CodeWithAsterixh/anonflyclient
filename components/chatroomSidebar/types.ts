import type { Participant } from "../../lib/types/chat";

export interface ChatroomSidebarProps {
  participants: Participant[];
  isHost: boolean;
  hostAid: string;
  creatorAid: string;
  currentUserId?: string | null;
  roomName: string;
  roomDescription?: string;
  isPrivate?: boolean;
  allowedFeatures?: string[];
  onRemoveParticipant: (userAid: string) => Promise<void>;
  onBanParticipant: (userAid: string, reason?: string) => Promise<void>;
  onUnbanParticipant: (userAid: string) => Promise<void>;
  onLeaveRoom: () => void;
  onEditRoom: () => void;
  onDeleteRoom: () => void;
  onGenerateShareLink: () => Promise<any>;
  isConnected: boolean;
  hideHeader?: boolean;
}
