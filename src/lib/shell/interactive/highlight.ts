import { COMMAND_NAMES, GIT_SUBCOMMANDS } from "./vocab";

// parser.ts는 따옴표를 벗기고 위치 정보를 버리므로, 하이라이팅은 스팬을
// 보존하는 자체 토크나이저를 쓴다. 의미 규칙은 parser와 동일하게 유지:
// 따옴표는 토글, 미폐쇄 따옴표는 줄 끝까지, >/>>는 독립 토큰일 때만 리다이렉트.

export type TokenKind = "command" | "subcommand" | "arg" | "string" | "redirect" | "space";

export interface DisplayToken {
  kind: TokenKind;
  text: string; // 입력의 원본 슬라이스 (따옴표 포함)
  start: number;
  valid?: boolean; // command/subcommand에만 의미 있음
  unclosed?: boolean; // 닫는 따옴표가 없는 string
}

const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const YELLOW = "\x1b[33m";
const ORANGE = "\x1b[38;2;249;115;22m"; // 테마 액센트 #f97316
const RESET = "\x1b[0m";

interface RawToken {
  text: string;
  start: number;
  hasQuote: boolean;
  unclosed: boolean;
  value: string; // parser처럼 따옴표를 벗긴 값
}

function scanTokens(input: string): (RawToken | { space: string; start: number })[] {
  const out: (RawToken | { space: string; start: number })[] = [];
  let i = 0;
  while (i < input.length) {
    if (input[i] === " " || input[i] === "\t") {
      const start = i;
      while (i < input.length && (input[i] === " " || input[i] === "\t")) i++;
      out.push({ space: input.slice(start, i), start });
      continue;
    }
    const start = i;
    let value = "";
    let hasQuote = false;
    let inQuote: string | null = null;
    while (i < input.length) {
      const ch = input[i];
      if (inQuote) {
        if (ch === inQuote) inQuote = null;
        else value += ch;
      } else if (ch === '"' || ch === "'") {
        inQuote = ch;
        hasQuote = true;
      } else if (ch === " " || ch === "\t") {
        break;
      } else {
        value += ch;
      }
      i++;
    }
    out.push({ text: input.slice(start, i), start, hasQuote, unclosed: inQuote !== null, value });
  }
  return out;
}

export function tokenizeForDisplay(input: string): DisplayToken[] {
  const tokens: DisplayToken[] = [];
  let wordIndex = 0; // 공백 제외한 논리 토큰 순번
  let firstValue: string | null = null;

  for (const t of scanTokens(input)) {
    if ("space" in t) {
      tokens.push({ kind: "space", text: t.space, start: t.start });
      continue;
    }
    let kind: TokenKind;
    let valid: boolean | undefined;
    if (t.text === ">" || t.text === ">>") {
      kind = "redirect";
    } else if (wordIndex === 0) {
      kind = "command";
      valid = COMMAND_NAMES.includes(t.value);
      firstValue = t.value;
    } else if (wordIndex === 1 && firstValue === "git") {
      kind = "subcommand";
      valid = GIT_SUBCOMMANDS.includes(t.value);
    } else if (t.hasQuote) {
      kind = "string";
    } else {
      kind = "arg";
    }
    tokens.push({ kind, text: t.text, start: t.start, valid, unclosed: t.unclosed || undefined });
    wordIndex++;
  }
  return tokens;
}

/** 입력과 가시 폭이 동일한 ANSI 컬러 문자열을 돌려준다. */
export function highlightInput(input: string): string {
  if (!input) return "";
  let out = "";
  for (const token of tokenizeForDisplay(input)) {
    switch (token.kind) {
      case "command":
      case "subcommand":
        out += (token.valid ? GREEN : RED) + token.text + RESET;
        break;
      case "string":
        out += YELLOW + token.text + RESET;
        break;
      case "redirect":
        out += ORANGE + token.text + RESET;
        break;
      default:
        out += token.text;
    }
  }
  return out;
}
