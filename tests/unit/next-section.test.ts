import { describe, expect, it } from "vitest";
import { nextSection } from "@/lib/nextSection";
import type { Section } from "@/types";
import sectionsData from "../../content/sections.json";

const sections = sectionsData.sections as Section[];

describe("nextSection", () => {
  it("returns the following lesson", () => {
    expect(nextSection(sections, "first-commit")?.slug).toBe("commit-history");
  });

  it("returns null for the last lesson", () => {
    const last = sections[sections.length - 1];
    expect(nextSection(sections, last.slug)).toBeNull();
  });

  it("returns null for an unknown slug", () => {
    expect(nextSection(sections, "nope")).toBeNull();
  });
});
