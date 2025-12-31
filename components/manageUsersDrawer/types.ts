import { Participant } from "../../lib/types/chat";

export interface ManageUsersDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  participants: Participant[];
  chatroomId: string;
  isHost: boolean;
  onRemoveParticipant: (userAid: string) => Promise<void>;
}
