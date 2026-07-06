---
theme: default
title: Git & GitHub 101
info: 브라우저에서 배우는 Git & GitHub 입문 강의 슬라이드
routerMode: hash
colorSchema: dark
canvasWidth: 740
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
안녕하세요, Git과 GitHub 입문 강의를 시작하겠습니다.

오늘 목표는 두 가지입니다. 왜 지금 Git을 배워야 하는지 스스로 납득하는 것, 그리고 브라우저 터미널에서 직접 손으로 익혀보는 것입니다.

설치할 것은 아무것도 없습니다. 브라우저만 있으면 바로 실습할 수 있으니 부담 없이 따라오시면 됩니다.
-->

---

# 우리는 이미 버전 관리를 하고 있습니다

<div class="text-xl opacity-75 -mt-2 pb-4">
다만, 아주 고통스러운 방식으로
</div>

<div class="font-mono leading-loose">
<v-clicks>

<div>📄 기획안.pptx</div>
<div>📄 기획안_수정.pptx</div>
<div>📄 기획안_최종.pptx</div>
<div>📄 기획안_최종_진짜최종.pptx</div>
<div style="color: var(--lane-main)">📄 기획안_최종_진짜최종2_이걸로.pptx</div>

</v-clicks>
</div>

<div v-click class="pt-6 text-lg">
어느 게 진짜 최종일까요? <span style="color: var(--lane-main)">지난주 버전으로 돌아갈 수 있나요?</span>
</div>

<!--
본격적으로 시작하기 전에, 장면 하나 보여드리겠습니다.

[click] 기획안을 하나 씁니다.

[click] 피드백을 받아서 수정본을 저장합니다.

[click] 통과됐으니 이제 최종.

[click] 아, 한 군데만 더 고치자고 하네요. 진짜 최종.

[click] 그리고 대망의 "진짜최종2_이걸로". 다들 이런 폴더 하나쯤 있으시죠? 이게 바로 버전 관리입니다. 우리 모두 이미 하고 있어요.

[click] 그런데 두 가지 질문에는 답하기 어렵습니다. 어느 게 진짜 최종인지, 그리고 지난주 버전으로 돌아갈 수 있는지. 이 두 질문에 제대로 답하게 해주는 도구가 오늘 배울 Git입니다.
-->

---

# 버전 관리는 이제 기본기입니다

<div class="text-xl opacity-75 -mt-2 pb-4">
빠르게 바꿀수록, 안전하게 되돌릴 수 있어야 합니다
</div>

<v-clicks>

- 개발은 계속 **수정하고 검증하는 과정**입니다
- Git은 변경사항을 **기록하고 비교**하게 해줍니다
- 문제가 생기면 언제든 **안전하게 되돌릴 수 있습니다**

</v-clicks>

<!--
방금 그 파일명 지옥에 이름을 붙이면 버전 관리 문제입니다. 왜 이게 기본기인지부터 짚고 가겠습니다.

[click] 개발은 한 번에 끝나지 않습니다. 고치고, 확인하고, 다시 고치는 과정의 반복이죠.

[click] Git은 그 변경사항을 전부 기록해두고, 무엇이 달라졌는지 비교할 수 있게 해줍니다.

[click] 그리고 무엇보다, 문제가 생기면 언제든 이전 상태로 안전하게 되돌릴 수 있습니다. "되돌릴 수 있다"는 오늘 계속 반복될 핵심 단어입니다.

그래서 많은 회사가 변경 이력을 관리하고 다른 사람과 충돌 없이 협업하는 능력을 기본기로 요구합니다.
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

<div v-click class="pt-6 text-lg">
그렇다면 Git이 필요한 이유는 뭘까요?
</div>

<!--
그런데 협업 때문에만 Git이 필요한 건 아닙니다. 요즘은 AI 코딩 에이전트가 일상이 됐죠.

[click] 이제 AI는 기능을 구현해주고

[click] 버그도 잡아주고

[click] 테스트 코드까지 대신 써줍니다.

[click] 심지어 문서까지 고쳐주죠.

[click] 그럼 여기서 질문 하나 드리겠습니다. AI가 이렇게 다 해주는데, 우리가 Git을 배워야 하는 이유는 뭘까요? 잠깐만 각자 생각해보세요.
-->

---

# 문제는 속도가 아니라 통제입니다

<div class="pt-4 text-xl leading-relaxed">

AI가 코드를 빠르게 만든다는 사실 자체가 문제가 아닙니다.

<span v-click style="color: var(--lane-main)">**그 결과물을 사람이 어떻게 검토하고 통제할 것인가.**</span><span v-click> 그것이 진짜 문제입니다.</span>

</div>

<!--
AI가 코드를 빠르게 만들어내는 것 자체는 문제가 아닙니다. 오히려 좋은 일이죠.

[click] 진짜 문제는 이겁니다. 그 결과물을 사람이 어떻게 검토하고 통제할 것인가.

[click] 속도는 AI가 내지만, 방향과 책임은 여전히 사람의 몫입니다. 그 통제 수단이 바로 Git입니다.
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
Git을 모르면 AI가 만든 코드를 그대로 믿는 수밖에 없습니다. 뭔가 잘못됐을 때 어디서부터 꼬였는지 찾기도 어렵죠. 알면 이렇게 다룹니다.

첫 번째, AI가 코드를 잔뜩 고쳐놨다면 git diff로 무엇이 바뀌었는지부터 눈으로 확인합니다.

