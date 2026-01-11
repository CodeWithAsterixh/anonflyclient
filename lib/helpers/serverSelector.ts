interface ServerConfig {
  name: string;
  id: string; // srv1, srv2, srv3, srv4
  url: string;
  region: string;
  continents: string[];
}

interface LocationData {
  country: string;
  continent: string;
  latitude: number;
  longitude: number;
}

interface EncryptedCache {
  data: string; // Base64 encoded encrypted data
  iv: string; // Base64 encoded IV
  v: number; // Cache version
  ts: number; // Timestamp
}

// Cache configuration
const CACHE_KEY = 'anonfly_server_selector';
// Reduce default cache to 10 minutes to avoid long-lived wrong selections
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes in milliseconds
const ENCRYPTION_KEY_SEED = 'anonfly-secure-server-selector-2025';
const ENCRYPTION_SALT = 'anonfly-encryption-salt';
const env_servers = import.meta.env
const {VITE_SERVER_1_URL,VITE_SERVER_2_URL,VITE_SERVER_3_URL,VITE_SERVER_4_URL} = env_servers
const SERVERS: ServerConfig[] = [
  {
    name: 'server-1',
    id: 'srv1',
    url: VITE_SERVER_1_URL,
    region: 'Oregon, USA',
    continents: ['North America'],
  },
  {
    name: 'server-2',
    id: 'srv2',
    url: VITE_SERVER_2_URL,
    region: 'Singapore',
    continents: ['Asia'],
  },
  {
    name: 'server-3',
    id: 'srv3',
    url: VITE_SERVER_3_URL,
    region: 'Frankfurt, Germany',
    continents: ['Europe'],
  },
  {
    name: 'server-4',
    id: 'srv4',
    url: VITE_SERVER_4_URL,
    region: 'Virginia, USA',
    continents: ['North America'],
  },
];

// Server coordinates (approximate centers)
const SERVER_COORDINATES: Record<string, { lat: number; lon: number }> = {
  'srv1': { lat: 45.5951, lon: -121.1787 }, // Oregon
  'srv2': { lat: 1.3521, lon: 103.8198 }, // Singapore
  'srv3': { lat: 50.1109, lon: 8.6821 }, // Frankfurt
  'srv4': { lat: 37.54, lon: -77.436 }, // Virginia
};

/**
 * Derive an encryption key from a seed using PBKDF2
 */
async function deriveEncryptionKey(): Promise<CryptoKey> {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(ENCRYPTION_KEY_SEED),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: new TextEncoder().encode(ENCRYPTION_SALT),
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );

  return key;
}

/**
 * Encrypt server identifier using AES-GCM
 */
async function encryptServerId(serverId: string): Promise<EncryptedCache> {
  const key = await deriveEncryptionKey();
  const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV for GCM
  
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    new TextEncoder().encode(serverId)
  );

  return {
    data: btoa(String.fromCodePoint(...new Uint8Array(encrypted))),
    iv: btoa(String.fromCodePoint(...iv)),
    v: 1,
    ts: Date.now(),
  };
}

/**
 * Decrypt server identifier from cache
 */
async function decryptServerId(cache: EncryptedCache): Promise<string | null> {
  try {
    const key = await deriveEncryptionKey();
    const iv = new Uint8Array(atob(cache.iv).split('').map(c => c.codePointAt(0) || 0));
    const encrypted = new Uint8Array(atob(cache.data).split('').map(c => c.codePointAt(0) || 0));

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      encrypted
    );

    return new TextDecoder().decode(decrypted);
  } catch {
    return null;
  }
}

/**
 * Validates if the server is suitable for the user's current location.
 * If not suitable, clears the cache.
 */
async function validateServerLocation(server: ServerConfig): Promise<boolean> {
  try {
    const location = await getUserLocation();
    if (location && !server.continents.includes(location.continent)) {
      localStorage.removeItem(CACHE_KEY);
      return false;
    }
  } catch {
    // If checking location fails, fall back to true (assume suitable)
  }
  return true;
}

/**
 * Get cached server selector if it exists and hasn't expired
 */
async function getCachedServerSelector(): Promise<string | null> {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const cacheData: EncryptedCache = JSON.parse(cached);
    if (Date.now() - cacheData.ts > CACHE_DURATION) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }

    const serverId = await decryptServerId(cacheData);
    if (!serverId) return null;

    const server = SERVERS.find(s => s.id === serverId);
    if (!server) return null;

    const isSuitable = await validateServerLocation(server);
    return isSuitable ? serverId : null;
  } catch {
    return null;
  }
}

/**
 * Cache the selected server (only the identifier, encrypted)
 */
async function cacheServerSelector(serverId: string): Promise<void> {
  try {
    const encrypted = await encryptServerId(serverId);
    localStorage.setItem(CACHE_KEY, JSON.stringify(encrypted));
  } catch {
    // Silently fail
  }
}

/**
 * Clear the cached server selector
 */
export function clearServerCache(): void {
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch {
    // Silently fail
  }
}

/**
 * Calculate distance between two geographic coordinates using Haversine formula
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Fetch user's location data from IP geolocation service
 */
async function getUserLocation(): Promise<LocationData | null> {
  try {
    // Using ip-api.com's free tier (no API key required, 45 req/min)
    const response = await fetch('https://ip-api.com/json/?fields=country,continent,lat,lon', {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch location: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.status === 'fail') {
      return null;
    }

    return {
      country: data.country,
      continent: data.continent,
      latitude: data.lat,
      longitude: data.lon,
    };
  } catch {
    return null;
  }
}

/**
 * Select the best server based on user's location
 * Returns cached server selector if available, otherwise fetches location and selects best server
 * Falls back to server-1 if location detection fails
 */
export async function selectBestServer(): Promise<string> {
  // Check cache first
  const cachedServerId = await getCachedServerSelector();
  if (cachedServerId) {
    const server = SERVERS.find(s => s.id === cachedServerId);
    if (server) {
      return server.url;
    }
  }

  const location = await getUserLocation();

  if (!location) {
    await cacheServerSelector(SERVERS[0].id);
    return SERVERS[0].url;
  }

  let closestServer = SERVERS[0];
  let minDistance = Infinity;

  // Find the closest server based on geographic distance
  for (const server of SERVERS) {
    const coords = SERVER_COORDINATES[server.id];
    if (!coords) continue;

    const distance = calculateDistance(
      location.latitude,
      location.longitude,
      coords.lat,
      coords.lon
    );

    if (distance < minDistance) {
      minDistance = distance;
      closestServer = server;
    }
  }

  // Cache the selected server selector (encrypted)
  await cacheServerSelector(closestServer.id);

  return closestServer.url;
}

/**
 * Get all available servers configuration
 */
export function getServersConfig(): ServerConfig[] {
  return SERVERS;
}

/**
 * Get a specific server URL by name
 */
export function getServerByName(name: string): string | null {
  const server = SERVERS.find((s) => s.name === name);
  return server?.url || null;
}

/**
 * Get a specific server by ID
 */
export function getServerById(id: string): ServerConfig | null {
  return SERVERS.find((s) => s.id === id) || null;
}
