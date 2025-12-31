import type { Participant } from "../../lib/types/chat";

export interface ParticipantListDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  participants: Participant[];
  isHost: boolean;
  hostAid?: string;
  onOpenManageUsers: () => void;
}
