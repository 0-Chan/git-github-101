'use client'

interface GuidePanelProps {
  html: string
  steps: Array<{ id: string; instruction: string; hint: string }>
  completedSteps: boolean[]
  currentStep: number
}

export function GuidePanel({ html, steps, completedSteps, currentStep }: GuidePanelProps) {
  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div
        className="prose prose-zinc dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: html }}
      />
      {steps.length > 0 && (
        <div className="mt-8 space-y-3">
          <h3 className="text-lg font-semibold">실습</h3>
          {steps.map((step, i) => (
            <div
              key={step.id}
              className={`flex items-start gap-3 p-3 rounded-lg border ${
                i === currentStep
                  ? 'border-orange-300 dark:border-orange-700 bg-orange-50 dark:bg-orange-950'
                  : completedSteps[i]
                  ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950'
                  : 'border-zinc-200 dark:border-zinc-800'
              }`}
            >
              <span className="mt-0.5">
                {completedSteps[i] ? '✅' : i === currentStep ? '👉' : '⬜'}
              </span>
              <div>
                <p className="text-sm">{step.instruction}</p>
                {i === currentStep && (
                  <p className="text-xs text-zinc-500 mt-1 font-mono">힌트: {step.hint}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
