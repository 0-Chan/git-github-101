---
theme: default
title: Git & GitHub 101 (1회차)
info: 브라우저에서 배우는 Git & GitHub 입문 강의 슬라이드 (1회차)
routerMode: hash
colorSchema: dark
canvasWidth: 740
deckBackground: s1/background-s1.png
favicon: /favicon.ico
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
인사 / 오늘 목표 2개: 왜 배우는지 납득 + 브라우저에서 직접 실습

설치 없음, 브라우저만 있으면 됨 (부담 낮추기)
-->

---

# 강사 소개

<div class="text-xl opacity-75 -mt-2 pb-4">
만드는 것을 좋아해서, 만드는 곳을 옮겨 다녔습니다
</div>

<div class="grid grid-cols-2 gap-6 items-center">

<div class="flex justify-center"><img src="./public/s1/tutor_photo.jpg" class="rounded-lg max-h-64" alt="강사 사진"></div>

<div>
<v-clicks>

- 🤖 **로봇 개발자**로 커리어 시작
- 🖥️ **프론트엔드 개발**로 전향
- 어느덧 **현업 5년차** 개발자

</v-clicks>

<div v-click class="pt-4 text-sm">
분야를 옮기며 사용하던 언어와 프레임워크는 달라졌지만, <span style="color: var(--lane-main)">Git을 활용하는 건 같았습니다</span>
</div>
</div>

</div>

<!--
이름: 김영찬

[click] 로봇 개발자 시절 (짧은 에피소드 하나)

[click] 프론트엔드 전향 계기 가볍게

[click] 현업 5년차

[click] 핵심: 언어·프레임워크는 계속 바뀌어도 Git으로 일하는 방식은 동일 (로봇 펌웨어에서도, 웹에서도) / 어떤 직군이든 따라가는 도구

→ 다음: 4일 커리큘럼
-->

---

# 4일 간 커리큘럼 안내

<div class="text-xl opacity-75 -mt-2 pb-4">
1~2일차는 입문, 3~4일차는 심화 과정입니다
</div>

| 일차 | 난이도 | 내용 |
|------|--------|------|
| 1일차 | 🌱 입문 | Git 기초와 커밋 |
| 2일차 | 🌿 기본 | Git 심화와 두 번째 PR |
| 3일차 | 🌳 응용 | CI/CD 파이프라인 구축과 코드 리뷰 |
| 4일차 | 🌳 응용 | 오픈소스 기여와 포트폴리오 |

<!--
표는 훑기만 (행 낭독 X). 강조 포인트:
- 1~2일차 입문: Git 처음인 분 기준
- 3일차: Actions로 CI/CD + 코드 리뷰 (실무 그대로의 흐름)
- 4일차: 오픈소스 기여 + 포트폴리오

페이오프: 수료하면 "보여줄 수 있는 저장소"가 실물로 남음
안심: 지금 몰라도 됨
-->

---

# Git이 어려운 건 여러분 탓이 아닙니다

<div class="text-xl opacity-75 -mt-2 pb-4">
그림 없이 명령어부터 외우면 누구나 헤맵니다
</div>

<v-clicks>

- 대부분 이렇게 배웁니다: `add`, `commit`, `push`... **주문처럼 외우기**
- 머릿속에 **그림(멘탈 모델)** 이 없으면, 왜 쓰는지도 무엇이 좋은지도 보이지 않습니다
- 그래서 오늘은 명령어가 아니라 **그림부터** 그립니다

</v-clicks>

<!--
Q: Git 배우다 포기해본 분? / "여러분 잘못 아님"

[click] 다들 명령어 암기부터 시작 → 외운 범위 벗어나면 바로 막힘

[click] 원인 = 그림(멘탈 모델) 부재 → 왜 쓰는지, 뭐가 좋은지 안 보임

[click] 오늘은 순서 뒤집기: 그림 먼저, 명령어는 따라옴

→ 다음: Git 없는 세상 (파일명 지옥)
-->

---

# 우리는 이미 버전 관리를 하고 있습니다

<div class="text-xl opacity-75 -mt-2 pb-4">
다만, 아주 고통스러운 방식으로
</div>

<div class="font-mono leading-loose">
<v-clicks>

