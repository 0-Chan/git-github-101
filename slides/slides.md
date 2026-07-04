---
theme: default
title: Git & GitHub 101
info: 브라우저에서 배우는 Git & GitHub 입문 강의 슬라이드
routerMode: hash
colorSchema: dark
fonts:
  sans: IBM Plex Sans KR
  mono: IBM Plex Mono
highlighter: shiki
drawings:
  persist: false
transition: slide-left
---

# ▸ git-github-101

브라우저에서 배우는 Git & GitHub 입문

<div class="pt-8 font-mono text-sm opacity-70">
$ git init
</div>

<!--
- 오늘의 목표: 왜 지금 Git을 배워야 하는지 납득하고, 브라우저에서 직접 손으로 익히기
-->

---

# 버전 관리는 이제 기본기입니다

<v-clicks>

- 효율적인 협업과 안정적인 프로젝트 관리를 위해 **버전 관리 시스템**이 점점 더 중요해집니다
- 많은 회사가 구성원에게 요구하는 능력:
  - 코드·문서의 **변경 이력 관리**
  - 다른 사람과 **충돌 없이 협업**

</v-clicks>

<!--
- 효율적으로 협업하고 프로젝트를 안정적으로 관리하려면 버전 관리 시스템이 점점 더 중요해집니다.
- 많은 회사에서 구성원에게 코드나 문서의 변경 이력을 관리하고 다른 사람과 충돌 없이 협업하는 능력을 요구하기도 합니다.
-->

---

# 하지만 협업이 전부가 아닙니다

AI 코딩 에이전트가 보편화되는 시대, 이제 AI는:

<v-clicks>

- 기능을 **구현**하고
- 버그를 **수정**하고
- 테스트 코드를 **작성**하고
- 문서까지 **고쳐줍니다**

</v-clicks>

<div v-click class="pt-6 text-lg" style="color: var(--lane-feature)">
그렇다면 Git이 필요한 이유는 뭘까요?
</div>

<!--
- 하지만 Git이 중요한 이유가 단순히 협업만은 아닙니다.
- AI 코딩 에이전트가 보편화되는 시대에는 Git이 개발자의 필수 안전장치가 됩니다.
- 이제 AI는 기능을 구현하고 버그를 수정하고 테스트 코드를 작성하고, 문서까지 고쳐줍니다.
-->

---

# 문제는 속도가 아니라 통제입니다

<div class="pt-4 text-xl leading-relaxed">

AI가 코드를 빠르게 만든다는 사실 자체가 문제가 아닙니다.

<span v-click style="color: var(--lane-main)">**그 결과물을 사람이 어떻게 검토하고 통제할 것인가.**</span><span v-click> 그것이 진짜 문제입니다.</span>

</div>

<!--
- 문제는 AI가 코드를 빠르게 만든다는 사실 자체가 아니라, 그 결과물을 사람이 어떻게 검토하고 통제할 것인가입니다.
-->

---

# Git을 모르면 vs 알면

<div class="pt-1 pb-3 opacity-70">
모르면 AI가 만든 코드를 그대로 믿거나, 어디서부터 잘못됐는지 추적하기 어렵습니다.<br>
알면 AI의 결과물을 이렇게 다룹니다:
</div>

````md magic-move
```bash
# 1. AI가 방금 코드를 잔뜩 고쳤습니다. 무엇이 바뀌었을까요?
git diff
```

```bash
# 2. 확인했으면 본진(main)을 지키면서 안전하게 실험합니다
git diff
git checkout -b experiment
```

```bash
# 3. 결과가 마음에 들면, 단위별로 기록합니다
git diff
git checkout -b experiment
git commit -m "AI 제안 적용: 검색 성능 개선"
```

```bash
# 4. 문제가 생기면? 본진으로 돌아가면 그만입니다
git diff
git checkout -b experiment
git commit -m "AI 제안 적용: 검색 성능 개선"
git checkout main   # 실험이 실패해도 본진은 그대로
```
````

<!--
- Git을 모르면 AI가 만든 코드를 그대로 믿거나, 문제가 생겼을 때 어디서부터 잘못되었는지 추적하기 어렵습니다.
- 반대로 Git을 알면 AI가 만든 변경사항을 diff로 확인하고 branch에서 안전하게 실험하고 commit 단위로 기록하고, 문제가 생겼을 때 이전 상태로 되돌릴 수 있습니다.
- [click] diff로 확인 [click] 브랜치로 실험 [click] 커밋으로 기록 [click] 본진 복귀로 되돌리기. 이 네 동작 모두 이 강의에서 직접 실습합니다.
-->

---
layout: center
---

# AI가 속도라면,<br>Git은 브레이크와 핸들입니다

<div class="pt-4 opacity-70">
속도를 안전하게 다루는 도구
</div>

<!--
- AI가 코드 작성의 속도를 높여준다면, Git은 그 속도를 안전하게 다루기 위한 브레이크와 핸들이 됩니다.
- 이 한 문장이 오늘 강의의 핵심 메시지입니다.
-->

---

# Git은 개발자만의 것이 아닙니다

이 강의는 이런 분들을 위해 준비했습니다:

