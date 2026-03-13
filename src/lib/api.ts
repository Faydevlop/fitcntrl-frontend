import type { BusinessType } from "@/data/businessTypes";

export interface ApiFieldError {
  field: string;
  message: string;
}

interface ApiEnvelope<T> {
  meta?: {
    success?: boolean;
    message?: string;
  };
  data?: T;
  errors?: ApiFieldError[];
}

export class ApiError extends Error {
  status: number;
  errors: ApiFieldError[];

  constructor(message: string, status: number, errors: ApiFieldError[] = []) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

const ACCESS_TOKEN_KEY = "gymflow_access_token";
const REFRESH_TOKEN_KEY = "gymflow_refresh_token";
export const AUTH_USER_KEY = "gymflow_user";
const DEMO_DB_KEY = "gymflow_use_demo_db";

const fallbackBase = "http://localhost:4000/api";
const rawBase = (import.meta.env.VITE_API_BASE_URL as string | undefined) || fallbackBase;
export const API_BASE_URL = rawBase.replace(/\/+$/, "");

const rawDemoEnv = import.meta.env.VITE_USE_DEMO_DB as string | undefined;
const envDemoFlag = rawDemoEnv ? rawDemoEnv.toLowerCase() === "true" : false;

export const getAccessToken = (): string | null => localStorage.getItem(ACCESS_TOKEN_KEY);
export const getRefreshToken = (): string | null => localStorage.getItem(REFRESH_TOKEN_KEY);

export const setAuthTokens = (accessToken: string, refreshToken?: string | null) => {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
};

export const clearAuthTokens = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

export const getUseDemoDb = (): boolean => {
  const stored = localStorage.getItem(DEMO_DB_KEY);
  if (stored === "true") return true;
  if (stored === "false") return false;
  return envDemoFlag;
};

export const setUseDemoDb = (enabled: boolean) => {
  localStorage.setItem(DEMO_DB_KEY, enabled ? "true" : "false");
};

export type AppUser = {
  id: string;
  name: string;
  email: string;
  countryCode?: string;
  phone?: string;
  role: "admin" | "gym_owner";
  gymId?: string | null;
  currentPlanId?: string | null;
  onboardingComplete?: boolean;
  platformType?: BusinessType | null;
  businessType?: BusinessType;
  lastLoginAt?: string | null;
};

export const normalizeUser = (user: any): AppUser => {
  const platformType = (user?.platformType || null) as BusinessType | null;
  return {
    id: String(user?.id || ""),
    name: String(user?.name || ""),
    email: String(user?.email || ""),
    countryCode: user?.countryCode ? String(user.countryCode) : "91",
    phone: user?.phone ? String(user.phone) : "",
    role: user?.role === "admin" ? "admin" : "gym_owner",
    gymId: user?.gymId ? String(user.gymId) : null,
    currentPlanId: user?.currentPlanId ? String(user.currentPlanId) : null,
    onboardingComplete: Boolean(user?.onboardingComplete),
    platformType,
    businessType: platformType || "gym",
    lastLoginAt: user?.lastLoginAt ? String(user.lastLoginAt) : null,
  };
};

const toApiError = async (response: Response): Promise<ApiError> => {
  let payload: ApiEnvelope<unknown> | null = null;
  try {
    payload = (await response.json()) as ApiEnvelope<unknown>;
  } catch {
    payload = null;
  }

  const message =
    payload?.meta?.message ||
    (response.statusText ? response.statusText : "Request failed");
  return new ApiError(message, response.status, payload?.errors || []);
};

type ApiRequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  auth?: boolean;
  demoDb?: boolean;
  headers?: Record<string, string>;
};

export const apiRequest = async <T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> => {
  const {
    method = "GET",
    body,
    auth = false,
    demoDb = getUseDemoDb(),
    headers = {},
  } = options;

  const requestHeaders: Record<string, string> = {
    ...headers,
  };

  if (body !== undefined) {
    requestHeaders["Content-Type"] = "application/json";
  }
  requestHeaders["x-demodb"] = demoDb ? "true" : "false";

  if (auth) {
    const token = getAccessToken();
    if (token) {
      requestHeaders.Authorization = `Bearer ${token}`;
    }
  }

  const url = `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
  const response = await fetch(url, {
    method,
    headers: requestHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    throw await toApiError(response);
  }

  const payload = (await response.json()) as ApiEnvelope<T>;
  if (payload?.meta?.success === false) {
    throw new ApiError(payload.meta.message || "Request failed", response.status, payload.errors || []);
  }
  return (payload?.data as T) ?? (null as T);
};
