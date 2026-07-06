import { describe, expect, it } from "vitest";
import { renderLine, rowOf } from "@/lib/shell/interactive/render";

// biome-ignore lint/suspicious/noControlCharactersInRegex: ANSI 이스케이프 제거용
const stripAnsi = (s: string) => s.replace(/\x1b\[[0-9;]*[A-Za-z]/g, "").replace(/\r/g, "");

describe("rowOf", () => {
  it("computes the row containing the nth character", () => {
    expect(rowOf(0, 80)).toBe(0);
    expect(rowOf(1, 80)).toBe(0);
    expect(rowOf(80, 80)).toBe(0); // 정확히 열 배수 = pending wrap, 같은 행
    expect(rowOf(81, 80)).toBe(1);
    expect(rowOf(160, 80)).toBe(1);
    expect(rowOf(161, 80)).toBe(2);
  });
});

describe("renderLine", () => {
  const base = { prompt: "~ $ ", cols: 80, prevCursorRow: 0 };

  it("paints carriage return, clear-to-end, prompt and input", () => {
    const { data, cursorRow } = renderLine({ ...base, input: "ls", ghost: "" });
    expect(data.startsWith("\r\x1b[J")).toBe(true);
    expect(stripAnsi(data)).toBe("~ $ ls");
    expect(cursorRow).toBe(0);
  });

  it("moves up prevCursorRow rows before clearing", () => {
    const { data } = renderLine({ ...base, input: "ls", ghost: "", prevCursorRow: 2 });
    expect(data.startsWith("\r\x1b[2A\x1b[J")).toBe(true);
  });

  it("tracks cursorRow across soft-wrapped input", () => {
    // prompt 4 + input 100 = 104 chars on 80 cols → row 1
    const { cursorRow } = renderLine({ ...base, input: "a".repeat(100), ghost: "" });
    expect(cursorRow).toBe(1);
  });

  it("keeps cursorRow on the same row at an exact column multiple (pending wrap)", () => {
    // prompt 4 + input 76 = 80 = cols → row 0
    const { cursorRow } = renderLine({ ...base, input: "a".repeat(76), ghost: "" });
    expect(cursorRow).toBe(0);
  });

  it("renders ghost dim and moves the cursor back over it", () => {
    const { data } = renderLine({ ...base, input: "git ini", ghost: "t" });
    expect(data).toContain("\x1b[38;5;242mt\x1b[0m\x1b[1D");
  });

  it("truncates ghost to the remaining width of the row", () => {
    // prompt 4 + input 70 = 74; 남은 폭 = 80 - 1 - 74 = 5
    const { data } = renderLine({ ...base, input: "a".repeat(70), ghost: "0123456789" });
    expect(data).toContain("\x1b[38;5;242m01234\x1b[0m\x1b[5D");
  });

  it("suppresses ghost when fewer than 3 chars fit", () => {
    // prompt 4 + input 74 = 78; 남은 폭 = 1 < 3
    const { data } = renderLine({ ...base, input: "a".repeat(74), ghost: "abcdef" });
    expect(data).not.toContain("\x1b[38;5;242m");
    expect(data).not.toContain("D");
  });

  it("suppresses ghost at an exact column boundary (pending wrap intact)", () => {
    const { data } = renderLine({ ...base, input: "a".repeat(76), ghost: "abcdef" });
    expect(data).not.toContain("\x1b[38;5;242m");
  });

  it("emits no cursor-back when ghost is empty", () => {
    const { data } = renderLine({ ...base, input: "ls", ghost: "" });
    // biome-ignore lint/suspicious/noControlCharactersInRegex: ANSI 커서 이동 검사
    expect(data).not.toMatch(/\x1b\[\d+D/);
  });
});
