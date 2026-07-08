"use client";
import { useRouter } from "next/navigation";
import { openNameDialog } from "@/lib/nameDialog";
import { getParticipant } from "@/lib/participant";

interface NextLessonButtonProps {
  href: string;
  title: string;
}

// 다음 레슨 이동 버튼. 이름이 아직 없으면 이동 전에 이름 입력 모달을 띄운다
// (입력·취소와 무관하게 모달이 닫히면 이동 — 이름은 유도이지 차단이 아니다).
export function NextLessonButton({ href, title }: NextLessonButtonProps) {
  const router = useRouter();

  return (
    <a
      href={href}
      onClick={(e) => {
        if (!getParticipant()) {
          e.preventDefault();
          openNameDialog(() => router.push(href));
        }
      }}
      className="shrink-0 flex items-center gap-1.5 rounded-lg bg-orange-500 px-4 py-2 text-base font-medium text-white transition-colors hover:bg-orange-600"
    >
      다음 레슨: {title} →
    </a>
  );
}
