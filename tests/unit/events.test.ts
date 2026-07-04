import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  appendEvent,
  clearEvents,
  emitLessonDone,
  emitLessonStep,
  getEvents,
  setSyncAdapter,
  subscribeEvents,
} from "@/lib/events";
import { clearParticipant, createParticipant, getParticipant } from "@/lib/participant";
import type { ProgressEvent } from "@/types";

const checkin: ProgressEvent = { kind: "checkin", sessionId: "s1", score: 7, reason: "기대돼요", at: 1000 };

beforeEach(() => {
  localStorage.clear();
  clearEvents();
  clearParticipant();
  setSyncAdapter(null);
});

describe("event log", () => {
  it("round-trips appended events through localStorage", () => {
    appendEvent(checkin);
    expect(getEvents()).toEqual([checkin]);
    expect(JSON.parse(localStorage.getItem("git101-events") ?? "[]")).toEqual([checkin]);
  });

  it("is append-only and preserves order", () => {
    const done: ProgressEvent = { kind: "lesson-done", slug: "first-repo", at: 2000 };
    appendEvent(checkin);
    appendEvent(done);
    expect(getEvents()).toEqual([checkin, done]);
  });

  it("returns a stable reference between changes (useSyncExternalStore contract)", () => {
    appendEvent(checkin);
    expect(getEvents()).toBe(getEvents());
  });

  it("returns [] for corrupt JSON", () => {
    clearEvents();
    localStorage.setItem("git101-events", "{not json");
    expect(getEvents()).toEqual([]);
  });

  it("returns [] for non-array JSON", () => {
    clearEvents();
    localStorage.setItem("git101-events", '{"kind":"checkin"}');
    expect(getEvents()).toEqual([]);
  });

  it("keeps the in-memory log when localStorage.setItem throws (quota)", () => {
    const spy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceededError");
    });
    appendEvent(checkin);
    expect(getEvents()).toEqual([checkin]);
    spy.mockRestore();
  });

  it("notifies subscribers on append and stops after unsubscribe", () => {
    const cb = vi.fn();
    const unsubscribe = subscribeEvents(cb);
    appendEvent(checkin);
    expect(cb).toHaveBeenCalledTimes(1);
    unsubscribe();
    appendEvent({ ...checkin, sessionId: "s2" });
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it("invalidates the cache on cross-tab storage events", () => {
    appendEvent(checkin);
    const cb = vi.fn();
    const unsubscribe = subscribeEvents(cb);
    const external: ProgressEvent[] = [checkin, { kind: "lesson-done", slug: "merge", at: 3000 }];
    localStorage.setItem("git101-events", JSON.stringify(external));
    window.dispatchEvent(new StorageEvent("storage", { key: "git101-events" }));
    expect(cb).toHaveBeenCalledTimes(1);
    expect(getEvents()).toEqual(external);
    unsubscribe();
  });
});

describe("idempotent emitters", () => {
  it("emitLessonStep deduplicates by (slug, stepId)", () => {
    emitLessonStep("first-repo", "step-1");
    emitLessonStep("first-repo", "step-1");
    emitLessonStep("first-repo", "step-2");
    emitLessonStep("merge", "step-1");
    expect(getEvents().filter((e) => e.kind === "lesson-step")).toHaveLength(3);
  });

  it("emitLessonDone deduplicates by slug", () => {
    emitLessonDone("first-repo");
    emitLessonDone("first-repo");
    emitLessonDone("merge");
    expect(getEvents().filter((e) => e.kind === "lesson-done")).toHaveLength(2);
  });
});

describe("sync adapter seam", () => {
  it("publishes appended events with the participant when an adapter is set", () => {
    const me = createParticipant("초코");
    const publish = vi.fn().mockResolvedValue(undefined);
    setSyncAdapter({ publish, subscribe: () => () => {} });
    appendEvent(checkin);
    expect(publish).toHaveBeenCalledWith(checkin, me);
  });

  it("does not publish without a participant", () => {
    const publish = vi.fn().mockResolvedValue(undefined);
    setSyncAdapter({ publish, subscribe: () => () => {} });
    appendEvent(checkin);
    expect(publish).not.toHaveBeenCalled();
  });
});

describe("participant", () => {
  it("createParticipant stores a uuid + trimmed name", () => {
    const p = createParticipant("  초코  ");
    expect(p.name).toBe("초코");
    expect(p.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(getParticipant()).toEqual(p);
  });

  it("returns null for corrupt or invalid stored data", () => {
    clearParticipant();
    localStorage.setItem("git101-participant", '{"id":123}');
    expect(getParticipant()).toBeNull();
  });
});
