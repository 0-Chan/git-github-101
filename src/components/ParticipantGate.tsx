"use client";
import { type ReactNode, useEffect, useState } from "react";
import { useParticipant } from "@/hooks/useParticipant";
import { createParticipant } from "@/lib/participant";

interface ParticipantGateProps {
  children: ReactNode;
}

// course/leaderboard 페이지만 감싼다 — 튜토리얼만 쓰는 방문자는
// 이름을 요구받지 않고, 이벤트는 참가자 없이도 로컬에 쌓인다.
export function ParticipantGate({ children }: ParticipantGateProps) {
  const participant = useParticipant();
  const [mounted, setMounted] = useState(false);
  const [name, setName] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="animate-pulse space-y-4 py-8" aria-hidden>
        <div className="h-6 w-48 rounded bg-surface" />
        <div className="h-32 rounded-xl border border-edge bg-surface" />
      </div>
    );
  }

  if (!participant) {
    return (
      <div className="flex justify-center py-16">
        <form
          className="w-full max-w-sm rounded-xl border border-edge bg-surface p-6 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (name.trim()) createParticipant(name);
          }}
        >
          <div>
            <h2 className="font-bold text-lg text-ink">이름을 알려주세요</h2>
            <p className="mt-1 text-sm text-muted">리더보드에 표시할 이름이에요. 이 브라우저에만 저장됩니다.</p>
          </div>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="예: 홍길동"
            maxLength={20}
            // biome-ignore lint/a11y/noAutofocus: 이 폼이 페이지의 유일한 입력이다
            autoFocus
            className="w-full rounded-lg border border-edge bg-ground px-3 py-2 text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <button
            type="submit"
            disabled={!name.trim()}
            className="w-full rounded-lg bg-orange-500 py-2 font-medium text-white transition-colors hover:bg-orange-600 disabled:opacity-40"
          >
            시작하기
          </button>
        </form>
      </div>
    );
  }

  return <>{children}</>;
}
