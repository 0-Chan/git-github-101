import { describe, expect, it } from "vitest";
import { getCourse } from "@/lib/course";
import { buildLeaderboard, reduceEvents } from "@/lib/courseProgress";
import type { ProgressEvent } from "@/types";

const course = getCourse();

describe("reduceEvents", () => {
  it("starts every activity as not done", () => {
    const map = reduceEvents(course, []);
    expect(map["s1-checkin"]).toEqual({ type: "checkin", done: false });
    expect(map["s1-l02"]).toEqual({ type: "lesson", done: false, stepsDone: [] });
    expect(map["s1-m01"]).toEqual({ type: "mission", done: false, steps: {} });
  });

  it("applies checkin with score and reason", () => {
    const map = reduceEvents(course, [{ kind: "checkin", sessionId: "s1", score: 8, reason: "좋아요", at: 1 }]);
    expect(map["s1-checkin"]).toEqual({ type: "checkin", done: true, score: 8, reason: "좋아요", at: 1 });
  });

  it("first checkin wins — 회차당 1회", () => {
    const map = reduceEvents(course, [
      { kind: "checkin", sessionId: "s1", score: 8, reason: "첫 번째", at: 1 },
      { kind: "checkin", sessionId: "s1", score: 2, reason: "두 번째", at: 2 },
    ]);
    expect(map["s1-checkin"]).toMatchObject({ score: 8, reason: "첫 번째" });
  });

  it("checkin and checkout for the same session are independent", () => {
    const map = reduceEvents(course, [{ kind: "checkout", sessionId: "s1", score: 9, reason: "뿌듯", at: 5 }]);
    expect(map["s1-checkin"].done).toBe(false);
    expect(map["s1-checkout"]).toMatchObject({ done: true, score: 9 });
  });

  it("applies survey answers once", () => {
    const answers = { "sv-basic": true, "sv-areas": false, "sv-branch": false, "sv-collab": false };
    const map = reduceEvents(course, [
      { kind: "survey", sessionId: "s1", answers, at: 1 },
      { kind: "survey", sessionId: "s1", answers: { "sv-basic": false }, at: 2 },
    ]);
    expect(map["s1-survey"]).toEqual({ type: "survey", done: true, answers, at: 1 });
  });

  it("applies lecture-done by activityId", () => {
    const map = reduceEvents(course, [{ kind: "lecture-done", activityId: "s1-lecture-opening", at: 3 }]);
    expect(map["s1-lecture-opening"]).toEqual({ type: "lecture", done: true, at: 3 });
  });

  it("accumulates lesson steps by slug and completes on lesson-done", () => {
    const events: ProgressEvent[] = [
      { kind: "lesson-step", slug: "first-repo", stepId: "step-1", at: 1 },
      { kind: "lesson-step", slug: "first-repo", stepId: "step-2", at: 2 },
      { kind: "lesson-step", slug: "first-repo", stepId: "step-1", at: 3 },
      { kind: "lesson-done", slug: "first-repo", at: 4 },
    ];
    const map = reduceEvents(course, events);
    expect(map["s1-l02"]).toEqual({ type: "lesson", done: true, stepsDone: ["step-1", "step-2"], at: 4 });
  });

  it("mission-step toggles with last-write-wins; done when all steps true", () => {
    const step = (stepId: string, done: boolean, at: number): ProgressEvent => ({
      kind: "mission-step",
      missionId: "s1-m01",
      stepId,
      done,
      at,
    });
    const partial = reduceEvents(course, [step("gh-account", true, 1), step("gh-account", false, 2)]);
    expect(partial["s1-m01"]).toMatchObject({ done: false, steps: { "gh-account": false } });

    const all = reduceEvents(course, [
      step("gh-account", true, 1),
      step("gh-profile", true, 2),
      step("gh-star", true, 3),
    ]);
    expect(all["s1-m01"].done).toBe(true);
  });

  it("silently ignores events that map to nothing in the curriculum", () => {
    const events: ProgressEvent[] = [
      { kind: "checkin", sessionId: "s99", score: 5, reason: "?", at: 1 },
      { kind: "survey", sessionId: "s2", answers: {}, at: 2 },
      { kind: "lecture-done", activityId: "ghost", at: 3 },
      { kind: "lesson-step", slug: "ghost", stepId: "x", at: 4 },
      { kind: "lesson-done", slug: "ghost", at: 5 },
      { kind: "mission-step", missionId: "ghost", stepId: "x", done: true, at: 6 },
    ];
    expect(reduceEvents(course, events)).toEqual(reduceEvents(course, []));
  });
});

describe("buildLeaderboard", () => {
  const me = { id: "uuid-me", name: "나" };
  const peer = { id: "uuid-peer", name: "동료" };

  it("returns no rows for no peers", () => {
    expect(buildLeaderboard(course, [])).toEqual([]);
  });

  it("builds one row for Phase 1 (local single participant)", () => {
    const rows = buildLeaderboard(course, [
      { participant: me, events: [{ kind: "checkin", sessionId: "s1", score: 7, reason: "ㅎ", at: 42 }] },
    ]);
    expect(rows).toHaveLength(1);
    expect(rows[0].participant).toBe(me);
    expect(rows[0].statuses["s1-checkin"].done).toBe(true);
    expect(rows[0].lastActivityAt).toBe(42);
  });

  it("reduces each peer's events independently (Phase 2 seam)", () => {
    const rows = buildLeaderboard(course, [
      { participant: me, events: [{ kind: "lesson-done", slug: "first-repo", at: 10 }] },
      { participant: peer, events: [] },
    ]);
    expect(rows[0].statuses["s1-l02"].done).toBe(true);
    expect(rows[1].statuses["s1-l02"].done).toBe(false);
    expect(rows[1].lastActivityAt).toBeNull();
  });
});
