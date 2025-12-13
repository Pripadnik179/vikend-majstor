import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { getAuthTokenSync } from "./authToken";

/**
 * Gets the base URL for the Express API server
 * @returns {string} The API base URL
 */
export function getApiUrl(): string {
  // Check if we're running on web platform
  const isWeb = typeof window !== 'undefined' && typeof document !== 'undefined';
  
  if (isWeb) {
    // On web, use same origin - requests go through the proxy
    // For localhost development, use localhost:5000
    const currentOrigin = window.location.origin;
    
    if (currentOrigin.includes('localhost:8081')) {
      return 'http://localhost:5000';
    }
    
    // For Replit and production: use same origin
    // The Express server on port 5000 serves both API and static files
    return currentOrigin;
  }
  
  // For mobile (React Native), use the configured domain
  const host = process.env.EXPO_PUBLIC_DOMAIN;

  if (!host) {
    throw new Error("EXPO_PUBLIC_DOMAIN is not set");
  }

  // Remove port suffix if present - mobile connects to port 5000 directly via Replit proxy
  const cleanHost = host.replace(/:5000$/, '');
  
  return `https://${cleanHost}`;
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
