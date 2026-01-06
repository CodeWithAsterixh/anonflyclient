import { getAPIBaseURL } from "lib/constants/api";
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
  if (session && session.token) {
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
  try {
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
  } catch (error) {
    throw error;
  }
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
  try {
    const response = await fetch(`${getAPIBaseURL()}/chatrooms/${encodeURIComponent(chatroomId)}/messages`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch chatroom messages');
    }

    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Joins a chatroom by ID, with optional password and tokens.
 * 
 * @async
 * @param {string} chatroomId - The ID of the chatroom to join.
 * @param {string} [password] - Optional password for the room.
 * @param {string} [linkToken] - Optional token from a shareable link.
 * @param {string} [joinAuthToken] - Optional pre-authorized join token.
 * @returns {Promise<Object>} The join result metadata.
 * @throws {Error} If joining the room fails.
 */
export const joinChatroom = async (chatroomId: string, password?: string, linkToken?: string, joinAuthToken?: string) => {
  try {
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
  } catch (error) {
    throw error;
  }
};

/**
 * Removes a participant from a chatroom.
 * 
 * @async
 * @param {string} chatroomId - The ID of the chatroom.
 * @param {string} userAid - The AID of the user to remove.
 * @returns {Promise<Object>} The removal result.
 * @throws {Error} If removing the participant fails.
 */
export const removeParticipant = async (chatroomId: string, userAid: string) => {
  try {
    const response = await fetch(`${getAPIBaseURL()}/chatrooms/${encodeURIComponent(chatroomId)}/participants/${encodeURIComponent(userAid)}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to remove participant');
    }

    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Bans a participant from a chatroom.
 * 
 * @async
 * @param {string} chatroomId - The ID of the chatroom.
 * @param {string} userAid - The AID of the user to ban.
 * @param {string} [reason] - Optional reason for the ban.
 * @returns {Promise<Object>} The ban result.
 * @throws {Error} If banning the participant fails.
 */
export const banParticipant = async (chatroomId: string, userAid: string, reason?: string) => {
  try {
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
  } catch (error) {
    throw error;
  }
};

/**
 * Unbans a participant from a chatroom.
 * 
 * @async
 * @param {string} chatroomId - The ID of the chatroom.
 * @param {string} userAid - The AID of the user to unban.
 * @returns {Promise<Object>} The unban result.
 * @throws {Error} If unbanning the participant fails.
 */
export const unbanParticipant = async (chatroomId: string, userAid: string) => {
  try {
    const response = await fetch(`${getAPIBaseURL()}/chatrooms/${encodeURIComponent(chatroomId)}/participants/${encodeURIComponent(userAid)}/unban`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to unban participant');
    }

    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Generates a shareable link for a chatroom.
 * 
 * @async
 * @param {string} chatroomId - The ID of the chatroom.
 * @returns {Promise<Object>} The share link metadata.
 * @throws {Error} If link generation fails.
 */
export const generateShareLink = async (chatroomId: string) => {
  try {
    const response = await fetch(`${getAPIBaseURL()}/chatrooms/${encodeURIComponent(chatroomId)}/share-link`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to generate share link');
    }

    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Validates a chatroom share link token.
 * 
 * @async
 * @param {string} token - The share link token.
 * @returns {Promise<Object>} The validation result and room metadata.
 * @throws {Error} If validation fails or the token is invalid.
 */
export const validateShareLink = async (token: string) => {
  try {
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
  } catch (error) {
    throw error;
  }
};

/**
 * Sends a request to leave a chatroom.
 * 
 * @async
 * @param {string} chatroomId - The ID of the chatroom to leave.
 * @returns {Promise<Object>} The leave result result.
 * @throws {Error} If leaving fails.
 */
export const leaveChatroom = async (chatroomId: string) => {
  try {
    const response = await fetch(`${getAPIBaseURL()}/chatrooms/${encodeURIComponent(chatroomId)}/leave`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to leave chatroom');
    }

    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Deletes a chatroom by ID. Only the room creator/owner can perform this action.
 * 
 * @async
 * @param {string} chatroomId - The ID of the chatroom to delete.
 * @returns {Promise<Object>} The deletion result.
 * @throws {Error} If deletion fails.
 */
export const deleteChatroom = async (chatroomId: string) => {
  try {
    const response = await fetch(`${getAPIBaseURL()}/chatrooms/${encodeURIComponent(chatroomId)}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete chatroom');
    }

    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Edits a chatroom's name and description.
 * 
 * @async
 * @param {string} chatroomId - The ID of the chatroom to edit.
 * @param {string} roomname - The new name for the chatroom.
 * @param {string} [description] - The new description for the chatroom.
 * @returns {Promise<Object>} The updated chatroom metadata.
 * @throws {Error} If editing fails.
 */
export const editChatroom = async (chatroomId: string, roomname: string, description?: string) => {
  try {
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
  } catch (error) {
    throw error;
  }
};

/**
 * Deletes a specific message from a chatroom.
 * 
 * @async
 * @param {string} chatroomId - The ID of the chatroom.
 * @param {string} messageId - The ID of the message to delete.
 * @returns {Promise<Object>} The deletion result.
 * @throws {Error} If deletion fails.
 */
export const deleteMessage = async (chatroomId: string, messageId: string) => {
  try {
    const response = await fetch(`${getAPIBaseURL()}/chatrooms/${encodeURIComponent(chatroomId)}/messages/${encodeURIComponent(messageId)}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete message');
    }

    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Fetches the current user's moderation token.
 * 
 * @async
 * @returns {Promise<Object>} The moderation token data.
 * @throws {Error} If fetching the token fails.
 */
export const getMyModerationToken = async () => {
  try {
    const response = await fetch(`${getAPIBaseURL()}/user/moderation-token`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch moderation token');
    }

    return data.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Establishes a Server-Sent Events (SSE) connection to receive real-time chatroom list updates.
 * 
 * @param {Function} onMessage - Callback for handling incoming SSE messages.
 * @param {Function} onError - Callback for handling SSE errors.
 * @returns {Function} A cleanup function to close the EventSource connection.
 */
export const getChatroomListSSE = (onMessage: (data: any) => void, onError: (event: Event) => void) => {
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