<div>📄 발표자료.pptx</div>
<div>📄 발표자료_수정.pptx</div>
<div>📄 발표자료_자료조사보강.pptx</div>
<div>📄 발표자료_최종.pptx</div>
<div>📄 발표자료_최종_발표자_hotfix.pptx</div>
<div style="color: var(--lane-main)">📄 발표자료_최종_진짜최종2_제발마지막.pptx</div>

</v-clicks>
</div>

<div v-click class="pt-6 text-lg">
어느 게 진짜 최종일까요? <span style="color: var(--lane-main)">지난주 버전으로 돌아갈 수 있나요?</span>
</div>

<!--
장면 하나 (파일명 에스컬레이션, 클릭마다 리듬감 있게 짧은 상황극)

[click] 초안 작성

[click] 피드백 반영 수정본

[click] 자료조사 보강 요청

[click] 통과, 최종!

[click] 발표 직전 hotfix

[click] "제발마지막" 등장 / Q: 다들 이런 폴더 있으시죠? = 우리 모두 이미 버전 관리 중

[click] 못 답하는 질문 2개 강조 → 이걸 해결하는 게 오늘의 Git
-->

---

# Git 특징 1: 우아하게 버전 관리하기

<div class="text-xl opacity-75 -mt-2 pb-2">
파일을 늘리는 대신, 기록을 쌓습니다
</div>

```mermaid {scale: 0.6, theme: 'base', themeVariables: {git0: '#f5a524', gitBranchLabel0: '#ffffff', commitLabelFontSize: '13px'}}
gitGraph
  commit id: "발표자료 작성"
  commit id: "피드백 반영"
  commit id: "자료조사 보강"
  commit id: "발표자 hotfix"
  commit id: "최종 완성"
```

<div v-click class="pt-2">

```text
commit a1b2c3d (HEAD -> main)
Author: 김발표 <presenter@example.com>
Date:   Mon Jul 6 14:32:11 2026 +0900

    자료조사 보강
```

</div>

<div v-click class="pt-3 text-sm">
파일 여섯 개 대신 이력 한 줄. <span style="color: var(--lane-main)">누가, 언제, 왜</span> 바꿨는지까지 남습니다
</div>

<!--
아까 그 여섯 파일이 이렇게: 파일은 하나, 각 시점은 커밋으로

[click] git log = 누가/언제/왜 자동 기록 / "이거 누가 고쳤어?" → 파일명 뒤지기 대신 로그

[click] 파일명 짓기 고민 → 커밋 메시지 한 줄

→ 다음: 이 도구의 탄생사
-->

---

# Git은 이제 갓 스무 살입니다

<div class="text-xl opacity-75 -mt-2 pb-4">
리눅스를 만들다가 태어난 도구
</div>

<div class="grid grid-cols-2 gap-6 items-center">

<img src="./public/s1/linus-with-git.jpeg" class="rounded-lg" alt="Git 20주년 아트워크와 리누스 토발즈">

<div>
<v-clicks>

- **1991** 리눅스 시작. 패치를 이메일로 받아 손으로 합침
- **2002** 상용 도구 **BitKeeper** 도입
- **2005** 리누스가 **2주 만에 Git**을 직접 개발

</v-clicks>
</div>

</div>

<!--
사진: 리누스 토발즈 (리눅스와 Git, 둘 다 만든 사람)

[click] 1991: 수천 명의 패치를 이메일로 수동 병합 = 파일명 지옥의 초대형판

[click] 2002: BitKeeper 채택 (당시 무료는 CVS·SVN 중앙 방식뿐, 리누스가 싫어해서 상용 선택)

[click] 2005: 무료 종료 → 직접 개발, 2주 / "갓 스무 살" 포인트

→ 다음: 리누스가 심은 설계 (특징 2)
이미지: GitHub Git 20주년 아트워크
-->

---

# Git 특징 2: 모두가 완전한 사본을 갖습니다

<div class="text-xl opacity-75 -mt-2 pb-4">
분산 버전 관리 시스템(DVCS)이라고 부릅니다
</div>

<div class="grid grid-cols-2 gap-4">

<div v-click class="rounded-lg border border-gray-400/30 p-4">
<div class="font-bold">중앙집중식</div>
<div class="text-xs opacity-70 pb-2">SVN(서브버전) · CVS</div>
<div class="text-2xl pb-2">💻 💻 💻 → 🏢</div>
<div class="text-sm opacity-80">이력은 서버 한 곳에만 있습니다.<br>서버가 죽으면 이력도 끝입니다.</div>
</div>

