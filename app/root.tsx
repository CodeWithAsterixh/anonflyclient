import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "react-router";
import { useEffect } from "react";

import type { Route } from "./+types/root";
import { initializeAPI } from "../lib/constants/api";
import { ThemeProvider } from "../hooks/useTheme/index";
import { AuthProvider } from "./contexts/AuthContext";
import { usePWA } from "../hooks/usePWA";
import PWAInstallPrompt from "../components/pwaInstallPrompt";
import "./app.css";

/**
 * Root loader to determine the initial theme from cookies.
 * 
 * @async
 * @param {Object} args - Loader arguments.
 * @param {Request} args.request - The incoming fetch request.
 * @returns {Promise<{ theme: string }>} The initial theme ("dark" or "light").
 */
export async function loader({ request }: { request: Request }) {
  const cookieHeader = request.headers.get("Cookie");
  const theme = cookieHeader?.includes("theme=dark") ? "dark" : "light";
  return { theme };
}

const BASE_URL = "https://anonfly.vercel.app";

export const meta: Route.MetaFunction = () => [
  { title: "Anonfly | Secure, Anonymous & Free Messaging" },
  { name: "description", content: "Anonfly is the ultimate free, secure, and anonymous messaging platform. No registration, no tracking—just private chatrooms for everyone." },
  { name: "keywords", content: "anonymous chat, secure messaging, free chatrooms, private messaging, no registration chat, encrypted chat, anonfly" },
  { rel: "canonical", href: BASE_URL },
  
  // Open Graph / Facebook
  { property: "og:type", content: "website" },
  { property: "og:url", content: BASE_URL },
  { property: "og:title", content: "Anonfly | Secure, Anonymous & Free Messaging" },
  { property: "og:description", content: "Join anonymous chatrooms instantly. No tracking, no sign-ups. 100% secure and free." },
  { property: "og:image", content: `${BASE_URL}/logo.svg` },

  // Twitter
  { name: "twitter:card", content: "summary_large_image" },
  { name: "twitter:url", content: BASE_URL },
  { name: "twitter:title", content: "Anonfly | Secure, Anonymous & Free Messaging" },
  { name: "twitter:description", content: "Join anonymous chatrooms instantly. No tracking, no sign-ups. 100% secure and free." },
  { name: "twitter:image", content: `${BASE_URL}/logo.svg` },
  
  // Theme Color for mobile browsers
  { name: "theme-color", content: "#2563eb" },
];

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  { rel: "icon", href: "/logo.svg" },
  { rel: "manifest", href: "/manifest.json" },
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

/**
 * The base HTML layout for the entire application.
 * Handles theme initialization, global styles, and meta tags.
 * 
 * @param {Object} props - Component props.
 * @param {React.ReactNode} props.children - The content to render inside the layout.
 * @returns {JSX.Element} The root HTML structure.
 */
export function Layout({ children }: { children: React.ReactNode }) {
  const data = useLoaderData<typeof loader>();
  const theme = data?.theme || "light";

  return (
    <html lang="en" className={theme}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "Anonfly",
              "url": BASE_URL,
              "description": "Secure, anonymous, and free messaging platform. No registration required.",
              "applicationCategory": "CommunicationApplication",
              "operatingSystem": "Any",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "author": {
                "@type": "Organization",
                "name": "Anonfly"
              }
            })
          }}
        />
        {/* Inline script to prevent theme flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = document.cookie.split('; ').find(row => row.startsWith('theme='))?.split('=')[1] || 
                              localStorage.getItem('theme') || 
                              (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                  document.documentElement.classList.add(theme);
                  document.body.style.backgroundColor = theme === 'dark' ? '#030712' : '#ffffff';
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="bg-white dark:bg-gray-950 isolate relative min-h-[100dvh] transition-colors duration-300">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

/**
 * The main App component that wraps the application with necessary providers.
 * Initializes the API and manages global state like theme and authentication.
 * 
 * @returns {JSX.Element} The rendered application with providers.
 */
export default function App() {
  const { theme } = useLoaderData<typeof loader>();
  const { showInstallPrompt, installApp, remindLater, cancelInstallation } = usePWA();

  useEffect(() => {
    initializeAPI();

    // Register Service Worker
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("SW registered: ", registration);
          })
          .catch((registrationError) => {
            console.log("SW registration failed: ", registrationError);
          });
      });
    }
  }, []);

  return (
    <ThemeProvider initialTheme={theme as "light" | "dark"}>
      <AuthProvider>
        <Outlet />
        {showInstallPrompt && (
          <PWAInstallPrompt 
            onInstall={installApp} 
            onRemindLater={remindLater} 
            onCancel={cancelInstallation} 
          />
        )}
      </AuthProvider>
    </ThemeProvider>
  );
}

/**
 * Global error boundary for the application.
 * Renders a fallback UI when a route error or unexpected exception occurs.
 * 
 * @param {Route.ErrorBoundaryProps} props - Component props containing the error.
 * @returns {JSX.Element} The error fallback UI.
 */
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
