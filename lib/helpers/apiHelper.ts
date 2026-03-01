import { getTokenFromSession } from './authStorage';

/**
 * Enhanced fetch wrapper that automatically routes requests through the 
 * local secure proxy to inject the API key on the server.
 * 
 * It also automatically adds:
 * 1. Authorization header (Bearer <token>)
 * 2. Proper path resolution relative to the proxy
 */
export async function authorizedFetch(endpoint: string, options: RequestInit = {}) {
    // All requests now go through our local proxy
    // The proxy handles the VITE_API_BASE_URL and VITE_API_KEY
    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `/proxy${path}`;

    const headers = new Headers(options.headers || {});

    // Add Session Token (Bearer) if available
    const token = getTokenFromSession();
    if (token) {
        if (!headers.has('Authorization')) {
            headers.set('Authorization', `Bearer ${token}`);
        }
    }

    return fetch(url, {
        ...options,
        headers
    });
}
