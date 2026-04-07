# git-github-101 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an interactive Korean web tutorial where users learn Git and GitHub basics by executing commands in a browser-based terminal powered by isomorphic-git and xterm.js.

**Architecture:** Next.js App Router with SSG for content pages. Client-side shell layer (parser → command handlers → isomorphic-git/LightningFS) rendered in xterm.js terminal. Validation system checks learner progress per step. Design follows cc101.axwith.com patterns (Geist fonts, orange accent, zinc scale, dark mode).

**Tech Stack:** Next.js 15+, TypeScript, Tailwind CSS v4, isomorphic-git, @isomorphic-git/lightning-fs, xterm.js, remark, remark-html, gray-matter, diff, Vitest, Playwright

**Spec:** `docs/superpowers/specs/2026-04-07-git-github-101-design.md`

**Testing rules:**
- TDD with unit/integration tests (Vitest) for all logic
- E2E tests (Playwright) are a separate final verification layer, NOT used for TDD
- `fake-indexeddb` for LightningFS tests in Node environment

---

## File Structure

```
src/
├── app/
│   ├── layout.tsx                    # Root layout: Geist fonts, metadata, ThemeProvider
│   ├── page.tsx                      # Landing page: Hero + lesson list
│   ├── globals.css                   # Tailwind v4 imports + custom scrollbar/prose styles
│   └── lessons/[slug]/
│       └── page.tsx                  # Lesson page: SSG, loads content, renders client layout
├── components/
│   ├── Nav.tsx                       # Header: logo, ThemeToggle
│   ├── Footer.tsx                    # Footer
│   ├── ThemeToggle.tsx               # Sun/moon toggle, localStorage persist
│   ├── Sidebar.tsx                   # TOC: lesson list, active highlight, progress checkmarks
│   ├── Hero.tsx                      # Landing hero: typewriter terminal animation
│   ├── LessonLayout.tsx              # Client wrapper: sidebar + guide + terminal split
│   ├── GuidePanel.tsx                # Renders lesson HTML + step progress UI
│   └── TerminalPanel.tsx             # xterm.js wrapper (client-only, dynamic import)
├── lib/
│   ├── content.ts                    # Server-only: gray-matter + remark MD parsing
│   ├── shell/
│   │   ├── parser.ts                 # Pure function: string → ParsedCommand
│   │   ├── filesystem.ts             # LightningFS wrapper: create/destroy/resolve paths
│   │   ├── commands/
│   │   │   ├── fs.ts                 # FS commands: ls, cat, mkdir, touch, echo, cd, pwd, clear, 도움말
│   │   │   ├── git.ts                # Git commands: init, add, status, commit, log, branch, checkout, merge, diff, remote, push
│   │   │   └── index.ts              # Command registry: routes parsed commands to handlers
│   │   └── Shell.ts                  # Orchestrator: cwd state, pendingMerge, execute pipeline
│   ├── validation.ts                 # 10 validator types, runValidation(), restoreProgress()
│   ├── fixtures.ts                   # Per-lesson setup() functions with version tracking
│   └── progress.ts                   # localStorage progress read/write + BroadcastChannel tab lock
├── hooks/
│   ├── useProgress.ts                # React hook for progress state
│   └── useTabLock.ts                 # React hook for BroadcastChannel tab locking
└── types/
    └── index.ts                      # All TypeScript interfaces

content/
├── sections.json                     # Lesson metadata array
└── lessons/
    ├── 01-what-is-git.md             # hasTerminal: false
    ├── 02-first-repo.md
    ├── 03-first-commit.md
    ├── 04-commit-history.md
    ├── 05-modify-and-diff.md
    ├── 06-branches.md
    ├── 07-merge.md
    ├── 08-merge-conflict.md
    ├── 09-what-is-github.md          # hasTerminal: false
    ├── 10-remote.md
    └── 11-pull-request.md            # hasTerminal: false

public/
└── theme-init.js                     # Sync dark mode init (beforeInteractive)

tests/
├── unit/
│   ├── parser.test.ts
│   ├── filesystem.test.ts
│   ├── commands-fs.test.ts
│   ├── commands-git.test.ts
│   ├── validation.test.ts
│   └── fixtures.test.ts
├── integration/
│   └── shell.test.ts
└── e2e/
    ├── navigation.spec.ts
    ├── terminal.spec.ts
    └── lesson-flow.spec.ts
```

---

## Phase 1: Foundation

### Task 1: Project Scaffolding

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `vitest.config.ts`, `playwright.config.ts`, `src/app/layout.tsx`, `src/app/globals.css`, `src/app/page.tsx`, `public/theme-init.js`
- Note: Tailwind CSS v4 uses CSS-based config (`@import 'tailwindcss'` in globals.css), no separate `tailwind.config.ts` needed

- [ ] **Step 1: Initialize Next.js project**

```bash
cd /Users/0-chan/workspace/personal/tutor/git-github-101/main
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-pnpm --yes
```

- [ ] **Step 2: Install dependencies**

```bash
pnpm add isomorphic-git @isomorphic-git/lightning-fs @xterm/xterm @xterm/addon-fit gray-matter remark remark-html remark-gfm diff
pnpm add -D vitest @vitejs/plugin-react jsdom fake-indexeddb @testing-library/react @testing-library/jest-dom @playwright/test @types/diff
```

- [ ] **Step 3: Configure Vitest**

Create `vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

Create `tests/setup.ts`:

```typescript
import 'fake-indexeddb/auto'
```

- [ ] **Step 4: Configure Playwright**

Create `playwright.config.ts`:

```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  webServer: {
    command: 'pnpm dev',
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
  use: {
    baseURL: 'http://localhost:3000',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['iPhone 13'] } },
  ],
})
```

- [ ] **Step 5: Configure Next.js for gray-matter**

Update `next.config.ts`:

```typescript
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  serverExternalPackages: ['gray-matter'],
}

export default nextConfig
```

- [ ] **Step 6: Create theme-init.js**

Create `public/theme-init.js`:

```javascript
(function () {
  var theme = localStorage.getItem('theme')
  if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark')
  }
})()
```

- [ ] **Step 7: Set up root layout with Geist fonts**

Update `src/app/layout.tsx`:

```tsx
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import Script from 'next/script'
import './globals.css'

const geistSans = Geist({ subsets: ['latin'], variable: '--font-geist-sans' })
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' })

