import sectionsData from "../../content/sections.json";
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
}
