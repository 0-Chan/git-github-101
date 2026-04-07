# git-github-101 설계 문서

## 개요

브라우저에서 Git을 직접 실습할 수 있는 인터랙티브 한국어 웹 튜토리얼.
완전 초보자를 대상으로 Git 기초부터 GitHub 기본 개념까지 다룬다.

### 핵심 기술

- **isomorphic-git**: 브라우저에서 Git 동작 수행
- **LightningFS**: IndexedDB 기반 인메모리 파일시스템
- **xterm.js**: 브라우저 터미널 UI
- **Next.js** (App Router): 프레임워크
- **Tailwind CSS v4**: 스타일링
- **remark + gray-matter**: MD 콘텐츠 파싱

### 디자인 레퍼런스

[cc101.axwith.com/ko](https://cc101.axwith.com/ko) (소스: [github.com/fivetaku/cc101](https://github.com/fivetaku/cc101))

- Geist 폰트 패밀리
- Orange 악센트 컬러 (#f97316), Zinc 스케일
- 클래스 기반 다크모드 (localStorage 저장, theme-init.js로 FOUC 방지)
- 사이드바 TOC + 메인 콘텐츠 레이아웃
- 반응형: 모바일에서 햄버거 드로어

---

## 아키텍처

### 레이아웃

```
┌─ Header (Nav) ──────────────────────────────────┐
├──────┬──────────────────┬───────────────────────┤
│ Side │   Guide Panel    │   Terminal Panel      │
│ bar  │                  │                       │
│ TOC  │  MD 콘텐츠 렌더링  │  xterm.js 터미널      │
│      │  (remark 파싱)    │  + Custom Shell       │
│      │  단계별 가이드     │  + isomorphic-git     │
│      │  + 진행 상태      │  + LightningFS        │
├──────┴──────────────────┴───────────────────────┤
│ Footer                                          │
└─────────────────────────────────────────────────┘
```

- **데스크톱**: 사이드바 + 가이드(왼쪽) + 터미널(오른쪽) 3컬럼
- **모바일**: 사이드바는 햄버거 드로어, 가이드와 터미널은 상하 스택

### 데이터 흐름

```
content/lessons/*.md (빌드 타임)
  → gray-matter (frontmatter 파싱)
  → remark (MD → HTML)
  → GuidePanel (렌더링)

사용자 입력 (런타임)
  → xterm.js (UI)
  → Shell.ts (명령어 라우팅)
  → parser.ts (파싱)
  → commands/git.ts 또는 commands/fs.ts (실행)
  → isomorphic-git / LightningFS (API 호출)
  → xterm.js (결과 출력)
  → validation.ts (단계 검증)
  → GuidePanel (진행 상태 업데이트)
```

---

## 프로젝트 구조

```
git-github-101/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # 루트 레이아웃 (폰트, 메타데이터)
│   │   ├── page.tsx                # 메인 랜딩 페이지
│   │   ├── globals.css             # Tailwind + 글로벌 스타일
│   │   └── lessons/
│   │       └── [slug]/
│   │           └── page.tsx        # 개별 레슨 페이지 (가이드+터미널)
│   ├── components/
│   │   ├── Nav.tsx                 # 헤더 (로고, 테마 토글)
│   │   ├── Sidebar.tsx             # TOC 네비게이션
│   │   ├── LessonLayout.tsx        # 가이드+터미널 분할 레이아웃
│   │   ├── GuidePanel.tsx          # MD 콘텐츠 렌더링
│   │   ├── TerminalPanel.tsx       # xterm.js 래퍼
│   │   ├── Hero.tsx                # 랜딩 히어로 섹션
│   │   ├── ThemeToggle.tsx         # 다크모드 토글
│   │   └── Footer.tsx
│   ├── lib/
│   │   ├── content.ts             # MD 파일 로딩 (gray-matter + remark)
│   │   ├── shell/
│   │   │   ├── Shell.ts           # 커스텀 셸 메인 클래스
│   │   │   ├── parser.ts          # 명령어 파싱
│   │   │   ├── commands/
│   │   │   │   ├── git.ts         # git 명령어 → isomorphic-git
│   │   │   │   ├── fs.ts          # ls, cat, mkdir, touch 등
│   │   │   │   └── index.ts       # 명령어 레지스트리
│   │   │   └── filesystem.ts      # LightningFS 초기화/관리
│   │   └── validation.ts          # 단계별 검증 로직
│   └── types/
│       └── index.ts               # TypeScript 타입 정의
├── content/
│   ├── sections.json              # 레슨 메타데이터
│   └── lessons/
│       ├── 01-what-is-git.md
│       ├── 02-first-repo.md
│       ├── 03-first-commit.md
│       ├── 04-commit-history.md
│       ├── 05-modify-and-diff.md
│       ├── 06-branches.md
│       ├── 07-merge.md
│       ├── 08-merge-conflict.md
│       ├── 09-what-is-github.md
│       ├── 10-remote.md
│       └── 11-pull-request.md
├── public/
│   └── theme-init.js              # 다크모드 FOUC 방지
├── package.json
├── tsconfig.json
├── next.config.ts
└── playwright.config.ts
```

---

## 커스텀 셸

### 동작 방식

1. xterm.js에서 사용자 키 입력 수신 (xterm.js의 내장 라인 에디팅: 백스페이스, 커서 이동, 붙여넣기 지원)
2. Enter 시 `parser.ts`에서 명령어 + 인자 파싱
3. 명령어 레지스트리(`commands/index.ts`)에서 핸들러 탐색
4. 핸들러가 isomorphic-git 또는 LightningFS API 호출
5. 결과를 xterm.js에 출력
6. 검증 로직 실행

### 지원 Git 명령어

| 명령어 | isomorphic-git API |
|--------|-------------------|
| `git init` | `git.init({ defaultBranch: 'main' })` |
| `git add <file>` | `git.add()` |
| `git status` | `git.statusMatrix()` |
| `git commit -m "msg"` | `git.commit()` |
| `git log` | `git.log()` |
| `git branch <name>` | `git.branch()` |
| `git checkout <branch>` | `git.checkout()` |
| `git merge <branch>` | `git.merge()` |
| `git diff` | `readBlob()` + `diff` 라이브러리 |
| `git remote add` | isomorphic-git `setConfig()` |
| `git push` | 시뮬레이션 (아래 참조) |

#### 기본 설정 (author/defaultBranch)

isomorphic-git의 `commit()`은 `author` 파라미터가 필요하다. 셸 초기화 시 기본값을 설정한다:
- `git.setConfig()` 으로 `user.name: "학습자"`, `user.email: "learner@git101.dev"` 설정
- `git init()`에 `defaultBranch: 'main'` 전달하여 기본 브랜치를 `main`으로 고정
- `git commit` 핸들러는 config에서 author 정보를 자동으로 읽어 사용

#### git diff 구현

isomorphic-git에는 내장 diff API가 없다. 다음과 같이 구현한다:
1. `git.statusMatrix()`로 변경된 파일 목록 확인
2. HEAD 커밋의 blob과 워킹 디렉토리 파일을 각각 읽음 (`readBlob()` + `fs.readFile()`)
3. `diff` npm 패키지 (`diffLines`)로 텍스트 비교
4. unified diff 형식으로 xterm.js에 출력 (추가: 녹색, 삭제: 빨간색)

**범위 제한**: 텍스트 파일의 unstaged 변경사항만 지원 (플래그 없는 `git diff`만). `--staged`, `--cached` 등 플래그는 미지원.

#### git remote add / git push 시뮬레이션

- `git remote add origin <url>`: isomorphic-git의 `setConfig()`로 `.git/config`에 remote 정보 저장
- `git push origin main`: 실제 네트워크 요청 없이 시뮬레이션
  - "Enumerating objects... Counting objects... Writing objects..." 형태의 진행 메시지 출력
  - 완료 후 "Branch 'main' pushed to 'origin'" 메시지 표시
  - 학습 목적이므로 실제 push 동작은 불필요

### 현재 작업 디렉토리 (cwd) 관리

LightningFS에는 cwd 개념이 없으므로 `Shell.ts`에서 애플리케이션 레벨로 관리한다:
- `Shell` 클래스에 `cwd: string` 상태 유지 (초기값: `/`)
- 모든 파일 경로를 명령어 실행 전에 cwd 기준으로 절대 경로로 resolve
- `cd` 명령어: 대상 디렉토리 존재 여부를 `fs.stat()`으로 확인 후 cwd 업데이트
- `pwd` 명령어: 현재 cwd 출력
- 프롬프트에 현재 경로 표시: `~/project $` 형태

### 지원 파일시스템 명령어

| 명령어 | 설명 |
|--------|------|
| `ls [path]` | 디렉토리 내용 나열 |
| `cat <file>` | 파일 내용 출력 |
| `mkdir <dir>` | 디렉토리 생성 |
| `touch <file>` | 빈 파일 생성 |
| `echo "text" > file` | 파일에 텍스트 쓰기 (덮어쓰기) |
| `echo "text" >> file` | 파일에 텍스트 추가 |
| `cd <dir>` | 작업 디렉토리 변경 |
| `pwd` | 현재 작업 디렉토리 출력 |
| `clear` | 터미널 화면 지우기 |
| `도움말` | 사용 가능한 명령어 목록과 설명 출력 (한글 명령어) |

#### 파싱 규칙
- 따옴표: 큰따옴표(`"`)와 작은따옴표(`'`) 모두 지원
- 리다이렉션: `>` (덮어쓰기)와 `>>` (추가)만 지원
- 파이프, 환경변수 등 고급 셸 기능은 미지원

### 에러 메시지

실제 Git 출력과 유사한 영문 에러 메시지를 사용하되, 튜토리얼 맥락에 맞는 한국어 힌트를 추가한다:

```
$ git commit
nothing to commit, working tree clean
💡 커밋할 변경사항이 없어요. 먼저 파일을 수정하고 git add로 스테이징하세요.
```

```
$ git checkout nonexistent
error: pathspec 'nonexistent' did not match any file(s) known to git
💡 'nonexistent' 브랜치가 없어요. git branch로 브랜치 목록을 확인해보세요.
```

### 미지원 명령어 처리

```
이 명령어는 아직 지원하지 않아요.
이 튜토리얼에서는 다음 명령어를 사용할 수 있습니다: ...
```

---

## 검증 시스템

각 레슨 MD의 frontmatter에 단계별 검증 조건 정의:

```yaml
---
title: 첫 번째 커밋
slug: first-commit
order: 3
steps:
  - id: create-file
    instruction: "hello.txt 파일을 만들어보세요"
    hint: "touch hello.txt"
    validation:
      type: file-exists
      path: /hello.txt
  - id: add-file
    instruction: "파일을 스테이징 영역에 추가하세요"
    hint: "git add hello.txt"
    validation:
      type: git-staged
      path: hello.txt
  - id: commit
    instruction: "커밋을 만들어보세요"
    hint: 'git commit -m "첫 번째 커밋"'
    validation:
      type: commit-count
      min: 1
---
```

### 검증 타입

| 타입 | 설명 | 파라미터 |
|------|------|---------|
| `file-exists` | 파일 존재 여부 | `path` |
| `file-content` | 파일 내용 확인 | `path`, `contains` 또는 `matches` |
| `git-staged` | 스테이징 여부 | `path` |
| `commit-count` | 커밋 수 | `min` |
| `branch-exists` | 브랜치 존재 여부 | `name` |
| `current-branch` | 현재 브랜치 확인 | `name` |
| `commit-message` | 커밋 메시지 패턴 | `pattern` |
| `merge-commit` | 머지 커밋 존재 (부모 2개) | - |
| `no-conflict-markers` | 충돌 마커 없음 확인 | `path` |
| `remote-exists` | 원격 저장소 설정 확인 | `name` |

### 검증 흐름

1. 명령어 실행 완료 후 현재 단계의 검증 조건 자동 실행
2. 통과 시: 가이드 패널에 체크마크 표시, 다음 단계 활성화
3. 실패 시: 아무 표시 없음 (학습자가 자유롭게 재시도)
4. 모든 단계 완료 시: 레슨 완료 표시, 다음 레슨 링크 활성화

### 검증 경로 규칙

- 모든 검증 경로는 저장소 루트(`/`) 기준 절대 경로로 작성
- cwd와 무관하게 동일한 경로로 검증 수행

### 페이지 로드 시 검증 복원

페이지 로드/새로고침 시 현재 레슨의 모든 단계에 대해 검증을 재실행하여 진행 상태를 복원한다. 이미 완료된 단계는 자동으로 체크 표시된다. 검증은 "최종 상태"를 확인하는 방식이므로, 의도한 동작을 수행했는지가 아니라 결과 상태가 올바른지를 확인한다.

---

## 튜토리얼 콘텐츠

### 레슨 목록

| # | 슬러그 | 제목 | 핵심 내용 |
|---|--------|------|----------|
| 01 | what-is-git | Git이란? | 버전 관리 개념, Git이 필요한 이유 |
| 02 | first-repo | 첫 번째 저장소 | `git init`, 저장소 구조 이해 |
| 03 | first-commit | 첫 번째 커밋 | `touch`, `git add`, `git status`, `git commit` |
| 04 | commit-history | 커밋 히스토리 | `git log`, 커밋 메시지 작성법 |
| 05 | modify-and-diff | 수정과 비교 | 파일 수정, `git diff`, 재커밋 |
| 06 | branches | 브랜치 | `git branch`, `git checkout`, 브랜치 개념 |
| 07 | merge | 머지 | `git merge`, fast-forward vs 3-way merge |
| 08 | merge-conflict | 충돌 해결 | 충돌 시나리오, 수동 해결 (아래 상세) |
| 09 | what-is-github | GitHub란? | 원격 저장소 개념, GitHub 소개 |
| 10 | remote | 원격 저장소 | `git remote add`, `git push` (시뮬레이션) |
| 11 | pull-request | Pull Request | PR 개념, 코드 리뷰 워크플로우 (시각적 설명) |

### 콘텐츠 메타데이터 (sections.json)

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
    }
  ]
}
```

`hasTerminal: false`인 레슨(개념 설명)은 터미널 패널 없이 가이드만 표시.

터미널 없는 레슨: 01 (what-is-git), 09 (what-is-github), 11 (pull-request)

### 레슨 08: 충돌 해결 상세 설계

머지 충돌은 튜토리얼에서 가장 복잡한 시나리오이다. 다음과 같이 가이드된 워크플로우로 진행한다:

1. **사전 설정**: 레슨 시작 시 두 개의 브랜치를 자동 생성하고, 같은 파일의 같은 줄을 다르게 수정해 놓음
2. **충돌 발생**: 학습자가 `git merge`를 실행하면 isomorphic-git이 `abortOnConflict: false`로 머지 시도 → 충돌 마커가 파일에 기록됨
3. **충돌 확인**: `cat <file>`로 충돌 마커 (`<<<<<<<`, `=======`, `>>>>>>>`) 확인
4. **충돌 해결**: `echo "resolved content" > file`로 파일 전체를 덮어쓰기하여 해결 (가이드에서 정확한 내용을 알려줌)
5. **완료**: `git add` → `git commit`으로 머지 완료

**머지 커밋 생성**: isomorphic-git에서 충돌 머지 후 수동 커밋 시, 셸은 "pending merge" 상태를 추적한다.
- `git merge`가 충돌로 실패하면 셸에 `pendingMerge: { theirs: commitOid }` 메타데이터 저장
- 충돌 해결 후 `git commit` 실행 시, 셸이 자동으로 `parent: [HEAD, theirs]` 두 개의 부모를 전달하여 정상적인 두-부모 머지 커밋 생성
- 머지 완료 후 `pendingMerge` 상태 초기화

충돌 해결 시 파일 편집은 `echo > file`로 전체 내용을 대체하는 방식을 사용한다. 라인 단위 편집기는 구현하지 않되, 가이드에서 정확히 어떤 내용으로 대체해야 하는지 안내한다.

---

## 상태 관리

### 파일시스템 상태 (IndexedDB)

- 각 레슨마다 독립된 LightningFS 인스턴스 사용 (네임스페이스: `lesson-{slug}`)
- 페이지 새로고침 시 IndexedDB 상태 유지 (이어서 실습 가능)
- **레슨 리셋**: 리셋 버튼 클릭 시 해당 레슨의 IndexedDB 데이터 삭제 후 초기 상태 재생성
- **동일 탭 제한**: LightningFS의 IndexedDB 락 충돌 방지를 위해 같은 레슨을 여러 탭에서 동시 열기 미지원 (BroadcastChannel로 감지, 경고 표시)

### 레슨 초기 상태 (fixture)

일부 레슨은 이전 레슨의 결과를 전제로 한다. 각 레슨의 `setup()` 함수가 초기 상태를 결정적으로 생성한다:

| 레슨 | 초기 상태 |
|------|----------|
| 02 (first-repo) | 빈 디렉토리 |
| 03 (first-commit) | git init 완료된 빈 저장소 |
| 04 (commit-history) | 2-3개 커밋이 있는 저장소 |
| 05 (modify-and-diff) | 파일이 있는 저장소 (커밋 완료) |
| 06 (branches) | main에 커밋이 있는 저장소 |
| 07 (merge) | main + feature 두 브랜치 |
| 08 (merge-conflict) | 같은 파일을 다르게 수정한 두 브랜치 |
| 10 (remote) | 커밋이 있는 저장소 |

각 `setup()` 함수는 isomorphic-git API로 프로그래밍적으로 초기 상태를 생성한다. 레슨 리셋 시에도 동일한 `setup()` 함수가 호출된다.

fixture에 버전 번호를 부여하여, 콘텐츠 업데이트 시 기존 IndexedDB 상태와 불일치하면 자동으로 리셋 후 재생성한다.

### 진행 상태 (localStorage)

- 각 레슨의 완료 여부를 localStorage에 저장
- 키: `git101-progress`, 값: `{ "first-repo": true, "first-commit": true, ... }`
- 사이드바 TOC에 완료된 레슨은 체크마크 표시
- 재방문 시 진행 상태 복원

### Next.js SSR 경계

isomorphic-git, xterm.js, LightningFS는 모두 클라이언트 전용 라이브러리이다.
서버 실행 경로에서 완전히 격리해야 한다:

- `TerminalPanel` 컴포넌트: `next/dynamic`으로 SSR 비활성화
- `lib/shell/` 전체 디렉토리: 서버 컴포넌트에서 import 금지
- `lib/validation.ts`: isomorphic-git 의존이므로 클라이언트 전용

```tsx
const TerminalPanel = dynamic(() => import('./TerminalPanel'), { ssr: false })
```

서버 컴포넌트에서는 `content.ts`(MD 파싱)만 사용하고, 셸/검증/FS 관련 코드는 클라이언트 컴포넌트에서만 import한다.

---

## 디자인 시스템

### 컬러

- **Light**: bg-white, text-zinc-900
- **Dark**: bg-zinc-950, text-zinc-100
- **Accent**: orange-500 (#f97316)
- **Borders**: zinc-200 (light) / zinc-800 (dark)

### 타이포그래피

- Sans: Geist (본문)
- Mono: Geist Mono (코드, 터미널)

### 컴포넌트 스타일

- 터미널: macOS 스타일 윈도우 크롬 (빨강/노랑/초록 점), 다크 배경
- 코드 블록: orange 텍스트, rounded-xl, border
- 사이드바: 활성 항목에 orange 배경 하이라이트
- 진행 상태: 체크마크 아이콘으로 완료 표시

---

## 배포

- **플랫폼**: Vercel
- **빌드**: `next build` (SSG)
- **도메인**: 미정

---

## 테스팅 전략

### 단위 테스트 (Vitest)

- 셸 파서: 명령어 파싱 정확성
- Git 명령어 핸들러: isomorphic-git API 호출 검증
- 파일시스템 명령어: LightningFS 연동
- 검증 로직: 각 검증 타입별 동작

### 컴포넌트 테스트 (React Testing Library)

- GuidePanel: MD 렌더링, 단계 표시
- TerminalPanel: xterm.js 초기화, 입출력

### 통합 테스트 (Vitest)

- 셸 + isomorphic-git + LightningFS 전체 파이프라인
- 명령어 실행 → 파일시스템 변경 → 검증 통과 흐름

### E2E 테스트 (Playwright)

- 레슨 페이지 네비게이션
- 터미널 명령어 입력 및 출력 확인
- 검증 통과 및 레슨 진행 플로우
- 다크모드 전환
- 모바일 반응형 레이아웃
