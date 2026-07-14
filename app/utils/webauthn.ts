/** Base64URL helpers and WebAuthn ceremony utilities for Padlock passkeys. */

export function base64UrlToBase64(str: string): string {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) base64 += "=";
  return base64;
}

export function base64ToBase64Url(str: string): string {
  return str.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function arrayBufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunkSize = 8192;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...chunk);
  }
  return base64ToBase64Url(btoa(binary));
}

export function base64UrlToArrayBuffer(str: string): ArrayBuffer {
  const base64 = base64UrlToBase64(str);
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/** Encode a string as a WebAuthn user.id / challenge buffer (UTF-8). */
export function stringToArrayBuffer(str: string): ArrayBuffer {
  return new TextEncoder().encode(str).buffer as ArrayBuffer;
}

export function isWebAuthnAvailable(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.PublicKeyCredential !== "undefined" &&
    typeof navigator.credentials?.create === "function" &&
    typeof navigator.credentials?.get === "function"
  );
}

/**
 * Relying party ID for registration.
 * `solian.app` is a valid parent domain for both the public app and API hosts.
 * Other deployments use their page host so WebAuthn accepts the origin.
 */
export function getPasskeyRpId(): string {
  if (typeof window === "undefined") return "localhost";
  const host = window.location.hostname;
  if (host === "localhost" || host === "127.0.0.1") {
    return host;
  }
  return host === "solian.app" || host.endsWith(".solian.app")
    ? "solian.app"
    : host;
}

export function getPasskeyDeviceName(): string {
  if (typeof navigator === "undefined") return "Web Browser";
  const ua = navigator.userAgent;
  if (ua.includes("Chrome") && !ua.includes("Edg")) return "Chrome Browser";
  if (ua.includes("Edg")) return "Edge Browser";
  if (ua.includes("Firefox")) return "Firefox Browser";
  if (ua.includes("Safari") && !ua.includes("Chrome")) return "Safari Browser";
  return "Web Browser";
}
