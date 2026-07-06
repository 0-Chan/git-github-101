"use client";
import Link from "next/link";

interface MarkReadButtonProps {
  done: boolean;
  onMarkRead: () => void;
  nextHref?: string;
  nextTitle?: string;
}

// 터미널 스텝이 없는 읽기 레슨(01·09·11)의 유일한 완료 장치.
// 기존 markComplete를 그대로 호출하므로 사이드바 ✓와 lesson-done
// 이벤트가 터미널 레슨과 동일한 경로로 흐른다.
export function MarkReadButton({ done, onMarkRead, nextHref, nextTitle }: MarkReadButtonProps) {
  return (
    <div className="flex items-center justify-between gap-4 border-t border-edge px-6 py-4 lg:px-10">
      {done ? (
        <>
          <p className="text-base font-medium text-muted">
            <span className="text-lane-main">✓</span> 읽기 완료된 레슨이에요.
          </p>
          {nextHref && (
            <Link
              href={nextHref}
              className="shrink-0 rounded-lg bg-orange-500 px-4 py-2 text-base font-medium text-white transition-colors hover:bg-orange-600"
            >
              다음 레슨: {nextTitle} →
            </Link>
          )}
        </>
      ) : (
        <button
          type="button"
          onClick={onMarkRead}
          className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600"
        >
          읽음 완료
        </button>
      )}
    </div>
  );
}