<div v-click class="rounded-lg border p-4" style="border-color: var(--lane-main)">
<div class="font-bold pb-2" style="color: var(--lane-main)">분산식 = Git</div>
<div class="text-2xl pb-2">💻📚 💻📚 💻📚</div>
<div class="text-sm opacity-80">clone하는 순간, 각자가 커밋 이력<br>전체의 완전한 사본을 갖습니다.</div>
</div>

</div>

<div v-click class="pt-6 text-lg">
서버가 통째로 사라져도, <span style="color: var(--lane-main)">팀원 한 명의 컴퓨터에 전부</span> 남아 있습니다
</div>

<!--
리누스가 심은 설계 = 분산

[click] 중앙집중식: 아까 리누스가 싫어했다던 그 도구들 / SVN은 지금도 쓰는 회사 있음

[click] clone = 첫 커밋부터 전체 이력 통째 복사 / 팀원 5명 = 완전한 사본 5개

[click] Q: 서버가 사라져도 남는다, 말이 되나 싶죠? → 픽사 실화
-->

---

# 픽사도 겪은 일입니다

<div class="text-xl opacity-75 -mt-2 pb-3">
1998년, Toy Story 2가 통째로 사라질 뻔한 날
</div>

<v-switch>
<template #0>
<div class="h-56 flex items-center justify-center"><img src="./public/s1/toystory-1.png" class="max-h-full rounded-lg" alt="Toy Story 2 포스터"></div>
<div class="pt-3 text-center opacity-90">1998년, 개봉을 앞둔 Toy Story 2</div>
</template>
<template #1>
<div class="h-56 flex items-center justify-center"><img src="./public/s1/toystory-2.png" class="max-h-full rounded-lg" alt="픽사 스튜디오"></div>
<div class="pt-3 text-center opacity-90">3D 애니메이션의 선두 주자 픽사, Toy Story 2 제작 2년차에 접어들 무렵이었습니다</div>
</template>
<template #2>
<div class="h-56 flex items-center justify-center"><img src="./public/s1/toystory-3.png" class="max-h-full rounded-lg" alt="터미널 화면"></div>
<div class="pt-3 text-center opacity-90">누군가 서버에서 실수로 <span class="font-mono" style="color: var(--lane-main)">rm -rf *</span> (전체 삭제)를 실행합니다.</div>
</template>
<template #3>
<div class="h-56 flex items-center justify-center"><img src="./public/s1/toystory-4.png" class="max-h-full rounded-lg" alt="데이터 유실"></div>
<div class="pt-3 text-center opacity-90">2년치 작업의 <span style="color: var(--lane-main)">90%가 사라졌지만</span>, 안타깝게도 백업 시스템은 정상이 아니었습니다.</div>
</template>
<template #4>
<div class="h-56 flex items-center justify-center"><img src="./public/s1/toystory-5.png" class="max-h-full rounded-lg" alt="Galyn Susman 인터뷰"></div>
<div class="pt-3 text-center opacity-90">중앙의 원본이 사라진 지금, 유일한 희망은 재택근무 중이던 기술 감독 <span style="color: var(--lane-main)">Galyn Susman의 집 컴퓨터</span></div>
</template>
<template #5>
<div class="h-56 flex items-center justify-center"><img src="./public/s1/toystory-6.jpeg" class="max-h-full rounded-lg" alt="담요로 감싼 컴퓨터"></div>
<div class="pt-3 text-center opacity-90">우여곡절 끝에 사본을 담은 컴퓨터를 무사히 운반했고, 영화는 기간 내에 완성됐습니다</div>
</template>
</v-switch>

<!--
"서버가 사라지는 날"의 실화, 1998 픽사

[click] 3D 선두 픽사, TS2 제작 2년차

[click] rm -rf 장면: 우디 모자부터 폴더가 눈앞에서 증발 (극적으로)

[click] 90% 손실 + 백업은 한 달째 조용히 실패 중 / "백업이 있다 ≠ 복구할 수 있다"

[click] 유일한 희망: Susman, 출산 재택 → 집에 전체 사본

[click] 담요 운반, 기간 내 완성 / 구한 건 백업이 아니라 "전체 사본을 가진 또 한 사람" = 분산 그 자체 / clone 한 번이면 될 일 / 원격 저장소 장에서 재회수 예고

출처: 픽사 "Studio Stories: The Movie Vanishes", 『Creativity, Inc.』
-->

