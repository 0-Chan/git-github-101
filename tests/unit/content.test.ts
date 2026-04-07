import { describe, expect, it } from "vitest";
import { getAllLessons, getLessonBySlug } from "@/lib/content";

describe("getAllLessons", () => {
  it("returns sorted lesson metadata", () => {
    const lessons = getAllLessons();
    expect(lessons.length).toBeGreaterThan(0);
    expect(lessons[0].slug).toBe("what-is-git");
    expect(lessons[0].order).toBe(1);
  });
});

describe("getLessonBySlug", () => {
  it("returns lesson content with parsed HTML", () => {
    const lesson = getLessonBySlug("what-is-git");
    expect(lesson).not.toBeNull();
    expect(lesson?.meta.title).toBe("Git이란?");
    expect(lesson?.meta.hasTerminal).toBe(false);
    expect(lesson?.html).toContain("버전 관리");
  });

  it("returns null for nonexistent slug", () => {
    expect(getLessonBySlug("nonexistent")).toBeNull();
  });
});