[click] 두 번째, 괜찮아 보이면 브랜치를 하나 만듭니다. 본진인 main을 지키면서 안전하게 실험하는 거죠.

[click] 세 번째, 결과가 마음에 들면 commit으로 작업 단위마다 기록해둡니다.

[click] 마지막으로, 문제가 생기면 main으로 돌아가면 그만입니다. 실험이 실패해도 본진은 그대로니까요.

확인, 실험, 기록, 복귀. 이 네 동작을 오늘 전부 직접 실습합니다.
-->

---
layout: center
---

# AI가 속도라면,<br>Git은 브레이크와 핸들입니다

<div class="pt-4 opacity-70">
속도를 안전하게 다루는 도구
</div>

<!--
오늘 강의를 한 문장으로 줄이면 이겁니다. AI가 속도라면, Git은 브레이크와 핸들입니다.

빨리 달리는 차일수록 브레이크와 핸들이 좋아야 합니다. 마찬가지로 코드가 빨리 만들어질수록, 멈추고 되돌리고 방향을 잡는 도구가 중요해집니다.

오늘 다른 건 다 잊으셔도 이 문장 하나만 기억하시면 됩니다.
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
그래서 Git은 더 이상 개발자만의 도구가 아닙니다.

[click] 개발자는 물론이고

[click] 데이터를 다루는 분석가

[click] 문서 작업이 많은 기획자

[click] 퍼포먼스 마케터

[click] UI/UX 디자이너까지, 변경되는 산출물을 다루는 모든 직군에 쓸모가 있습니다.

[click] 그리고 직군과 상관없이 배우고 싶은 마음만 있다면 누구든 환영입니다. 이 강의는 처음 배울 때 다들 헷갈려하는 지점을 중심으로 진행합니다.
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
본격적으로 시작하기 전에, 지금 내가 어디쯤인지 가볍게 점검해봅시다. 네 가지 질문에 마음속으로 체크해보세요.

[click] 첫째, git init, add, commit, status로 단순한 버전 관리를 할 수 있는가.

[click] 둘째, working directory, staging area, repository 개념을 알고 있는가.

[click] 셋째, branch, merge, push, pull을 능숙하게 쓰는가.

[click] 넷째, conflict 해결과 rebase, pull request 협업 흐름까지 이해하고 있는가.

[click] 하나도 체크하지 못하셨어도 전혀 괜찮습니다. 이 강의는 git init부터 함께 시작하니까요. 반대로 네 가지가 전부 익숙하다면 오늘 강의는 좀 쉬울 수 있습니다.

이 네 항목은 OT 자가진단으로 한 번 더 쓰이니, 지금의 상태를 기억해두세요.
-->

---
dragPos:
  split: 300,318,150,_
  merge: 555,120,190,_
---

# 커리큘럼: 브랜치가 갈라졌다 합쳐지는 여정

```mermaid {scale: 0.55, theme: 'base', themeVariables: {git0: '#f5a524', git1: '#7c3aed', gitBranchLabel0: '#ffffff', gitBranchLabel1: '#ffffff', commitLabelFontSize: '14px'}}
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

<v-drag pos="split" class="text-xs font-mono">
↑ 06에서 갈라지고
</v-drag>

<v-drag pos="merge" class="text-xs font-mono" style="color: var(--lane-main)">
↓ 09에서 다시 합쳐집니다
</v-drag>

<div class="pt-4 text-sm opacity-70">
기초(01–05)는 <span class="font-mono" style="color: var(--lane-main)">main</span>에서,
브랜치 실습(06–08)은 <span class="font-mono">feature</span>에서.
그리고 09강에서 실제로 머지됩니다.
</div>

<!--
오늘의 커리큘럼입니다. 그림이 좀 특이하죠? 커리큘럼 자체를 커밋 그래프로 그렸습니다.

기초 다섯 강은 주황색 main 레인에서 진행합니다. 그러다 6강에서 보라색 feature 브랜치로 갈라지고, 브랜치와 머지, 충돌 해결을 익힌 다음 9강에서 다시 main으로 합쳐집니다.

지금은 이 그림이 낯설어도 괜찮습니다. 여러분이 8강까지 마치면 바로 이 그림을 여러분 손으로 직접 만들게 되니까요. 튜토리얼 사이트의 레슨 내비게이션도 이 구조 그대로입니다.
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
첫 실습에서 만날 세 가지 명령입니다. 파일을 만들고, git add로 스테이징하고, git commit으로 기록합니다. 지금은 외우지 않으셔도 됩니다. 곧 직접 쳐볼 거니까요.

커밋은 게임의 세이브 포인트라고 생각하시면 됩니다. 보스전 앞에서 세이브해두면 져도 거기서 다시 시작할 수 있잖아요. 커밋도 똑같습니다. 기록해둔 시점으로 언제든 돌아올 수 있습니다.
-->

---
layout: center
---

# 직접 해보세요

튜토리얼과 함께 브라우저 터미널에서 바로 실습할 수 있습니다

<div class="font-mono pt-4">git-github-101 · /lessons/what-is-git</div>

<!--
설명은 여기까지입니다. 이제 직접 해볼 차례입니다.

설치도 계정도 필요 없습니다. 브라우저에서 튜토리얼 사이트를 열어주세요. 첫 레슨부터 저와 함께 진행하겠습니다.
-->