---

# 만약 픽사에 Git이 있었다면 어땠을까요?

<v-clicks>

- 픽사 사고의 본질: 프로젝트의 **원본이 단 한 곳**에 있었다는 것
- Git이 있었다면: clone한 **모든 컴퓨터가 전체 이력을 담은 완전한 사본**

</v-clicks>

<div v-click class="pt-10 text-xl leading-relaxed">

> Git은 실수를 막는 도구가 아니라,<br>실수가 재앙이 되지 않게 만드는 <span style="color: var(--lane-main)">**안전장치**</span>입니다

</div>

<!--
Q: 만약 그때 픽사에 Git이 있었다면?

[click] 본질 = 원본이 단 한 곳 / "진짜최종2" 폴더도 같은 상태

[click] Git이면 팀원 전원이 Susman의 집 컴퓨터 / 담요 대신 clone 한 번

[click] 단, Git이 실수를 없애주진 않음 (나도 내고 픽사도 냄) → 오늘의 첫 결론: 안전장치
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
두 장면(파일명 지옥 + 픽사)에 이름 붙이면 = 버전 관리 문제

[click] 개발은 반복 (고치고 확인하고 또 고치고)

[click] 기록과 비교

[click] 키워드 "되돌릴 수 있다" 강조 (오늘 내내 반복될 단어)

회사들이 기본기로 요구하는 이유이기도
-->

---

# 하지만 협업이 전부가 아닙니다

AI 코딩 에이전트(<img src="./public/s1/claude-color.svg" style="display:inline;height:1.1em;vertical-align:-3px" alt="Claude"> Claude · <img src="./public/s1/codex-color.svg" style="display:inline;height:1.1em;vertical-align:-3px" alt="Codex"> Codex)가 널리 쓰이는 시대, 이제 AI는:

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
협업만이 아님 / AI 에이전트 일상화 (Claude, Codex)

[click] 구현

[click] 수정

[click] 테스트

[click] 문서까지 (낭독 말고 리듬으로 넘기기)

[click] Q: AI가 다 해주는데 왜 Git? / 생각할 시간 5초 주기
-->

---

# 문제는 속도가 아니라 통제입니다

<div class="pt-4 text-xl leading-relaxed">

AI가 코드를 빠르게 만든다는 사실 자체가 문제가 아닙니다.

<span v-click style="color: var(--lane-main)">**그 결과물을 사람이 어떻게 검토하고 통제할 것인가.**</span><span v-click> 그것이 진짜 문제입니다.</span>

</div>

<!--
속도 자체는 좋은 일

[click] 진짜 문제 = 검토와 통제

[click] 속도는 AI, 방향·책임은 사람 / 그 수단이 Git
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
모르면: AI 결과물을 그냥 믿는 수밖에 / 1단계는 diff로 눈 확인

[click] 브랜치 = 본진 지키는 실험

[click] 단위별 commit 기록

[click] 실패 시 main 복귀 (본진 무사)

요약: 확인·실험·기록·복귀 → 오늘 전부 실습
-->

---
layout: center
---

# AI가 속도라면,<br>Git은 브레이크와 핸들입니다

<div class="pt-4 opacity-70">
속도를 안전하게 다루는 도구
</div>

<!--
오늘의 한 문장. 차 비유: 빠를수록 브레이크와 핸들이 좋아야

마무리: "다 잊어도 이 문장 하나만"
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
개발자만의 것 아님

[click] 개발자

[click] 분석가 (데이터도 버전이 있음)

[click] 기획자 (문서 작업)

[click] 마케터

[click] 디자이너 / "변경되는 산출물을 다루는 모든 직군"

[click] 마지막 카드: 배우려는 마음이면 충분 / 헷갈리는 지점 중심 진행 약속
-->

---

# 시작 전에, 나는 어디쯤일까요?

<v-clicks>

- ☐ Git으로 파일 변경 내용을 확인하고 커밋으로 기록할 수 있다
- ☐ working directory, staging area, repository가 무엇인지 대략 알고 있다
- ☐ branch를 만들고 merge, push, pull을 사용해본 적이 있다
- ☐ GitHub에서 Pull Request 협업 흐름을 경험해본 적이 있다

</v-clicks>

