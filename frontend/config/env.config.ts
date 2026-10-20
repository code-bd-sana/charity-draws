/**
 * Centralized environment configuration module.
 * Provides typed access to environment variables used across the application.
 * Prevents hardcoding `process.env.NEXT_PUBLIC_*` throughout the codebase.
 */

interface EnvConfig {
  apiUrl: string;
  appUrl: string;
}

const getDefaultApiUrl = (): string => {
  if (process.env.NEXT_PUBLIC_API_URL?.trim()) {
    return process.env.NEXT_PUBLIC_API_URL.trim();
  }
  if (typeof window !== "undefined") {
    const isLocalhost =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";
    if (isLocalhost) {
      return "http://localhost:5000/api/v1";
    }
    return "https://api.charitydraws.co.uk/api/v1";
  }
  return process.env.NODE_ENV === "production"
    ? "https://api.charitydraws.co.uk/api/v1"
    : "http://localhost:5000/api/v1";
};

const getDefaultAppUrl = (): string => {
  if (process.env.NEXT_PUBLIC_APP_URL?.trim()) {
    return process.env.NEXT_PUBLIC_APP_URL.trim();
  }
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return process.env.NODE_ENV === "production"
    ? "https://charitydraws.co.uk"
    : "http://localhost:3000";
};

export const envConfig: EnvConfig = {
  apiUrl: getDefaultApiUrl(),
  appUrl: getDefaultAppUrl(),
};
