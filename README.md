<div align="center">
  <div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
    <svg width="128" height="128" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1));">
      <defs>
        <linearGradient id="logo-shield-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#3b82f6" />
          <stop offset="100%" stop-color="#1d4ed8" />
        </linearGradient>
      </defs>
      <path d="M176 192V144C176 99.8172 211.817 64 256 64C300.183 64 336 99.8172 336 144V192" stroke="#3b82f6" stroke-width="32" stroke-linecap="round" />
      <path d="M128 160C128 160 128 280 128 320C128 400 256 464 256 464C256 464 384 400 384 320C384 280 384 160 384 160H128Z" fill="url(#logo-shield-grad)" />
      <rect x="180" y="260" width="60" height="20" rx="10" fill="white" />
      <rect x="272" y="260" width="60" height="20" rx="10" fill="white" />
      <path d="M128 200L32 280L128 320" fill="#3b82f6" fill-opacity="0.6" />
      <path d="M384 200L480 280L384 320" fill="#3b82f6" fill-opacity="0.6" />
    </svg>
    <div style="display: flex; flex-direction: column; line-height: 1.2; text-align: left;">
      <span style="font-weight: bold; font-size: 24px; letter-spacing: -0.025em; color: #1d4ed8;">
        Anonfly
      </span>
      <span style="font-size: 10px; font-weight: bold; color: #3b82f6; text-transform: uppercase; letter-spacing: 0.1em;">
        Free • Secure • Anon
      </span>
    </div>
  </div>
</div>

# Anonfly Client 🌐🦋

The modern, sleek, and secure frontend for the Anonfly anonymous chat application. Built with React Router (v7) and Tailwind CSS, it features end-to-end encryption (E2EE) and a seamless real-time user experience.

## ✨ Features

- **Anonymous Identity**: No email or password required. Persistent cryptographic identities stored locally.
- **End-to-End Encryption (E2EE)**: Secure messaging using X25519, Ed25519, and AES-GCM.
- **Real-time Updates**: Live chatroom lists and instant messaging via WebSockets and SSE.
- **Modern UI/UX**: Responsive design with Tailwind CSS, featuring dark mode support and smooth transitions.
- **Dynamic Avatars**: Unique avatars generated based on user identity.
- **Offline Resilience**: Intelligent state management that handles intermittent network issues gracefully.

## 🛠️ Tech Stack & Tools

- **Framework**: [React Router v7](https://reactrouter.com/) (formerly Remix)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **UI Components**: [Headless UI](https://headlessui.com/)
- **State Management**: Custom React Hooks (`useAuth`, `useChatroom`, `useChatroomList`)
- **Storage**: [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) for persistent identities and session storage.
- **Client-Side Crypto**: [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)

## 🏗️ Core Architecture

### 1. Identity Management
Users are identified by cryptographic keypairs. The `identityManager` handles the generation and persistence of these keys in the browser's IndexedDB, allowing users to "switch accounts" while remaining anonymous.

### 2. Encryption Layer
Messages are encrypted on the client before being sent and decrypted only by recipients. This ensures that even the server cannot read the message contents.

### 3. Real-time Hooks
- `useChatroom`: Manages WebSocket connections and message history for a specific room.
- `useChatroomList`: Handles live updates to the global chatroom directory using SSE.
- `useAuth`: Orchestrates the secure handshake and session state.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Backend server running (see Anonfly Backend folder)

### Installation
```bash
cd anonflyclient
pnpm install
```

### Development
```bash
pnpm dev
```

### Production Build
```bash
pnpm build
pnpm start
```

## 📂 Project Structure
- `app/routes/`: Page components and routing logic.
- `components/`: Reusable UI components (Modals, Cards, Skeletons).
- `hooks/`: Business logic and data fetching hooks.
- `lib/controllers/`: Core application logic (WS management, avatar generation).
- `lib/helpers/`: Cryptographic utilities and storage managers.

---
Created with ❤️ by **Peter Paul (Asterixh)**
- Portfolio: [codewithasterixh.vercel.app](https://codewithasterixh.vercel.app)
- Live Site: [anonfly.vercel.app](https://anonfly.vercel.app)