<div v-click class="pt-6 text-sm opacity-80">
하나도 체크하지 못했어도 괜찮습니다. 이 강의는 <span class="font-mono" style="color: var(--lane-main)">git init</span>부터 함께 시작합니다.<br>
네 가지 모두 익숙하다면 1~2일차는 너무 쉬울 수 있어요. 반대로 3~4일차는 실무 개발자 대상이라 어려워집니다.
</div>

<!--
Q: 마음속으로 체크해보세요 (항목 낭독 X, 클릭마다 잠깐씩 멈춰주기)

[click] 1번 공개

[click] 2번 / "대략이면 충분" 안심

[click] 3번

[click] 4번

[click] 못 해도 OK (git init부터 시작) / 다 되면 1~2일차 쉬움 + 3~4일차는 실무 수준 예고 ("그때 진짜 재미")
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
오늘 1일차 지도 / 포인트: 커리큘럼 자체가 커밋 그래프

훅: 8강까지 마치면 이 그림을 직접 만들게 됨 / 튜토리얼 내비도 같은 구조
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
첫 실습 명령 3개 / "외울 필요 없음, 곧 직접 침"

보스전 세이브 비유 (져도 거기서 다시 시작)
-->

---

# 커밋은 단체사진입니다

<div class="text-xl opacity-75 -mt-2 pb-4">
add는 사진에 들어갈 파일을 무대에 올리는 일, commit은 셔터를 누르는 일
</div>

```mermaid {scale: 0.7, theme: 'base', themeVariables: {primaryColor: '#27272a', primaryTextColor: '#ffffff', primaryBorderColor: '#f5a524', lineColor: '#f5a524', edgeLabelBackground: '#27272a', tertiaryTextColor: '#ffffff', clusterBkg: '#18181b', clusterBorder: '#f5a524', fontSize: '15px'}, themeCSS: 'foreignObject { overflow: visible; } .labelBkg { background: transparent !important; } span.edgeLabel { display: inline-block; padding: 4px 12px; border-radius: 8px; transform: translate(-12px, -4px); } .cluster-label { color: #f5a524; }'}
flowchart LR
  subgraph proj["&nbsp;📁 내 프로젝트 폴더 = 작업 디렉터리 (working directory)&nbsp;"]
    direction LR
    W["작업 파일들<br/><small>&nbsp;대기실&nbsp;</small>"]
    subgraph git["&nbsp;<img src='data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22219pt%22%20height%3D%2292pt%22%20viewBox%3D%220%200%20219%2092%22%3E%3Cpath%20id%3D%22icon%22%20fill%3D%22%23f03c2e%22%20transform%3D%22scale(1.179487)%20translate(10%2010)%20rotate(-45%2029%2029)%22%20d%3D%22M5%2C58c-2.76142%2C0%20-5%2C-2.23858%20-5%2C-5v-48c0%2C-2.76142%202.23858%2C-5%205%2C-5h33v12.54404c-2.06553%2C0.94801%20-3.5%2C3.03446%20-3.5%2C5.45596c0%2C0.73514%200.13221%2C1.43941%200.37415%2C2.09031l-15.28384%2C15.28384c-0.6509%2C-0.24194%20-1.35517%2C-0.37415%20-2.09031%2C-0.37415c-3.31371%2C0%20-6%2C2.68629%20-6%2C6c0%2C3.31371%202.68629%2C6%206%2C6c3.31371%2C0%206%2C-2.68629%206%2C-6c0%2C-0.73514%20-0.13221%2C-1.43941%20-0.37415%2C-2.09031l14.87415%2C-14.87415l0%2C11.50851c-2.06553%2C0.94801%20-3.5%2C3.03446%20-3.5%2C5.45596c0%2C3.31371%202.68629%2C6%206%2C6c3.31371%2C0%206%2C-2.68629%206%2C-6c0%2C-2.42149%20-1.43447%2C-4.50795%20-3.5%2C-5.45596l0%2C-12.08808c2.06553%2C-0.94801%203.5%2C-3.03446%203.5%2C-5.45596c0%2C-2.42149%20-1.43447%2C-4.50795%20-3.5%2C-5.45596l0%2C-12.54404h10c2.76142%2C0%205%2C2.23858%205%2C5v48c0%2C2.76142%20-2.23858%2C5%20-5%2C5z%22%2F%3E%3Cpath%20id%3D%22text%22%20fill%3D%22%23ffffff%22%20d%3D%22M130.871%2031.836c-4.785%200-8.351%202.352-8.351%208.008%200%204.261%202.347%207.222%208.093%207.222%204.871%200%208.18-2.867%208.18-7.398%200-5.133-2.961-7.832-7.922-7.832Zm-9.57%2039.95c-1.133%201.39-2.262%202.87-2.262%204.612%200%203.48%204.434%204.524%2010.527%204.524%205.051%200%2011.926-.352%2011.926-5.043%200-2.793-3.308-2.965-7.488-3.227Zm25.761-39.688c1.563%202.004%203.22%204.789%203.22%208.793%200%209.656-7.571%2015.316-18.536%2015.316-2.789%200-5.312-.348-6.879-.785l-2.87%204.613%208.526.52c15.059.96%2023.934%201.398%2023.934%2012.968%200%2010.008-8.789%2015.665-23.934%2015.665-15.75%200-21.757-4.004-21.757-10.88%200-3.917%201.742-6%204.789-8.878-2.875-1.211-3.828-3.387-3.828-5.739%200-1.914.953-3.656%202.523-5.312%201.566-1.652%203.305-3.305%205.395-5.219-4.262-2.09-7.485-6.617-7.485-13.058%200-10.008%206.613-16.88%2019.93-16.88%203.742%200%206.004.344%208.008.872h16.972v7.394l-8.007.61M170.379%2016.281c-4.961%200-7.832-2.87-7.832-7.836%200-4.957%202.871-7.656%207.832-7.656%205.05%200%207.922%202.7%207.922%207.656%200%204.965-2.871%207.836-7.922%207.836Zm-11.227%2052.305V61.71l4.438-.606c1.219-.175%201.394-.437%201.394-1.746V33.773c0-.953-.261-1.566-1.132-1.824l-4.7-1.656.957-7.047h18.016V59.36c0%201.399.086%201.57%201.395%201.746l4.437.606v6.875h-24.805M218.371%2065.21c-3.742%201.825-9.223%203.481-14.187%203.481-10.356%200-14.27-4.175-14.27-14.015V31.879c0-.524%200-.871-.7-.871h-6.093v-7.746c7.664-.871%2010.707-4.703%2011.664-14.188h8.27v12.36c0%20.609%200%20.87.695.87h12.27v8.704h-12.965v20.797c0%205.136%201.218%207.136%205.918%207.136%202.437%200%204.96-.609%207.047-1.39l2.351%207.66%22%2F%3E%3C%2Fsvg%3E' style='display:inline;height:15px;vertical-align:-2px' alt='Git'> .git = 로컬 저장소 (local repository)&nbsp;"]
      direction LR
      S["스테이징 영역<br/><small>&nbsp;staging area · 무대 위&nbsp;</small>"]
      R["커밋 히스토리<br/><small>&nbsp;repository · 앨범&nbsp;</small>"]
      S -- "git commit" --> R
    end
    W -- "git add" --> S
  end
```

