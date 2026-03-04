import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "react-router";
import { useEffect, type JSX, useMemo } from "react";

import type { Route } from "./+types/root";
import { initializeAPI, getAPIBaseURL, getChatWSURL } from "~/shared/constants/api";
import { ThemeProvider, usePWA } from "~/shared/hooks";
import { AnonflyProvider } from "@anonfly/react";
import { AuthProvider } from "~/features/auth/context/AuthContext";
import PWAInstallPrompt from "~/shared/components/pwaInstallPrompt";
import "./app.css";

/**
 * Root loader to determine initial configuration and theme.
 */
export async function loader({ request }: { request: Request }) {
  const cookieHeader = request.headers.get("Cookie");
  const theme = cookieHeader?.includes("themeState=light") ? "light" : "dark";

  const colorSchemeMatch = cookieHeader?.match(/colorScheme=([^;]+)/);
  const colorScheme = colorSchemeMatch ? colorSchemeMatch[1] : "purple";

  // Ensure API is initialized (server selection)
  await initializeAPI();

  return {
    theme,
    colorScheme,
    config: {
      baseUrl: getAPIBaseURL(),
      wsUrl: getChatWSURL(),
      apiKey: "anonfly-public-key", // In production, this might come from env or a registry
    }
  };
}

export function Layout({ children }: Readonly<{ children: React.ReactNode }>): JSX.Element {
  const data = useLoaderData<typeof loader>();
  const theme = data?.theme || "light";

  return (
    <html lang="en" className={theme}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="bg-background text-foreground isolate relative min-h-dvh transition-colors duration-300">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App(): JSX.Element {
  const { theme, colorScheme, config } = useLoaderData<typeof loader>();
  const { showInstallPrompt, installApp, remindLater, cancelInstallation } = usePWA();

  const anonflyConfig = useMemo(() => ({
    baseUrl: config.baseUrl,
    wsUrl: config.wsUrl,
    apiKey: config.apiKey,
  }), [config]);

  useEffect(() => {
    // Register Service Worker
    if ("serviceWorker" in navigator && import.meta.env.PROD) {
      navigator.serviceWorker.register("/sw.js").catch(err => console.error("SW registration failed:", err));
    }
  }, []);

  return (
    <ThemeProvider initialTheme={theme as "light" | "dark"} initialColorScheme={colorScheme as any}>
      <AnonflyProvider config={anonflyConfig}>
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
      </AnonflyProvider>
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
