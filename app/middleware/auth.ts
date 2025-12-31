import { redirect } from "react-router";
import { userContext, tokenContext } from "../context/auth";

/**
 * Middleware to handle authentication on the server side.
 * It reads the session cookie and populates the user context.
 */
export async function authMiddleware({ request, context }: any) {
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
    if (session && session.user) {
      // Set the user and token in the context for loaders to access
      context.set(userContext, session.user);
      context.set(tokenContext, session.token || null);
    } else {
      throw redirect("/login");
    }
  } catch (e) {
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
