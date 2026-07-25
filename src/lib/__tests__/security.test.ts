import { describe, it, expect } from "vitest";
import { escapeHtml, rateLimit, isBot } from "../security";

describe("escapeHtml", () => {
  it("escapes <, >, &, \" and ' into HTML entities", () => {
    expect(escapeHtml("<script>")).toBe("&lt;script&gt;");
    expect(escapeHtml("a & b")).toBe("a &amp; b");
    expect(escapeHtml('"quoted"')).toBe("&quot;quoted&quot;");
    expect(escapeHtml("it's")).toBe("it&#39;s");
  });

  it("escapes a combined XSS-ish payload", () => {
    expect(escapeHtml(`<a href="x" onclick='y'>&</a>`)).toBe(
      "&lt;a href=&quot;x&quot; onclick=&#39;y&#39;&gt;&amp;&lt;/a&gt;"
    );
  });
});

describe("rateLimit", () => {
  it("allows up to the limit then blocks", () => {
    const key = `test-key-${Date.now()}-${Math.random()}`;
    const limit = 3;
    expect(rateLimit(key, limit, 60_000)).toBe(true); // 1
    expect(rateLimit(key, limit, 60_000)).toBe(true); // 2
    expect(rateLimit(key, limit, 60_000)).toBe(true); // 3
    expect(rateLimit(key, limit, 60_000)).toBe(false); // 4 — blocked
    expect(rateLimit(key, limit, 60_000)).toBe(false); // still blocked
  });

  it("tracks separate keys independently", () => {
    const a = `key-a-${Date.now()}-${Math.random()}`;
    const b = `key-b-${Date.now()}-${Math.random()}`;
    expect(rateLimit(a, 1, 60_000)).toBe(true);
    expect(rateLimit(a, 1, 60_000)).toBe(false);
    // b has its own budget
    expect(rateLimit(b, 1, 60_000)).toBe(true);
  });
});

describe("isBot", () => {
  it("returns true for a non-empty honeypot value", () => {
    expect(isBot("i am a bot")).toBe(true);
  });

  it("returns false for empty, whitespace-only, or undefined values", () => {
    expect(isBot("")).toBe(false);
    expect(isBot("   ")).toBe(false);
    expect(isBot(undefined)).toBe(false);
    expect(isBot(null)).toBe(false);
  });
});
