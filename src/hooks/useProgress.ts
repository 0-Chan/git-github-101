"use client";
import { useEffect, useState } from "react";
import { getProgress, setLessonComplete } from "@/lib/progress";
import type { ProgressMap } from "@/types";

export function useProgress() {
  const [progress, setProgress] = useState<ProgressMap>({});
  useEffect(() => {
    setProgress(getProgress());
  }, []);

  const markComplete = (slug: string) => {
    setLessonComplete(slug);
    setProgress((prev) => ({ ...prev, [slug]: true }));
  };

  return { progress, markComplete };
}
