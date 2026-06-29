"use client";
import { useCallback, useEffect, useState } from "react";
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
    setLessonComplete(slug);
    setProgress((prev) => ({ ...prev, [slug]: true }));
  }, []);

  return { progress, markComplete };
}
