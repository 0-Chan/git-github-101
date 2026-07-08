import { describe, expect, it } from "vitest";
import { getReferences } from "@/lib/references";

describe("references", () => {
  const { categories } = getReferences();
  const items = categories.flatMap((c) => c.items);

  it("has at least one category with items", () => {
    expect(categories.length).toBeGreaterThan(0);
    expect(items.length).toBeGreaterThan(0);
  });

  it("every item has a title, https url, and description", () => {
    for (const item of items) {
      expect(item.title.trim().length).toBeGreaterThan(0);
      expect(item.url).toMatch(/^https:\/\//);
      expect(item.description.trim().length).toBeGreaterThan(0);
    }
  });

  it("urls are unique", () => {
    const urls = items.map((i) => i.url);
    expect(new Set(urls).size).toBe(urls.length);
  });

  it("uses no em dash (content principle)", () => {
    for (const item of items) {
      expect(`${item.title} ${item.description}`).not.toContain("—");
    }
  });
});
