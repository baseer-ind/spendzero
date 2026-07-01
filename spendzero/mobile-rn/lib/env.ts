import { Platform } from "react-native";

/**
 * Centralized environment config. Nothing in this app should hardcode a
 * base URL outside this file.
 *
 * Resolution order for the API base URL:
 *   1. `EXPO_PUBLIC_API_BASE_URL` env var (set via `.env` or shell before
 *      `expo start`/`eas build`) — e.g. a physical device's LAN address.
 *   2. A sane per-platform fallback so the app "just works" on an
 *      emulator/simulator with zero config: 10.0.2.2 for the Android
 *      emulator (its alias for the host loopback interface), localhost
 *      everywhere else (iOS simulator shares the host network).
 *
 * Physical devices are the one case nothing here can infer automatically
 * — there is no way for the device to know the dev machine's LAN IP — so
 * set EXPO_PUBLIC_API_BASE_URL explicitly when testing on a physical phone.
 *
 * This mirrors mobile/lib/core/config/env.dart's resolution order exactly.
 */
function resolveApiBaseUrl(): string {
  const explicit = process.env.EXPO_PUBLIC_API_BASE_URL;
  if (explicit) return explicit;
  if (Platform.OS === "android") return "http://10.0.2.2:8000/api/v1";
  return "http://localhost:8000/api/v1";
}

export const Env = {
  apiBaseUrl: resolveApiBaseUrl(),
} as const;
