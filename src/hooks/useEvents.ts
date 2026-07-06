"use client";
import { useSyncExternalStore } from "react";
import { getEvents, subscribeEvents } from "@/lib/events";
import type { ProgressEvent } from "@/types";

const EMPTY: ProgressEvent[] = [];

// 서버 스냅샷은 항상 빈 배열 — SSR 결과가 결정적이라 hydration 불일치가 없다.
export function useEvents(): ProgressEvent[] {
  return useSyncExternalStore(subscribeEvents, getEvents, () => EMPTY);
}
