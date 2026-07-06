"use client";
import { useCallback, useEffect, useState } from "react";
import { emitLessonDone } from "@/lib/events";
import { getProgress, setLessonComplete } from "@/lib/progress";
import type { ProgressMap } from "@/types";

export function useProgress() {
  const [progress, setProgress] = useState<ProgressMap>({});
  useEffect(() => {
    setProgress(getProgress());
  }, []);

  // Stable identity so consumers (e.g. LessonLayout's onReady callback) don't
  // change every render and retrigger the terminal's mount effect.
  const markComplete = useCallback((slug: string) => {
    emitLessonDone(slug); // 멱등 — 페이지 로드 복원 경로가 매번 재호출한다
    setLessonComplete(slug);
    setProgress((prev) => ({ ...prev, [slug]: true }));
  }, []);

  return { progress, markComplete };
}
