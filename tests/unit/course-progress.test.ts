import { describe, expect, it } from "vitest";
import { getCourse } from "@/lib/course";
import { reduceEvents } from "@/lib/courseProgress";
import type { Course, ProgressEvent } from "@/types";

const course = getCourse();

// 체크인/체크아웃/자가진단 활동은 현재 course.json에서 빠졌지만
// 이벤트 스키마와 리듀서 능력은 유지된다 — fixture로 검증한다.
const fixtureCourse: Course = {
  cohort: "테스트",
  sessions: [
    {
      id: "s1",
      order: 1,
      title: "픽스처",
      goal: "",
      activities: [
        { type: "checkin", id: "fx-checkin" },
        {
          type: "survey",
          id: "fx-survey",
          items: [
            { id: "q1", label: "하나" },
            { id: "q2", label: "둘" },
          ],
        },
        { type: "checkout", id: "fx-checkout" },
      ],
    },
  ],
};

describe("reduceEvents — 실제 course.json", () => {
  it("starts every activity as not done", () => {
    const map = reduceEvents(course, []);
    expect(map["s1-lecture-opening"]).toEqual({ type: "lecture", done: false });
    expect(map["s1-l02"]).toEqual({ type: "lesson", done: false, stepsDone: [] });
    expect(map["s1-m01"]).toEqual({ type: "mission", done: false, steps: {} });
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

  it("silently ignores events that map to nothing — 과거 체크인/설문 로그 포함", () => {
    const events: ProgressEvent[] = [
      { kind: "checkin", sessionId: "s1", score: 5, reason: "질문지 삭제 전 로그", at: 1 },
      { kind: "checkout", sessionId: "s1", score: 9, reason: "", at: 2 },
      { kind: "survey", sessionId: "s1", answers: { "sv-basic": true }, at: 3 },
      { kind: "lecture-done", activityId: "ghost", at: 4 },
      { kind: "lesson-step", slug: "ghost", stepId: "x", at: 5 },
      { kind: "lesson-done", slug: "ghost", at: 6 },
      { kind: "mission-step", missionId: "ghost", stepId: "x", done: true, at: 7 },
    ];
    expect(reduceEvents(course, events)).toEqual(reduceEvents(course, []));
  });
});

describe("reduceEvents — checkin/checkout/survey (fixture)", () => {
  it("applies checkin with score and reason", () => {
    const map = reduceEvents(fixtureCourse, [{ kind: "checkin", sessionId: "s1", score: 8, reason: "좋아요", at: 1 }]);
    expect(map["fx-checkin"]).toEqual({ type: "checkin", done: true, score: 8, reason: "좋아요", at: 1 });
  });

  it("first checkin wins — 회차당 1회", () => {
    const map = reduceEvents(fixtureCourse, [
      { kind: "checkin", sessionId: "s1", score: 8, reason: "첫 번째", at: 1 },
      { kind: "checkin", sessionId: "s1", score: 2, reason: "두 번째", at: 2 },
    ]);
    expect(map["fx-checkin"]).toMatchObject({ score: 8, reason: "첫 번째" });
  });

  it("checkin and checkout for the same session are independent", () => {
    const map = reduceEvents(fixtureCourse, [{ kind: "checkout", sessionId: "s1", score: 9, reason: "뿌듯", at: 5 }]);
    expect(map["fx-checkin"].done).toBe(false);
    expect(map["fx-checkout"]).toMatchObject({ done: true, score: 9 });
  });

  it("applies survey answers once", () => {
    const answers = { q1: true, q2: false };
    const map = reduceEvents(fixtureCourse, [
      { kind: "survey", sessionId: "s1", answers, at: 1 },
      { kind: "survey", sessionId: "s1", answers: { q1: false }, at: 2 },
    ]);
    expect(map["fx-survey"]).toEqual({ type: "survey", done: true, answers, at: 1 });
  });
});
