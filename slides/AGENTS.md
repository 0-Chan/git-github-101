# AGENTS.md

이 저장소는 **Slidev 기반 브라우저 발표 자료**를 만드는 프로젝트다. 1차 산출물은 `.pptx`가 아니라 `slides.md`, Vue 컴포넌트, CSS, 정적 에셋으로 구성된 **웹 슬라이드 덱**이다. PDF/PPTX export는 공유·제출용 fallback으로만 취급한다.

## Agent compatibility

- Codex는 이 파일을 프로젝트 지침으로 읽는다.
- Claude Code는 `AGENTS.md`를 직접 읽지 않을 수 있으므로 같은 디렉터리의 `CLAUDE.md`에서 `@AGENTS.md`를 import한다. (저장소 루트의 `CLAUDE.md`/`AGENTS.md`는 Next.js 앱용으로 별개다.)
- 사용자 요청이 이 파일과 충돌하면 사용자 요청을 우선한다.
- 명령어는 항상 `package.json`, lockfile, README를 먼저 확인한 뒤 실행한다.

## 이 저장소에서의 배선 (일반 지침보다 우선)

이 디렉터리는 독립 프로젝트가 아니라 **git-github-101 저장소의 pnpm 워크스페이스 서브패키지**다.
아래 사실이 이 문서의 일반 지침(GitHub Pages, `dist/` 등)과 충돌하면 아래가 우선한다.

- **덱은 회차별 멀티 엔트리다**: `session-1.md` ~ `session-4.md` (4회차 과정, `docs/course-structure.md` 참조).
  `components/`·`style.css`·`global-bottom.vue`·`public/` 에셋은 모든 엔트리가 공유한다.
- **`public/`은 회차별 폴더로 관리한다**: 특정 회차 전용 이미지는 `public/s{N}/`에,
  전 덱 공유 에셋(favicon, Git 로고)은 루트에 둔다.
- **배경은 회차별이다**: `public/s{N}/background-s{N}.png`를 각 엔트리 headmatter의
  `deckBackground` 키로 지정하면 `global-bottom.vue`가 읽어 깐다.
  headmatter는 엔트리마다 복제되어 있으니 공통 설정을 바꿀 때는 4개 파일을 모두 수정한다.
- 빌드 산출물은 `dist/`가 아니라 `../public/slides/s{N}`로 나간다 (gitignore됨, 커밋 금지).
  base는 `--base /slides/s{N}/` — 둘 다 `package.json` build script에 이미 인코딩돼 있으니 바꾸지 않는다.
- 배포는 GitHub Pages가 아니라 **Vercel 단일 프로젝트**: 루트 `pnpm build`가
  `slides build(엔트리 4개) → next build`를 체인 실행하고, Next rewrite(`/slides/:deck` → `/slides/:deck/index.html`)로
  서빙된다. `/slides`는 `/slides/s1`로 redirect된다.
- 각 엔트리 headmatter의 `routerMode: hash`는 필수다. 정적 서빙에 SPA 폴백이 없어
  history 모드로 바꾸면 딥링크가 404 난다.
- 개발 서버는 루트에서 `pnpm dev:slides`(1회차), 다른 회차는 여기서 `pnpm dev:s2`~`dev:s4`.
- 덱의 시각 토큰(IBM Plex, lane 팔레트 amber/violet)은 웹 앱(`src/app/globals.css`)과 일치시킨다.

## Mission

- 발표자가 브라우저에서 자연스럽게 발표할 수 있는 Slidev 덱을 만든다.
- 한 슬라이드에는 하나의 핵심 메시지만 둔다.
- 기본 언어는 한국어다. 사용자가 요청하지 않으면 자연스러운 한국어 발표체로 쓴다.
- 개발자/기술 강의에서는 코드, 다이어그램, 실습 흐름, 발표자 노트를 중시한다.
- 인터랙션이 있는 웹 발표를 우선하고, PPTX 호환성은 후순위로 둔다.

## Setup commands

패키지 매니저는 lockfile 기준으로 선택한다: `pnpm-lock.yaml` → `pnpm`, `bun.lock*` → `bun`, `yarn.lock` → `yarn`, `package-lock.json` → `npm`. 아무것도 없으면 Slidev 프로젝트는 `pnpm`을 기본값으로 사용한다.

```bash
# 새 프로젝트
pnpm create slidev

# 설치 / 개발 / 빌드
pnpm install
pnpm dev
pnpm build
# build script가 없으면
pnpm exec slidev build

# 공개 배포용: 발표자 노트 제외
pnpm exec slidev build --without-notes

# PDF / PPTX export
pnpm exec slidev export
pnpm exec slidev export --format pptx
```

