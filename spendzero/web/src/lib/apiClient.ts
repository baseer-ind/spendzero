import { Env } from "./env";
import { getOrCreateDeviceId } from "./deviceId";

export class ApiException extends Error {
  constructor(public statusCode: number, message: string) {
    super(`ApiException(${statusCode}): ${message}`);
  }
}

/**
 * Thin REST client mirroring mobile-rn/lib/apiClient.ts (in turn mirroring
 * mobile/lib/core/network/api_client.dart). Attaches the guest device id
 * to every request so the backend can resolve/create the user without
 * requiring sign-in — same contract as the native apps, same backend.
 */
async function request(method: "GET" | "POST" | "PUT", path: string, body?: unknown) {
  const deviceId = getOrCreateDeviceId();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch(`${Env.apiBaseUrl}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        "X-Device-Id": deviceId,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
    const text = await response.text();
    if (response.status >= 200 && response.status < 300) {
      return text.length ? JSON.parse(text) : null;
    }
    throw new ApiException(response.status, text);
  } finally {
    clearTimeout(timeout);
  }
}

export const apiClient = {
  get: (path: string) => request("GET", path),
  post: (path: string, body?: unknown) => request("POST", path, body),
  put: (path: string, body?: unknown) => request("PUT", path, body),
};
