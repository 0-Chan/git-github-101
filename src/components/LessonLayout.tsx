'use client'
import { useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { GuidePanel } from './GuidePanel'
import { Sidebar } from './Sidebar'
import { useProgress } from '@/hooks/useProgress'
import { useTabLock } from '@/hooks/useTabLock'
import { validateAllSteps } from '@/lib/validation'
import type { LessonContent, Section } from '@/types'
import type { Shell } from '@/lib/shell/Shell'

const TerminalPanel = dynamic(
  () => import('./TerminalPanel').then((m) => ({ default: m.TerminalPanel })),
  { ssr: false }
)

interface LessonLayoutProps {
  lesson: LessonContent
  sections: Section[]
}

export function LessonLayout({ lesson, sections }: LessonLayoutProps) {
  const { progress, markComplete } = useProgress()
  const isLocked = useTabLock(lesson.meta.slug)
  const [completedSteps, setCompletedSteps] = useState<boolean[]>(
    new Array(lesson.meta.steps.length).fill(false)
  )
  const currentStep = completedSteps.findIndex((c) => !c)
  const allComplete = completedSteps.every(Boolean)

  const handleStepComplete = useCallback((stepIndex: number) => {
    setCompletedSteps((prev) => {
      const next = [...prev]
      next[stepIndex] = true
      if (next.every(Boolean)) {
        markComplete(lesson.meta.slug)
      }
      return next
    })
  }, [lesson.meta.slug, markComplete])

  const handleShellReady = useCallback(async (shell: Shell) => {
    if (lesson.meta.steps.length > 0) {
      const results = await validateAllSteps(lesson.meta.steps, shell.getFS(), '/')
      setCompletedSteps(results)
      if (results.every(Boolean)) {
        markComplete(lesson.meta.slug)
      }
    }
  }, [lesson.meta.steps, lesson.meta.slug, markComplete])

  if (isLocked) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-zinc-500">이 레슨은 다른 탭에서 이미 열려 있어요.</p>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      <div className="hidden lg:block">
        <Sidebar sections={sections} progress={progress} />
      </div>
      <div className={`flex-1 flex ${lesson.meta.hasTerminal ? 'flex-col lg:flex-row' : ''}`}>
        <GuidePanel
          html={lesson.html}
          steps={lesson.meta.steps}
          completedSteps={completedSteps}
          currentStep={currentStep === -1 ? lesson.meta.steps.length : currentStep}
        />
        {lesson.meta.hasTerminal && (
          <div className="lg:w-1/2 h-80 lg:h-full p-4">
            <TerminalPanel
              namespace={`lesson-${lesson.meta.slug}`}
              steps={lesson.meta.steps}
              currentStep={currentStep === -1 ? lesson.meta.steps.length : currentStep}
              onStepComplete={handleStepComplete}
              onReady={handleShellReady}
            />
          </div>
        )}
      </div>
    </div>
  )
}