export const metadata: Metadata = {
  title: 'Git & GitHub 101',
  description: '브라우저에서 배우는 Git & GitHub 입문',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <Script src="/theme-init.js" strategy="beforeInteractive" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100`}>
        {children}
      </body>
    </html>
  )
}
```

- [ ] **Step 8: Set up globals.css with Tailwind v4**

Update `src/app/globals.css`:

```css
@import 'tailwindcss';

:root {
  --color-accent: #f97316;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-thumb {
  background: #a1a1aa;
  border-radius: 3px;
}

.dark ::-webkit-scrollbar-thumb {
  background: #52525b;
}

/* Prose code inline */
.prose code:not(pre code) {
  background: #fff7ed;
  color: #ea580c;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-size: 0.875em;
}

.dark .prose code:not(pre code) {
  background: #431407;
  color: #fb923c;
}
```

- [ ] **Step 9: Create placeholder landing page**

Update `src/app/page.tsx`:

```tsx
export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <h1 className="text-4xl font-bold">Git & GitHub 101</h1>
    </main>
  )
}
```

- [ ] **Step 10: Verify setup**

```bash
pnpm dev &
sleep 3
curl -s http://localhost:3000 | head -20
kill %1
pnpm vitest run
```

Expected: Dev server boots, no test failures (0 tests).

- [ ] **Step 11: Add npm scripts to package.json**

Add to `package.json` scripts:

```json
{
  "test": "vitest run",
  "test:watch": "vitest",
  "test:e2e": "playwright test"
}
```

- [ ] **Step 12: Commit**

```bash
git add .
git commit -m "chore: scaffold Next.js project with all dependencies"
```

---

## Phase 2: Types & Static Content Metadata

### Task 2: TypeScript Interfaces

**Files:**
- Create: `src/types/index.ts`

- [ ] **Step 1: Define all types**

```typescript
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
```

- [ ] **Step 2: Commit**

```bash
git add src/types/index.ts
git commit -m "feat: define TypeScript interfaces for shell, validation, content, and progress"
```

---

### Task 3: Content Metadata (sections.json)

**Files:**
- Create: `content/sections.json`

- [ ] **Step 1: Create sections.json with all 11 lessons**

```json
{
  "name": "git-github-101",
  "description": "브라우저에서 배우는 Git & GitHub 입문",
  "sections": [
    {
      "id": "01-what-is-git",
      "order": 1,
      "slug": "what-is-git",
      "title": "Git이란?",
      "description": "버전 관리 시스템의 개념과 Git이 필요한 이유를 알아봅니다",
      "file": "01-what-is-git.md",
      "hasTerminal": false
    },
    {
      "id": "02-first-repo",
      "order": 2,
      "slug": "first-repo",
      "title": "첫 번째 저장소",
      "description": "git init으로 첫 번째 저장소를 만들어봅니다",
      "file": "02-first-repo.md",
      "hasTerminal": true
    },
    {
      "id": "03-first-commit",
      "order": 3,
      "slug": "first-commit",
      "title": "첫 번째 커밋",
      "description": "파일을 만들고 첫 번째 커밋을 해봅니다",
      "file": "03-first-commit.md",
      "hasTerminal": true
    },
    {
      "id": "04-commit-history",
      "order": 4,
      "slug": "commit-history",
      "title": "커밋 히스토리",
      "description": "커밋 기록을 확인하고 메시지 작성법을 배웁니다",
      "file": "04-commit-history.md",
      "hasTerminal": true
    },
    {
      "id": "05-modify-and-diff",
      "order": 5,
      "slug": "modify-and-diff",
      "title": "수정과 비교",
      "description": "파일을 수정하고 변경사항을 비교해봅니다",
      "file": "05-modify-and-diff.md",
      "hasTerminal": true
    },
    {
      "id": "06-branches",
      "order": 6,
      "slug": "branches",
      "title": "브랜치",
      "description": "브랜치를 만들고 전환하는 방법을 배웁니다",
      "file": "06-branches.md",
      "hasTerminal": true
    },
    {
      "id": "07-merge",
      "order": 7,
      "slug": "merge",
      "title": "머지",
      "description": "브랜치를 합치는 다양한 방법을 배웁니다",
      "file": "07-merge.md",
      "hasTerminal": true
    },
    {
      "id": "08-merge-conflict",
      "order": 8,
      "slug": "merge-conflict",
      "title": "충돌 해결",
      "description": "머지 충돌이 발생했을 때 해결하는 방법을 배웁니다",
      "file": "08-merge-conflict.md",
      "hasTerminal": true
    },
    {
      "id": "09-what-is-github",
      "order": 9,
      "slug": "what-is-github",
      "title": "GitHub란?",
      "description": "원격 저장소와 GitHub의 개념을 알아봅니다",
      "file": "09-what-is-github.md",
      "hasTerminal": false
    },
    {
      "id": "10-remote",
      "order": 10,
      "slug": "remote",
      "title": "원격 저장소",
      "description": "원격 저장소를 연결하고 push하는 방법을 배웁니다",
      "file": "10-remote.md",
      "hasTerminal": true
    },
    {
      "id": "11-pull-request",
      "order": 11,
      "slug": "pull-request",
      "title": "Pull Request",
      "description": "PR을 통한 코드 리뷰 워크플로우를 알아봅니다",
      "file": "11-pull-request.md",
      "hasTerminal": false
    }
  ]
}
```

- [ ] **Step 2: Commit**

```bash
git add content/sections.json
git commit -m "feat: add sections.json with all 11 lesson metadata entries"
```

---

## Phase 3: Core Logic Modules (parallel-safe, no cross-deps)

### Task 4: Shell Parser

**Files:**
- Create: `src/lib/shell/parser.ts`
- Test: `tests/unit/parser.test.ts`

- [ ] **Step 1: Write failing tests for parser**

```typescript
import { describe, it, expect } from 'vitest'
import { parseCommand } from '@/lib/shell/parser'

describe('parseCommand', () => {
  it('parses simple command', () => {
    expect(parseCommand('ls')).toEqual({
      command: 'ls', args: [],
    })
  })

  it('parses command with args', () => {
    expect(parseCommand('git init')).toEqual({
      command: 'git', args: ['init'],
    })
  })

  it('parses git commit with quoted message', () => {
    expect(parseCommand('git commit -m "hello world"')).toEqual({
      command: 'git', args: ['commit', '-m', 'hello world'],
    })
  })

  it('parses single-quoted strings', () => {
    expect(parseCommand("echo 'hello world'")).toEqual({
      command: 'echo', args: ['hello world'],
    })
  })

  it('parses redirect operator >', () => {
    expect(parseCommand('echo "hello" > file.txt')).toEqual({
      command: 'echo', args: ['hello'],
      redirectOp: '>', redirectTarget: 'file.txt',
    })
  })

  it('parses append operator >>', () => {
    expect(parseCommand('echo "more" >> file.txt')).toEqual({
      command: 'echo', args: ['more'],
      redirectOp: '>>', redirectTarget: 'file.txt',
    })
  })

  it('parses Korean command', () => {
    expect(parseCommand('도움말')).toEqual({
      command: '도움말', args: [],
    })
  })

  it('handles extra whitespace', () => {
    expect(parseCommand('  git   add   file.txt  ')).toEqual({
      command: 'git', args: ['add', 'file.txt'],
    })
  })

  it('returns null for empty input', () => {
    expect(parseCommand('')).toBeNull()
    expect(parseCommand('   ')).toBeNull()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm vitest run tests/unit/parser.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement parser**

```typescript
import type { ParsedCommand } from '@/types'

export function parseCommand(input: string): ParsedCommand | null {
  const trimmed = input.trim()
  if (!trimmed) return null

  const tokens: string[] = []
  let current = ''
  let inQuote: string | null = null

  for (let i = 0; i < trimmed.length; i++) {
    const ch = trimmed[i]

    if (inQuote) {
      if (ch === inQuote) {
        inQuote = null
      } else {
        current += ch
      }
    } else if (ch === '"' || ch === "'") {
      inQuote = ch
    } else if (ch === ' ' || ch === '\t') {
      if (current) {
        tokens.push(current)
        current = ''
      }
    } else {
      current += ch
    }
  }
  if (current) tokens.push(current)
  if (tokens.length === 0) return null

  // Detect redirect operators
  let redirectOp: '>' | '>>' | undefined
  let redirectTarget: string | undefined

  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i] === '>>' || tokens[i] === '>') {
      redirectOp = tokens[i] as '>' | '>>'
      redirectTarget = tokens[i + 1]
      tokens.splice(i) // remove redirect and everything after
      break
    }
  }

  const [command, ...args] = tokens
  return { command, args, ...(redirectOp && { redirectOp, redirectTarget }) }
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm vitest run tests/unit/parser.test.ts
```

Expected: All tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/shell/parser.ts tests/unit/parser.test.ts
git commit -m "feat: implement shell command parser with quote and redirect support"
```

---

### Task 5: Filesystem Layer (LightningFS wrapper)

**Files:**
- Create: `src/lib/shell/filesystem.ts`
- Test: `tests/unit/filesystem.test.ts`

- [ ] **Step 1: Write failing tests**

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { createFS, destroyFS, resolvePath } from '@/lib/shell/filesystem'

describe('resolvePath', () => {
  it('resolves absolute path as-is', () => {
    expect(resolvePath('/', '/hello.txt')).toBe('/hello.txt')
  })

  it('resolves relative path against cwd', () => {
    expect(resolvePath('/src', 'file.txt')).toBe('/src/file.txt')
  })

  it('resolves .. correctly', () => {
    expect(resolvePath('/src/lib', '../file.txt')).toBe('/src/file.txt')
  })

  it('resolves . correctly', () => {
    expect(resolvePath('/src', './file.txt')).toBe('/src/file.txt')
  })

  it('normalizes trailing slash', () => {
    expect(resolvePath('/', 'src/')).toBe('/src')
  })
})

