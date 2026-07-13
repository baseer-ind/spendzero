const DEVICE_ID_KEY = "project_future_device_id";

/**
 * Stable per-install identity used for guest mode — no sign-in required.
 * Matches `guest_devices.device_id` on the backend and is sent as the
 * `X-Device-Id` header. Mirrors mobile-rn/lib/deviceId.ts (MMKV there,
 * localStorage here — same contract, same backend, same guest identity
 * model — just per-browser instead of per-install).
 */
export function getOrCreateDeviceId(): string {
  const existing = localStorage.getItem(DEVICE_ID_KEY);
  if (existing) return existing;
  const generated = crypto.randomUUID();
  localStorage.setItem(DEVICE_ID_KEY, generated);
  return generated;
}
