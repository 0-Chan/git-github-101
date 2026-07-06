"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { Session } from "@/types";

interface SessionMenuProps {
  sessions: Pick<Session, "id" | "order" | "title">[];
}

export function SessionMenu({ sessions }: SessionMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const current = sessions.find((s) => pathname === `/course/${s.id}`);

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
        className={`p-2 rounded-lg text-sm transition-colors hover:bg-surface hover:text-ink ${
          current ? "text-lane-main" : "text-muted"
        }`}
      >
        {current ? `${current.order}회차` : "강의"} ▾
      </button>
      {open && (
        <nav className="absolute right-0 top-full z-50 mt-1 w-64 rounded-lg border border-edge bg-ground p-1 shadow-lg">
          <Link
            href="/course"
            onClick={() => setOpen(false)}
            className="block rounded-md px-3 py-2 text-sm text-muted transition-colors hover:bg-surface hover:text-ink"
          >
            전체 회차 보기
          </Link>
          {sessions.map((session) => (
            <Link
              key={session.id}
              href={`/course/${session.id}`}
              onClick={() => setOpen(false)}
              className={`block rounded-md px-3 py-2 text-sm transition-colors hover:bg-surface ${
                current?.id === session.id ? "text-lane-main" : "text-ink"
              }`}
            >
              <span className="font-mono text-xs">{session.order}회차</span> {session.title}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}
