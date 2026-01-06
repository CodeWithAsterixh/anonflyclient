# Encryption Module

The Encryption module in Anonfly provides End-to-End Encryption (E2EE) for all chatroom communications. It ensures that messages can only be read by authorized participants within a room.

## Technologies Used

- **Web Crypto API**: A native browser API for performing cryptographic operations.
- **Ed25519**: Used for digital signatures and identity verification.
- **X25519**: Used for Diffie-Hellman key exchange.
- **AES-GCM (256-bit)**: Used for symmetric encryption of message content.
- **SHA-256**: Used for deriving unique identifiers (AID) and hashing.

## Key Concepts

### Identity
Every user has a unique identity generated locally. An identity consists of:
- **AID (Anonymous ID)**: A SHA-256 hash of the user's public signing key.
- **Signing Key Pair (Ed25519)**: Used to sign messages and prove authenticity.
- **Exchange Key Pair (X25519)**: Used to derive shared secrets with other participants.

### Room Keys
Each chatroom has a unique symmetric key (AES-GCM) used to encrypt all messages within that room.
- Room keys are stored locally in IndexedDB via the `identityManager`.
- When a user joins a room, they must obtain the room key either via direct derivation (if they are the creator) or through a secure key exchange process.

## Core Functions

### `deriveSharedSecret(privateKey, publicKey)`
Uses X25519 to derive a shared secret between two users. This secret is then used to securely transfer the room key.

### `encryptMessage(content, roomKey)`
Encrypts the message content using AES-GCM with the provided room key.
1. Generates a random 12-byte Initialization Vector (IV).
2. Encrypts the UTF-8 encoded content.
3. Returns a base64-encoded string containing the IV and the ciphertext.

### `decryptMessage(encryptedData, roomKey)`
Decrypts a base64-encoded message blob.
1. Extracts the IV and ciphertext.
2. Decrypts the ciphertext using the room key and IV.
3. Returns the original plaintext content.

## Implementation Details

The implementation can be found in [encryption.ts](file:///c:/Users/Asterixh/Desktop/Anonfly-chat-app/anonflyclient/lib/helpers/encryption.ts).

### Key Storage
Room keys and user identities are managed by [identityManager.ts](file:///c:/Users/Asterixh/Desktop/Anonfly-chat-app/anonflyclient/lib/helpers/identityManager.ts), which uses IndexedDB for persistent local storage.
