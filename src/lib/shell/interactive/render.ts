import { highlightInput } from "./highlight";

const GHOST_COLOR = "\x1b[38;5;242m"; // dim 속성 대신 고정 회색 — 렌더러별 편차 회피
const RESET = "\x1b[0m";
const MIN_GHOST_CHARS = 3;

export interface PaintResult {
  /** terminal.write()에 그대로 넘길 단일 문자열 */
  data: string;
  /** 커서가 위치한 행 (블록 내 0-기준) — 다음 페인트의 prevCursorRow */
  cursorRow: number;
}

/**
 * n번째 문자를 담은 셀의 행 번호. 정확히 열 배수일 때 같은 행으로 취급하는
 * 것은 xterm의 pending-wrap 동작(마지막 열에 쓴 뒤 커서가 머무름)과 일치시키기 위함.
 */
export function rowOf(n: number, cols: number): number {
  return n === 0 ? 0 : Math.floor((n - 1) / cols);
}

/**
 * "프롬프트 + 컬러 입력 + 회색 ghost" 한 블록을 다시 그린다.
 * - 입력은 자유롭게 soft-wrap: 이전 커서 행만큼 올라가 \x1b[J로 블록 전체를 지운다.
 * - ghost는 절대 wrap하지 않는다: 같은 행의 남은 폭만큼만 표시(그마저 좁으면 생략).
 *   덕분에 행 수 계산이 ghost와 무관하고, 커서 복귀가 항상 같은 행 \x1b[nD로 끝난다.
 */
export function renderLine(opts: {
  prompt: string;
  input: string;
  ghost: string;
  cols: number;
  prevCursorRow: number;
}): PaintResult {
  const { prompt, input, ghost, cols, prevCursorRow } = opts;
  const total = prompt.length + input.length;
  const cursorRow = rowOf(total, cols);

  let data = "\r";
  if (prevCursorRow > 0) data += `\x1b[${prevCursorRow}A`;
  data += "\x1b[J";
  data += prompt + highlightInput(input);

  if (ghost) {
    // 입력 끝에서 커서가 놓일 0-기준 열. 정확히 열 배수면 pending-wrap 상태라 여유 없음.
    const endCol = total > 0 && total % cols === 0 ? cols : total % cols;
    const available = cols - 1 - endCol;
    if (available >= MIN_GHOST_CHARS) {
      const shown = ghost.slice(0, available);
      data += `${GHOST_COLOR}${shown}${RESET}\x1b[${shown.length}D`;
    }
  }

  return { data, cursorRow };
}
