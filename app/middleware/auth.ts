import { redirect } from "react-router";

/**
 * Helper to handle authentication in loaders.
 * It reads the session cookie and returns the user and token.
 */
export async function requireAuth(request: Request) {
  const cookieHeader = request.headers.get("Cookie");
  const cookies = parseCookies(cookieHeader);
  
  // Be resilient to missing env vars
  const sessionKey = (import.meta.env?.VITE_SESSION_COOKIE_KEY);
  const sessionCookie = cookies[sessionKey];

  if (!sessionCookie) {
    const url = new URL(request.url);
    // If no session cookie, redirect to login with current path as redirect_to
    throw redirect(`/login?redirect_to=${encodeURIComponent(url.pathname)}`);
  }

  try {
    // Decode the session cookie value
    // js-cookie encodes JSON values, so we need to decode it
    const decoded = decodeURIComponent(sessionCookie);
    const session = JSON.parse(decoded);
    
    if (session?.user) {
      return {
        user: session.user,
        token: session.token || null,
      };
    } else {
      throw redirect("/login");
    }
  } catch (error) {
    console.error("[requireAuth] Cookie parsing failed:", error);
    throw redirect("/login");
  }
}

/**
 * Simple helper to parse cookies from the Cookie header.
 */
function parseCookies(cookieHeader: string | null) {
  const cookies: Record<string, string> = {};
  if (cookieHeader) {
    cookieHeader.split(";").forEach((cookie) => {
      const parts = cookie.split("=");
      if (parts.length >= 2) {
        const name = parts[0].trim();
        const value = parts.slice(1).join("=");
        cookies[name] = value;
      }
    });
  }
  return cookies;
}
