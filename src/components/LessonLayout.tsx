"use client";
import dynamic from "next/dynamic";
import { useCallback, useState } from "react";
import { useProgress } from "@/hooks/useProgress";
import { useTabLock } from "@/hooks/useTabLock";
import { FIXTURE_VERSION_KEY } from "@/lib/fixtures";
import type { Shell } from "@/lib/shell/Shell";
import { validateAllSteps } from "@/lib/validation";
import type { LessonContent, Section } from "@/types";
import { GuidePanel } from "./GuidePanel";
import { MarkReadButton } from "./MarkReadButton";
import { Sidebar } from "./Sidebar";

const TerminalPanel = dynamic(() => import("./TerminalPanel").then((m) => ({ default: m.TerminalPanel })), {
  ssr: false,
});

interface LessonLayoutProps {
  lesson: LessonContent;
  sections: Section[];
}

export function LessonLayout({ lesson, sections }: LessonLayoutProps) {
  const { progress, markComplete } = useProgress();
  const isLocked = useTabLock(lesson.meta.slug);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<boolean[]>(new Array(lesson.meta.steps.length).fill(false));
  const [terminalKey, setTerminalKey] = useState(0);
  const currentStep = completedSteps.findIndex((c) => !c);
  const _allComplete = completedSteps.every(Boolean);

  const handleStepComplete = useCallback(
    (stepIndex: number) => {
      setCompletedSteps((prev) => {
        const next = [...prev];
        next[stepIndex] = true;
        if (next.every(Boolean)) {
          markComplete(lesson.meta.slug);
        }
        return next;
      });
    },
    [lesson.meta.slug, markComplete],
  );

  const handleReset = useCallback(async () => {
    const { destroyFS } = await import("@/lib/shell/filesystem");
    const { clearHistory } = await import("@/lib/shell/interactive/history");
    const slug = lesson.meta.slug;
    await destroyFS(`lesson-${slug}`);
    localStorage.removeItem(`${FIXTURE_VERSION_KEY}-${slug}`);
    clearHistory(`lesson-${slug}`);
    setCompletedSteps(new Array(lesson.meta.steps.length).fill(false));
    setTerminalKey((k) => k + 1);
  }, [lesson.meta.slug, lesson.meta.steps.length]);

  const handleShellReady = useCallback(
    async (shell: Shell) => {
      if (lesson.meta.steps.length > 0) {
        const results = await validateAllSteps(lesson.meta.steps, shell.getFS(), "/");
        setCompletedSteps(results);
        if (results.every(Boolean)) {
          markComplete(lesson.meta.slug);
        }
      }
    },
    [lesson.meta.steps, lesson.meta.slug, markComplete],
  );

  if (isLocked) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-zinc-500">이 레슨은 다른 탭에서 이미 열려 있어요.</p>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      <button
        type="button"
        onClick={() => setMobileMenuOpen(true)}
        className="lg:hidden fixed bottom-4 left-4 z-40 p-3 bg-orange-500 text-white rounded-full shadow-lg"
        aria-label="Open menu"
      >
        ☰
      </button>
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          {/* biome-ignore lint/a11y/useKeyWithClickEvents: backdrop dismiss */}
          {/* biome-ignore lint/a11y/noStaticElementInteractions: backdrop dismiss */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            role="presentation"
            onClick={() => setMobileMenuOpen(false)}
          />
          {/* biome-ignore lint/a11y/useKeyWithClickEvents: nav click dismiss */}
          <nav
            className="absolute left-0 top-0 h-full w-72 bg-white dark:bg-zinc-950 shadow-xl overflow-y-auto"
            onClick={() => setMobileMenuOpen(false)}
          >
            <Sidebar sections={sections} progress={progress} />
          </nav>
        </div>
      )}
      <div className="hidden lg:block">
        <Sidebar sections={sections} progress={progress} />
      </div>
      <div className={`flex-1 flex ${lesson.meta.hasTerminal ? "flex-col lg:flex-row" : "flex-col"}`}>
        <GuidePanel
          html={lesson.html}
          steps={lesson.meta.steps}
          completedSteps={completedSteps}
          currentStep={currentStep === -1 ? lesson.meta.steps.length : currentStep}
        />
        {!lesson.meta.hasTerminal && (
          <MarkReadButton done={!!progress[lesson.meta.slug]} onMarkRead={() => markComplete(lesson.meta.slug)} />
        )}
        {lesson.meta.hasTerminal && (
          <div className="lg:w-1/2 h-80 lg:h-full p-4 flex flex-col gap-2">
            {/* Goal bar: the terminal column never scrolls, so this stays visible. */}
            <div className="flex items-center gap-3 rounded-lg border border-edge bg-surface px-3 py-2">
              {lesson.meta.steps.length > 0 && (
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  {currentStep === -1 ? (
                    <p className="truncate text-sm text-ink">🎉 모든 단계 완료! 다음 레슨으로 넘어가 보세요.</p>
                  ) : (
                    <>
                      <span className="shrink-0 font-mono text-xs font-medium text-lane-main">
                        🎯 {currentStep + 1}/{lesson.meta.steps.length}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm text-ink">{lesson.meta.steps[currentStep].instruction}</p>
                        <p className="truncate font-mono text-xs text-muted">$ {lesson.meta.steps[currentStep].hint}</p>
                      </div>
                    </>
                  )}
                </div>
              )}
              <button
                type="button"
                onClick={handleReset}
                className="ml-auto shrink-0 text-xs px-3 py-1 rounded border border-edge hover:bg-ground transition-colors"
              >
                리셋
              </button>
            </div>
            <div className="flex-1 min-h-0">
              <TerminalPanel
                key={terminalKey}
                namespace={`lesson-${lesson.meta.slug}`}
                steps={lesson.meta.steps}
                currentStep={currentStep === -1 ? lesson.meta.steps.length : currentStep}
                onStepComplete={handleStepComplete}
                onReady={handleShellReady}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
