"use client";
import { useSyncExternalStore } from "react";
import { getParticipant, subscribeParticipant } from "@/lib/participant";
import type { Participant } from "@/types";

export function useParticipant(): Participant | null {
  return useSyncExternalStore(subscribeParticipant, getParticipant, () => null);
}
