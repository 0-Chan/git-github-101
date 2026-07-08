# 레슨 통과(체크) 기준

레슨 진행 체크는 **두 층위**로 동작한다. 실습 단계 체크(레슨 페이지 안 ✅)와
레슨 완료 체크(사이드바·랜딩 커밋 그래프의 ✓)는 기준과 저장 위치가 다르다.

## 1층: 실습 단계 체크 ✅ (GuidePanel)

각 레슨 MD(`content/lessons/*.md`)의 frontmatter에 단계별 검증 규칙이 선언된다:

```yaml
steps:
  - id: add-file
    instruction: "파일을 스테이징 영역에 추가하세요"
    hint: "git add hello.txt"
    validation:
      type: git-staged   # ← 체크 기준
      path: hello.txt
```

### 평가 시점 (2곳)

| 시점 | 대상 | 코드 |
|------|------|------|
| 터미널 명령 실행 직후 | **현재 단계(첫 미완료) 하나만** | `src/components/TerminalPanel.tsx` (onKey Enter 처리) |
| 페이지 로드/새로고침 | **모든 단계 일괄 재검증** (진행도 복원) | `src/components/LessonLayout.tsx` `handleShellReady` → `validateAllSteps` |

### 검증 타입 (`src/lib/validation.ts`)

대부분 **"행위"가 아니라 파일시스템/git 저장소의 "최종 상태"** 를 검사한다.
(예외: `command-run`은 읽기 명령처럼 상태 스냅샷으로 판정할 수 없는 단계를 위해
명령 히스토리를 검사한다.)

| 타입 | 통과 기준 | 파라미터 |
|------|----------|---------|
| `file-exists` | 해당 경로에 파일 존재 (`fs.stat` 성공) | `path` |
| `file-content` | 파일 내용이 `contains` 포함 또는 `matches` 정규식 매치 | `path`, `contains`/`matches` |
| `git-staged` | `statusMatrix`에서 해당 파일 stage 값 = 2 (스테이징됨) | `path` |
| `commit-count` | `git.log()` 커밋 수 ≥ `min` | `min` |
| `branch-exists` | 브랜치 목록에 존재 | `name` |
| `current-branch` | 현재 브랜치 일치 | `name` |
| `commit-message` | **최신 커밋 1개**의 메시지가 정규식 매치 | `pattern` |
| `merge-commit` | 최신 커밋의 부모가 2개 (두-부모 머지 커밋) | — |
| `no-conflict-markers` | 파일에 `<<<<<<<` / `>>>>>>>` 없음 | `path` |
| `remote-exists` | 해당 이름의 리모트 설정 존재 | `name` |
| `tag-exists` | 태그 목록에 존재 | `name` |
| `command-run` | 터미널 명령 히스토리에 정규식 매치하는 명령 존재 | `matches` |
| `rebased-onto` | `name` 브랜치 팁이 HEAD의 조상(자신 제외)이고 그 사이가 전부 단일 부모(선형) — merge로는 통과 불가 | `name` |

검증 경로는 모두 저장소 루트(`/`) 기준 절대 경로이며, 터미널의 cwd와 무관하다.
검증 중 예외가 발생하면 조용히 `false` 처리된다(재시도 자유).

### 상태 기반 모델의 함의

- 힌트와 다른 방법으로 해도 **결과 상태만 맞으면 통과**한다
  (예: `touch` 대신 `echo >` 로 파일을 만들어도 `file-exists` 통과).
- 명령 실행 직후에는 현재 단계만 검사하므로, 단계를 건너뛰어 다음 단계 조건을
  미리 만족시켜도 당장은 체크가 안 뜬다 — 새로고침하면 전체 재검증으로 한꺼번에 뜬다.
- 순서를 강제하지 않는 "결과 스냅샷" 모델이다.

## 2층: 레슨 완료 체크 ✓ (사이드바 · 랜딩 CommitGraph)

- **기준**: 그 레슨의 모든 단계가 통과하는 순간 `markComplete(slug)` 호출
  (`src/components/LessonLayout.tsx` — 단계 완료 시 / 로드 복원 시 두 경로).
- **저장**: localStorage `git101-progress` = `{ "first-commit": true, ... }`
  (`src/lib/progress.ts`, `src/hooks/useProgress.ts`).
- 사이드바 ✓(`Sidebar.tsx`)와 랜딩 철길의 채워진 노드(`CommitGraph.tsx`)가 이 값을 읽는다.
- 랜딩 철길의 **HEAD 헤일로**는 "첫 미완료 레슨"에 표시된다.

## 저장소 키 정리

| 저장소 | 키 | 내용 |
|--------|-----|------|
| localStorage | `git101-progress` | 레슨 완료 여부 맵 |
| localStorage | `git101-fixture-versions-{slug}` | 레슨 fixture 버전 (불일치 시 자동 리셋) |
| IndexedDB | `lesson-{slug}` | 레슨별 가상 파일시스템 (LightningFS) |

## 알려진 공백

**터미널 없는 개념 레슨(01 what-is-git, 09 what-is-github, 11 pull-request)은 완료 처리
경로가 없다.** steps가 0개이고 TerminalPanel이 렌더되지 않아 `markComplete`에 도달할 수
없으므로, 사이드바/랜딩에 ✓가 영원히 표시되지 않는다. (방문 시 완료 처리 등 별도 정책 필요)

## 리셋 경로

| 방법 | 범위 |
|------|------|
| 레슨 페이지 우상단 **리셋** 버튼 | 해당 레슨의 파일시스템 + fixture 버전 + 단계 체크 |
| 🥚 **이스터 에그**: 다크모드 토글을 2초 간격 이내로 **연속 10회** 클릭 | 전체 리셋 — 모든 레슨 파일시스템 + fixture 버전 + 완료 체크(`git101-progress`) 삭제 후 새로고침 (`src/lib/reset.ts`) |

> 진행 체크(`git101-progress`)만 지우면 레슨 페이지 로드 시 IndexedDB에 남은 상태로
> 전체 재검증이 돌아 체크가 되살아난다. 그래서 전체 리셋은 파일시스템까지 함께 지운다.
