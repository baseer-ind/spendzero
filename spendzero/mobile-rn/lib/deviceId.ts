import { createMMKV, MMKV } from "react-native-mmkv";

let _storage: MMKV | null = null;
const DEVICE_ID_KEY = "project_future_device_id";

function getStorage(): MMKV {
  if (!_storage) _storage = createMMKV({ id: "spendzero-device" });
  return _storage;
}

/**
 * Stable per-install identity used for guest mode — no sign-in required.
 * Matches `guest_devices.device_id` on the backend and is sent as the
 * `X-Device-Id` header. Mirrors mobile/lib/core/network/device_id.dart.
 */
export function getOrCreateDeviceId(): string {
  const storage = getStorage();
  const existing = storage.getString(DEVICE_ID_KEY);
  if (existing) return existing;
  const generated = generateUuidV4();
  storage.set(DEVICE_ID_KEY, generated);
  return generated;
}

function generateUuidV4(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
