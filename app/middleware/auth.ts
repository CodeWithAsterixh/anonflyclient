import { redirect } from "react-router";

/**
 * Helper to handle authentication in loaders.
 * It reads the session cookie and returns the user and token.
 */
export async function requireAuth(request: Request) {
  const cookieHeader = request.headers.get("Cookie");
  const cookies = parseCookies(cookieHeader);
  const sessionCookie = cookies["anonfly_session_user"];

  if (!sessionCookie) {
    const url = new URL(request.url);
    // If no session cookie, redirect to login with current path as redirect_to
    throw redirect(`/login?redirect_to=${encodeURIComponent(url.pathname)}`);
  }

  try {
    // Decode and parse the session cookie
    const session = JSON.parse(decodeURIComponent(sessionCookie));
    if (session?.user) {
      return {
        user: session.user,
        token: session.token || null,
      };
    } else {
      throw redirect("/login");
    }
  } catch{
    // If parsing fails, the cookie is invalid
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
