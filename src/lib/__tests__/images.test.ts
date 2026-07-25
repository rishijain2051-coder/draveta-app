import { describe, it, expect } from "vitest";
import { toDirectImageUrl } from "../images";

describe("toDirectImageUrl", () => {
  it("converts a Drive /file/d/<id>/view share link to the thumbnail endpoint", () => {
    const id = "1A2b3C4d5E6f7G8h9I0j";
    const input = `https://drive.google.com/file/d/${id}/view?usp=sharing`;
    expect(toDirectImageUrl(input)).toBe(
      `https://drive.google.com/thumbnail?id=${id}&sz=w2000`
    );
  });

  it("converts /open?id=<id> and ?id=<id> Drive links likewise", () => {
    const id = "abc_DEF-123";
    expect(toDirectImageUrl(`https://drive.google.com/open?id=${id}`)).toBe(
      `https://drive.google.com/thumbnail?id=${id}&sz=w2000`
    );
    expect(
      toDirectImageUrl(`https://drive.google.com/uc?export=view&id=${id}`)
    ).toBe(`https://drive.google.com/thumbnail?id=${id}&sz=w2000`);
  });

  it("returns a non-Drive URL unchanged", () => {
    const url =
      "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=1200&q=80";
    expect(toDirectImageUrl(url)).toBe(url);
  });

  it("returns an empty string for empty string, null, or undefined", () => {
    expect(toDirectImageUrl("")).toBe("");
    expect(toDirectImageUrl(null)).toBe("");
    expect(toDirectImageUrl(undefined)).toBe("");
  });

  it("keeps an already-converted thumbnail URL valid (idempotent-ish)", () => {
    const id = "zzzTOP999";
    const already = `https://drive.google.com/thumbnail?id=${id}&sz=w2000`;
    // The id is re-extracted from ?id=, so the result is still the same
    // canonical thumbnail URL for that id.
    expect(toDirectImageUrl(already)).toBe(
      `https://drive.google.com/thumbnail?id=${id}&sz=w2000`
    );
  });
});
