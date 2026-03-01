import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";

const API_BASE_URL = process.env.VITE_API_BASE_URL || "http://localhost:5001/api/v1";
const API_KEY = process.env.VITE_API_KEY;

/**
 * Proxy handler for both GET and POST/PUT/DELETE requests.
 * Injects the API_KEY on the server to keep it hidden from the browser.
 */
async function proxyHandler({ request, params }: LoaderFunctionArgs | ActionFunctionArgs) {
    const url = new URL(request.url);
    // Get the path after /proxy/
    const path = url.pathname.replace(/^\/proxy/, "");
    const targetUrl = `${API_BASE_URL}${path}${url.search}`;

    const headers = new Headers(request.headers);

    // Inject the API key on the server
    if (API_KEY) {
        headers.set("X-API-Key", API_KEY);
        // Also set as Authorization if no Bearer token is present
        if (!headers.has("Authorization") || headers.get("Authorization") === "") {
            headers.set("Authorization", `ApiKey ${API_KEY}`);
        }
    }

    // Remove host header to avoid SSL/Routing issues on the target
    headers.delete("host");
    // Ensure we don't leak internal proxy info if any
    headers.delete("connection");

    try {
        const response = await fetch(targetUrl, {
            method: request.method,
            headers: headers,
            body: request.method !== "GET" && request.method !== "HEAD" ? await request.arrayBuffer() : undefined,
            redirect: "manual", // Let the client handle redirects
        });

        // Clean up headers from the target response if needed
        const responseHeaders = new Headers(response.headers);

        return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: responseHeaders,
        });
    } catch (error) {
        console.error(`Proxy error for ${targetUrl}:`, error);
        return new Response(JSON.stringify({ error: "Proxy error", details: String(error) }), {
            status: 502,
            headers: { "Content-Type": "application/json" },
        });
    }
}

export const loader = proxyHandler;
export const action = proxyHandler;
