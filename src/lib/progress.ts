import type { ProgressMap } from "@/types";

const PROGRESS_KEY = "git101-progress";

export function getProgress(): ProgressMap {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(PROGRESS_KEY) || "{}");
  } catch {
    return {};
  }
}

export function setLessonComplete(slug: string): void {
  const progress = getProgress();
  progress[slug] = true;
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
}

export function clearProgress(): void {
  localStorage.removeItem(PROGRESS_KEY);
}
