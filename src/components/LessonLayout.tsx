"use client";
import dynamic from "next/dynamic";
import { useCallback, useRef, useState } from "react";
import { useProgress } from "@/hooks/useProgress";
import { useTabLock } from "@/hooks/useTabLock";
import { celebrate } from "@/lib/confetti";
import { FIXTURE_VERSION_KEY } from "@/lib/fixtures";
import { openNameDialog } from "@/lib/nameDialog";
import { nextSection } from "@/lib/nextSection";
import { getParticipant } from "@/lib/participant";
import type { Shell } from "@/lib/shell/Shell";
import { validateAllSteps } from "@/lib/validation";
import type { LessonContent, Section } from "@/types";
import { GuidePanel } from "./GuidePanel";
import { MarkReadButton } from "./MarkReadButton";
import { NextLessonButton } from "./NextLessonButton";
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
  const [terminalExpanded, setTerminalExpanded] = useState(false);
  const currentStep = completedSteps.findIndex((c) => !c);
  const _allComplete = completedSteps.every(Boolean);
  const nextLesson = nextSection(sections, lesson.meta.slug);
  const terminalColRef = useRef<HTMLDivElement>(null);
  // 라이브 완주 순간에만 한 번 터뜨린다 (Strict Mode 이중 호출·복원 경로 방지)
  const celebrationFiredRef = useRef(false);

  const handleStepComplete = useCallback(
    (stepIndex: number) => {
      setCompletedSteps((prev) => {
        const next = [...prev];
        next[stepIndex] = true;
        if (next.every(Boolean)) {
          markComplete(lesson.meta.slug);
          if (!celebrationFiredRef.current) {
            celebrationFiredRef.current = true;
            celebrate(terminalColRef.current);
          }
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
    celebrationFiredRef.current = false; // 재완주 시 다시 축하
    setCompletedSteps(new Array(lesson.meta.steps.length).fill(false));
    setTerminalKey((k) => k + 1);
  }, [lesson.meta.slug, lesson.meta.steps.length]);

  const handleShellReady = useCallback(
    async (shell: Shell) => {
      if (lesson.meta.steps.length > 0) {
        const { loadHistory } = await import("@/lib/shell/interactive/history");
        const results = await validateAllSteps(lesson.meta.steps, shell.getFS(), "/", {
          history: loadHistory(`lesson-${lesson.meta.slug}`),
        });
        setCompletedSteps(results);
        if (results.every(Boolean)) {
          markComplete(lesson.meta.slug);
          // 복원으로 이미 완료된 레슨 — 리로드마다 confetti가 터지면 안 된다
          celebrationFiredRef.current = true;
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
        className="lg:hidden fixed bottom-20 left-4 z-40 p-3 bg-orange-500 text-white rounded-full shadow-lg"
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
          <MarkReadButton
            done={!!progress[lesson.meta.slug]}
            onMarkRead={() => {
              markComplete(lesson.meta.slug);
              celebrate();
              // 완료는 즉시 처리하고, 이름이 없으면 입력을 유도한다
              if (!getParticipant()) openNameDialog();
            }}
            nextHref={nextLesson ? `/lessons/${nextLesson.slug}` : undefined}
            nextTitle={nextLesson?.title}
          />
        )}
        {lesson.meta.hasTerminal && (
          <div
            ref={terminalColRef}
            className={`${
              terminalExpanded ? "lg:w-[70%] h-[60vh]" : "lg:w-1/2 h-80"
            } lg:h-full lg:min-w-[420px] p-4 flex flex-col gap-2 transition-[width,height] duration-300 ease-in-out`}
          >
            <div className="flex-1 min-h-0">
              <TerminalPanel
                key={terminalKey}
                namespace={`lesson-${lesson.meta.slug}`}
                steps={lesson.meta.steps}
                currentStep={currentStep === -1 ? lesson.meta.steps.length : currentStep}
                onStepComplete={handleStepComplete}
                onReady={handleShellReady}
                expanded={terminalExpanded}
                onToggleExpand={() => setTerminalExpanded((v) => !v)}
              />
            </div>
            {/* Goal bar: the terminal column never scrolls, so this stays visible below it. */}
            <div className="flex items-center gap-4 rounded-xl border border-edge bg-surface px-4 py-3">
              {lesson.meta.steps.length > 0 && (
                <div className="flex min-w-0 flex-1 items-center gap-4">
                  {currentStep === -1 ? (
                    <div className="flex min-w-0 flex-1 items-center justify-between gap-4">
                      <p className="truncate text-base font-medium text-ink">🎉 모든 단계 완료!</p>
                      {nextLesson && <NextLessonButton href={`/lessons/${nextLesson.slug}`} title={nextLesson.title} />}
                    </div>
                  ) : (
                    <>
                      <span className="shrink-0 font-mono text-base font-bold text-lane-main">
                        🎯 {currentStep + 1}/{lesson.meta.steps.length}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-base font-medium text-ink">
                          {lesson.meta.steps[currentStep].instruction}
                        </p>
                        <p className="truncate font-mono text-sm text-muted">$ {lesson.meta.steps[currentStep].hint}</p>
                      </div>
                    </>
                  )}
                </div>
              )}
              <button
                type="button"
                onClick={handleReset}
                className="ml-auto shrink-0 text-sm px-3 py-1.5 rounded-lg border border-edge hover:bg-ground transition-colors"
              >
                터미널 리셋
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
