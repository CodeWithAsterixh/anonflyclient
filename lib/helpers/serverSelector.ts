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
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const ENCRYPTION_KEY_SEED = 'anonfly-secure-server-selector-2025';
const ENCRYPTION_SALT = 'anonfly-encryption-salt';

const SERVERS: ServerConfig[] = [
  {
    name: 'server-1',
    id: 'srv1',
    url: 'https://anonfly-server-1.onrender.com',
    region: 'Oregon, USA',
    continents: ['North America'],
  },
  {
    name: 'server-2',
    id: 'srv2',
    url: 'https://anonfly-server-2.onrender.com',
    region: 'Singapore',
    continents: ['Asia'],
  },
  {
    name: 'server-3',
    id: 'srv3',
    url: 'https://anonfly-server-3.onrender.com',
    region: 'Frankfurt, Germany',
    continents: ['Europe'],
  },
  {
    name: 'server-4',
    id: 'srv4',
    url: 'https://anonfly-server-4.onrender.com',
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
  try {
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
  } catch (error) {
    console.error('Error deriving encryption key:', error);
    throw error;
  }
}

/**
 * Encrypt server identifier using AES-GCM
 */
async function encryptServerId(serverId: string): Promise<EncryptedCache> {
  try {
    const key = await deriveEncryptionKey();
    const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV for GCM
    
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      new TextEncoder().encode(serverId)
    );

    return {
      data: btoa(String.fromCharCode(...new Uint8Array(encrypted))),
      iv: btoa(String.fromCharCode(...iv)),
      v: 1,
      ts: Date.now(),
    };
  } catch (error) {
    console.error('Error encrypting server ID:', error);
    throw error;
  }
}

/**
 * Decrypt server identifier from cache
 */
async function decryptServerId(cache: EncryptedCache): Promise<string | null> {
  try {
    const key = await deriveEncryptionKey();
    const iv = new Uint8Array(atob(cache.iv).split('').map(c => c.charCodeAt(0)));
    const encrypted = new Uint8Array(atob(cache.data).split('').map(c => c.charCodeAt(0)));

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      encrypted
    );

    return new TextDecoder().decode(decrypted);
  } catch (error) {
    console.error('Error decrypting server ID:', error);
    return null;
  }
}

/**
 * Get cached server selector if it exists and hasn't expired
 */
async function getCachedServerSelector(): Promise<string | null> {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const cacheData: EncryptedCache = JSON.parse(cached);
    const now = Date.now();
    const age = now - cacheData.ts;

    // Check if cache has expired
    if (age > CACHE_DURATION) {
      console.log('Server selector cache expired, will fetch new location');
      localStorage.removeItem(CACHE_KEY);
      return null;
    }

    // Decrypt the server ID
    const serverId = await decryptServerId(cacheData);
    
    if (serverId) {
      const server = SERVERS.find(s => s.id === serverId);
      if (server) {
        console.log(
          `Using cached server selector: ${serverId} (${server.region}) - Cache age: ${(age / 1000 / 60).toFixed(1)} minutes`
        );
        return serverId;
      }
    }

    return null;
  } catch (error) {
    console.error('Error reading cache:', error);
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
    const server = SERVERS.find(s => s.id === serverId);
    console.log(`Cached server selector: ${serverId} (${server?.region})`);
  } catch (error) {
    console.error('Error caching server selector:', error);
  }
}

/**
 * Clear the cached server selector
 */
export function clearServerCache(): void {
  try {
    localStorage.removeItem(CACHE_KEY);
    console.log('Server selector cache cleared');
  } catch (error) {
    console.error('Error clearing cache:', error);
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
      console.warn('Geolocation failed:', data.message);
      return null;
    }

    return {
      country: data.country,
      continent: data.continent,
      latitude: data.lat,
      longitude: data.lon,
    };
  } catch (error) {
    console.error('Error fetching user location:', error);
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
    console.warn('Could not determine user location, using default server (server-1)');
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

  console.log(
    `Selected server: ${closestServer.id} (${closestServer.region}) - Distance: ${minDistance.toFixed(2)}km`
  );

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
