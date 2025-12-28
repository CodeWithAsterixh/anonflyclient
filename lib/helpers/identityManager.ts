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
const DB_VERSION = 5;
const STORE_NAME = 'identity_store';
const ROOM_KEY_STORE = 'room_key_store';
const ACTIVE_IDENTITY_KEY = 'active_identity_aid';

async function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => {
      console.error("[identityManager] Failed to open IndexedDB:", request.error);
      reject(request.error);
    };
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = request.result;
      console.log(`[identityManager] Upgrading IndexedDB from ${event.oldVersion} to ${event.newVersion}`);
      
      // If upgrading from an older version, clear the stores to ensure correct schema
      if (event.oldVersion > 0 && event.oldVersion < 5) {
        console.log("[identityManager] Older version detected. Recreating object stores...");
        if (db.objectStoreNames.contains(STORE_NAME)) {
          db.deleteObjectStore(STORE_NAME);
        }
        if (db.objectStoreNames.contains(ROOM_KEY_STORE)) {
          db.deleteObjectStore(ROOM_KEY_STORE);
        }
      }

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        console.log(`[identityManager] Creating ${STORE_NAME} with keyPath 'aid'`);
        db.createObjectStore(STORE_NAME, { keyPath: 'aid' });
      }
      
      if (!db.objectStoreNames.contains(ROOM_KEY_STORE)) {
        console.log(`[identityManager] Creating ${ROOM_KEY_STORE} (out-of-line keys)`);
        db.createObjectStore(ROOM_KEY_STORE);
      }
    };
  });
}

export async function saveRoomKey(chatroomId: string, keyBase64: string): Promise<void> {
  if (!chatroomId) {
    console.error("[identityManager] Cannot save room key: chatroomId is missing");
    return;
  }
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(ROOM_KEY_STORE, 'readwrite');
    const store = transaction.objectStore(ROOM_KEY_STORE);
    const request = store.put(keyBase64, chatroomId);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export async function getRoomKey(chatroomId: string): Promise<string | null> {
  if (!chatroomId) return null;
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(ROOM_KEY_STORE, 'readonly');
    const store = transaction.objectStore(ROOM_KEY_STORE);
    const request = store.get(chatroomId);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || null);
  });
}

export async function clearRoomKeys(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(ROOM_KEY_STORE, 'readwrite');
    const store = transaction.objectStore(ROOM_KEY_STORE);
    const request = store.clear();
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export async function saveIdentity(identity: Identity): Promise<void> {
  if (!identity || !identity.aid) {
    console.error("[identityManager] Cannot save identity: aid is missing");
    return;
  }
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    // Safety check: ensure the store has the expected keyPath
    if (store.keyPath !== 'aid') {
      console.error(`[identityManager] Object store ${STORE_NAME} has incorrect keyPath: ${store.keyPath}. Expected 'aid'.`);
      reject(new Error(`Incorrect keyPath for ${STORE_NAME}`));
      return;
    }

    const request = store.put(identity);
    request.onerror = () => {
      console.error("[identityManager] Error in saveIdentity put request:", request.error);
      reject(request.error);
    };
    request.onsuccess = () => {
      localStorage.setItem(ACTIVE_IDENTITY_KEY, identity.aid);
      resolve();
    };
  });
}

export async function getIdentity(): Promise<Identity | null> {
  const db = await openDB();
  const activeAid = localStorage.getItem(ACTIVE_IDENTITY_KEY);
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    
    if (activeAid) {
      const request = store.get(activeAid);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || null);
    } else {
      // Fallback: Get the first available identity if no active one is set
      const request = store.openCursor();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor) {
          localStorage.setItem(ACTIVE_IDENTITY_KEY, cursor.value.aid);
          resolve(cursor.value);
        } else {
          resolve(null);
        }
      };
    }
  });
}

export async function getAllIdentities(): Promise<Identity[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || []);
  });
}

export async function switchIdentity(aid: string): Promise<Identity | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(aid);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      if (request.result) {
        localStorage.setItem(ACTIVE_IDENTITY_KEY, aid);
        resolve(request.result);
      } else {
        resolve(null);
      }
    };
  });
}

export async function clearIdentity(aid?: string): Promise<void> {
  const db = await openDB();
  const targetAid = aid || localStorage.getItem(ACTIVE_IDENTITY_KEY);
  if (!targetAid) return;

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(targetAid);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      if (targetAid === localStorage.getItem(ACTIVE_IDENTITY_KEY)) {
        localStorage.removeItem(ACTIVE_IDENTITY_KEY);
      }
      resolve();
    };
  });
}

export async function generateIdentity(username: string): Promise<Identity> {
  // 1. Generate Identity Key Pair (Ed25519 for signing)
  const identityKeyPair = (await window.crypto.subtle.generateKey(
    {
      name: 'Ed25519',
    },
    true,
    ['sign', 'verify']
  )) as CryptoKeyPair;

  // 2. Generate Exchange Key Pair (X25519 for E2EE)
  const exchangeKeyPair = (await window.crypto.subtle.generateKey(
    {
      name: 'X25519',
    },
    true,
    ['deriveKey', 'deriveBits']
  )) as CryptoKeyPair;

  // Export keys to Base64 DER (spki for public, pkcs8 for private)
  const exportKey = async (key: CryptoKey, format: 'spki' | 'pkcs8') => {
    const exported = await window.crypto.subtle.exportKey(format, key);
    return btoa(String.fromCharCode(...new Uint8Array(exported)));
  };

  const idPubKeyBase64 = await exportKey(identityKeyPair.publicKey, 'spki');
  const idPrivKeyBase64 = await exportKey(identityKeyPair.privateKey, 'pkcs8');
  
  // Note: For X25519, we use raw format for easier handling, but if you need spki/pkcs8, 
  // ensure your environment supports them. Most modern browsers do.
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
