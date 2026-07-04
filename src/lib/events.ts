import type { ProgressEvent, SyncAdapter } from "@/types";
import { getParticipant } from "./participant";

const EVENTS_KEY = "git101-events";
const CHANGE_EVENT = "git101:events";

// useSyncExternalStore가 참조 동일성으로 리렌더를 판단하므로,
// 변경이 없는 한 같은 배열 인스턴스를 돌려줘야 한다.
let cache: ProgressEvent[] | null = null;

// Phase 2 결합점: 어댑터가 꽂히면 appendEvent가 발행까지 담당한다. UI 무변경.
let adapter: SyncAdapter | null = null;

export function setSyncAdapter(next: SyncAdapter | null): void {
  adapter = next;
}

function readFromStorage(): ProgressEvent[] {
  try {
    const raw = localStorage.getItem(EVENTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getEvents(): ProgressEvent[] {
  if (typeof window === "undefined") return [];
  if (cache === null) cache = readFromStorage();
  return cache;
}

export function appendEvent(e: ProgressEvent): void {
  const next = [...getEvents(), e];
  cache = next;
  try {
    localStorage.setItem(EVENTS_KEY, JSON.stringify(next));
  } catch (err) {
    // quota 초과 등 — 인메모리 캐시는 유지되므로 세션은 계속 동작한다
    console.warn("git101-events 저장 실패:", err);
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));

  if (adapter) {
    const who = getParticipant();
    if (who) {
      adapter.publish(e, who).catch((err) => console.warn("이벤트 발행 실패:", err));
    }
  }
}

export function subscribeEvents(cb: () => void): () => void {
  // 같은 탭의 append는 커스텀 이벤트로, 다른 탭의 append는 storage 이벤트로 감지
  const onStorage = (e: StorageEvent) => {
    if (e.key === EVENTS_KEY || e.key === null) {
      cache = null;
      cb();
    }
  };
  window.addEventListener(CHANGE_EVENT, cb);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(CHANGE_EVENT, cb);
    window.removeEventListener("storage", onStorage);
  };
}

export function clearEvents(): void {
  cache = null;
  localStorage.removeItem(EVENTS_KEY);
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

// 멱등 emitter — markComplete는 리로드·복원 경로에서 반복 호출되므로
// 여기서 걸러야 append-only 로그가 중복으로 오염되지 않는다.
export function emitLessonStep(slug: string, stepId: string): void {
  const dup = getEvents().some((e) => e.kind === "lesson-step" && e.slug === slug && e.stepId === stepId);
  if (dup) return;
  appendEvent({ kind: "lesson-step", slug, stepId, at: Date.now() });
}

export function emitLessonDone(slug: string): void {
  const dup = getEvents().some((e) => e.kind === "lesson-done" && e.slug === slug);
  if (dup) return;
  appendEvent({ kind: "lesson-done", slug, at: Date.now() });
}
