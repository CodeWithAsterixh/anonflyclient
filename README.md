# Anonfly Client 🦋

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
