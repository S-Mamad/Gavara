const ADMIN_COOKIE_NAME = "raxin_admin_session";
export const ADMIN_COOKIE = ADMIN_COOKIE_NAME;
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;

const WEAK_PASSWORDS = new Set([
  "admin123",
  "password",
  "123456",
  "12345678",
  "qwerty",
  "changeme",
]);

const WEAK_SECRETS = new Set([
  "dev-secret-change-me",
  "change-this-to-a-long-random-string-at-least-24",
]);

export type AdminEnvCheck =
  | { ok: true }
  | { ok: false; message: string; code: string };

export function assertAdminEnvConfigured(): AdminEnvCheck {
  if (process.env.NODE_ENV !== "production") return { ok: true };

  const pass = process.env.ADMIN_PASSWORD?.trim() || "";
  const secret = process.env.ADMIN_SESSION_SECRET?.trim() || "";

  if (!pass || pass.length < 12 || WEAK_PASSWORDS.has(pass.toLowerCase())) {
    return {
      ok: false,
      code: "weak_admin_password",
      message:
        "در پروداکشن باید ADMIN_PASSWORD قوی (حداقل ۱۲ کاراکتر) تنظیم شود.",
    };
  }
  if (
    !secret ||
    secret.length < 24 ||
    WEAK_SECRETS.has(secret) ||
    secret === pass
  ) {
    return {
      ok: false,
      code: "weak_admin_secret",
      message:
        "در پروداکشن باید ADMIN_SESSION_SECRET جدا و حداقل ۲۴ کاراکتر تنظیم شود.",
    };
  }
  return { ok: true };
}

function secret() {
  const envCheck = assertAdminEnvConfigured();
  if (!envCheck.ok) {
    throw new Error(envCheck.message);
  }
  return (
    process.env.ADMIN_SESSION_SECRET ||
    process.env.ADMIN_PASSWORD ||
    "dev-secret-change-me"
  );
}

function adminPassword() {
  if (process.env.NODE_ENV === "production") {
    const check = assertAdminEnvConfigured();
    if (!check.ok) throw new Error(check.message);
  }
  return process.env.ADMIN_PASSWORD || "admin123";
}

function toBase64Url(bytes: ArrayBuffer | Uint8Array): string {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let str = "";
  for (let i = 0; i < arr.length; i += 1) str += String.fromCharCode(arr[i]!);
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(value: string): Uint8Array {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const pad = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
  const bin = atob(padded + pad);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i += 1) out[i] = bin.charCodeAt(i);
  return out;
}

async function sign(payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payload),
  );
  return toBase64Url(sig);
}

export function verifyPassword(input: string): boolean {
  const expected = adminPassword();
  const max = Math.max(input.length, expected.length);
  let ok = input.length === expected.length ? 0 : 1;
  for (let i = 0; i < max; i += 1) {
    const a = input.charCodeAt(i) || 0;
    const b = expected.charCodeAt(i) || 0;
    ok |= a ^ b;
  }
  return ok === 0;
}

export async function createSessionToken(): Promise<string> {
  const exp = Date.now() + SESSION_TTL_MS;
  const payload = toBase64Url(new TextEncoder().encode(JSON.stringify({ exp })));
  const sig = await sign(payload);
  return `${payload}.${sig}`;
}

export async function verifySessionToken(
  token: string | undefined | null,
): Promise<boolean> {
  if (!token) return false;
  try {
    const [payload, sig] = token.split(".");
    if (!payload || !sig) return false;
    const expected = await sign(payload);
    if (expected.length !== sig.length) return false;
    let ok = 0;
    for (let i = 0; i < expected.length; i += 1) {
      ok |= expected.charCodeAt(i) ^ sig.charCodeAt(i);
    }
    if (ok !== 0) return false;
    const json = new TextDecoder().decode(fromBase64Url(payload));
    const data = JSON.parse(json) as { exp?: number };
    return typeof data.exp === "number" && data.exp > Date.now();
  } catch {
    return false;
  }
}

const loginAttempts = new Map<string, { count: number; resetAt: number }>();

export function checkLoginRateLimit(ip: string): boolean {
  const now = Date.now();
  const row = loginAttempts.get(ip);
  if (!row || row.resetAt < now) {
    loginAttempts.set(ip, { count: 1, resetAt: now + 15 * 60 * 1000 });
    return true;
  }
  if (row.count >= 12) return false;
  row.count += 1;
  return true;
}

/** Shared IP rate limiter for public endpoints (e.g. lead form). */
const ipBuckets = new Map<string, { count: number; resetAt: number }>();

function looksLikeIp(value: string): boolean {
  if (!value || value.length > 64) return false;
  if (/^(?:\d{1,3}\.){3}\d{1,3}$/.test(value)) {
    return value.split(".").every((part) => Number(part) <= 255);
  }
  return value.includes(":") && /^[0-9a-fA-F:]+$/.test(value);
}

/**
 * Prefer proxy-set addresses. The leftmost X-Forwarded-For hop is
 * client-controlled, so it is not used.
 */
export function clientIp(request: Request): string {
  const real = request.headers.get("x-real-ip")?.trim() ?? "";
  if (looksLikeIp(real)) return real;
  const cf = request.headers.get("cf-connecting-ip")?.trim() ?? "";
  if (looksLikeIp(cf)) return cf;
  const hops = (request.headers.get("x-forwarded-for") ?? "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  const nearest = hops.at(-1) ?? "";
  if (looksLikeIp(nearest)) return nearest;
  return "unknown";
}

export function checkIpRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): boolean {
  const now = Date.now();
  const row = ipBuckets.get(key);
  if (!row || row.resetAt < now) {
    ipBuckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (row.count >= limit) return false;
  row.count += 1;
  return true;
}
