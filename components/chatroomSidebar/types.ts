import type { Participant } from "../../lib/types/chat";

export interface ChatroomSidebarProps {
  participants: Participant[];
  isHost: boolean;
  hostAid: string;
  roomName: string;
  roomDescription?: string;
  allowedFeatures?: string[];
  onRemoveParticipant: (userAid: string) => Promise<void>;
  onLeaveRoom: () => void;
  onEditRoom: () => void;
  onDeleteRoom: () => void;
  isConnected: boolean;
  hideHeader?: boolean;
}