<v-clicks>

- 커밋은 **단체사진**입니다. 그 순간을 통째로 찍는 스냅샷이죠
- `git add`는 사진에 들어갈 파일을 **무대에 올리는** 일입니다
- 셔터를 누르면, 바꾼 것 전부가 아니라 **무대에 올린 것만** 찍힙니다

</v-clicks>

<!--
Q: 왜 add와 commit 두 단계일까? / 그림 짚기: 전부 내 폴더 안, .git = git init이 만든 로컬 저장소

[click] 단체사진 비유 시작 (스냅샷)

[click] add = 무대(staging) / 아직 안 찍힘, 준비만

[click] 존재 이유: 올린 것만 찍힘 → 뒤죽박죽 작업에서 의미 있는 것만 골라 기록

자가진단 2번(세 단어) 회수
(Git 로고: Jason Long 作, CC BY 3.0)
-->

---
layout: center
---

# 직접 해보세요

튜토리얼과 함께 브라우저 터미널에서 바로 실습할 수 있습니다

<div class="font-mono pt-4">git-github-101 · /lessons/what-is-git</div>

<!--
실습 전환 / 설치·계정 불필요, 첫 레슨부터 같이
-->

---

# git status를 읽는 법

<div class="text-xl opacity-75 -mt-2 pb-3">
터미널이 하는 말을 그림으로 옮기면 이렇습니다
</div>

