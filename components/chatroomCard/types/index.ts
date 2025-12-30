export interface ChatroomCardProps {
  id: string;
  roomname: string;
  description: string;
  participantCount: number;
  lastMessage: string | null;
  isLocked?: boolean;
  onClick?: () => void;
}
