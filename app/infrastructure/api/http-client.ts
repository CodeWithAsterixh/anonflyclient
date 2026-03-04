import { getAPIBaseURL } from '../../lib/constants/api';

/**
 * Shared HTTP Client wrapper for consistent error handling and configuration.
 */
export const httpClient = {
    async get<T>(path: string, options?: RequestInit): Promise<T> {
        const response = await fetch(`${getAPIBaseURL()}${path}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options?.headers,
            },
        });
        return this.handleResponse(response);
    },

    async post<T>(path: string, body?: any, options?: RequestInit): Promise<T> {
        const response = await fetch(`${getAPIBaseURL()}${path}`, {
            method: 'POST',
            body: JSON.stringify(body),
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options?.headers,
            },
        });
        return this.handleResponse(response);
    },

    async handleResponse(response: Response) {
        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: response.statusText }));
            throw new Error(error.message || 'API Request failed');
        }
        if (response.status === 204) return null;
        return response.json();
    },
};
