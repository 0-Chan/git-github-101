import { describe, expect, it } from "vitest";
import { ghostSuggestion } from "@/lib/shell/interactive/suggest";

describe("ghostSuggestion", () => {
  it("returns empty for empty input", () => {
    expect(ghostSuggestion("", ["git init"])).toBe("");
  });

  it("prefers history over command completion", () => {
    // 명령어 사전이라면 "git"의 접미사는 없음("git" 자체) — 히스토리가 이김
    expect(ghostSuggestion("git i", ["git init"])).toBe("nit");
    expect(ghostSuggestion("l", ["ls -la"])).toBe("s -la");
  });

  it("uses the newest matching history entry", () => {
    const history = ["git init", "git commit -m one", "git checkout main"];
    expect(ghostSuggestion("git c", history)).toBe("heckout main");
  });

  it("excludes an exact match so accepting never no-ops", () => {
    expect(ghostSuggestion("ls", ["ls"])).toBe("");
  });

  it("falls back to command names for the first token", () => {
    expect(ghostSuggestion("mk", [])).toBe("dir");
    expect(ghostSuggestion("che", [])).toBe(""); // 명령 아님 (checkout은 서브커맨드)
  });

  it("suggests alphabetically first command on prefix ties", () => {
    // c → cat (cat < cd < clear)
    expect(ghostSuggestion("c", [])).toBe("at");
  });

  it("falls back to git subcommands after 'git '", () => {
    expect(ghostSuggestion("git ch", [])).toBe("eckout");
    expect(ghostSuggestion("git ", [])).toBe("add"); // 빈 부분 → 첫 서브커맨드
  });

  it("suggests nothing for later tokens of non-git commands", () => {
    expect(ghostSuggestion("echo hel", [])).toBe("");
  });

  it("suggests nothing past the git subcommand token", () => {
    expect(ghostSuggestion("git commit -", [])).toBe("");
  });
});
