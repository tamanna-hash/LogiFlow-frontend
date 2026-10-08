import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";
import { API_URL, ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from "@/config";
import type { ApiSuccessResponse, ApiErrorResponse, TokenPair } from "@/types";

// ── Error class ───────────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly errors: { field?: string; message: string }[] = [],
    public readonly code?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// ── Token storage (browser only) ──────────────────────────────────────────────

function getTokens(): { accessToken: string | null; refreshToken: string | null } {
  if (typeof window === "undefined") {
    return { accessToken: null, refreshToken: null };
  }
  return {
    accessToken: localStorage.getItem(ACCESS_TOKEN_KEY),
    refreshToken: localStorage.getItem(REFRESH_TOKEN_KEY),
  };
}

function setTokens(tokens: TokenPair): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
}

function clearTokens(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export { getTokens, setTokens, clearTokens };

// ── Axios instance ────────────────────────────────────────────────────────────

const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30_000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor — attach access token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const { accessToken } = getTokens();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Track whether we're currently refreshing to avoid infinite loops
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

function onRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

// Response interceptor — handle 401 and refresh tokens
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // Normalize error
    if (!error.response) {
      throw new ApiError(0, "Network error — please check your connection", []);
    }

    const { status, data } = error.response as {
      status: number;
      data: ApiErrorResponse;
    };

    // 401 + not already retried → attempt refresh
    if (status === 401 && !originalRequest._retry) {
      const { refreshToken } = getTokens();
      if (!refreshToken) {
        clearTokens();
        // Dispatch a custom event so the auth store can react
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("logiflow:session-expired"));
        }
        throw new ApiError(401, "Session expired. Please log in again.", []);
      }

      if (isRefreshing) {
        // Wait for the current refresh to complete
        return new Promise((resolve, _reject) => {
          subscribeTokenRefresh((newToken: string) => {
            if (originalRequest.headers) {
              (originalRequest.headers as Record<string, string>)["Authorization"] = `Bearer ${newToken}`;
            }
            resolve(apiClient(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshResp = await axios.post<ApiSuccessResponse<TokenPair>>(
          `${API_URL}/auth/refresh`,
          { refreshToken },
          { timeout: 10_000 },
        );
        const newTokens = refreshResp.data.data;
        setTokens(newTokens);
        onRefreshed(newTokens.accessToken);
        isRefreshing = false;

        if (originalRequest.headers) {
          (originalRequest.headers as Record<string, string>)["Authorization"] = `Bearer ${newTokens.accessToken}`;
        }
        return apiClient(originalRequest);
      } catch {
        isRefreshing = false;
        clearTokens();
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("logiflow:session-expired"));
        }
        throw new ApiError(401, "Session expired. Please log in again.", []);
      }
    }

    // Parse server error envelope
    const message: string =
      (data as ApiErrorResponse)?.message ?? "An error occurred";
    const errors = (data as ApiErrorResponse)?.errors ?? [];

    throw new ApiError(status, message, errors);
  },
);

export default apiClient;

// ── Typed request helpers ─────────────────────────────────────────────────────

export async function apiGet<T>(
  url: string,
  params?: Record<string, unknown>,
): Promise<ApiSuccessResponse<T>> {
  const resp = await apiClient.get<ApiSuccessResponse<T>>(url, { params });
  return resp.data;
}

export async function apiPost<T>(
  url: string,
  data?: unknown,
): Promise<ApiSuccessResponse<T>> {
  const resp = await apiClient.post<ApiSuccessResponse<T>>(url, data);
  return resp.data;
}

export async function apiPatch<T>(
  url: string,
  data?: unknown,
): Promise<ApiSuccessResponse<T>> {
  const resp = await apiClient.patch<ApiSuccessResponse<T>>(url, data);
  return resp.data;
}

export async function apiDelete<T>(url: string): Promise<ApiSuccessResponse<T>> {
  const resp = await apiClient.delete<ApiSuccessResponse<T>>(url);
  return resp.data;
}

export async function apiPostFormData<T>(
  url: string,
  formData: FormData,
): Promise<ApiSuccessResponse<T>> {
  const resp = await apiClient.patch<ApiSuccessResponse<T>>(url, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return resp.data;
}
