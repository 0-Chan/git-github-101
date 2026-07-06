"use client";
import { useEffect, useRef, useState } from "react";
import { capture } from "@/lib/analytics";
import type { Session } from "@/types";

interface DeckMenuProps {
  sessions: Pick<Session, "id" | "order" | "title">[];
}

// 덱 콘텐츠가 완성된 회차만 링크를 연다. 새 덱이 준비되면 여기에 추가.
const READY_DECKS = new Set(["s1"]);

// 회차별 Slidev 덱(/slides/s1~s4)으로 나가는 드롭다운. 덱은 계측하지
// 않으므로 DeckLink와 같은 방식으로 진입점에서 횟수를 센다.
export function DeckMenu({ sessions }: DeckMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="p-2 rounded-lg text-sm text-muted transition-colors hover:bg-surface hover:text-ink"
      >
        슬라이드 ▾
      </button>
      {open && (
        <nav className="absolute right-0 top-full z-50 mt-1 w-64 rounded-lg border border-edge bg-ground p-1 shadow-lg">
          {sessions.map((session) => {
            const href = `/slides/${session.id}`;
            if (!READY_DECKS.has(session.id)) {
              return (
                <span
                  key={session.id}
                  aria-disabled="true"
                  className="block rounded-md px-3 py-2 text-sm text-muted opacity-50 cursor-not-allowed"
                >
                  <span className="font-mono text-xs">{session.order}회차</span> {session.title} (준비 중)
                </span>
              );
            }
            return (
              <a
                key={session.id}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  capture("deck_opened", { source: "nav", href });
                  setOpen(false);
                }}
                className="block rounded-md px-3 py-2 text-sm text-ink transition-colors hover:bg-surface"
              >
                <span className="font-mono text-xs">{session.order}회차</span> {session.title}
              </a>
            );
          })}
        </nav>
      )}
    </div>
  );
}
