export const HISTORY_LIMIT = 50;

export function historyKey(namespace: string): string {
  return `git101-history-${namespace}`;
}

/** oldest→newest 순서. 저장소가 없거나 손상됐으면 []. */
export function loadHistory(namespace: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(historyKey(namespace)) || "[]");
    return Array.isArray(parsed) ? parsed.filter((e) => typeof e === "string") : [];
  } catch {
    return [];
  }
}

export function saveHistory(namespace: string, entries: string[]): void {
  try {
    localStorage.setItem(historyKey(namespace), JSON.stringify(entries));
  } catch {
    // quota 등 — 히스토리는 편의 기능이라 조용히 무시
  }
}

/** 순수 함수: 빈 입력 무시, 직전 항목과 같으면 중복 제거, 캡 초과 시 오래된 것부터 탈락. */
export function pushHistory(entries: string[], input: string): string[] {
  const trimmed = input.trim();
  if (!trimmed) return entries;
  if (entries[entries.length - 1] === trimmed) return entries;
  const next = [...entries, trimmed];
  return next.length > HISTORY_LIMIT ? next.slice(next.length - HISTORY_LIMIT) : next;
}

export function clearHistory(namespace: string): void {
  localStorage.removeItem(historyKey(namespace));
}

/**
 * ↑/↓ 내비게이션. zsh처럼 첫 ↑에서 작성 중이던 입력을 스태시해 두고,
 * ↓로 최신을 지나치면 그 스태시를 되돌려준다.
 */
export class HistoryNavigator {
  private entries: string[];
  private index: number; // entries.length == 내비게이션 안 함
  private stash = "";

  constructor(entriesOldestFirst: string[]) {
    this.entries = entriesOldestFirst;
    this.index = entriesOldestFirst.length;
  }

  up(currentInput: string): string | null {
    if (this.entries.length === 0) return null;
    if (this.index === this.entries.length) this.stash = currentInput;
    if (this.index === 0) return null; // 가장 오래된 항목에서 정지
    this.index--;
    return this.entries[this.index];
  }

  down(): string | null {
    if (this.index >= this.entries.length) return null; // 내비게이션 중 아님
    this.index++;
    return this.index === this.entries.length ? this.stash : this.entries[this.index];
  }

  reset(): void {
    this.index = this.entries.length;
    this.stash = "";
  }
}
