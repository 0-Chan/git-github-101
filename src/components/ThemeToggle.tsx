"use client";
import { useEffect, useRef, useState } from "react";

// Easter egg: this many theme toggles in a row wipes all learning progress.
const EGG_STREAK = 10;
// Clicks further apart than this break the streak.
const EGG_WINDOW_MS = 2000;

export function ThemeToggle() {
  const [dark, setDark] = useState(false);
  const [resetting, setResetting] = useState(false);
  const streakRef = useRef({ count: 0, last: 0 });

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggle = async () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");

    const now = Date.now();
    const streak = streakRef.current;
    streak.count = now - streak.last <= EGG_WINDOW_MS ? streak.count + 1 : 1;
    streak.last = now;

    if (streak.count >= EGG_STREAK && !resetting) {
      streak.count = 0;
      setResetting(true);
      // Loaded on demand so LightningFS stays out of the page bundle.
      const { resetAllProgress } = await import("@/lib/reset");
      await resetAllProgress();
      setTimeout(() => window.location.reload(), 1200);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={toggle}
        className="p-2 rounded-lg hover:bg-surface transition-colors"
        aria-label="Toggle theme"
      >
        {dark ? "☀️" : "🌙"}
      </button>
      {resetting && (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 z-[100] -translate-x-1/2 rounded-lg border border-edge bg-surface px-4 py-2 font-mono text-sm text-ink shadow-lg"
        >
          🥚 모든 진행 상황이 리셋되었습니다
        </div>
      )}
    </>
  );
}
