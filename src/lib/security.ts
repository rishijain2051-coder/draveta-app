// Shared helpers for hardening public form endpoints.

/**
 * Best-effort in-memory rate limiter (sliding window).
 * Returns true if the request is ALLOWED, false if it should be blocked.
 *
 * Note: on serverless this is per-instance and resets on cold starts, so it's a
 * speed bump against casual abuse — not a guarantee. For production-grade limits
 * use a shared store (e.g. Upstash Redis / @vercel/kv).
 */
const hits = new Map<string, number[]>();

export function rateLimit(key: string, limit = 5, windowMs = 60_000): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= limit) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);
  return true;
}

/** Extract the client IP from proxy headers (Vercel sets x-forwarded-for). */
export function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  return (
    xff?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

const HTML_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

/** Escape a value for safe interpolation into HTML (e.g. outbound emails). */
export function escapeHtml(input: unknown): string {
  return String(input ?? "").replace(/[&<>"']/g, (c) => HTML_ESCAPES[c]);
}

/**
 * Honeypot check. Public forms include a hidden field that real users never
 * see; bots that auto-fill every input will populate it. If it's non-empty,
 * treat the submission as spam.
 */
export function isBot(honeypotValue: unknown): boolean {
  return typeof honeypotValue === "string" && honeypotValue.trim().length > 0;
}
