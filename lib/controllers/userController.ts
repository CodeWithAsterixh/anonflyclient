import { getAPIBaseURL } from "lib/constants/api";

import { getTokenFromSession } from '../helpers/authStorage';

const getAuthHeaders = () => {
  const token = getTokenFromSession();
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

export const deleteUser = async (userId: string) => {
  try {
    const response = await fetch(`${getAPIBaseURL()}/users/${userId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete user');
    }

    return data;
  } catch (error) {
    console.error('Delete user error:', error);
    throw error;
  }
};