import { describe, expect, it } from "vitest";
import sectionsData from "../../content/sections.json";
import { findLessonActivity, findMissionActivity, getCourse, getSession } from "@/lib/course";

describe("course.json shape", () => {
  const course = getCourse();

  it("has cohort 1기 and 4 sessions in order", () => {
    expect(course.cohort).toBe("1기");
    expect(course.sessions).toHaveLength(4);
    expect(course.sessions.map((s) => s.order)).toEqual([1, 2, 3, 4]);
  });

  it("every session has 6 periods of 45 minutes", () => {
    for (const session of course.sessions) {
      expect(session.periods).toHaveLength(6);
      for (const period of session.periods) {
        expect(period.durationMin).toBe(45);
      }
    }
  });

  it("activity ids are unique across the whole course", () => {
    const ids = course.sessions.flatMap((s) => s.activities.map((a) => a.id));
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every lesson activity slug exists in sections.json", () => {
    const knownSlugs = new Set(sectionsData.sections.map((s) => s.slug));
    for (const session of course.sessions) {
      for (const activity of session.activities) {
        if (activity.type === "lesson") {
          expect(knownSlugs.has(activity.slug), `unknown slug: ${activity.slug}`).toBe(true);
        }
      }
    }
  });

  it("all 11 lessons are covered by lesson activities", () => {
    const lessonSlugs = course.sessions.flatMap((s) =>
      s.activities.filter((a) => a.type === "lesson").map((a) => a.slug),
    );
    expect(new Set(lessonSlugs).size).toBe(sectionsData.sections.length);
  });

  it("survey exists only in s1 (OT에서 1회)", () => {
    for (const session of course.sessions) {
      const surveys = session.activities.filter((a) => a.type === "survey");
      expect(surveys.length).toBe(session.id === "s1" ? 1 : 0);
    }
  });

  it("every session has exactly one checkin and one checkout", () => {
    for (const session of course.sessions) {
      expect(session.activities.filter((a) => a.type === "checkin")).toHaveLength(1);
      expect(session.activities.filter((a) => a.type === "checkout")).toHaveLength(1);
    }
  });
});

describe("course lookups", () => {
  const course = getCourse();

  it("getSession finds by id and returns null for unknown", () => {
    expect(getSession("s1")?.order).toBe(1);
    expect(getSession("nope")).toBeNull();
  });

  it("findLessonActivity maps slug to its session", () => {
    const found = findLessonActivity(course, "first-commit");
    expect(found?.sessionId).toBe("s1");
    expect(found?.activity.slug).toBe("first-commit");
    expect(findLessonActivity(course, "nope")).toBeNull();
  });

  it("findMissionActivity maps missionId to its session", () => {
    const found = findMissionActivity(course, "s1-m01");
    expect(found?.sessionId).toBe("s1");
    expect(found?.activity.steps.length).toBeGreaterThan(0);
    expect(findMissionActivity(course, "nope")).toBeNull();
  });
});
