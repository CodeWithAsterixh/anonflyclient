import { getAPIBaseURL } from "lib/constants/api";
import { getSessionUser } from '../helpers/authStorage';
import { getUserRegion } from '../helpers/location';

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

export const createChatroom = async (roomname: string, description?: string, password?: string) => {
  try {
    const region = getUserRegion();
    const response = await fetch(`${getAPIBaseURL()}/chatrooms`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ roomname, description, password, region }),
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

export const getChatroomMessages = async (chatroomId: string) => {
  try {
    const response = await fetch(`${getAPIBaseURL()}/chatrooms/${chatroomId}/messages`, {
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

export const joinChatroom = async (chatroomId: string, password?: string) => {
  try {
    const response = await fetch(`${getAPIBaseURL()}/chatrooms/${chatroomId}/join`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ password }),
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

export const leaveChatroom = async (chatroomId: string) => {
  try {
    const response = await fetch(`${getAPIBaseURL()}/chatrooms/${chatroomId}/leave`, {
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

export const deleteChatroom = async (chatroomId: string) => {
  try {
    const response = await fetch(`${getAPIBaseURL()}/chatrooms/${chatroomId}`, {
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

export const editChatroom = async (chatroomId: string, roomname: string, description?: string) => {
  try {
    const response = await fetch(`${getAPIBaseURL()}/chatrooms/${chatroomId}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ roomname, description }),
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

export const deleteMessage = async (chatroomId: string, messageId: string) => {
  try {
    const response = await fetch(`${getAPIBaseURL()}/chatrooms/${chatroomId}/messages/${messageId}`, {
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

export const removeParticipant = async (chatroomId: string, userAid: string) => {
  try {
    const response = await fetch(`${getAPIBaseURL()}/chatrooms/${chatroomId}/participants/${userAid}`, {
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
