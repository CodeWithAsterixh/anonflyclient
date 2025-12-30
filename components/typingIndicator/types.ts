export interface TypingUser {
  userAid: string;
  username: string;
  avatarUrl: string;
}

export interface TypingIndicatorProps {
  typingUsers: TypingUser[];
}
