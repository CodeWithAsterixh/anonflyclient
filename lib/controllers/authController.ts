import { getAPIBaseURL } from "lib/constants/api";

export const login = async (credentials: {
    username: string;
    password: string;
}) => {
  try {
    const response = await fetch(`${getAPIBaseURL()}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const getUser = async (token: string) => {
  try {
    const response = await fetch(`${getAPIBaseURL()}/auth/user`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch user data');
    }

    return data;
  } catch (error) {
    console.error('Get user error:', error);
    throw error;
  }
};

export const createUser = async (userData: {
    username: string;
    password:string;
}) => {
  try {
    const response = await fetch(`${getAPIBaseURL()}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'User creation failed');
    }

    return data;
  } catch (error) {
    console.error('Create user error:', error);
    throw error;
  }
};