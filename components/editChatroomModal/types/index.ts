export interface EditChatroomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  chatroomId: string;
  initialRoomname: string;
  initialDescription: string;
}
