# Authentication & Identity Module

Anonfly uses a decentralized, registration-free authentication system based on cryptographic identities.

## Overview

Unlike traditional apps, Anonfly does not use passwords or email addresses. Instead, it relies on locally generated cryptographic keys to identify users and authorize actions.

## Identity Management

### The Identity Object
An identity contains:
- `aid`: The unique public identifier (Anonymous ID).
- `username`: A display name chosen by the user.
- `publicKey`: The Ed25519 public key for signing.
- `exchangePublicKey`: The X25519 public key for key exchange.
- `identityKeyPair`: The full Ed25519 key pair (stored locally).
- `exchangeKeyPair`: The full X25519 key pair (stored locally).

### Multi-Account Support
Users can maintain multiple identities on the same device. The `identityManager` handles:
- **Saving Identities**: Storing new identities in IndexedDB.
- **Switching Identities**: Changing the active account in `localStorage`.
- **Deleting Identities**: Removing keys and metadata from the device.

## Authentication Flow

1. **Generation**: When a user first visits, a new identity is generated locally using the Web Crypto API.
2. **Persistence**: The identity is saved to IndexedDB, and the `aid` is set as the active account in `localStorage`.
3. **API Authorization**: All requests to the backend include an `Authorization` header containing the user's `aid`.
4. **Verification**: For sensitive actions (like sending messages), the user signs the payload with their private key, and the backend verifies the signature against their registered public key.

## Implementation Details

- **Hooks**: [useAuthInternal.ts](file:///c:/Users/Asterixh/Desktop/Anonfly-chat-app/anonflyclient/hooks/useAuth/useAuthInternal.ts) provides the high-level API for components to interact with the auth system.
- **Storage**: [identityManager.ts](file:///c:/Users/Asterixh/Desktop/Anonfly-chat-app/anonflyclient/lib/helpers/identityManager.ts) manages the IndexedDB interactions.
- **API Wrapper**: [authController.ts](file:///c:/Users/Asterixh/Desktop/Anonfly-chat-app/anonflyclient/lib/controllers/authController.ts) handles network requests for account verification and premium status.

## Premium Status
Premium features (like creating larger rooms or using custom themes) are checked periodically via the `checkPremiumStatus` function in `useAuthInternal`. The status is cached locally to reduce API calls.
