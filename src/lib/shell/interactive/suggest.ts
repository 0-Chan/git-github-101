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
