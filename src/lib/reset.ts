import sectionsData from "../../content/sections.json";
import { clearEvents } from "./events";
import { FIXTURE_VERSION_KEY } from "./fixtures";
import { clearProgress } from "./progress";
import { destroyFS } from "./shell/filesystem";

/**
 * Full learning-state reset: every lesson filesystem, fixture version marker,
 * and the completion map. Clearing only `git101-progress` is not enough —
 * on the next lesson load the surviving IndexedDB state re-validates and the
 * checkmarks come right back, so the filesystems must go too.
 */
export async function resetAllProgress(): Promise<void> {
  for (const section of sectionsData.sections) {
    if (section.hasTerminal) {
      await destroyFS(`lesson-${section.slug}`);
    }
    localStorage.removeItem(`${FIXTURE_VERSION_KEY}-${section.slug}`);
  }
  clearProgress();
  // 이벤트 로그도 함께 — 남겨두면 리셋 후 lesson-done 이벤트가 리더보드
  // 체크를 되살린다. 참가자 정체성(git101-participant)은 진행 상태가
  // 아니므로 유지한다.
  clearEvents();
}
