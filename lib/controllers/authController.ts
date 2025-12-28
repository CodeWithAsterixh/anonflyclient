import { getAPIBaseURL } from "lib/constants/api";
import { getIdentity, type Identity } from "../helpers/identityManager";
import { setSessionUser } from "../helpers/authStorage";

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
    const privateKey = await window.crypto.subtle.importKey(
      'pkcs8',
      privateKeyBuffer,
      { name: 'Ed25519' },
      true,
      ['sign']
    );

    const nonceBuffer = new TextEncoder().encode(nonce);
    const signatureBuffer = await window.crypto.subtle.sign(
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

    const { token, aid, username } = verifyData.data;

    // 4. Store session (ephemeral sessionStorage)
    setSessionUser({ userId: aid, username }, token);

    return verifyData.data;
  } catch (error) {
    console.error('Handshake error:', error);
    throw error;
  }
};

export const logout = async () => {
  // Simply clear session storage, backend session will expire on its own
  sessionStorage.clear();
  window.location.href = '/login';
};
