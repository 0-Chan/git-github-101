import type { Participant } from "@/types";

const PARTICIPANT_KEY = "git101-participant";
const CHANGE_EVENT = "git101:participant";

let cache: Participant | null | undefined;

export function getParticipant(): Participant | null {
  if (typeof window === "undefined") return null;
  if (cache === undefined) {
    try {
      const raw = localStorage.getItem(PARTICIPANT_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      cache = parsed && typeof parsed.id === "string" && typeof parsed.name === "string" ? parsed : null;
    } catch {
      cache = null;
    }
  }
  return cache ?? null;
}

export function createParticipant(name: string): Participant {
  const participant: Participant = { id: crypto.randomUUID(), name: name.trim() };
  cache = participant;
  try {
    localStorage.setItem(PARTICIPANT_KEY, JSON.stringify(participant));
  } catch (err) {
    console.warn("git101-participant 저장 실패:", err);
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
  return participant;
}

/** 이름만 갱신 — 기존 uuid를 보존해 이벤트 로그의 식별자 연속성을 지킨다. 없으면 생성. */
export function setParticipantName(name: string): Participant {
  const existing = getParticipant();
  if (!existing) return createParticipant(name);
  const updated: Participant = { id: existing.id, name: name.trim() };
  cache = updated;
  try {
    localStorage.setItem(PARTICIPANT_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn("git101-participant 저장 실패:", err);
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
  return updated;
}

export function clearParticipant(): void {
  cache = undefined;
  localStorage.removeItem(PARTICIPANT_KEY);
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function subscribeParticipant(cb: () => void): () => void {
  const onStorage = (e: StorageEvent) => {
    if (e.key === PARTICIPANT_KEY || e.key === null) {
      cache = undefined;
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
