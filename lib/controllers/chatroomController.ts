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
    const body: any = { 
      roomname: roomname.trim(), 
      region 
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

export const joinChatroom = async (chatroomId: string, password?: string) => {
  try {
    const response = await fetch(`${getAPIBaseURL()}/chatrooms/${encodeURIComponent(chatroomId)}/join`, {
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

export const validateShareLink = async (token: string) => {
  try {
    const response = await fetch(`${getAPIBaseURL()}/chatrooms/validate-link`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ token }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to validate share link');
    }

    return data;
  } catch (error) {
    throw error;
  }
};

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
