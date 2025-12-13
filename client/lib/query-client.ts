import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { getAuthTokenSync } from "./authToken";

/**
 * Gets the base URL for the Express API server (e.g., "http://localhost:3000")
 * @returns {string} The API base URL
 */
export function getApiUrl(): string {
  // For web platform in development, use localhost
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    // We're in a browser
    const hostname = window.location.hostname;
    
    // Local development
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:5000';
    }
    
    // Replit web preview - need to use the origin but with port 5000 routing
    // Replit proxies multiple ports, so we access via same origin
    // The API is served from the same domain with /api routes
    return window.location.origin;
  }
  
  // For native apps (iOS/Android), use the EXPO_PUBLIC_DOMAIN
  let host = process.env.EXPO_PUBLIC_DOMAIN;

  if (!host) {
    throw new Error("EXPO_PUBLIC_DOMAIN is not set");
  }

  let url = new URL(`https://${host}`);

  return url.href;
}

function getAuthHeaders(): Record<string, string> {
  const token = getAuthTokenSync();
  if (token) {
    return { 'Authorization': `Bearer ${token}` };
  }
  return {};
}

class ApiError extends Error {
  code?: string;
  status: number;
  
  constructor(message: string, status: number, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
    this.name = 'ApiError';
  }
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    let message = `${res.status}: ${text}`;
    let code: string | undefined;
    
    // Try to parse JSON error response
    try {
      const json = JSON.parse(text);
      if (json.error) {
        message = json.error;
      }
      if (json.code) {
        code = json.code;
      }
    } catch {
      // Not JSON, use text as-is
    }
    
    throw new ApiError(message, res.status, code);
  }
}

export async function apiRequest(
  method: string,
  route: string,
  data?: unknown | undefined,
): Promise<Response> {
  const baseUrl = getApiUrl();
  const url = new URL(route, baseUrl);

  const headers: Record<string, string> = {
    ...getAuthHeaders(),
    ...(data ? { "Content-Type": "application/json" } : {}),
  };

  try {
    const res = await fetch(url.toString(), {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    });

    await throwIfResNotOk(res);
    return res;
  } catch (error: any) {
    console.log('API Request failed:', url.toString(), error?.message || error);
    throw new Error(error?.message || 'Network request failed');
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const baseUrl = getApiUrl();
    const url = new URL(queryKey.join("/") as string, baseUrl);

    const res = await fetch(url, {
      credentials: "include",
      headers: getAuthHeaders(),
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