Export가 Playwright 관련 오류로 실패하면 기존 의존성을 확인한 뒤 필요할 때만 실행한다.

```bash
pnpm add -D playwright-chromium
```

## Recommended Slidev skill

공식 Slidev skill이 **이미 이 디렉터리의 `.agents/skills/slidev`에 설치돼 있다**
(`skills-lock.json`에 해시 고정 — 재설치 불필요). Slidev 문법이 필요한 작업 전에:

1. `.agents/skills/slidev/SKILL.md`(인덱스)를 읽는다.
2. 필요한 주제의 `references/*.md`만 추가로 읽는다 (예: 애니메이션은 `core-animations.md`).

skill 시스템에 등록되지 않은 에이전트도 위 파일을 직접 읽으면 된다. 다른 환경에서 새로
설치해야 하면 `npx skills add slidevjs/slidev`. 어떤 경우에도 Slidev 문법을 추측하지 말고
기존 `slides.md`, 현재 테마, 공식 문서를 기준으로 수정한다.

## Project structure

```text
.
├── slides.md          # 기본 엔트리 덱
├── package.json
├── AGENTS.md          # 에이전트 공통 지침
├── CLAUDE.md          # Claude Code용 import shim, 선택
├── components/        # 재사용 Vue 컴포넌트
├── layouts/           # 커스텀 레이아웃, 필요한 경우만
├── public/            # 정적 이미지/비디오/다운로드 에셋
├── snippets/          # 긴 코드 예제, 필요한 경우만
├── style.css          # 전역 스타일, 기존 구조 우선
└── pages/             # 큰 덱 분할 시 사용
```

- `slides.md`를 기본 진입점으로 유지한다. 별도 엔트리가 있으면 README나 package script에 명확히 드러낸다.
- 반복되는 시각 요소는 `components/`의 Vue 컴포넌트로 만든다.
- 발표 원본은 Markdown과 코드로 남긴다. 큰 PNG 한 장으로 슬라이드를 대체하지 않는다.
- `dist/`, `.slidev/`, `slides-export.pdf`, `slides-export.pptx` 같은 생성물은 요청 없이는 커밋 대상으로 보지 않는다.
- 외부 이미지/폰트/아이콘을 추가할 때는 라이선스와 출처를 확인한다.

## Slidev Markdown rules

- Slide 구분자는 앞뒤에 빈 줄이 있는 `---` 한 줄로 둔다.
- 파일 맨 위 첫 frontmatter는 deck 전체 설정이다.
- 각 슬라이드의 frontmatter는 해당 슬라이드에만 적용한다.
- 발표자 노트는 슬라이드 끝의 HTML comment block으로 작성한다.
- 슬라이드 중간의 HTML comment는 노트가 아니다.
- 코드 블록에는 언어를 명시한다. 예: ```` ```bash ```` 또는 ```` ```ts ````.
- Mermaid/PlantUML/LaTeX는 발표장에서 한눈에 읽히는 크기로 제한한다.
- Click animation은 `<v-clicks>`, `v-click`, `v-after` 등을 사용하되 이해를 돕는 경우에만 쓴다.
- 애니메이션은 순차 설명을 돕기 위한 수단이다. 장식용으로 남발하지 않는다.

예시:

```md
---
layout: center
---

# 핵심 메시지 하나

짧은 보조 설명 한 줄.

<!--
- 발표자가 여기서 말할 요점 1
- 발표자가 여기서 말할 요점 2
-->
```

## Content rules

- 제목은 결론형으로 쓴다. 예: “Git은 파일 저장소가 아니라 변경 이력 시스템이다.”
- 본문 bullet은 3~5개를 넘기지 않는다.
- 긴 문단, 중첩 bullet, 작은 표, 20줄 이상의 코드는 피한다.
- 코드가 길면 여러 슬라이드로 나누거나 `snippets/`에 두고 필요한 줄만 보여준다.
- 어려운 개념은 먼저 비유/그림/흐름으로 설명하고, 그 다음 명령어를 보여준다.
- 한국어 자료에서는 용어를 일관되게 쓴다. 예: “작업 디렉터리”, “스테이징 영역”, “저장소”, “커밋”, “브랜치”.
- 영어 원어가 중요한 기술 용어는 첫 등장에만 병기한다. 예: “스테이징 영역(staging area)”.
- 발표자가 말할 내용은 노트에 넣고, 청중이 읽을 내용만 화면에 둔다.

## Visual design rules

- 16:9 발표장을 기준으로 가독성을 최우선으로 한다.
- 제목, 본문, 코드, 캡션의 위계를 명확히 한다.
- 작은 글씨로 많은 정보를 넣지 않는다.
- 명령어와 코드는 복사 가능한 텍스트로 유지한다.
- 배경 이미지 위에는 충분한 대비를 확보한다.
- 아이콘과 일러스트는 메시지를 강화할 때만 사용한다.
- 중요한 도식은 가능하면 Mermaid, SVG, Vue 컴포넌트처럼 수정 가능한 형태로 만든다.