```mermaid {scale: 0.6, theme: 'base', themeVariables: {primaryColor: '#27272a', primaryTextColor: '#ffffff', primaryBorderColor: '#f5a524', lineColor: '#f5a524', edgeLabelBackground: '#27272a', tertiaryTextColor: '#ffffff', fontSize: '15px'}, themeCSS: 'foreignObject { overflow: visible; } .labelBkg { background: transparent !important; } span.edgeLabel { display: inline-block; padding: 4px 12px; border-radius: 8px; transform: translate(-12px, -4px); }'}
flowchart LR
  U["Untracked files<br/><small>&nbsp;아직 추적하지 않는 새 파일&nbsp;</small>"]
  M["Changes not staged<br/><small>&nbsp;수정됐지만 스테이징 전&nbsp;</small>"]
  S["Changes to be committed<br/><small>&nbsp;스테이징 완료, 커밋 대기&nbsp;</small>"]
  C["커밋 완료"]
  U -- "git add" --> S
  M -- "git add" --> S
  S -- "git commit" --> C
```

<div v-click class="pt-3 text-sm">
<span style="color: var(--lane-main)">add는 무대에 올리는 일, commit은 셔터.</span> 아까 그 단체사진 그림 그대로입니다
</div>

<!--
실습 중 상시 참조 슬라이드 (내내 띄워둠) / 세 상태는 그림으로 짚기만

추가 포인트: 커밋 후 다시 고치면 not staged로 돌아와 한 바퀴 순환

[click] 단체사진 회수 (add=무대, commit=셔터) / "터미널 문구 보이면 이 그림에서 내 파일 위치 찾기"
-->

---

# 브랜치: 본진을 지키는 실험실

<div class="text-xl opacity-75 -mt-2 pb-2">
가지를 쳐서, 원본에 영향 없이 작업합니다
</div>

```mermaid {scale: 0.6, theme: 'base', themeVariables: {git0: '#f5a524', git1: '#7c3aed', gitBranchLabel0: '#ffffff', gitBranchLabel1: '#ffffff', commitLabelFontSize: '13px'}}
gitGraph
  commit id: "기존 작업"
  commit id: "안정 버전"
  branch feature
  commit id: "feature.txt 추가"
```

<div v-click class="pt-2">

```bash
git branch feature      # 브랜치 만들기
git checkout feature    # 브랜치로 이동 (-b 옵션이면 한 번에)
```

</div>

<div v-click class="pt-3 text-sm">
feature에서 만든 파일은 <span style="color: var(--lane-main)">main으로 돌아가면 보이지 않습니다</span>. 완전히 독립된 작업 공간입니다
</div>

<!--
나무 가지 비유 / 기본 가지 = main

[click] 함정: 만들기 ≠ 이동 (checkout까지) / -b면 한 번에 / "모르면vs알면"의 -b experiment가 이것

[click] 핵심은 격리 / 실무 네이밍: main · feature/기능명 · bugfix/버그명

→ 다음: 갈라진 가지 다시 합치기 (머지)
-->

---

# 머지: 갈라진 길을 다시 합칩니다

<div class="text-xl opacity-75 -mt-2 pb-2">
브랜치의 작업을 main으로 가져오는 일
</div>

```bash
git checkout main    # 1. 합쳐지는 쪽으로 이동
git merge feature    # 2. feature를 main에 병합
```

<div class="grid grid-cols-2 gap-4 pt-2">

<div v-click class="rounded-lg border border-gray-400/30 p-3">
<div class="font-bold text-sm pb-1">Fast-forward · main이 그대로일 때</div>

```mermaid {scale: 0.45, theme: 'base', themeVariables: {git0: '#f5a524', gitBranchLabel0: '#ffffff', commitLabelFontSize: '13px'}}
gitGraph
  commit id: "기존"
  commit id: "작업 1"
  commit id: "작업 2"
```

<div class="text-xs opacity-80">포인터만 앞으로 이동합니다</div>
</div>

<div v-click class="rounded-lg border border-gray-400/30 p-3">
<div class="font-bold text-sm pb-1">머지 커밋 · 양쪽 다 진행됐을 때</div>

```mermaid {scale: 0.45, theme: 'base', themeVariables: {git0: '#f5a524', git1: '#7c3aed', gitBranchLabel0: '#ffffff', gitBranchLabel1: '#ffffff', commitLabelFontSize: '13px'}}
gitGraph
  commit id: "기존"
  branch feature
  commit id: "새 기능"
  checkout main
  commit id: "본진 수정"
  merge feature id: "머지!"
```

