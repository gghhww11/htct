const API_BASE =
  (import.meta.env.VITE_API_URL as string) ||
  `${window.location.protocol}//${window.location.hostname}:4000/api`;

export type FetchOptions = RequestInit & {
  skipAuth?: boolean;
};

type ApiErrorPayload = {
  message?: string;
  error?: string;
};

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

async function refreshToken(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function handleRefresh(): Promise<boolean> {
  if (isRefreshing && refreshPromise) return refreshPromise;

  isRefreshing = true;
  refreshPromise = refreshToken().finally(() => {
    isRefreshing = false;
    refreshPromise = null;
  });

  return refreshPromise;
}

export async function apiClient<T>(
  endpoint: string,
  options: FetchOptions = {},
): Promise<T> {
  const { skipAuth, ...fetchOptions } = options;

  // merge headers safely
  const headers: Record<string, string> = {};
  if (fetchOptions.headers) {
    if (fetchOptions.headers instanceof Headers) {
      fetchOptions.headers.forEach((v, k) => (headers[k] = v));
    } else if (Array.isArray(fetchOptions.headers)) {
      for (const [k, v] of fetchOptions.headers) headers[k] = v;
    } else {
      Object.assign(headers, fetchOptions.headers as Record<string, string>);
    }
  }

  const isFormData = fetchOptions.body instanceof FormData;

  // Don't set Content-Type for FormData (browser sets boundary)
  if (isFormData) {
    delete headers["Content-Type"];
  } else {
    // set JSON content-type only if body is string and header not set
    if (typeof fetchOptions.body === "string" && !headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
    }
  }

  const config: RequestInit = {
    ...fetchOptions,
    credentials: "include",
    headers,
  };

  const url = `${API_BASE}${endpoint}`;

  let response = await fetch(url, config);

  // Handle 401 once (refresh) unless skipAuth
  if (response.status === 401 && !skipAuth) {
    const refreshed = await handleRefresh();
    if (refreshed) response = await fetch(url, config);
  }

  if (!response.ok) {
    const raw = await response.text().catch(() => "");
    let message = "Request failed";

    try {
      const data = raw ? (JSON.parse(raw) as unknown) : null;

      if (data && typeof data === "object") {
        const payload = data as ApiErrorPayload;

        if (typeof payload.message === "string") message = payload.message;
        else if (typeof payload.error === "string") message = payload.error;
        else if (raw) message = raw;
      } else if (raw) {
        message = raw;
      }
    } catch {
      if (raw) message = raw;
    }

    throw new Error(message);
  }

  const text = await response.text().catch(() => "");
  if (!text) return {} as T;

  try {
    return JSON.parse(text) as T;
  } catch {
    return text as unknown as T;
  }
}

// Convenience methods
export const api = {
  get: <T>(endpoint: string, options?: FetchOptions) =>
    apiClient<T>(endpoint, { ...options, method: "GET" }),

  post: <T>(endpoint: string, data?: unknown, options?: FetchOptions) =>
    apiClient<T>(endpoint, {
      ...options,
      method: "POST",
      body: data instanceof FormData ? data : JSON.stringify(data),
    }),

  put: <T>(endpoint: string, data?: unknown, options?: FetchOptions) =>
    apiClient<T>(endpoint, {
      ...options,
      method: "PUT",
      body: JSON.stringify(data),
    }),

  patch: <T>(endpoint: string, data?: unknown, options?: FetchOptions) =>
    apiClient<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: <T>(endpoint: string, options?: FetchOptions) =>
    apiClient<T>(endpoint, { ...options, method: "DELETE" }),

  upload: <T>(endpoint: string, formData: FormData, options?: FetchOptions) =>
    apiClient<T>(endpoint, {
      ...options,
      method: "POST",
      body: formData,
    }),
};