<div class="grid grid-cols-3 gap-3 pt-6 text-center">
<v-clicks>

<div class="rounded-lg border border-gray-400/30 p-3">👩‍💻 개발자</div>
<div class="rounded-lg border border-gray-400/30 p-3">📊 데이터 분석가</div>
<div class="rounded-lg border border-gray-400/30 p-3">📋 기획자</div>
<div class="rounded-lg border border-gray-400/30 p-3">📈 퍼포먼스 마케터</div>
<div class="rounded-lg border border-gray-400/30 p-3">🎨 UI/UX 디자이너</div>
<div class="rounded-lg border p-3" style="border-color: var(--lane-main); color: var(--lane-main)">배우고 싶은 모든 분</div>

</v-clicks>
</div>

<!--
- 그래서 Git은 더 이상 개발자만의 전유물이 아닙니다.
- 개발자, 데이터 분석가, 기획자, 퍼포먼스 마케터, UI/UX 디자이너 그리고 Git과 GitHub를 배우고 싶은 모든 사람들을 위한 강의입니다.
- 처음 Git을 배울 때 이해하기 힘들어하는 부분을 중심으로 설명합니다.
-->

---

# 시작 전에, 나는 어디쯤일까요?

<v-clicks>

- ☐ `git init` `add` `commit` `status`로 단순한 버전 관리가 가능하다
- ☐ working directory, staging area, repository 개념을 알고 있다
- ☐ branch, merge, push, pull을 능숙하게 사용할 수 있다
- ☐ conflict 해결, rebase, pull request 협업 흐름을 이해하고 쓴다

</v-clicks>

<div v-click class="pt-6 text-sm opacity-80">
하나도 체크하지 못했어도 괜찮습니다. 이 강의는 <span class="font-mono" style="color: var(--lane-main)">git init</span>부터 함께 시작합니다.<br>
네 가지 모두 익숙하다면 이 강의는 너무 쉬울 수 있어요.
</div>

<!--
- 본격적으로 시작하기 전 네 가지 체크리스트에 답해보세요.
- (원문 각색) 원래 이 체크리스트는 첫 항목을 전제로 하지만, 이 강의는 완전 입문이므로 첫 항목부터 함께 시작합니다.
- 네 가지 모두 알고 있다면 이 강의가 너무 쉬울 수 있습니다.
-->

---
dragPos:
  split: 300,318,150,_
  merge: 555,120,190,_
---

# 커리큘럼: 브랜치가 갈라졌다 합쳐지는 여정

```mermaid {scale: 0.55, theme: 'base', themeVariables: {git0: '#d97706', git1: '#7c3aed', gitBranchLabel0: '#ffffff', gitBranchLabel1: '#ffffff', commitLabelFontSize: '14px'}}
gitGraph
  commit id: "01 Git이란?"
  commit id: "02 첫 번째 저장소"
  commit id: "03 첫 번째 커밋"
  commit id: "04 커밋 히스토리"
  commit id: "05 수정과 비교"
  branch feature
  commit id: "06 브랜치"
  commit id: "07 머지"
  commit id: "08 충돌 해결"
  checkout main
  merge feature id: "09 GitHub란?"
  commit id: "10 원격 저장소"
  commit id: "11 Pull Request"
```

<v-drag pos="split" class="text-xs font-mono" style="color: var(--lane-feature)">
↑ 06에서 갈라지고
</v-drag>

<v-drag pos="merge" class="text-xs font-mono" style="color: var(--lane-main)">
↓ 09에서 다시 합쳐집니다
</v-drag>

<div class="pt-4 text-sm opacity-70">
기초(01–05)는 <span class="font-mono" style="color: var(--lane-main)">main</span>에서,
브랜치 실습(06–08)은 <span class="font-mono" style="color: var(--lane-feature)">feature</span>에서.
그리고 09강에서 실제로 머지됩니다.
</div>

<!--
- 커리큘럼 자체가 커밋 그래프입니다. 기초 다섯 강은 main 레인, 브랜치 세 강은 feature 레인.
- 6강에서 브랜치가 갈라지고 9강에서 머지되는 이 그림을, 여러분이 8강까지 마치면 직접 만들게 됩니다.
- 튜토리얼 사이트의 레슨 내비게이션도 이 그래프와 같은 구조입니다.
-->

---

# 커밋은 세이브 포인트

파일의 변경사항을 저장소에 기록하는 행위

```bash
touch hello.txt        # 파일 만들기
git add hello.txt      # 스테이징
git commit -m "첫 커밋" # 기록
```

<div class="pt-4 opacity-70">
게임의 세이브 포인트처럼, 그 시점으로 언제든 돌아올 수 있습니다.
</div>

<!--
- 첫 실습에서 이 세 명령을 직접 손으로 쳐볼 겁니다.
-->

---
layout: center
---

# 직접 해보세요

튜토리얼과 함께 브라우저 터미널에서 바로 실습할 수 있습니다

<div class="font-mono pt-4">git-github-101 · /lessons/what-is-git</div>

<!--
- 설치 없이 브라우저 터미널에서 바로 실습이 가능합니다. 함께 시작해봅시다.
-->
