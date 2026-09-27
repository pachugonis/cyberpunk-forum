/**
 * Simple in-memory fixed-window rate limiter.
 *
 * State lives in the server process, so limits are per instance and reset on
 * restart. That is enough for a single-instance deployment (VPS / one Railway
 * replica); use a shared store (Redis etc.) when running several instances.
 */

type Window = { count: number; resetAt: number };

const globalForRateLimit = globalThis as unknown as {
  rateLimitStore: Map<string, Window> | undefined;
};

const store = globalForRateLimit.rateLimitStore ?? new Map<string, Window>();
globalForRateLimit.rateLimitStore = store;

let lastSweep = 0;

function sweep(now: number) {
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [key, window] of store) {
    if (window.resetAt <= now) store.delete(key);
  }
}

/**
 * Count one attempt for `key`. Returns false once more than `limit`
 * attempts were made within `windowMs`.
 */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  sweep(now);

  const window = store.get(key);
  if (!window || window.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  window.count++;
  return window.count <= limit;
}

/**
 * Best-effort client IP. Relies on the reverse proxy (nginx / Railway)
 * setting X-Forwarded-For or X-Real-IP.
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

const FIFTEEN_MINUTES = 15 * 60 * 1000;

/**
 * Limits for endpoints that check a secret (password, TOTP, recovery code):
 * per IP against spraying and per account against distributed brute force.
 */
export function allowAuthAttempt(request: Request, scope: string, account?: string): boolean {
  const ipAllowed = rateLimit(`${scope}:ip:${getClientIp(request)}`, 30, FIFTEEN_MINUTES);
  const accountAllowed = account
    ? rateLimit(`${scope}:account:${account.toLowerCase()}`, 10, FIFTEEN_MINUTES)
    : true;
  return ipAllowed && accountAllowed;
}

export const TOO_MANY_ATTEMPTS = "Too many attempts. Please try again later.";
