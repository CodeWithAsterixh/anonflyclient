import { getAPIBaseURL } from "lib/constants/api";
import { getIdentity, type Identity } from "../helpers/identityManager";
import { setSessionUser, clearSessionUser } from "../helpers/authStorage";

/**
 * Fetches the premium status for the current user from the server.
 * 
 * @async
 * @param {string} token - The authentication token.
 * @returns {Promise<Object>} The premium status data.
 * @throws {Error} If the request fails or returns an error.
 */
export const fetchPremiumStatus = async (token: string) => {
  try {
    const response = await fetch(`${getAPIBaseURL()}/auth/premium-status`, {
      method: 'GET',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to fetch premium status');

    return data.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Performs a cryptographic handshake to authenticate the user.
 * 1. Requests a challenge nonce from the server.
 * 2. Signs the nonce using the user's private Ed25519 key.
 * 3. Sends the signature back to the server for verification.
 * 4. Stores the resulting session token and user details in cookies.
 * 
 * @async
 * @param {Identity} identity - The user identity containing key pairs and metadata.
 * @returns {Promise<Object>} The session data including token and user info.
 * @throws {Error} If any step of the handshake or verification fails.
 */
export const performHandshake = async (identity: Identity) => {
  try {
    // 1. Request Challenge
    const challengeResponse = await fetch(`${getAPIBaseURL()}/auth/challenge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ aid: identity.aid }),
    });

    const challengeData = await challengeResponse.json();
    if (!challengeResponse.ok) throw new Error(challengeData.message || 'Challenge failed');

    const { nonce } = challengeData.data;

    // 2. Sign Challenge
    const privateKeyBuffer = Uint8Array.from(atob(identity.identityKeyPair.privateKey), c => c.charCodeAt(0));
    const privateKey = await globalThis.window.crypto.subtle.importKey(
      'pkcs8',
      privateKeyBuffer,
      { name: 'Ed25519' },
      true,
      ['sign']
    );

    const nonceBuffer = new TextEncoder().encode(nonce);
    const signatureBuffer = await globalThis.window.crypto.subtle.sign(
      { name: 'Ed25519' },
      privateKey,
      nonceBuffer
    );

    const signature = btoa(String.fromCharCode(...new Uint8Array(signatureBuffer)));

    // 3. Verify Signature & Get Session
    const verifyResponse = await fetch(`${getAPIBaseURL()}/auth/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        aid: identity.aid,
        signature,
        username: identity.username,
        publicKey: identity.identityKeyPair.publicKey,
        exchangePublicKey: identity.exchangeKeyPair.publicKey,
      }),
    });

    const verifyData = await verifyResponse.json();
    if (!verifyResponse.ok) throw new Error(verifyData.message || 'Verification failed');

    const { token, aid, username, allowedFeatures } = verifyData.data;

    // 4. Store session (secure cookie with 1 week expiration)
    setSessionUser({ userId: aid, username, allowedFeatures }, token);

    return verifyData.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Logs out the current user by clearing session cookies and redirecting to the login page.
 * 
 * @async
 * @returns {Promise<void>}
 */
export const logout = async () => {
  // Clear the auth cookie and session data
  clearSessionUser();
  globalThis.window.location.href = '/login';
};
