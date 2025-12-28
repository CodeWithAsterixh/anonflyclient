export interface Identity {
  aid: string;
  username: string;
  identityKeyPair: {
    publicKey: string; // Base64 DER
    privateKey: string; // Base64 DER
  };
  exchangeKeyPair: {
    publicKey: string; // Base64 DER
    privateKey: string; // Base64 DER
  };
}

const DB_NAME = 'anonfly_identity_db';
const DB_VERSION = 1;
const STORE_NAME = 'identity_store';
const IDENTITY_KEY = 'current_identity';

async function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE_NAME);
    };
  });
}

export async function saveIdentity(identity: Identity): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(identity, IDENTITY_KEY);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export async function getIdentity(): Promise<Identity | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(IDENTITY_KEY);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || null);
  });
}

export async function clearIdentity(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(IDENTITY_KEY);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export async function generateIdentity(username: string): Promise<Identity> {
  // 1. Generate Identity Key Pair (Ed25519 for signing)
  const identityKeyPair = await window.crypto.subtle.generateKey(
    {
      name: 'Ed25519',
    },
    true,
    ['sign', 'verify']
  );

  // 2. Generate Exchange Key Pair (X25519 for E2EE)
  const exchangeKeyPair = await window.crypto.subtle.generateKey(
    {
      name: 'X25519',
    },
    true,
    ['deriveKey', 'deriveBits']
  );

  // Export keys to Base64 DER (spki for public, pkcs8 for private)
  const exportKey = async (key: CryptoKey, format: 'spki' | 'pkcs8') => {
    const exported = await window.crypto.subtle.exportKey(format, key);
    return btoa(String.fromCharCode(...new Uint8Array(exported)));
  };

  const idPubKeyBase64 = await exportKey(identityKeyPair.publicKey, 'spki');
  const idPrivKeyBase64 = await exportKey(identityKeyPair.privateKey, 'pkcs8');
  const exPubKeyBase64 = await exportKey(exchangeKeyPair.publicKey, 'spki');
  const exPrivKeyBase64 = await exportKey(exchangeKeyPair.privateKey, 'pkcs8');

  // 3. Derive AID (SHA-256 of Public Key)
  const pubKeyBuffer = new Uint8Array(await window.crypto.subtle.exportKey('spki', identityKeyPair.publicKey));
  const aidBuffer = await window.crypto.subtle.digest('SHA-256', pubKeyBuffer);
  const aid = Array.from(new Uint8Array(aidBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  const identity: Identity = {
    aid,
    username,
    identityKeyPair: {
      publicKey: idPubKeyBase64,
      privateKey: idPrivKeyBase64,
    },
    exchangeKeyPair: {
      publicKey: exPubKeyBase64,
      privateKey: exPrivKeyBase64,
    },
  };

  await saveIdentity(identity);
  return identity;
}
