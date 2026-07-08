import { describe, expect, it } from "vitest";
import { colorizeOutput } from "@/lib/shell/interactive/outputHighlight";

const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const YELLOW = "\x1b[33m";
const CYAN = "\x1b[36m";
const ORANGE = "\x1b[38;2;249;115;22m";

// biome-ignore lint/suspicious/noControlCharactersInRegex: stripping ANSI SGR codes
const stripAnsi = (s: string) => s.replace(/\x1b\[[0-9;]*m/g, "");

describe("colorizeOutput", () => {
  it("preserves content and width when ANSI is stripped", () => {
    const raw = "diff --git a/x b/x\n+added\n-removed\n context";
    expect(stripAnsi(colorizeOutput("git diff", raw))).toBe(raw);
  });

  describe("diff", () => {
    it("colors added green and removed red, hunk cyan", () => {
      const out = colorizeOutput("git diff", "@@ -1 +1 @@\n+new line\n-old line\n unchanged");
      const lines = out.split("\n");
      expect(lines[0]).toContain(CYAN);
      expect(lines[1]).toContain(GREEN);
      expect(lines[2]).toContain(RED);
      expect(lines[3]).not.toContain(GREEN);
    });

    it("treats +++/--- as headers, not add/remove", () => {
      const out = colorizeOutput("git diff", "--- a/x\n+++ b/x");
      const lines = out.split("\n");
      expect(lines[0]).not.toContain(RED);
      expect(lines[1]).not.toContain(GREEN);
    });
  });

  describe("status", () => {
    it("colors staged files green and unstaged/untracked red", () => {
      const raw = [
        "On branch main",
        "",
        "Changes to be committed:",
        "\tnew file:   a.txt",
        "",
        "Untracked files:",
        "\tb.txt",
      ].join("\n");
      const lines = colorizeOutput("git status", raw).split("\n");
      expect(lines[3]).toContain(GREEN); // staged
      expect(lines[6]).toContain(RED); // untracked
    });

    it("colors 'working tree clean' green", () => {
      const out = colorizeOutput("git status", "On branch main\n\nnothing to commit, working tree clean");
      expect(out.split("\n")[2]).toContain(GREEN);
    });
  });

  describe("log", () => {
    it("colors the short hash yellow and decorations cyan (oneline)", () => {
      const line = colorizeOutput("git log --oneline", "abc1234 (HEAD -> main) first commit");
      expect(line).toContain(YELLOW);
      expect(line).toContain(CYAN);
      expect(stripAnsi(line)).toBe("abc1234 (HEAD -> main) first commit");
    });

    it("dims Author/Date and yellows the commit hash (full)", () => {
      const raw = "commit abc1234 (HEAD -> main)\nAuthor: Learner <l@x.dev>\nDate:   now\n\n    msg";
      const lines = colorizeOutput("git log", raw).split("\n");
      expect(lines[0]).toContain(YELLOW);
      expect(lines[1]).toContain("\x1b[2m"); // DIM
    });
  });

  describe("generic", () => {
    it("colors 💡 hint lines orange for any command", () => {
      const out = colorizeOutput("git commit", "error: switch `m` requires a value\n💡 커밋 메시지를 입력하세요.");
      const lines = out.split("\n");
      expect(lines[0]).toContain(RED); // error:
      expect(lines[1]).toContain(ORANGE); // 💡 hint
    });

    it("leaves plain output untouched in content", () => {
      const raw = "Switched to branch 'feature'";
      expect(stripAnsi(colorizeOutput("git checkout feature", raw))).toBe(raw);
    });
  });
});
