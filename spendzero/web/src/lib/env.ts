/**
 * Centralized environment config for the web app. Mirrors
 * mobile-rn/lib/env.ts's resolution order (in turn mirroring
 * mobile/lib/core/config/env.dart): an explicit override env var first,
 * then a sane zero-config default — here, same-origin `/api/v1` so the
 * web app "just works" when served behind the same reverse proxy as the
 * backend, with `VITE_API_BASE_URL` for local dev against a different host.
 */
function resolveApiBaseUrl(): string {
  const explicit = import.meta.env.VITE_API_BASE_URL as string | undefined;
  if (explicit) return explicit;
  return "http://localhost:8000/api/v1";
}

export const Env = {
  apiBaseUrl: resolveApiBaseUrl(),
} as const;
