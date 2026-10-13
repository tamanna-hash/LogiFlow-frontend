export const API_URL =
  process.env.NODE_ENV === "development"
    ? process.env.NEXT_PUBLIC_LOCAL_API_URL ?? "http://localhost:5000/api/v1"
    : process.env.NEXT_PUBLIC_API_URL ?? "https://logiflow-backend-ai0r.onrender.com/api/v1";

export const APP_URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : process.env.NEXT_PUBLIC_APP_URL ?? "https://logiflow-hash.vercel.app";

export const APP_NAME = "LogiFlow";
export const APP_DESCRIPTION =
  "Bangladesh's trusted courier and logistics management platform — fast, trackable, reliable.";

/** Access token key in localStorage (short-lived JWT) */
export const ACCESS_TOKEN_KEY = "logiflow_access_token";
/** Refresh token key in localStorage */
export const REFRESH_TOKEN_KEY = "logiflow_refresh_token";

/** Default pagination */
export const DEFAULT_PAGE_SIZE = 10;

/** bKash payment polling */
export const PAYMENT_POLL_INTERVAL_MS = 3_000;
export const PAYMENT_POLL_MAX_ATTEMPTS = 10;
