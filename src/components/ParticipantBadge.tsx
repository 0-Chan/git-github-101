"use client";
import { useEffect, useRef, useState } from "react";
import { useParticipant } from "@/hooks/useParticipant";
import { registerNameDialog } from "@/lib/nameDialog";
import { setParticipantName } from "@/lib/participant";

// 좌측 하단 고정 이름 배지 + "수강생 이름을 입력 해주세요." 모달.
// 배지 클릭으로 언제든 수정할 수 있고, 레슨 쪽 트리거(읽음 완료·다음 레슨)가
// openNameDialog()로 같은 모달을 연다.
export function ParticipantBadge() {
  const participant = useParticipant();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const onDoneRef = useRef<(() => void) | undefined>(undefined);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return registerNameDialog((onDone) => {
      onDoneRef.current = onDone;
      setOpen(true);
    });
  }, []);

  useEffect(() => {
    if (open) {
      setDraft(participant?.name ?? "");
      // 모달 렌더 후 포커스 (이름 변경은 저장→닫힘 경로뿐이라 재실행 무해)
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open, participant?.name]);

  const close = () => {
    setOpen(false);
    const done = onDoneRef.current;
    onDoneRef.current = undefined;
    done?.();
  };

  const save = () => {
    if (draft.trim()) setParticipantName(draft);
    close();
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="이름 수정"
        className={`fixed bottom-4 left-4 z-40 flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm shadow-lg backdrop-blur transition-colors ${
          participant
            ? "border-edge bg-surface/90 text-ink hover:border-orange-500/50"
            : "border-dashed border-edge bg-ground/80 text-muted hover:text-ink"
        }`}
      >
        <span aria-hidden>👤</span>
        {participant ? participant.name : "이름 설정"}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <form
            className="w-full max-w-sm rounded-xl border border-edge bg-surface p-6 space-y-4 shadow-xl"
            onSubmit={(e) => {
              e.preventDefault();
              save();
            }}
          >
            <h2 className="font-bold text-lg text-ink">수강생 이름을 입력 해주세요.</h2>
            <input
              ref={inputRef}
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  e.preventDefault();
                  close();
                }
              }}
              placeholder="예: 홍길동"
              maxLength={20}
              className="w-full rounded-lg border border-edge bg-ground px-3 py-2 text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={close}
                className="rounded-lg border border-edge px-4 py-2 text-sm text-ink transition-colors hover:bg-ground"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={!draft.trim()}
                className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600 disabled:opacity-40"
              >
                저장
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