describe('createFS / destroyFS', () => {
  it('creates a filesystem instance', () => {
    const fs = createFS('test-ns')
    expect(fs).toBeDefined()
    expect(typeof fs.promises.readdir).toBe('function')
  })

  it('destroys filesystem data', async () => {
    const fs = createFS('test-destroy')
    await fs.promises.writeFile('/test.txt', 'hello')
    await destroyFS('test-destroy')
    const fs2 = createFS('test-destroy')
    await expect(fs2.promises.readFile('/test.txt', 'utf8')).rejects.toThrow()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm vitest run tests/unit/filesystem.test.ts
```

- [ ] **Step 3: Implement filesystem wrapper**

```typescript
import LightningFS from '@isomorphic-git/lightning-fs'

export function createFS(namespace: string): any {
  return new LightningFS(namespace)
}

export async function destroyFS(namespace: string): Promise<void> {
  const fs = new LightningFS(namespace)
  fs.init(namespace, { wipe: true })
}

export function resolvePath(cwd: string, target: string): string {
  if (target.startsWith('/')) {
    return normalizePath(target)
  }

  const parts = cwd.split('/').filter(Boolean)
  const targetParts = target.split('/').filter(Boolean)

  for (const part of targetParts) {
    if (part === '..') {
      parts.pop()
    } else if (part !== '.') {
      parts.push(part)
    }
  }

  return '/' + parts.join('/')
}

function normalizePath(p: string): string {
  const parts = p.split('/').filter(Boolean)
  const resolved: string[] = []
  for (const part of parts) {
    if (part === '..') resolved.pop()
    else if (part !== '.') resolved.push(part)
  }
  return '/' + resolved.join('/')
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm vitest run tests/unit/filesystem.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/shell/filesystem.ts tests/unit/filesystem.test.ts
git commit -m "feat: implement LightningFS wrapper with path resolution"
```

---

### Task 6: Content Loader

**Files:**
- Create: `src/lib/content.ts`
- Test: `tests/unit/content.test.ts`
- Create: `content/lessons/01-what-is-git.md` (minimal placeholder for testing)

- [ ] **Step 1: Create minimal test MD file**

Create `content/lessons/01-what-is-git.md`:

```markdown
---
title: "Git이란?"
slug: what-is-git
order: 1
hasTerminal: false
steps: []
---

## 버전 관리란?

버전 관리는 파일의 변경 이력을 추적하는 시스템입니다.
```

- [ ] **Step 2: Write failing tests**

```typescript
import { describe, it, expect } from 'vitest'
import { getAllLessons, getLessonBySlug } from '@/lib/content'

describe('getAllLessons', () => {
  it('returns sorted lesson metadata', () => {
    const lessons = getAllLessons()
    expect(lessons.length).toBeGreaterThan(0)
    expect(lessons[0].slug).toBe('what-is-git')
    expect(lessons[0].order).toBe(1)
  })
})

describe('getLessonBySlug', () => {
  it('returns lesson content with parsed HTML', () => {
    const lesson = getLessonBySlug('what-is-git')
    expect(lesson).not.toBeNull()
    expect(lesson!.meta.title).toBe('Git이란?')
    expect(lesson!.meta.hasTerminal).toBe(false)
    expect(lesson!.html).toContain('버전 관리')
  })

  it('returns null for nonexistent slug', () => {
    expect(getLessonBySlug('nonexistent')).toBeNull()
  })
})
```

- [ ] **Step 3: Run test to verify it fails**

```bash
pnpm vitest run tests/unit/content.test.ts
```

- [ ] **Step 4: Implement content loader**

```typescript
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import html from 'remark-html'
import remarkGfm from 'remark-gfm'
import type { LessonMeta, LessonContent, SectionsData } from '@/types'

const contentDir = path.join(process.cwd(), 'content/lessons')
const sectionsPath = path.join(process.cwd(), 'content/sections.json')

export function getSections(): SectionsData {
  const raw = fs.readFileSync(sectionsPath, 'utf8')
  return JSON.parse(raw)
}

export function getAllLessons(): LessonMeta[] {
  const files = fs.readdirSync(contentDir).filter((f) => f.endsWith('.md'))
  return files
    .map((file) => {
      const raw = fs.readFileSync(path.join(contentDir, file), 'utf8')
      const { data } = matter(raw)
      return data as LessonMeta
    })
    .sort((a, b) => a.order - b.order)
}

export function getLessonBySlug(slug: string): LessonContent | null {
  const sections = getSections()
  const section = sections.sections.find((s) => s.slug === slug)
  if (!section) return null

  const filePath = path.join(contentDir, section.file)
  if (!fs.existsSync(filePath)) return null

  const raw = fs.readFileSync(filePath, 'utf8')
  const { data, content } = matter(raw)

  const processed = remark().use(remarkGfm).use(html).processSync(content)

  return {
    meta: data as LessonMeta,
    html: processed.toString(),
  }
}
```

- [ ] **Step 5: Run test to verify it passes**

```bash
pnpm vitest run tests/unit/content.test.ts
```

- [ ] **Step 6: Commit**

```bash
git add src/lib/content.ts tests/unit/content.test.ts content/lessons/01-what-is-git.md
git commit -m "feat: implement content loader with gray-matter and remark"
```

---

## Phase 4: Command Handlers (parallel-safe)

### Task 7: Filesystem Commands

**Files:**
- Create: `src/lib/shell/commands/fs.ts`
- Test: `tests/unit/commands-fs.test.ts`

- [ ] **Step 1: Write failing tests**

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { createFS } from '@/lib/shell/filesystem'
import { fsCommands } from '@/lib/shell/commands/fs'
import type { ShellContext } from '@/types'

function makeContext(fs: any, cwd = '/'): ShellContext {
  return {
    fs,
    dir: '/',
    cwd,
    pendingMerge: null,
    setPendingMerge: () => {},
  }
}

describe('fs commands', () => {
  let fs: any
  let ctx: ShellContext

  beforeEach(() => {
    fs = createFS(`test-fs-${Math.random()}`)
    ctx = makeContext(fs)
  })

  describe('touch', () => {
    it('creates an empty file', async () => {
      const result = await fsCommands.touch(['hello.txt'], ctx)
      expect(result.output).toBe('')
      const content = await fs.promises.readFile('/hello.txt', 'utf8')
      expect(content).toBe('')
    })
  })

  describe('ls', () => {
    it('lists files in directory', async () => {
      await fs.promises.writeFile('/a.txt', 'a')
      await fs.promises.writeFile('/b.txt', 'b')
      const result = await fsCommands.ls([], ctx)
      expect(result.output).toContain('a.txt')
      expect(result.output).toContain('b.txt')
    })
  })

  describe('cat', () => {
    it('reads file content', async () => {
      await fs.promises.writeFile('/hello.txt', 'world')
      const result = await fsCommands.cat(['hello.txt'], ctx)
      expect(result.output).toBe('world')
    })

    it('errors on nonexistent file', async () => {
      const result = await fsCommands.cat(['nope.txt'], ctx)
      expect(result.isError).toBe(true)
    })
  })

  describe('mkdir', () => {
    it('creates directory', async () => {
      await fsCommands.mkdir(['mydir'], ctx)
      const stat = await fs.promises.stat('/mydir')
      expect(stat.isDirectory()).toBe(true)
    })
  })

  describe('pwd', () => {
    it('returns current directory', async () => {
      const result = await fsCommands.pwd([], { ...ctx, cwd: '/src/lib' })
      expect(result.output).toBe('/src/lib')
    })
  })

  describe('echo with redirect', () => {
    it('is handled at Shell level, not here', () => {
      // echo redirect is handled by Shell.ts, not by fsCommands
      expect(true).toBe(true)
    })
  })

  describe('도움말', () => {
    it('returns help text', async () => {
      const result = await fsCommands['도움말']([], ctx)
      expect(result.output).toContain('ls')
      expect(result.output).toContain('git')
    })
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm vitest run tests/unit/commands-fs.test.ts
```

- [ ] **Step 3: Implement FS commands**

```typescript
import type { CommandResult, ShellContext } from '@/types'
import { resolvePath } from '../filesystem'

type FsCommandHandler = (args: string[], ctx: ShellContext) => Promise<CommandResult>

export const fsCommands: Record<string, FsCommandHandler> = {
  ls: async (args, ctx) => {
    const target = args[0] ? resolvePath(ctx.cwd, args[0]) : ctx.cwd
    try {
      const entries = await ctx.fs.promises.readdir(target)
      return { output: entries.join('  ') }
    } catch {
      return { output: `ls: cannot access '${args[0] || target}': No such file or directory`, isError: true }
    }
  },

  cat: async (args, ctx) => {
    if (!args[0]) return { output: 'cat: missing file operand', isError: true }
    const filePath = resolvePath(ctx.cwd, args[0])
    try {
      const content = await ctx.fs.promises.readFile(filePath, 'utf8')
      return { output: content }
    } catch {
      return { output: `cat: ${args[0]}: No such file or directory`, isError: true }
    }
  },

  mkdir: async (args, ctx) => {
    if (!args[0]) return { output: 'mkdir: missing operand', isError: true }
    const dirPath = resolvePath(ctx.cwd, args[0])
    try {
      await ctx.fs.promises.mkdir(dirPath)
      return { output: '' }
    } catch {
      return { output: `mkdir: cannot create directory '${args[0]}': File exists`, isError: true }
    }
  },

  touch: async (args, ctx) => {
    if (!args[0]) return { output: 'touch: missing file operand', isError: true }
    const filePath = resolvePath(ctx.cwd, args[0])
    try {
      await ctx.fs.promises.readFile(filePath)
    } catch {
      await ctx.fs.promises.writeFile(filePath, '')
    }
    return { output: '' }
  },

  echo: async (args) => {
    // Standalone echo (no redirect) — just output the text
    return { output: args.join(' ') }
  },

  cd: async (args, ctx) => {
    if (!args[0] || args[0] === '~') return { output: '', cwd: '/' }
    const target = resolvePath(ctx.cwd, args[0])
    try {
      const stat = await ctx.fs.promises.stat(target)
      if (!stat.isDirectory()) {
        return { output: `cd: not a directory: ${args[0]}`, isError: true }
      }
      return { output: '', cwd: target }
    } catch {
      return { output: `cd: no such file or directory: ${args[0]}`, isError: true }
    }
  },

  pwd: async (_args, ctx) => {
    return { output: ctx.cwd }
  },

  clear: async () => {
    return { output: '', clear: true }
  },

  '도움말': async () => {
    const help = [
      '사용 가능한 명령어:',
      '',
      '📁 파일 시스템:',
      '  ls [경로]              디렉토리 내용 나열',
      '  cat <파일>             파일 내용 출력',
      '  mkdir <디렉토리>       디렉토리 생성',
      '  touch <파일>           빈 파일 생성',
      '  echo "텍스트" > 파일   파일에 쓰기',
      '  echo "텍스트" >> 파일  파일에 추가',
      '  cd <디렉토리>          작업 디렉토리 변경',
      '  pwd                    현재 디렉토리 출력',
      '  clear                  화면 지우기',
      '',
      '🔧 Git:',
      '  git init               저장소 초기화',
      '  git add <파일>         스테이징',
      '  git status             상태 확인',
      '  git commit -m "메시지" 커밋',
      '  git log                커밋 히스토리',
      '  git branch <이름>      브랜치 생성',
      '  git checkout <브랜치>  브랜치 전환',
      '  git merge <브랜치>     브랜치 머지',
      '  git diff               변경사항 비교',
      '  git remote add <이름> <URL>  원격 저장소 추가',
      '  git push <원격> <브랜치>     푸시 (시뮬레이션)',
    ].join('\n')
    return { output: help }
  },
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm vitest run tests/unit/commands-fs.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/shell/commands/fs.ts tests/unit/commands-fs.test.ts
git commit -m "feat: implement filesystem commands (ls, cat, mkdir, touch, cd, pwd, clear, 도움말)"
```

---

### Task 8: Git Commands

**Files:**
- Create: `src/lib/shell/commands/git.ts`
- Test: `tests/unit/commands-git.test.ts`

- [ ] **Step 1: Write failing tests for core git commands**

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { createFS } from '@/lib/shell/filesystem'
import { gitCommands } from '@/lib/shell/commands/git'
import type { ShellContext } from '@/types'
import git from 'isomorphic-git'

function makeContext(fs: any): ShellContext {
  let pendingMerge: { theirs: string } | null = null
  return {
    fs,
    dir: '/',
    cwd: '/',
    get pendingMerge() { return pendingMerge },
    setPendingMerge: (m) => { pendingMerge = m },
  }
}

describe('git commands', () => {
  let fs: any
  let ctx: ShellContext

  beforeEach(() => {
    fs = createFS(`test-git-${Math.random()}`)
    ctx = makeContext(fs)
  })

  describe('git init', () => {
    it('initializes a repo with main branch', async () => {
      const result = await gitCommands.init([], ctx)
      expect(result.output).toContain('Initialized')
      const branches = await git.listBranches({ fs, dir: '/' })
      expect(branches).toContain('main')
    })
  })

  describe('git add + git status', () => {
    it('shows staged file', async () => {
      await git.init({ fs, dir: '/', defaultBranch: 'main' })
      await fs.promises.writeFile('/hello.txt', 'hello')
      await gitCommands.add(['hello.txt'], ctx)
      const result = await gitCommands.status([], ctx)
      expect(result.output).toContain('hello.txt')
    })
  })

  describe('git commit', () => {
    it('creates a commit', async () => {
      await git.init({ fs, dir: '/', defaultBranch: 'main' })
      await git.setConfig({ fs, dir: '/', path: 'user.name', value: '학습자' })
      await git.setConfig({ fs, dir: '/', path: 'user.email', value: 'learner@git101.dev' })
      await fs.promises.writeFile('/hello.txt', 'hello')
      await git.add({ fs, dir: '/', filepath: 'hello.txt' })
      const result = await gitCommands.commit(['-m', '첫 번째 커밋'], ctx)
      expect(result.output).toContain('첫 번째 커밋')
      const log = await git.log({ fs, dir: '/' })
      expect(log).toHaveLength(1)
    })
  })

  describe('git log', () => {
    it('shows commit history', async () => {
      await git.init({ fs, dir: '/', defaultBranch: 'main' })
      await git.setConfig({ fs, dir: '/', path: 'user.name', value: '학습자' })
      await git.setConfig({ fs, dir: '/', path: 'user.email', value: 'learner@git101.dev' })
      await fs.promises.writeFile('/file.txt', 'content')
      await git.add({ fs, dir: '/', filepath: 'file.txt' })
      await git.commit({ fs, dir: '/', message: 'test commit', author: { name: '학습자', email: 'learner@git101.dev' } })
      const result = await gitCommands.log([], ctx)
      expect(result.output).toContain('test commit')
    })
  })

  describe('git branch', () => {
    it('creates a new branch', async () => {
      await git.init({ fs, dir: '/', defaultBranch: 'main' })
      await git.setConfig({ fs, dir: '/', path: 'user.name', value: '학습자' })
      await git.setConfig({ fs, dir: '/', path: 'user.email', value: 'learner@git101.dev' })
      await fs.promises.writeFile('/f.txt', 'x')
      await git.add({ fs, dir: '/', filepath: 'f.txt' })
      await git.commit({ fs, dir: '/', message: 'init', author: { name: '학습자', email: 'learner@git101.dev' } })
      await gitCommands.branch(['feature'], ctx)
      const branches = await git.listBranches({ fs, dir: '/' })
      expect(branches).toContain('feature')
    })
  })

  describe('git checkout', () => {
    it('switches branch', async () => {
      await git.init({ fs, dir: '/', defaultBranch: 'main' })
      await git.setConfig({ fs, dir: '/', path: 'user.name', value: '학습자' })
      await git.setConfig({ fs, dir: '/', path: 'user.email', value: 'learner@git101.dev' })
      await fs.promises.writeFile('/f.txt', 'x')
      await git.add({ fs, dir: '/', filepath: 'f.txt' })
      await git.commit({ fs, dir: '/', message: 'init', author: { name: '학습자', email: 'learner@git101.dev' } })
      await git.branch({ fs, dir: '/', ref: 'dev' })
      const result = await gitCommands.checkout(['dev'], ctx)
      expect(result.output).toContain('dev')
      const current = await git.currentBranch({ fs, dir: '/' })
      expect(current).toBe('dev')
    })
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm vitest run tests/unit/commands-git.test.ts
```

- [ ] **Step 3: Implement git commands**

Create `src/lib/shell/commands/git.ts` with handlers for all git subcommands:

- `init`: calls `git.init({ defaultBranch: 'main' })`, then sets `user.name`/`user.email` config
- `add`: calls `git.add()` with resolved filepath
- `status`: calls `git.statusMatrix()`, formats output like real `git status`
- `commit`: reads author from config, handles `-m` flag, handles `pendingMerge` for two-parent commits
- `log`: calls `git.log()`, formats output with hash, author, date, message
- `branch`: with no args lists branches, with arg creates branch
- `checkout`: calls `git.checkout()`, handles `-b` flag for create+switch
- `merge`: calls `git.merge()` with `abortOnConflict: false`, sets `pendingMerge` on conflict
- `diff`: uses `statusMatrix()` + `readBlob()` + `diff` package for unified diff output
- `remote`: handles `add` subcommand via `git.setConfig()`
- `push`: outputs simulation text

Each handler should include Korean hint messages for common errors.

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm vitest run tests/unit/commands-git.test.ts
```

- [ ] **Step 5: Add tests for merge conflict flow**

```typescript
describe('git merge with conflict', () => {
  it('sets pendingMerge on conflict', async () => {
    // Setup: init, commit on main, create branch, modify same file differently
    await git.init({ fs, dir: '/', defaultBranch: 'main' })
    await git.setConfig({ fs, dir: '/', path: 'user.name', value: '학습자' })
    await git.setConfig({ fs, dir: '/', path: 'user.email', value: 'learner@git101.dev' })

    // Commit on main
    await fs.promises.writeFile('/file.txt', 'original')
    await git.add({ fs, dir: '/', filepath: 'file.txt' })
    await git.commit({ fs, dir: '/', message: 'initial', author: { name: '학습자', email: 'learner@git101.dev' } })

    // Create feature branch and modify
    await git.branch({ fs, dir: '/', ref: 'feature' })
    await git.checkout({ fs, dir: '/', ref: 'feature' })
    await fs.promises.writeFile('/file.txt', 'feature change')
    await git.add({ fs, dir: '/', filepath: 'file.txt' })
    await git.commit({ fs, dir: '/', message: 'feature', author: { name: '학습자', email: 'learner@git101.dev' } })

    // Back to main and modify same file
    await git.checkout({ fs, dir: '/', ref: 'main' })
    await fs.promises.writeFile('/file.txt', 'main change')
    await git.add({ fs, dir: '/', filepath: 'file.txt' })
    await git.commit({ fs, dir: '/', message: 'main change', author: { name: '학습자', email: 'learner@git101.dev' } })

    // Merge should conflict
    const result = await gitCommands.merge(['feature'], ctx)
    expect(result.output).toContain('CONFLICT')
    expect(ctx.pendingMerge).not.toBeNull()
  })
})
```

- [ ] **Step 6: Run and verify**

```bash
pnpm vitest run tests/unit/commands-git.test.ts
```

- [ ] **Step 7: Commit**

```bash
git add src/lib/shell/commands/git.ts tests/unit/commands-git.test.ts
git commit -m "feat: implement git commands with isomorphic-git (init, add, status, commit, log, branch, checkout, merge, diff, remote, push)"
```

---

### Task 9: Command Registry

**Files:**
- Create: `src/lib/shell/commands/index.ts`
- Test: `tests/unit/commands-registry.test.ts`

- [ ] **Step 1: Write failing tests for command routing**

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { createFS } from '@/lib/shell/filesystem'
import { executeCommand } from '@/lib/shell/commands'
import type { ShellContext, ParsedCommand } from '@/types'

function makeContext(fs: any): ShellContext {
  return {
    fs, dir: '/', cwd: '/',
    pendingMerge: null,
    setPendingMerge: () => {},
  }
}

describe('executeCommand', () => {
  let ctx: ShellContext

  beforeEach(() => {
    ctx = makeContext(createFS(`test-registry-${Math.random()}`))
  })

  it('routes git subcommands', async () => {
    const result = await executeCommand({ command: 'git', args: ['init'] }, ctx)
    expect(result.output).toContain('Initialized')
  })

  it('routes fs commands', async () => {
    const result = await executeCommand({ command: 'pwd', args: [] }, ctx)
    expect(result.output).toBe('/')
  })

  it('returns error for unknown git subcommand', async () => {
    const result = await executeCommand({ command: 'git', args: ['rebase'] }, ctx)
    expect(result.isError).toBe(true)
    expect(result.output).toContain('is not a git command')
  })

  it('returns Korean error for unknown command', async () => {
    const result = await executeCommand({ command: 'wget', args: [] }, ctx)
    expect(result.isError).toBe(true)
    expect(result.output).toContain('지원하지 않')
  })

  it('returns error for bare git with no subcommand', async () => {
    const result = await executeCommand({ command: 'git', args: [] }, ctx)
    expect(result.isError).toBe(true)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm vitest run tests/unit/commands-registry.test.ts
```

- [ ] **Step 3: Create command registry**

```typescript
import type { CommandHandler, ParsedCommand, ShellContext, CommandResult } from '@/types'
import { fsCommands } from './fs'
import { gitCommands } from './git'

export async function executeCommand(
  parsed: ParsedCommand,
  ctx: ShellContext
): Promise<CommandResult> {
  // Handle git subcommands
  if (parsed.command === 'git') {
    const subcommand = parsed.args[0]
    if (!subcommand) {
      return { output: 'usage: git <command> [<args>]', isError: true }
    }
    const handler = gitCommands[subcommand]
    if (!handler) {
      return {
        output: `git: '${subcommand}' is not a git command.\n💡 '도움말'을 입력하면 사용 가능한 명령어를 볼 수 있어요.`,
        isError: true,
      }
    }
    return handler(parsed.args.slice(1), ctx)
  }

  // Handle filesystem commands
  const fsHandler = fsCommands[parsed.command]
  if (fsHandler) {
    return fsHandler(parsed.args, ctx)
  }

  return {
    output: `이 명령어는 아직 지원하지 않아요.\n💡 '도움말'을 입력하면 사용 가능한 명령어를 볼 수 있어요.`,
    isError: true,
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm vitest run tests/unit/commands-registry.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/shell/commands/index.ts tests/unit/commands-registry.test.ts
git commit -m "feat: add command registry routing git and fs commands"
```

---

## Phase 5: Validation System

### Task 10: Validation

**Files:**
- Create: `src/lib/validation.ts`
- Test: `tests/unit/validation.test.ts`

- [ ] **Step 1: Write failing tests**

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { createFS } from '@/lib/shell/filesystem'
import { runValidation } from '@/lib/validation'
import git from 'isomorphic-git'
import type { ValidationRule } from '@/types'

describe('runValidation', () => {
  let fs: any

  beforeEach(async () => {
    fs = createFS(`test-validation-${Math.random()}`)
    await git.init({ fs, dir: '/', defaultBranch: 'main' })
    await git.setConfig({ fs, dir: '/', path: 'user.name', value: '학습자' })
    await git.setConfig({ fs, dir: '/', path: 'user.email', value: 'learner@git101.dev' })
  })

  it('file-exists: passes when file exists', async () => {
    await fs.promises.writeFile('/hello.txt', 'hello')
    const result = await runValidation({ type: 'file-exists', path: '/hello.txt' }, fs, '/')
    expect(result).toBe(true)
  })

  it('file-exists: fails when file missing', async () => {
    const result = await runValidation({ type: 'file-exists', path: '/nope.txt' }, fs, '/')
    expect(result).toBe(false)
  })

  it('file-content: passes on match', async () => {
    await fs.promises.writeFile('/hello.txt', 'hello world')
    const result = await runValidation({ type: 'file-content', path: '/hello.txt', contains: 'hello' }, fs, '/')
    expect(result).toBe(true)
  })

  it('git-staged: passes when file is staged', async () => {
    await fs.promises.writeFile('/a.txt', 'a')
    await git.add({ fs, dir: '/', filepath: 'a.txt' })
    const result = await runValidation({ type: 'git-staged', path: 'a.txt' }, fs, '/')
    expect(result).toBe(true)
  })

  it('commit-count: passes when enough commits', async () => {
    await fs.promises.writeFile('/a.txt', 'a')
    await git.add({ fs, dir: '/', filepath: 'a.txt' })
    await git.commit({ fs, dir: '/', message: 'first', author: { name: '학습자', email: 'learner@git101.dev' } })
    const result = await runValidation({ type: 'commit-count', min: 1 }, fs, '/')
    expect(result).toBe(true)
  })

  it('branch-exists: passes when branch exists', async () => {
    await fs.promises.writeFile('/a.txt', 'a')
    await git.add({ fs, dir: '/', filepath: 'a.txt' })
    await git.commit({ fs, dir: '/', message: 'init', author: { name: '학습자', email: 'learner@git101.dev' } })
    await git.branch({ fs, dir: '/', ref: 'feature' })
    const result = await runValidation({ type: 'branch-exists', name: 'feature' }, fs, '/')
    expect(result).toBe(true)
  })

  it('current-branch: passes on correct branch', async () => {
    const result = await runValidation({ type: 'current-branch', name: 'main' }, fs, '/')
    expect(result).toBe(true)
  })

  it('commit-message: passes when latest commit matches pattern', async () => {
    await fs.promises.writeFile('/a.txt', 'a')
    await git.add({ fs, dir: '/', filepath: 'a.txt' })
    await git.commit({ fs, dir: '/', message: 'feat: add file', author: { name: '학습자', email: 'learner@git101.dev' } })
    const result = await runValidation({ type: 'commit-message', pattern: '^feat:' }, fs, '/')
    expect(result).toBe(true)
  })

  it('merge-commit: passes when latest commit has two parents', async () => {
    // Create two branches with different commits, then merge
    await fs.promises.writeFile('/a.txt', 'a')
    await git.add({ fs, dir: '/', filepath: 'a.txt' })
    await git.commit({ fs, dir: '/', message: 'init', author: { name: '학습자', email: 'learner@git101.dev' } })
    await git.branch({ fs, dir: '/', ref: 'feature' })
    await git.checkout({ fs, dir: '/', ref: 'feature' })
    await fs.promises.writeFile('/b.txt', 'b')
    await git.add({ fs, dir: '/', filepath: 'b.txt' })
    await git.commit({ fs, dir: '/', message: 'feature commit', author: { name: '학습자', email: 'learner@git101.dev' } })
    await git.checkout({ fs, dir: '/', ref: 'main' })
    await git.merge({ fs, dir: '/', ours: 'main', theirs: 'feature', author: { name: '학습자', email: 'learner@git101.dev' } })
    const result = await runValidation({ type: 'merge-commit' }, fs, '/')
    expect(result).toBe(true)
  })

  it('no-conflict-markers: passes when file has no markers', async () => {
    await fs.promises.writeFile('/clean.txt', 'clean content')
    const result = await runValidation({ type: 'no-conflict-markers', path: '/clean.txt' }, fs, '/')
    expect(result).toBe(true)
  })

  it('no-conflict-markers: fails when file has markers', async () => {
    await fs.promises.writeFile('/conflict.txt', '<<<<<<< HEAD\nours\n=======\ntheirs\n>>>>>>>')
    const result = await runValidation({ type: 'no-conflict-markers', path: '/conflict.txt' }, fs, '/')
    expect(result).toBe(false)
  })

  it('remote-exists: passes when remote is configured', async () => {
    await git.addRemote({ fs, dir: '/', remote: 'origin', url: 'https://example.com/repo.git' })
    const result = await runValidation({ type: 'remote-exists', name: 'origin' }, fs, '/')
    expect(result).toBe(true)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm vitest run tests/unit/validation.test.ts
```

- [ ] **Step 3: Implement validation**

```typescript
import type { ValidationRule } from '@/types'
import git from 'isomorphic-git'

export async function runValidation(
  rule: ValidationRule,
  fs: any,
  dir: string
): Promise<boolean> {
  try {
    switch (rule.type) {
      case 'file-exists': {
        await fs.promises.stat(rule.path!)
        return true
      }
      case 'file-content': {
        const content = await fs.promises.readFile(rule.path!, 'utf8')
        if (rule.contains) return content.includes(rule.contains)
        if (rule.matches) return new RegExp(rule.matches).test(content)
        return false
      }
      case 'git-staged': {
        const matrix = await git.statusMatrix({ fs, dir })
        const entry = matrix.find((row: any) => row[0] === rule.path)
        return entry ? entry[3] === 2 : false // [filepath, HEAD, WORKDIR, STAGE]
      }
      case 'commit-count': {
        const log = await git.log({ fs, dir })
        return log.length >= (rule.min || 1)
      }
      case 'branch-exists': {
        const branches = await git.listBranches({ fs, dir })
        return branches.includes(rule.name!)
      }
      case 'current-branch': {
        const current = await git.currentBranch({ fs, dir })
        return current === rule.name
      }
      case 'commit-message': {
        const log = await git.log({ fs, dir, depth: 1 })
        if (log.length === 0) return false
        return new RegExp(rule.pattern!).test(log[0].commit.message)
      }
      case 'merge-commit': {
        const log = await git.log({ fs, dir, depth: 1 })
        if (log.length === 0) return false
        return log[0].commit.parent.length === 2
      }
      case 'no-conflict-markers': {
        const content = await fs.promises.readFile(rule.path!, 'utf8')
        return !content.includes('<<<<<<<') && !content.includes('>>>>>>>')
      }
      case 'remote-exists': {
        const remotes = await git.listRemotes({ fs, dir })
        return remotes.some((r: any) => r.remote === rule.name)
      }
      default:
        return false
    }
  } catch {
    return false
  }
}

export async function validateAllSteps(
  steps: Array<{ validation: ValidationRule }>,
  fs: any,
  dir: string
): Promise<boolean[]> {
  return Promise.all(steps.map((step) => runValidation(step.validation, fs, dir)))
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm vitest run tests/unit/validation.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/validation.ts tests/unit/validation.test.ts
git commit -m "feat: implement 10 validation types for lesson step verification"
```

---

## Phase 6: Shell Orchestrator

### Task 11: Shell.ts

**Files:**
- Create: `src/lib/shell/Shell.ts`
- Test: `tests/integration/shell.test.ts`

- [ ] **Step 1: Write failing integration tests**

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { Shell } from '@/lib/shell/Shell'

describe('Shell integration', () => {
  let shell: Shell

  beforeEach(async () => {
    shell = new Shell(`test-shell-${Math.random()}`)
    await shell.init()
  })

  it('executes touch and verifies file exists', async () => {
    await shell.execute('touch hello.txt')
    const result = await shell.execute('ls')
    expect(result.output).toContain('hello.txt')
  })

  it('executes git init', async () => {
    const result = await shell.execute('git init')
    expect(result.output).toContain('Initialized')
  })

  it('handles echo with redirect', async () => {
    await shell.execute('echo "hello world" > test.txt')
    const result = await shell.execute('cat test.txt')
    expect(result.output).toBe('hello world')
  })

  it('manages cwd with cd', async () => {
    await shell.execute('mkdir mydir')
    await shell.execute('cd mydir')
    expect(shell.cwd).toBe('/mydir')
    const result = await shell.execute('pwd')
    expect(result.output).toBe('/mydir')
  })

  it('returns error for unknown commands', async () => {
    const result = await shell.execute('blah')
    expect(result.isError).toBe(true)
    expect(result.output).toContain('지원하지 않')
  })

  it('full git workflow: init → add → commit', async () => {
    await shell.execute('git init')
    await shell.execute('touch hello.txt')
    await shell.execute('git add hello.txt')
    const result = await shell.execute('git commit -m "first commit"')
    expect(result.output).toContain('first commit')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm vitest run tests/integration/shell.test.ts
```

- [ ] **Step 3: Implement Shell orchestrator**

```typescript
import type { CommandResult, ShellContext } from '@/types'
import { parseCommand } from './parser'
import { createFS, destroyFS, resolvePath } from './filesystem'
import { executeCommand } from './commands'

export class Shell {
  private fs: any
  private namespace: string
  cwd: string = '/'
  private _pendingMerge: { theirs: string } | null = null

  constructor(namespace: string) {
    this.namespace = namespace
    this.fs = createFS(namespace)
  }

  async init(): Promise<void> {
    // Ensure root directory exists
    try {
      await this.fs.promises.readdir('/')
    } catch {
      await this.fs.promises.mkdir('/')
    }
  }

  async reset(): Promise<void> {
    await destroyFS(this.namespace)
    this.fs = createFS(this.namespace)
    this.cwd = '/'
    this._pendingMerge = null
    await this.init()
  }

  get prompt(): string {
    const display = this.cwd === '/' ? '~' : '~' + this.cwd
    return `${display} $ `
  }

  async execute(input: string): Promise<CommandResult> {
    const parsed = parseCommand(input)
    if (!parsed) return { output: '' }

    // Handle echo with redirect at Shell level
    if (parsed.command === 'echo' && parsed.redirectOp && parsed.redirectTarget) {
      const text = parsed.args.join(' ')
      const filePath = resolvePath(this.cwd, parsed.redirectTarget)
      if (parsed.redirectOp === '>>') {
        try {
          const existing = await this.fs.promises.readFile(filePath, 'utf8')
          await this.fs.promises.writeFile(filePath, existing + text)
        } catch {
          await this.fs.promises.writeFile(filePath, text)
        }
      } else {
        await this.fs.promises.writeFile(filePath, text)
      }
      return { output: '' }
    }

    const ctx: ShellContext = {
      fs: this.fs,
      dir: '/',
      cwd: this.cwd,
      pendingMerge: this._pendingMerge,
      setPendingMerge: (m) => { this._pendingMerge = m },
    }

    const result = await executeCommand(parsed, ctx)

    // Handle cwd change from cd command
    if (result.cwd) {
      this.cwd = result.cwd
    }

    return result
  }

  getFS(): any {
    return this.fs
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm vitest run tests/integration/shell.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/shell/Shell.ts tests/integration/shell.test.ts
git commit -m "feat: implement Shell orchestrator with cwd, redirect, and pendingMerge support"
```

---

## Phase 7: Lesson Fixtures

### Task 12: Fixtures

**Files:**
- Create: `src/lib/fixtures.ts`
- Test: `tests/unit/fixtures.test.ts`

- [ ] **Step 1: Write failing tests**

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { createFS } from '@/lib/shell/filesystem'
import { getFixture, FIXTURE_VERSION_KEY } from '@/lib/fixtures'
import git from 'isomorphic-git'

describe('fixtures', () => {
  it('first-repo: creates empty directory', async () => {
    const fs = createFS(`fixture-test-${Math.random()}`)
    const fixture = getFixture('first-repo')
    await fixture.setup(fs)
    const entries = await fs.promises.readdir('/')
    expect(entries).not.toContain('.git')
  })

  it('first-commit: creates initialized repo', async () => {
    const fs = createFS(`fixture-test-${Math.random()}`)
    const fixture = getFixture('first-commit')
    await fixture.setup(fs)
    const branches = await git.listBranches({ fs, dir: '/' })
    expect(branches).toContain('main')
  })

  it('merge-conflict: creates two branches with conflicting changes', async () => {
    const fs = createFS(`fixture-test-${Math.random()}`)
    const fixture = getFixture('merge-conflict')
    await fixture.setup(fs)
    const branches = await git.listBranches({ fs, dir: '/' })
    expect(branches).toContain('main')
    expect(branches).toContain('feature')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm vitest run tests/unit/fixtures.test.ts
```

- [ ] **Step 3: Implement fixtures**

Implement `src/lib/fixtures.ts` with a `getFixture(slug)` function that returns `{ version, setup }` for each lesson. Each `setup()` uses isomorphic-git API to programmatically create the expected initial state:

- `first-repo`: empty directory (no git init)
- `first-commit`: `git.init()` + config, no files
- `commit-history`: init + 3 commits with different files
- `modify-and-diff`: init + 1 commit with a file
- `branches`: init + 1 commit on main
- `merge`: init + main commits + feature branch with commits
- `merge-conflict`: init + same file modified on both branches
- `remote`: init + commits

Include `FIXTURE_VERSION_KEY` constant for version tracking in localStorage.

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm vitest run tests/unit/fixtures.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/fixtures.ts tests/unit/fixtures.test.ts
git commit -m "feat: implement per-lesson fixture setup functions with version tracking"
```

---

## Phase 8: UI Components

### Task 13: Layout Shell (Nav, Footer, ThemeToggle)

**Files:**
- Create: `src/components/Nav.tsx`
- Create: `src/components/Footer.tsx`
- Create: `src/components/ThemeToggle.tsx`

- [ ] **Step 1: Implement ThemeToggle**

```tsx
'use client'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'))
  }, [])

  const toggle = () => {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
  }

  return (
    <button
      onClick={toggle}
      className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
      aria-label="Toggle theme"
    >
      {dark ? '☀️' : '🌙'}
    </button>
  )
}
```

- [ ] **Step 2: Implement Nav**

```tsx
import Link from 'next/link'
import { ThemeToggle } from './ThemeToggle'

export function Nav() {
  return (
    <header className="sticky top-0 z-50 h-14 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur">
      <div className="max-w-screen-xl mx-auto h-full flex items-center justify-between px-4">
        <Link href="/" className="font-mono font-bold text-lg text-orange-500">
          ▸ git-github-101
        </Link>
        <div className="flex items-center gap-2">
          <a
            href="https://github.com/0-Chan/git-github-101"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-sm"
          >
            GitHub
          </a>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
```

- [ ] **Step 3: Implement Footer**

```tsx
export function Footer() {
  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800 py-8 text-center text-sm text-zinc-500">
      <p>Git & GitHub 101 — 브라우저에서 배우는 Git 입문</p>
    </footer>
  )
}
```

- [ ] **Step 4: Update root layout to use Nav**

Update `src/app/layout.tsx` to include `<Nav />` in the body.

- [ ] **Step 5: Verify dev server renders correctly**

```bash
pnpm dev
```

Check http://localhost:3000 — Nav with logo and theme toggle visible.

- [ ] **Step 6: Commit**

```bash
git add src/components/Nav.tsx src/components/Footer.tsx src/components/ThemeToggle.tsx src/app/layout.tsx
git commit -m "feat: add Nav, Footer, ThemeToggle components with dark mode support"
```

---

### Task 14: Landing Page (Hero + Lesson List)

**Files:**
- Create: `src/components/Hero.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Implement Hero with typewriter animation**

Create `src/components/Hero.tsx` with:
- macOS-style terminal window chrome (red/yellow/green dots)
- Typewriter animation: "무엇을 만들어 드릴까요?" types out
- Call-to-action button linking to first lesson

- [ ] **Step 2: Update landing page**

Update `src/app/page.tsx` to:
- Import `getSections()` from content.ts
- Render Hero component
- Render lesson list grid with cards linking to `/lessons/[slug]`
- Each card shows order number, title, description
- Different styling for hasTerminal vs concept-only lessons

- [ ] **Step 3: Verify**

```bash
pnpm dev
```

Check landing page renders with hero and lesson cards.

- [ ] **Step 4: Commit**

```bash
git add src/components/Hero.tsx src/app/page.tsx
git commit -m "feat: add landing page with Hero typewriter animation and lesson list"
```

---

### Task 15: Sidebar

**Files:**
- Create: `src/components/Sidebar.tsx`

- [ ] **Step 1: Implement Sidebar**

```tsx
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { Section } from '@/types'

interface SidebarProps {
  sections: Section[]
  progress: Record<string, boolean>
}

export function Sidebar({ sections, progress }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="w-64 shrink-0 border-r border-zinc-200 dark:border-zinc-800 overflow-y-auto">
      <nav className="p-4 space-y-1">
        {sections.map((section) => {
          const href = `/lessons/${section.slug}`
          const isActive = pathname === href
          const isComplete = progress[section.slug]

          return (
            <Link
              key={section.id}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-orange-50 dark:bg-orange-950 text-orange-600 dark:text-orange-400 font-medium'
                  : 'hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300'
              }`}
            >
              <span className="font-mono text-xs text-zinc-400 w-6">
                {String(section.order).padStart(2, '0')}
              </span>
              <span className="flex-1 truncate">{section.title}</span>
              {isComplete && <span className="text-green-500">✓</span>}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Sidebar.tsx
git commit -m "feat: add Sidebar with active state highlighting and progress checkmarks"
```

---

## Phase 9: Lesson Page

### Task 16: GuidePanel, TerminalPanel, LessonLayout

**Files:**
- Create: `src/components/GuidePanel.tsx`
- Create: `src/components/TerminalPanel.tsx`
- Create: `src/components/LessonLayout.tsx`
- Create: `src/app/lessons/[slug]/page.tsx`
- Create: `src/hooks/useProgress.ts`
- Create: `src/hooks/useTabLock.ts`
- Create: `src/lib/progress.ts`

- [ ] **Step 1: Implement progress utilities**

Create `src/lib/progress.ts`:

```typescript
import type { ProgressMap } from '@/types'

const PROGRESS_KEY = 'git101-progress'

export function getProgress(): ProgressMap {
  if (typeof window === 'undefined') return {}
  try {
    return JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}')
  } catch {
    return {}
  }
}

export function setLessonComplete(slug: string): void {
  const progress = getProgress()
  progress[slug] = true
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress))
}
```

- [ ] **Step 2: Implement useProgress hook**

Create `src/hooks/useProgress.ts`:

```typescript
'use client'
import { useState, useEffect } from 'react'
import { getProgress, setLessonComplete } from '@/lib/progress'
import type { ProgressMap } from '@/types'

export function useProgress() {
  const [progress, setProgress] = useState<ProgressMap>({})

  useEffect(() => {
    setProgress(getProgress())
  }, [])

  const markComplete = (slug: string) => {
    setLessonComplete(slug)
    setProgress((prev) => ({ ...prev, [slug]: true }))
  }

  return { progress, markComplete }
}
```

- [ ] **Step 3: Implement useTabLock hook**

Create `src/hooks/useTabLock.ts`:

```typescript
'use client'
import { useState, useEffect } from 'react'

export function useTabLock(slug: string) {
  const [isLocked, setIsLocked] = useState(false)

  useEffect(() => {
    const channel = new BroadcastChannel(`git101-lesson-${slug}`)
    channel.postMessage({ type: 'check' })

    const handler = (event: MessageEvent) => {
      if (event.data.type === 'check') {
        channel.postMessage({ type: 'active' })
      } else if (event.data.type === 'active') {
        setIsLocked(true)
      }
    }

    channel.addEventListener('message', handler)
    return () => {
      channel.removeEventListener('message', handler)
      channel.close()
    }
  }, [slug])

  return isLocked
}
```

- [ ] **Step 4: Implement GuidePanel**

Create `src/components/GuidePanel.tsx`:

```tsx
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
                  <p className="text-xs text-zinc-500 mt-1 font-mono">
                    힌트: {step.hint}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 5: Implement TerminalPanel**

Create `src/components/TerminalPanel.tsx`:

```tsx
'use client'
import { useEffect, useRef, useCallback } from 'react'
import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import '@xterm/xterm/css/xterm.css'
import { Shell } from '@/lib/shell/Shell'
import { runValidation } from '@/lib/validation'
import type { LessonStep } from '@/types'

interface TerminalPanelProps {
  namespace: string
  steps: LessonStep[]
  currentStep: number
  onStepComplete: (stepIndex: number) => void
  onReady: (shell: Shell) => void
}

export function TerminalPanel({
  namespace,
  steps,
  currentStep,
  onStepComplete,
  onReady,
}: TerminalPanelProps) {
  const termRef = useRef<HTMLDivElement>(null)
  const shellRef = useRef<Shell | null>(null)
  const terminalRef = useRef<Terminal | null>(null)
  const inputRef = useRef('')
  const currentStepRef = useRef(currentStep)
  const onStepCompleteRef = useRef(onStepComplete)
  const stepsRef = useRef(steps)

  // Keep refs in sync with props
  useEffect(() => { currentStepRef.current = currentStep }, [currentStep])
  useEffect(() => { onStepCompleteRef.current = onStepComplete }, [onStepComplete])
  useEffect(() => { stepsRef.current = steps }, [steps])

  const writePrompt = useCallback(() => {
    const shell = shellRef.current
    const terminal = terminalRef.current
    if (!shell || !terminal) return
    terminal.write(`\r\n${shell.prompt}`)
  }, [])

  useEffect(() => {
    if (!termRef.current) return

    const terminal = new Terminal({
      theme: {
        background: '#18181b',
        foreground: '#f4f4f5',
        cursor: '#f97316',
        selectionBackground: '#f9731640',
      },
      fontFamily: 'var(--font-geist-mono), monospace',
      fontSize: 14,
      cursorBlink: true,
    })

    const fitAddon = new FitAddon()
    terminal.loadAddon(fitAddon)
    terminal.open(termRef.current)
    fitAddon.fit()
    terminalRef.current = terminal

    const shell = new Shell(namespace)
    shellRef.current = shell

    // NOTE: Fixture initialization is added in Task 18.
    // Until then, lessons requiring pre-configured state (e.g., merge-conflict)
    // will start with an empty filesystem.
    shell.init().then(() => {
      terminal.writeln('Git & GitHub 101 터미널')
      terminal.writeln("'도움말'을 입력하면 사용 가능한 명령어를 볼 수 있어요.\r\n")
      writePrompt()
      onReady(shell)
    })

    terminal.onKey(async ({ key, domEvent }) => {
      if (domEvent.key === 'Enter') {
        const input = inputRef.current.trim()
        inputRef.current = ''
        terminal.write('\r\n')

        if (input) {
          const result = await shell.execute(input)
          if (result.clear) {
            terminal.clear()
          } else if (result.output) {
            const lines = result.output.split('\n')
            lines.forEach((line, i) => {
              terminal.write(line)
              if (i < lines.length - 1) terminal.write('\r\n')
            })
          }

          // Run validation for current step (using refs to avoid stale closures)
          const stepIdx = currentStepRef.current
          if (stepIdx < stepsRef.current.length) {
            const step = stepsRef.current[stepIdx]
            const passed = await runValidation(step.validation, shell.getFS(), '/')
            if (passed) {
              onStepCompleteRef.current(stepIdx)
            }
          }
        }

        writePrompt()
      } else if (domEvent.key === 'Backspace') {
        if (inputRef.current.length > 0) {
          inputRef.current = inputRef.current.slice(0, -1)
          terminal.write('\b \b')
        }
      } else if (key.length === 1 && !domEvent.ctrlKey && !domEvent.altKey) {
        inputRef.current += key
        terminal.write(key)
      }
    })

    const resizeObserver = new ResizeObserver(() => fitAddon.fit())
    resizeObserver.observe(termRef.current)

    return () => {
      resizeObserver.disconnect()
      terminal.dispose()
    }
  }, [namespace]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-col h-full bg-zinc-900 rounded-xl border border-zinc-700 overflow-hidden">
      {/* macOS window chrome */}
      <div className="flex items-center gap-2 px-4 py-2 bg-zinc-800 border-b border-zinc-700">
        <span className="w-3 h-3 rounded-full bg-red-500" />
        <span className="w-3 h-3 rounded-full bg-yellow-500" />
        <span className="w-3 h-3 rounded-full bg-green-500" />
        <span className="ml-2 text-xs text-zinc-400 font-mono">터미널</span>
      </div>
      <div ref={termRef} className="flex-1 p-2" />
    </div>
  )
}
```

- [ ] **Step 6: Implement LessonLayout**

Create `src/components/LessonLayout.tsx`:

```tsx
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

const TerminalPanel = dynamic(() =>
  import('./TerminalPanel').then((m) => ({ default: m.TerminalPanel })),
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
      // Check if all steps complete using the updated array
      if (next.every(Boolean)) {
        markComplete(lesson.meta.slug)
      }
      return next
    })
  }, [lesson.meta.slug, markComplete])

  const handleShellReady = useCallback(async (shell: Shell) => {
    // Restore progress by re-running validations
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
```

- [ ] **Step 7: Create lesson page route**

Create `src/app/lessons/[slug]/page.tsx`:

```tsx
import { notFound } from 'next/navigation'
import { getLessonBySlug, getSections } from '@/lib/content'
import { LessonLayout } from '@/components/LessonLayout'
import { Nav } from '@/components/Nav'
import { getAllLessons } from '@/lib/content'

export function generateStaticParams() {
  const lessons = getAllLessons()
  return lessons.map((lesson) => ({ slug: lesson.slug }))
}

export default async function LessonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const lesson = getLessonBySlug(slug)
  if (!lesson) notFound()

  const sections = getSections()

  return (
    <>
      <Nav />
      <LessonLayout lesson={lesson} sections={sections.sections} />
    </>
  )
}
```

- [ ] **Step 8: Verify lesson page renders**

```bash
pnpm dev
```

Navigate to http://localhost:3000/lessons/what-is-git — should render guide content.

- [ ] **Step 9: Commit**

```bash
git add src/components/GuidePanel.tsx src/components/TerminalPanel.tsx src/components/LessonLayout.tsx src/app/lessons/ src/lib/progress.ts src/hooks/
git commit -m "feat: implement lesson page with GuidePanel, TerminalPanel, and progress tracking"
```

---

## Phase 10: Tutorial Content

### Task 17: Lesson MD Files

**Files:**
- Create: `content/lessons/02-first-repo.md` through `content/lessons/11-pull-request.md`

- [ ] **Step 1: Write all lesson MD files**

Each file has YAML frontmatter with `title`, `slug`, `order`, `hasTerminal`, and `steps` (validation rules). The body contains Korean tutorial content explaining concepts and guiding the learner.

Key files:
- `01-what-is-git.md` (already exists, expand content)
- `02-first-repo.md`: steps for `git init`
- `03-first-commit.md`: steps for `touch`, `git add`, `git commit`
- `04-commit-history.md`: steps for `git log`
- `05-modify-and-diff.md`: steps for modifying files and `git diff`
- `06-branches.md`: steps for `git branch`, `git checkout`
- `07-merge.md`: steps for `git merge`
- `08-merge-conflict.md`: steps for conflict resolution
- `09-what-is-github.md`: concept-only (no terminal)
- `10-remote.md`: steps for `git remote add`, `git push`
- `11-pull-request.md`: concept-only (no terminal)

- [ ] **Step 2: Verify all lessons load**

```bash
pnpm dev
```

Navigate through all lesson pages.

- [ ] **Step 3: Commit**

```bash
git add content/lessons/
git commit -m "feat: add all 11 tutorial lesson content files"
```

---

## Phase 11: Integration & Polish

### Task 18: Fixture Integration with Lesson Pages

**Files:**
- Modify: `src/components/TerminalPanel.tsx` — call fixture `setup()` on first load
- Modify: `src/components/LessonLayout.tsx` — add reset button

- [ ] **Step 1: Add fixture initialization to TerminalPanel**

When a TerminalPanel mounts, check if fixture is needed:
1. Check localStorage for fixture version
2. If version mismatch or first load, run `setup()` from fixtures
3. Store current fixture version in localStorage

- [ ] **Step 2: Add reset button to LessonLayout**

Add a "리셋" button that:
1. Calls `shell.reset()`
2. Re-runs fixture `setup()`
3. Resets step completion state

- [ ] **Step 3: Verify fixture flow**

Navigate to `/lessons/merge-conflict` — should see pre-configured repo with two branches.

- [ ] **Step 4: Commit**

```bash
git add src/components/TerminalPanel.tsx src/components/LessonLayout.tsx
git commit -m "feat: integrate lesson fixtures with version tracking and reset functionality"
```

---

### Task 19: Mobile Responsive & Polish

**Files:**
- Modify: `src/components/LessonLayout.tsx` — hamburger menu for mobile sidebar
- Modify: `src/app/globals.css` — responsive tweaks

- [ ] **Step 1: Add mobile hamburger menu**

Add a hamburger button (visible only on mobile) that opens a drawer overlay for the sidebar.

- [ ] **Step 2: Polish responsive layout**

- Mobile: guide stacks above terminal vertically
- Terminal minimum height: 320px on mobile
- Sidebar drawer slides from left with backdrop

- [ ] **Step 3: Verify on mobile viewport**

```bash
pnpm dev
```

Use browser DevTools to check iPhone 13 viewport.

- [ ] **Step 4: Commit**

```bash
git add src/components/ src/app/globals.css
git commit -m "feat: add mobile responsive layout with hamburger sidebar drawer"
```

---

## Phase 12: E2E Tests

### Task 20: Playwright E2E Tests

**Files:**
- Create: `tests/e2e/navigation.spec.ts`
- Create: `tests/e2e/terminal.spec.ts`
- Create: `tests/e2e/lesson-flow.spec.ts`

- [ ] **Step 1: Install Playwright browsers**

```bash
pnpm exec playwright install chromium
```

- [ ] **Step 2: Write navigation E2E tests**

```typescript
import { test, expect } from '@playwright/test'

test('landing page shows lesson list', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('text=Git이란?')).toBeVisible()
  await expect(page.locator('text=첫 번째 저장소')).toBeVisible()
})

test('navigates to lesson page', async ({ page }) => {
  await page.goto('/')
  await page.click('text=첫 번째 저장소')
  await expect(page).toHaveURL('/lessons/first-repo')
})

test('dark mode toggle works', async ({ page }) => {
  await page.goto('/')
  const html = page.locator('html')
  await page.click('[aria-label="Toggle theme"]')
  await expect(html).toHaveClass(/dark/)
})
```

- [ ] **Step 3: Write terminal E2E test**

```typescript
import { test, expect } from '@playwright/test'

test('terminal accepts input and shows output', async ({ page }) => {
  await page.goto('/lessons/first-repo')
  // Wait for terminal to initialize
  await page.waitForSelector('.xterm')
  // Type a command
  await page.locator('.xterm').click()
  await page.keyboard.type('도움말')
  await page.keyboard.press('Enter')
  // Check output appears
  await expect(page.locator('.xterm')).toContainText('Git')
})
```

- [ ] **Step 4: Write lesson flow E2E test**

```typescript
import { test, expect } from '@playwright/test'

test('completes first-repo lesson steps', async ({ page }) => {
  await page.goto('/lessons/first-repo')
  await page.waitForSelector('.xterm')
  await page.locator('.xterm').click()
  await page.keyboard.type('git init')
  await page.keyboard.press('Enter')
  // Verify step completion indicator appears
  await expect(page.locator('text=✅')).toBeVisible({ timeout: 5000 })
})
```

- [ ] **Step 5: Run E2E tests**

```bash
pnpm test:e2e
```

- [ ] **Step 6: Commit**

```bash
git add tests/e2e/ playwright.config.ts
git commit -m "test: add Playwright E2E tests for navigation, terminal, and lesson flow"
```

---

## Phase 13: Final Build Verification

### Task 21: Production Build & Deploy Verification

- [ ] **Step 1: Run all unit/integration tests**

```bash
pnpm test
```

Expected: All tests pass.

- [ ] **Step 2: Run E2E tests**

```bash
pnpm test:e2e
```

Expected: All tests pass.

- [ ] **Step 3: Production build**

```bash
pnpm build
```

Expected: Build succeeds with no errors. All lesson pages statically generated.

- [ ] **Step 4: Test production build locally**

```bash
pnpm start
```

Navigate through the app at http://localhost:3000. Verify:
- Landing page renders
- All lesson pages load
- Terminal works in lessons with `hasTerminal: true`
- Dark mode toggle works
- Mobile layout works

- [ ] **Step 5: Final commit**

```bash
git add .
git commit -m "chore: production build verification complete"
```

---

## Parallel Execution Schedule

```
Phase 1:   Task 1  (scaffolding)
Phase 2:   Task 2 + Task 3                          [parallel: types, sections.json]
Phase 3:   Task 4 + Task 5 + Task 6                 [parallel: parser, fs-layer, content-loader]
Phase 4:   Task 7 + Task 8                           [parallel: fs-commands, git-commands]
Phase 5:   Task 9  (command registry)
Phase 6:   Task 10 (validation)
Phase 7:   Task 11 (shell orchestrator)
           ** INTEGRATION CHECKPOINT 1 **
Phase 8:   Task 12 + Task 13 + Task 15              [parallel: fixtures, sidebar, layout-shell]
Phase 9:   Task 14 (landing page: hero + lesson list)
Phase 10:  Task 16 (lesson page: guide + terminal)
           ** INTEGRATION CHECKPOINT 2 **
Phase 11:  Task 17 + Task 18                         [parallel: content MD files, fixture integration]
Phase 12:  Task 19 (mobile responsive)
Phase 13:  Task 20 (E2E tests)
Phase 14:  Task 21 (final build verification)
```

**Integration checkpoints:** After phases 7 and 10.
