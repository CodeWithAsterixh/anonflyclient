export interface User {
  userId: string;
  username: string;
  isPremium?: boolean;
  allowedFeatures?: string[];
  // Add other user properties as needed
}
