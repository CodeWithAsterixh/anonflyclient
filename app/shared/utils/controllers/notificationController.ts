import { getAPIBaseURL } from "../../constants/api";

export interface Notification {
  id: string;
  title: string;
  content: string;
  type: 'GLOBAL' | 'PRIVATE';
  createdAt: string;
  isRead: boolean;
  readAt?: string;
  expiresAt?: string;
}

/**
 * Fetches all notifications for the authenticated user.
 */
export const getNotifications = async (token: string): Promise<Notification[]> => {
  const response = await fetch(`${getAPIBaseURL()}/notifications`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch notifications');

  return data.data;
};

/**
 * Marks a specific notification as read.
 */
export const markNotificationAsRead = async (token: string, id: string): Promise<void> => {
  const response = await fetch(`${getAPIBaseURL()}/notifications/${id}/read`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message || 'Failed to mark notification as read');
  }
};
