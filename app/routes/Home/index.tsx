import { type MetaFunction } from "react-router";

export const meta: MetaFunction = () => {
  return [
    { title: "Dashboard | Anonfly - Secure Anonymous Chat" },
    { name: "description", content: "Manage your private chatrooms and conversations on Anonfly. The ultimate platform for secure, anonymous, and free messaging." },
    { property: "og:title", content: "Dashboard | Anonfly - Secure Anonymous Chat" },
    { property: "og:description", content: "Your personal dashboard for secure and private conversations." },
    { name: "twitter:title", content: "Dashboard | Anonfly - Secure Anonymous Chat" },
    { name: "twitter:description", content: "Your personal dashboard for secure and private conversations." },
    { rel: "canonical", href: "https://anonfly.vercel.app/" },
  ];
};

export default function Home() {
  return (
    <div className="flex items-center justify-center h-full bg-background text-muted">
      <div className="text-center">
        <svg
          className="w-24 h-24 mx-auto mb-4 text-muted/30"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
        <p className="text-lg font-medium text-foreground">
          Select a chat to view the conversation
        </p>
        <p className="text-sm text-muted mt-2">
          Choose a chatroom from the list to get started
        </p>
      </div>
    </div>
  );
}
