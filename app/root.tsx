import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import { useEffect } from "react";

import type { Route } from "./+types/root";
import { initializeAPI } from "../lib/constants/api";
import { ThemeProvider } from "../hooks/useTheme/index";
import "./app.css";

export const meta: Route.MetaFunction = () => [
  { title: "Anonfly | Secure, Anonymous & Free Messaging" },
  { name: "description", content: "Anonfly is the ultimate free, secure, and anonymous messaging platform. No registration, no tracking—just private chatrooms for everyone." },
  { name: "keywords", content: "anonymous chat, secure messaging, free chatrooms, private messaging, no registration chat, encrypted chat, anonfly" },
  
  // Open Graph / Facebook
  { property: "og:type", content: "website" },
  { property: "og:url", content: "https://anonfly.vercel.app" },
  { property: "og:title", content: "Anonfly | Secure, Anonymous & Free Messaging" },
  { property: "og:description", content: "Join anonymous chatrooms instantly. No tracking, no sign-ups. 100% secure and free." },
  { property: "og:image", content: "/logo.svg" },

  // Twitter
  { name: "twitter:card", content: "summary_large_image" },
  { name: "twitter:url", content: "https://anonfly.vercel.app" },
  { name: "twitter:title", content: "Anonfly | Secure, Anonymous & Free Messaging" },
  { name: "twitter:description", content: "Join anonymous chatrooms instantly. No tracking, no sign-ups. 100% secure and free." },
  { name: "twitter:image", content: "/logo.svg" },
  
  // Theme Color for mobile browsers
  { name: "theme-color", content: "#2563eb" },
];

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {rel: "icon", href:"/logo.svg"},
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  useEffect(() => {
    initializeAPI();
  }, []);

  return (
    <ThemeProvider>
      <Outlet />
    </ThemeProvider>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
