import { describe, expect, it } from "vitest";
import { highlightInput, tokenizeForDisplay } from "@/lib/shell/interactive/highlight";
import { COMMAND_NAMES, GIT_SUBCOMMANDS } from "@/lib/shell/interactive/vocab";

const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const YELLOW = "\x1b[33m";
const ORANGE = "\x1b[38;2;249;115;22m";

// biome-ignore lint/suspicious/noControlCharactersInRegex: ANSI 이스케이프 제거용
const stripAnsi = (s: string) => s.replace(/\x1b\[[0-9;]*m/g, "");

describe("vocab", () => {
  it("derives command names from the registries", () => {
    expect(COMMAND_NAMES).toContain("git");
    expect(COMMAND_NAMES).toContain("ls");
    expect(COMMAND_NAMES).toContain("help");
    expect(COMMAND_NAMES).toContain("clear");
    expect(GIT_SUBCOMMANDS).toContain("init");
    expect(GIT_SUBCOMMANDS).toContain("commit");
  });
});

describe("tokenizeForDisplay", () => {
  it("marks a valid first token as command", () => {
    const [t] = tokenizeForDisplay("ls");
    expect(t).toMatchObject({ kind: "command", valid: true, text: "ls", start: 0 });
  });

  it("marks an unknown first token as invalid command (zsh behavior while typing)", () => {
    const [t] = tokenizeForDisplay("gi");
    expect(t).toMatchObject({ kind: "command", valid: false });
  });

  it("classifies git subcommands", () => {
    const tokens = tokenizeForDisplay("git commit -m hi");
    expect(tokens[0]).toMatchObject({ kind: "command", valid: true });
    expect(tokens[2]).toMatchObject({ kind: "subcommand", valid: true, text: "commit" });
    expect(tokens[4]).toMatchObject({ kind: "arg", text: "-m" });
  });

  it("marks unknown git subcommand invalid", () => {
    const tokens = tokenizeForDisplay("git comit");
    expect(tokens[2]).toMatchObject({ kind: "subcommand", valid: false });
  });

  it("treats quoted runs as string tokens, including spaces inside", () => {
    const tokens = tokenizeForDisplay('git commit -m "first commit"');
    const str = tokens.find((t) => t.kind === "string");
    expect(str?.text).toBe('"first commit"');
    expect(str?.unclosed).toBeUndefined();
  });

  it("colors an unclosed quote to the end of the line", () => {
    const tokens = tokenizeForDisplay('echo "hello wor');
    const str = tokens.find((t) => t.kind === "string");
    expect(str?.text).toBe('"hello wor');
    expect(str?.unclosed).toBe(true);
  });

  it("recognizes standalone > and >> as redirect but not >f", () => {
    const tokens = tokenizeForDisplay("echo hi > file.txt");
    expect(tokens.find((t) => t.kind === "redirect")?.text).toBe(">");

    const glued = tokenizeForDisplay("echo hi >file.txt");
    expect(glued.some((t) => t.kind === "redirect")).toBe(false);
  });

  it("skips leading whitespace when finding the command token", () => {
    const tokens = tokenizeForDisplay("  ls");
    expect(tokens[0]).toMatchObject({ kind: "space" });
    expect(tokens[1]).toMatchObject({ kind: "command", valid: true });
  });
});

describe("highlightInput", () => {
  it("returns empty string for empty input", () => {
    expect(highlightInput("")).toBe("");
  });

  it("preserves visible width exactly", () => {
    const inputs = ["ls", "git comit --bad", 'echo "a b" >> f.txt', '  mkdir "unclosed', "x"];
    for (const input of inputs) {
      expect(stripAnsi(highlightInput(input))).toBe(input);
    }
  });

  it("colors valid command green and invalid red", () => {
    expect(highlightInput("ls")).toContain(`${GREEN}ls`);
    expect(highlightInput("lss")).toContain(`${RED}lss`);
  });

  it("colors strings yellow and redirects orange", () => {
    const out = highlightInput('echo "hi" > f');
    expect(out).toContain(`${YELLOW}"hi"`);
    expect(out).toContain(`${ORANGE}>`);
  });
});
