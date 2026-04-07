// Shell types
export interface ParsedCommand {
  command: string
  args: string[]
  redirectOp?: '>' | '>>'
  redirectTarget?: string
}

export interface CommandResult {
  output: string
  isError?: boolean
  clear?: boolean
  cwd?: string // set by cd command to update shell cwd
}

export type CommandHandler = (
  args: string[],
  context: ShellContext
) => Promise<CommandResult>

export interface ShellContext {
  fs: any // LightningFS instance
  dir: string // git repo root (always '/')
  cwd: string
  pendingMerge: { theirs: string } | null
  setPendingMerge: (merge: { theirs: string } | null) => void
}

// Validation types
export type ValidationType =
  | 'file-exists'
  | 'file-content'
  | 'git-staged'
  | 'commit-count'
  | 'branch-exists'
  | 'current-branch'
  | 'commit-message'
  | 'merge-commit'
  | 'no-conflict-markers'
  | 'remote-exists'

export interface ValidationRule {
  type: ValidationType
  path?: string
  contains?: string
  matches?: string
  min?: number
  name?: string
  pattern?: string
}

export interface LessonStep {
  id: string
  instruction: string
  hint: string
  validation: ValidationRule
}

// Content types
export interface LessonMeta {
  title: string
  slug: string
  order: number
  hasTerminal: boolean
  steps: LessonStep[]
}

export interface LessonContent {
  meta: LessonMeta
  html: string
}

export interface Section {
  id: string
  order: number
  slug: string
  title: string
  description: string
  file: string
  hasTerminal: boolean
}

export interface SectionsData {
  name: string
  description: string
  sections: Section[]
}

// Progress types
export type ProgressMap = Record<string, boolean>

// Fixture types
export interface FixtureConfig {
  version: number
  setup: (fs: any) => Promise<void>
}
