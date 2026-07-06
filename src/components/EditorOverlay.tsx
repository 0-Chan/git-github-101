"use client";
import { useEffect, useRef, useState } from "react";

interface EditorOverlayProps {
  path: string; // 절대 경로 (헤더에는 파일명만 표시)
  initialContent: string;
  onSave: (content: string) => void;
  onCancel: () => void;
}

// `edit <파일>` 명령이 여는 간단 에디터. 일반 textarea라 비개발자에게
// 익숙하고, 터미널과 달리 한글 IME 입력도 자유롭다.
export function EditorOverlay({ path, initialContent, onSave, onCancel }: EditorOverlayProps) {
  const [content, setContent] = useState(initialContent);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileName = path.split("/").pop() || path;

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  return (
    <div className="absolute inset-0 z-10 flex flex-col bg-zinc-900/95 backdrop-blur-sm">
      <div className="flex items-center justify-between gap-2 border-b border-zinc-700 bg-zinc-800 px-4 py-2">
        <span className="font-mono text-xs text-zinc-300">📝 {fileName}</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded border border-zinc-600 px-3 py-1 text-xs text-zinc-300 transition-colors hover:bg-zinc-700"
          >
            취소 (Esc)
          </button>
          <button
            type="button"
            onClick={() => onSave(content)}
            className="rounded bg-orange-500 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-orange-600"
          >
            저장
          </button>
        </div>
      </div>
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            e.preventDefault();
            onCancel();
          } else if ((e.metaKey || e.ctrlKey) && e.key === "s") {
            e.preventDefault();
            onSave(content);
          }
        }}
        spellCheck={false}
        className="flex-1 resize-none bg-[#18181b] p-4 font-mono text-sm text-zinc-100 focus:outline-none"
        aria-label={`${fileName} 편집`}
      />
    </div>
  );
}