## Vue and CSS rules

- `components/`에는 발표 도식, 타임라인, 카드, 비교표처럼 재사용 가치가 있는 요소만 둔다.
- 컴포넌트 props는 단순하고 명확하게 만든다.
- Slidev Markdown에서 이해하기 어려운 거대한 inline HTML을 반복하지 않는다.
- CSS는 기존 프로젝트 스타일 방식을 따른다. 기존에 UnoCSS utility를 쓰면 우선 활용한다.
- 브라우저에서만 동작하는 코드는 SSR/build 문제를 피하도록 주의한다.

## Diagrams and technical teaching

- 프로세스 설명은 flowchart, timeline, sequence, state diagram 중 가장 단순한 표현을 고른다.
- Git/GitHub 강의라면 commit graph, branch/merge, working tree → staging area → repository 흐름을 시각화한다.
- 다이어그램 텍스트는 짧고 크게 쓴다.
- 복잡한 다이어그램은 “전체 그림 1장”보다 “단계별 reveal”이 낫다.
- 실습 슬라이드는 명령어, 기대 결과, 흔한 오류를 분리해서 보여준다.

## Workflow for substantial slide work

1. `README.md`, `package.json`, `slides.md`, 기존 컴포넌트, 스타일을 먼저 읽는다.
2. 발표 대상, 시간, 목적, 최종 산출물 요구사항을 사용자 요청에서 추출한다.
3. 전체 스토리라인을 먼저 잡고, 슬라이드 제목을 “핵심 메시지” 형태로 설계한다.
4. `slides.md`를 작성하거나 수정하고, 반복 시각 요소는 Vue 컴포넌트로 분리한다.
5. 발표자 노트를 추가한다.
6. `pnpm build` 또는 해당 프로젝트의 build script로 검증한다.
7. 가독성, 흐름, 중복, 과밀 슬라이드를 리뷰하고 수정한다.
8. 최종 응답에는 변경 파일, 실행한 명령, 남은 이슈를 짧게 요약한다.

작은 수정은 절차를 축약하되, 가능한 한 빌드 검증과 변경 요약은 유지한다.

## Quality gates

작업 전후로 확인한다.

- 모든 슬라이드가 16:9에서 잘 읽히는가?
- 각 슬라이드의 핵심 메시지가 제목만 봐도 드러나는가?
- 한 슬라이드에 너무 많은 bullet, 코드, 표가 들어가지 않았는가?
- 발표자 노트가 슬라이드 끝 comment block에 있는가?
- 데모 명령어가 실제로 복사해서 실행 가능한가?
- 이미지 경로가 `public/` 기준으로 올바른가?
- Mermaid/Vue 컴포넌트가 build를 깨지 않는가?
- 공개 배포 시 speaker notes를 포함하지 않아야 하는지 확인했는가?

## Build, export, and hosting policy

- 기본 공유 방식은 정적 웹앱 build 결과다.
- 공개 배포용 build에서는 필요한 경우 `--without-notes`를 사용한다.
- GitHub Pages 하위 경로에 배포할 때는 `slidev build --base /repo-or-path/`처럼 base path를 명시한다.
- PDF는 인쇄/공유용 fallback이다.
- PPTX는 PowerPoint 제출이 명시적으로 필요할 때만 만든다.
- PPTX export를 편집 가능한 PowerPoint 원본으로 기대하지 않는다.

## Security, privacy, and dependencies

- API key, token, private URL, 내부 고객 정보, 비공개 노트를 슬라이드나 빌드 결과에 넣지 않는다.
- 공개 배포 전에 발표자 노트 포함 여부를 확인한다.
- 외부 스크립트/CDN을 추가하지 않는다. 꼭 필요하면 이유와 대안을 설명한다.
- 알 수 없는 저장소나 스크립트를 실행하지 않는다.
- `rm -rf`, 강제 push, 대규모 파일 삭제, dependency major upgrade는 사용자 요청 없이 하지 않는다.
- 새 dependency는 최소화하고, 먼저 Slidev/Vue/UnoCSS/Mermaid 내장 기능으로 해결한다.
- lockfile이 있으면 package manager를 섞지 않는다.

## Final response style

최종 응답은 다음만 간결하게 요약한다.

- 무엇을 바꿨는지
- 어떤 파일을 수정했는지
- 실패한 검증이나 남은 이슈가 있는지
- 사용자가 바로 실행할 다음 명령이 무엇인지
