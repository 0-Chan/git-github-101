import { resolvePath } from "../filesystem";
import { COMMAND_NAMES, GIT_SUBCOMMANDS } from "./vocab";

/**
 * zsh-autosuggestions 방식의 ghost 접미사. 우선순위:
 * ① 히스토리 최신 항목부터 (입력으로 시작하되 입력과 다른 것)
 * ② 첫 토큰 입력 중이면 명령어 사전 (알파벳순 첫 후보)
 * ③ `git <부분>` 꼴이면 git 서브커맨드
 */
export function ghostSuggestion(
  input: string,
  historyOldestFirst: string[],
  commands: readonly string[] = COMMAND_NAMES,
  gitSubs: readonly string[] = GIT_SUBCOMMANDS,
): string {
  if (!input) return "";

  for (let i = historyOldestFirst.length - 1; i >= 0; i--) {
    const entry = historyOldestFirst[i];
    if (entry.startsWith(input) && entry !== input) return entry.slice(input.length);
  }

  if (!input.includes(" ")) {
    const match = commands.find((c) => c.startsWith(input) && c !== input);
    if (match) return match.slice(input.length);
    return "";
  }

  const gitPartial = input.match(/^git ([^ ]*)$/);
  if (gitPartial) {
    const partial = gitPartial[1];
    const match = gitSubs.find((s) => s.startsWith(partial) && s !== partial);
    if (match) return match.slice(partial.length);
  }

  return "";
}

export interface CompletionResult {
  kind: "none" | "single" | "prefix" | "multiple";
  /** 입력 뒤에 그대로 붙일 텍스트 ("multiple"이면 "") */
  insert: string;
  /** "multiple"일 때 표시할 후보 (정렬, 디렉터리는 뒤에 /) */
  candidates: string[];
}

function commonPrefix(items: string[]): string {
  if (items.length === 0) return "";
  let prefix = items[0];
  for (const item of items.slice(1)) {
    while (!item.startsWith(prefix)) prefix = prefix.slice(0, -1);
  }
  return prefix;
}

function fromWordList(partial: string, words: readonly string[]): CompletionResult {
  const matches = words.filter((w) => w.startsWith(partial));
  if (matches.length === 0) return { kind: "none", insert: "", candidates: [] };
  if (matches.length === 1) return { kind: "single", insert: `${matches[0].slice(partial.length)} `, candidates: [] };
  const extension = commonPrefix(matches).slice(partial.length);
  if (extension) return { kind: "prefix", insert: extension, candidates: [] };
  return { kind: "multiple", insert: "", candidates: [...matches].sort() };
}

/**
 * Tab 완성. 커서가 항상 입력 끝에 있으므로 완성 대상은 언제나 마지막 토큰이다.
 * 첫 토큰=명령어, `git` 뒤 첫 토큰=서브커맨드, 그 외=가상 FS 경로.
 */
export async function complete(input: string, ctx: { fs: any; cwd: string }): Promise<CompletionResult> {
  const m = input.match(/(^|[ \t])([^ \t]*)$/);
  const partial = m ? m[2] : input;
  const before = input.slice(0, input.length - partial.length);
  const priorWords = before.split(/[ \t]+/).filter(Boolean);

  if (priorWords.length === 0) return fromWordList(partial, COMMAND_NAMES);
  if (priorWords.length === 1 && priorWords[0] === "git") return fromWordList(partial, GIT_SUBCOMMANDS);

  // 경로 완성 — 따옴표로 시작했으면 벗기고 본다
  const clean = partial.replace(/^["']/, "");
  const lastSlash = clean.lastIndexOf("/");
  const dirPart = lastSlash >= 0 ? clean.slice(0, lastSlash + 1) : "";
  const base = clean.slice(lastSlash + 1);
  const parent = resolvePath(ctx.cwd, dirPart || ".");

  let names: string[];
  try {
    names = await ctx.fs.promises.readdir(parent);
  } catch {
    return { kind: "none", insert: "", candidates: [] };
  }

  const matches = names.filter((n) => n.startsWith(base)).sort();
  if (matches.length === 0) return { kind: "none", insert: "", candidates: [] };

  const isDir = async (name: string) => {
    try {
      const stat = await ctx.fs.promises.stat(resolvePath(parent, name));
      return stat.isDirectory();
    } catch {
      return false;
    }
  };

  if (matches.length === 1) {
    const dir = await isDir(matches[0]);
    return { kind: "single", insert: matches[0].slice(base.length) + (dir ? "/" : " "), candidates: [] };
  }

  const extension = commonPrefix(matches).slice(base.length);
  if (extension) return { kind: "prefix", insert: extension, candidates: [] };

  const candidates = await Promise.all(matches.map(async (n) => ((await isDir(n)) ? `${n}/` : n)));
  return { kind: "multiple", insert: "", candidates };
}
