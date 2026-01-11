import { getAPIBaseURL } from "../constants/api";
import { getSessionUser } from '../helpers/authStorage';
import { getUserRegion } from '../helpers/location';

/**
 * Generates authorization headers for API requests using the current session token.
 * 
 * @returns {Object} Headers object with Content-Type and Authorization.
 */
const getAuthHeaders = () => {
  // Get token from sessionStorage
  let token = null;
  const session = getSessionUser();
  if (session?.token) {
    token = session.token;
  }
  
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

/**
 * Checks if the current user has access to a specific chatroom.
 * 
 * @async
 * @param {string} chatroomId - The ID of the chatroom to check.
 * @param {string} [joinAuthToken] - Optional token for authorized join.
 * @returns {Promise<Object>} Access status and optional metadata.
 */
export const checkAccess = async (chatroomId: string, joinAuthToken?: string) => {
  try {
    const response = await fetch(`${getAPIBaseURL()}/chatroom/${encodeURIComponent(chatroomId)}/check-access`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ joinAuthToken }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Access denied',
        statusCode: response.status
      };
    }

    return data;
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to verify access',
      statusCode: 500
    };
  }
};

/**
 * Creates a new chatroom.
 * 
 * @async
 * @param {string} roomname - The name of the room.
 * @param {string} [description] - Optional description.
 * @param {string} [password] - Optional password for private rooms.
 * @param {boolean} [isPrivate=false] - Whether the room should be private.
 * @returns {Promise<Object>} The created chatroom details.
 * @throws {Error} If room creation fails.
 */
export const createChatroom = async (roomname: string, description?: string, password?: string, isPrivate: boolean = false) => {
  const region = getUserRegion();
  const body: any = { 
    roomname: roomname.trim(), 
    region,
    isPrivate
  };

  if (description && description.trim() !== '') {
    body.description = description.trim();
  }

  if (password && password.trim() !== '') {
    body.password = password;
  }

  const response = await fetch(`${getAPIBaseURL()}/chatrooms`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to create chatroom');
  }

  return data;
};

/**
 * Fetches the message history for a chatroom.
 * 
 * @async
 * @param {string} chatroomId - The ID of the chatroom.
 * @returns {Promise<Object>} The message list and metadata.
 * @throws {Error} If fetching messages fails.
 */
export const getChatroomMessages = async (chatroomId: string) => {
  const response = await fetch(`${getAPIBaseURL()}/chatrooms/${encodeURIComponent(chatroomId)}/messages`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch chatroom messages');
  }

  return data;
};

export const joinChatroom = async (chatroomId: string, password?: string, linkToken?: string, joinAuthToken?: string) => {
  const response = await fetch(`${getAPIBaseURL()}/chatrooms/${encodeURIComponent(chatroomId)}/join`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ password, linkToken, joinAuthToken }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to join chatroom');
  }

  return data;
};

export const removeParticipant = async (chatroomId: string, userAid: string): Promise<any> => {
  const response = await fetch(`${getAPIBaseURL()}/chatrooms/${encodeURIComponent(chatroomId)}/participants/${encodeURIComponent(userAid)}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to remove participant');
  }

  return data;
};

export const banParticipant = async (chatroomId: string, userAid: string, reason?: string): Promise<any> => {
  const response = await fetch(`${getAPIBaseURL()}/chatrooms/${encodeURIComponent(chatroomId)}/participants/${encodeURIComponent(userAid)}/ban`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ reason }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to ban participant');
  }

  return data;
};

export const unbanParticipant = async (chatroomId: string, userAid: string): Promise<any> => {
  const response = await fetch(`${getAPIBaseURL()}/chatrooms/${encodeURIComponent(chatroomId)}/participants/${encodeURIComponent(userAid)}/unban`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to unban participant');
  }

  return data;
};

export const generateShareLink = async (chatroomId: string): Promise<any> => {
  const response = await fetch(`${getAPIBaseURL()}/chatrooms/${encodeURIComponent(chatroomId)}/share-link`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to generate share link');
  }

  return data;
};

export const validateShareLink = async (token: string): Promise<any> => {
  const response = await fetch(`${getAPIBaseURL()}/chatrooms/validate-link`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ token }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || data.error || 'Failed to validate share link');
  }

  return data;
};

export const leaveChatroom = async (chatroomId: string): Promise<any> => {
  const response = await fetch(`${getAPIBaseURL()}/chatrooms/${encodeURIComponent(chatroomId)}/leave`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to leave chatroom');
  }

  return data;
};

export const deleteChatroom = async (chatroomId: string): Promise<any> => {
  const response = await fetch(`${getAPIBaseURL()}/chatrooms/${encodeURIComponent(chatroomId)}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to delete chatroom');
  }

  return data;
};

export const editChatroom = async (chatroomId: string, roomname: string, description?: string): Promise<any> => {
  const response = await fetch(`${getAPIBaseURL()}/chatrooms/${encodeURIComponent(chatroomId)}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ 
      roomname: roomname.trim(), 
      description: description?.trim() 
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to edit chatroom');
  }

  return data;
};

export const deleteMessage = async (chatroomId: string, messageId: string): Promise<any> => {
  const response = await fetch(`${getAPIBaseURL()}/chatrooms/${encodeURIComponent(chatroomId)}/messages/${encodeURIComponent(messageId)}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to delete message');
  }

  return data;
};

export const getMyModerationToken = async (): Promise<any> => {
  const response = await fetch(`${getAPIBaseURL()}/user/moderation-token`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch moderation token');
  }

  return data.data;
};

/**
 * Establishes a Server-Sent Events (SSE) connection to receive real-time chatroom list updates.
 * 
 * @param {Function} onMessage - Callback for handling incoming SSE messages.
 * @param {Function} onError - Callback for handling SSE errors.
 * @returns {Function} A cleanup function to close the EventSource connection.
 */
export const getChatroomListSSE = (onMessage: (data: any) => void, onError: (event: Event) => void): Function => {
  const eventSource = new EventSource(`${getAPIBaseURL()}/chatrooms`);

  eventSource.onmessage = (event) => {
    onMessage(JSON.parse(event.data));
  };

  eventSource.onerror = (event) => {
    eventSource.close();
    onError(event);
  };

  return () => {
    eventSource.close();
  };
};