<div class="text-xs opacity-80">부모가 둘인 <strong>새 커밋</strong>을 만듭니다</div>
</div>

</div>

<div v-click class="pt-3 text-sm">
핵심 규칙: 머지는 <span style="color: var(--lane-main)">합쳐지는 쪽(main)에서</span> 실행합니다
</div>

<!--
순서 강조: 합쳐지는 쪽(main)에서 / 머지 전후 ls 시연 큐 (feature.txt 등장)

[click] FF: main이 안 움직였을 때, 포인터만 이동 (실습 화면에 뜨는 그 단어)

[click] 머지 커밋: 양쪽 진행 시 부모 둘인 새 커밋 (두 선이 모이는 점)

[click] 규칙 재강조 / branch -d 정리 / 팀에선 머지가 일상 / Q: 같은 곳을 고쳤다면? → 충돌
-->


---

# 충돌: Git이 표시하고, 사람이 결정합니다

<div class="text-xl opacity-75 -mt-2 pb-2">
두 브랜치가 같은 곳을 고쳤을 때만 일어납니다
</div>

```text
<<<<<<< HEAD
Hello! Welcome!            ← 현재 브랜치(main)의 내용
=======
Hi! Nice to meet you!      ← 가져오는 브랜치(feature)의 내용
>>>>>>> feature
```

<div v-click class="pt-3 text-sm opacity-90">
해결 순서: ① 마커를 지우고 원하는 내용만 남긴다 → ② <code>git add</code> → ③ <code>git commit</code>
</div>

<div v-click class="pt-3 text-sm">
Git은 충돌을 <span style="color: var(--lane-main)">찾아줄 뿐, 해결하지 못합니다</span>. 어느 쪽을 남길지는 사람의 결정입니다
</div>

<!--
발생 조건: 같은 파일 같은 부분 / 마커 읽기: 위=HEAD(main), 아래=feature, ===가 경계

[click] 한쪽만 남겨도, 합쳐도 됨 ("Hello! Welcome! Nice to meet you!") / VS Code Accept 버튼도 같은 원리

[click] 프레임: 충돌은 오류가 아니라 질문 / 결정은 사람 몫 / 레슨 08에서 직접 풀어봄
-->

---

# GitHub: 내 저장소를 인터넷에 올립니다

<div class="text-xl opacity-75 -mt-2 pb-2">
Git은 도구, GitHub는 저장소를 호스팅하는 서비스입니다
</div>

```mermaid {scale: 0.7, theme: 'base', themeVariables: {primaryColor: '#27272a', primaryTextColor: '#ffffff', primaryBorderColor: '#f5a524', lineColor: '#f5a524', edgeLabelBackground: '#27272a', tertiaryTextColor: '#ffffff', clusterBkg: '#18181b', clusterBorder: '#f5a524', fontSize: '15px'}, themeCSS: 'foreignObject { overflow: visible; } .labelBkg { background: transparent !important; } span.edgeLabel { display: inline-block; padding: 4px 12px; border-radius: 8px; transform: translate(-12px, -4px); }'}
flowchart LR
  subgraph local["&nbsp;💻 내 컴퓨터&nbsp;"]
    L["로컬 저장소<br/><small>&nbsp;.git&nbsp;</small>"]
  end
  subgraph github["&nbsp;☁️ GitHub&nbsp;"]
    R["원격 저장소<br/><small>&nbsp;remote repository&nbsp;</small>"]
  end
  L -- "git push (올리기)" --> R
  R -- "git pull (내려받기)" --> L
```

<div v-click class="pt-2 text-sm opacity-80">
원격 저장소가 주는 것: <strong>백업 · 협업 · 공유</strong>
</div>

<div v-click class="pt-3 text-sm">
컴퓨터가 망가져도 <span style="color: var(--lane-main)">원격에 전부 남아 있습니다</span>. 픽사에서 배운 그대로죠
</div>

<!--
구분 먼저: Git = 도구, GitHub = 호스팅 서비스 (GitLab·Bitbucket도 있음)
push = 올리기 / pull = 내려받기 / clone = 통째 복사 (특징 2 회수)

[click] 3효용 짚기: 백업 · 협업 · 공유

[click] 픽사 회수: Susman의 집 컴퓨터 역할 = 이제 GitHub / → 내일 2일차: 오늘 보낸 첫 PR의 실체 공개 + 두 번째 PR은 스스로
-->
