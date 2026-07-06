import { beforeEach, describe, expect, it } from "vitest";
import {
  clearHistory,
  HISTORY_LIMIT,
  HistoryNavigator,
  historyKey,
  loadHistory,
  pushHistory,
  saveHistory,
} from "@/lib/shell/interactive/history";

beforeEach(() => localStorage.clear());

describe("pushHistory", () => {
  it("appends trimmed input", () => {
    expect(pushHistory([], "  git init  ")).toEqual(["git init"]);
  });

  it("ignores blank input", () => {
    expect(pushHistory(["ls"], "   ")).toEqual(["ls"]);
  });

  it("dedupes consecutive but keeps non-adjacent duplicates", () => {
    let h: string[] = [];
    for (const cmd of ["ls", "ls", "pwd", "ls"]) h = pushHistory(h, cmd);
    expect(h).toEqual(["ls", "pwd", "ls"]);
  });

  it("caps at the limit, dropping oldest", () => {
    let h: string[] = [];
    for (let i = 0; i < HISTORY_LIMIT + 5; i++) h = pushHistory(h, `cmd-${i}`);
    expect(h).toHaveLength(HISTORY_LIMIT);
    expect(h[0]).toBe("cmd-5");
    expect(h[h.length - 1]).toBe(`cmd-${HISTORY_LIMIT + 4}`);
  });
});

describe("load/save/clear", () => {
  it("round-trips through localStorage with a namespaced key", () => {
    saveHistory("lesson-first-repo", ["git init", "ls"]);
    expect(localStorage.getItem(historyKey("lesson-first-repo"))).toBeTruthy();
    expect(loadHistory("lesson-first-repo")).toEqual(["git init", "ls"]);
  });

  it("returns [] for corrupt or non-array data", () => {
    localStorage.setItem(historyKey("x"), "{oops");
    expect(loadHistory("x")).toEqual([]);
    localStorage.setItem(historyKey("y"), '{"a":1}');
    expect(loadHistory("y")).toEqual([]);
  });

  it("clearHistory removes only the namespaced key", () => {
    saveHistory("a", ["one"]);
    saveHistory("b", ["two"]);
    clearHistory("a");
    expect(loadHistory("a")).toEqual([]);
    expect(loadHistory("b")).toEqual(["two"]);
  });
});

describe("HistoryNavigator", () => {
  it("walks up through history newest-first and sticks at the oldest", () => {
    const nav = new HistoryNavigator(["one", "two", "three"]);
    expect(nav.up("")).toBe("three");
    expect(nav.up("")).toBe("two");
    expect(nav.up("")).toBe("one");
    expect(nav.up("")).toBeNull(); // 가장 오래된 항목에서 정지
  });

  it("stashes the in-progress input on first up and restores it walking down", () => {
    const nav = new HistoryNavigator(["one", "two"]);
    expect(nav.up("git sta")).toBe("two");
    expect(nav.up("ignored")).toBe("one");
    expect(nav.down()).toBe("two");
    expect(nav.down()).toBe("git sta"); // 스태시 복원
    expect(nav.down()).toBeNull();
  });

  it("returns null on down when not navigating", () => {
    const nav = new HistoryNavigator(["one"]);
    expect(nav.down()).toBeNull();
  });

  it("returns null on up with empty history", () => {
    const nav = new HistoryNavigator([]);
    expect(nav.up("wip")).toBeNull();
  });

  it("reset returns to the not-navigating state", () => {
    const nav = new HistoryNavigator(["one"]);
    nav.up("wip");
    nav.reset();
    expect(nav.down()).toBeNull();
    expect(nav.up("new")).toBe("one");
  });
});
