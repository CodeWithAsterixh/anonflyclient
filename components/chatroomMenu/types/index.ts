export interface ChatroomMenuProps {
  onLeaveRoom: () => void;
  onRemoveParticipant: () => void;
  onDeleteRoom: () => void;
  onEditRoom: () => void;
  isHost: boolean;
}
