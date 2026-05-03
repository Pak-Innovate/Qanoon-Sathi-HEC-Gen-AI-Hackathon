/**
 * API Client Configuration
 * Dynamically sets the backend URL based on environment and current context
 */

// Get backend URL from environment variables
const getBackendUrl = (): string => {
  // For production (Vercel frontend + Render backend)
  if (import.meta.env.VITE_BACKEND_URL) {
    return import.meta.env.VITE_BACKEND_URL;
  }

  // For development or same-origin deployment
  // Returns empty string to use relative URLs (same origin)
  return "";
};

export const BACKEND_URL = getBackendUrl();

/**
 * Make an API request to the backend
 * Automatically prepends the backend URL if configured
 */
export const apiCall = async (
  endpoint: string,
  options: RequestInit = {},
): Promise<Response> => {
  const url = BACKEND_URL ? `${BACKEND_URL}${endpoint}` : endpoint;

  // Only set Content-Type for non-FormData requests
  const headers: any = options.headers || {};
  if (!(options.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  return fetch(url, {
    ...options,
    headers,
  });
};

/**
 * Helper for common API patterns
 */
export const apiRequest = async <T = any>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> => {
  const response = await apiCall(endpoint, options);
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }
  return response.json();
};
