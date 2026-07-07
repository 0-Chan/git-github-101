---
theme: default
title: Git & GitHub 101 (2회차)
info: 브라우저에서 배우는 Git & GitHub 입문 강의 슬라이드 (2회차)
routerMode: hash
colorSchema: dark
canvasWidth: 740
deckBackground: s2/background-s2.png
favicon: /favicon.ico
fonts:
  sans: IBM Plex Sans KR
  mono: IBM Plex Mono
highlighter: shiki
drawings:
  persist: false
transition: slide-left
---

# ▸ 2회차: Git 심화와 두 번째 PR

어제 따라 한 모든 동작, 오늘은 이해하고 스스로

<div class="pt-8 font-mono text-sm opacity-70">
$ git remote add upstream ...
</div>

<!--
인사 / 관통 서사 선언: 어제 first-contributions에서 따라 한 동작들의 실체를 오늘 전부 공개

오늘 청중은 개발자 위주 → 어제보다 밀도 올라간다고 예고
-->

---

# 어제 배운 그림, 기억하시나요?

<div class="text-xl opacity-75 -mt-2 pb-3">
1분 복습 퀴즈
</div>

```mermaid {scale: 0.6, theme: 'base', themeVariables: {primaryColor: '#27272a', primaryTextColor: '#ffffff', primaryBorderColor: '#f5a524', lineColor: '#f5a524', edgeLabelBackground: '#27272a', tertiaryTextColor: '#ffffff', clusterBkg: '#18181b', clusterBorder: '#f5a524', fontSize: '15px'}, themeCSS: 'foreignObject { overflow: visible; } .labelBkg { background: transparent !important; } span.edgeLabel { display: inline-block; padding: 4px 12px; border-radius: 8px; transform: translate(-12px, -4px); }'}
flowchart LR
  subgraph proj["&nbsp;📁 작업 디렉터리&nbsp;"]
    direction LR
    W["작업 파일들"]
    subgraph git["&nbsp;.git = 로컬 저장소&nbsp;"]
      direction LR
      S["스테이징 영역"]
      R["커밋 히스토리"]
      S -- "git commit" --> R
    end
    W -- "git add" --> S
  end
```

<div v-click class="pt-2 text-sm">
Q. 파일을 수정하고 <code>git add</code>까지 했습니다. 지금 어디에 있을까요?
</div>

<div v-click class="pt-2 text-sm">
A. <span style="color: var(--lane-main)">스테이징 영역(무대 위)</span>. 셔터는 아직 안 눌렀습니다
</div>

<!--
어제 그림 그대로 (단체사진 비유 회수)

[click] Q 던지고 손들게 하기

[click] A 공개 / 보너스 Q: commit하면? (커밋 히스토리로)

→ 다음: 어제의 PR 이야기
-->

---

# 어제 만든 PR, 정확히 무슨 일이 일어난 걸까?

<div class="text-xl opacity-75 -mt-2 pb-3">
first-contributions에서 우리가 따라 한 것들
</div>

<v-clicks>

- **Fork** 버튼을 눌렀다 → 왜 눌러야 했을까?
- 초록 버튼의 주소로 **clone**했다 → 그 주소는 누구의 저장소였을까?
- **push**했다 → 어디로 올라간 걸까?
- **Create pull request**를 눌렀다 → 누구에게 무엇을 제안한 걸까?

</v-clicks>

<div v-click class="pt-4 text-sm">
<span style="color: var(--lane-main)">오늘 덱이 이 질문 전부의 답입니다</span>
</div>

<!--
훅: 어제 다들 진짜 PR을 하나씩 만들었음 (축하 다시 한번)

[click]x4: 각 동작을 "따라 하긴 했는데..."로 하나씩 (웃음 유도)

[click] 오늘의 약속: 끝나면 전부 설명할 수 있다

→ 다음: 지도
-->

---

# 오늘의 지도

<div class="text-xl opacity-75 -mt-2 pb-3">
그림 → 규칙 → 구조 → 실전
</div>

<v-clicks>

- **원리 심화**: 해시, 이름표, HEAD, 되돌리기
- **실무 워크플로우**: GitHub Flow, conventional commits
- **협업의 구조**: 권한과 fork, origin과 upstream
- **두 번째 PR**: 이번엔 이해하고 스스로

</v-clicks>

<!--
어제가 "그림 그리기"였다면 오늘은 그림의 속을 뜯어보는 날

[click]x4 훑기

약속: 끝나면 어제 한 모든 동작을 설명할 수 있고, 두 번째 PR은 스스로

→ 2막 시작: 커밋의 정체
-->

---

# 커밋의 정체: 스냅샷과 지문

<div class="text-xl opacity-75 -mt-2 pb-2">
어제 본 a1b2c3d는 무엇이었나
</div>

```text
commit a1b2c3d (HEAD -> main)
Author: 김발표 <presenter@example.com>
Date:   Mon Jul 6 14:32:11 2026 +0900

    자료조사 보강
```

<div v-click class="pt-3 text-sm opacity-90">
해시에 반영되는 것: <strong>내용 + 부모 커밋 + 작성자 + 시간 + 메시지</strong>
</div>

<div v-click class="pt-3 text-sm">
하나라도 다르면 완전히 다른 지문. 부모가 포함되므로 <span style="color: var(--lane-main)">커밋들은 사슬로 엮입니다</span>
</div>

<!--
어제 git log에서 본 그 문자열의 정체

[click] 해시 = 지문(fingerprint). 5가지 입력 나열 / "내용만이 아니다"에 주의

[click] 부모 포함 → 사슬(chain) → 과거를 몰래 바꾸면 이후 전부 달라짐 = 이력 위조 불가

→ 다음: 그 사슬에 붙는 이름표
-->

---

# 브랜치의 정체: 이름표

<div class="text-xl opacity-75 -mt-2 pb-2">
가지라고 불렀지만, 실은 커밋에 붙인 포스트잇
</div>

```mermaid {scale: 0.6, theme: 'base', themeVariables: {git0: '#f5a524', git1: '#7c3aed', gitBranchLabel0: '#ffffff', gitBranchLabel1: '#ffffff', commitLabelFontSize: '13px'}}
gitGraph
  commit id: "c1"
  commit id: "c2"
  branch feature
  commit id: "c3"
```

<v-clicks>

- 브랜치 = 특정 커밋을 가리키는 **이름표**. 새 커밋을 쌓으면 이름표가 따라 이동
- 그래서 만드는 비용이 사실상 0입니다

</v-clicks>

<div v-click class="pt-3 text-sm">
결론: <span style="color: var(--lane-main)">브랜치는 공짜입니다. 마음껏 만드세요</span>
</div>

<!--
어제 "가지" 비유의 실체 공개 / 그래프의 main·feature 라벨이 바로 이름표

[click] 이름표는 커밋을 가리킬 뿐, 커밋을 복사하지 않음

[click] 비용 0 (실험 부담 없음)

[click] 결론 강조

→ 다음: 나는 지금 어느 이름표에? (HEAD)
-->

---

# HEAD: 지금 내가 서 있는 곳

<div class="text-xl opacity-75 -mt-2 pb-2">
checkout은 HEAD를 옮기는 일이었습니다
</div>

```mermaid {scale: 0.7, theme: 'base', themeVariables: {primaryColor: '#27272a', primaryTextColor: '#ffffff', primaryBorderColor: '#f5a524', lineColor: '#f5a524', edgeLabelBackground: '#27272a', tertiaryTextColor: '#ffffff', fontSize: '15px'}, themeCSS: 'foreignObject { overflow: visible; } .labelBkg { background: transparent !important; } span.edgeLabel { display: inline-block; padding: 4px 12px; border-radius: 8px; transform: translate(-12px, -4px); }'}
flowchart LR
  H["HEAD<br/><small>&nbsp;내 현재 위치&nbsp;</small>"] -- "가리킴" --> B["main<br/><small>&nbsp;이름표&nbsp;</small>"] -- "가리킴" --> C["커밋 a1b2c3d"]
```

<v-clicks>

- `git checkout feature` = HEAD를 feature 이름표로 옮기기
- HEAD가 옮겨가면 **작업 디렉터리가 그 시점의 모습으로 바뀝니다**

</v-clicks>

<div v-click class="pt-3 text-sm">
어제 브랜치를 오가며 <span style="color: var(--lane-main)">feature.txt가 보였다 안 보였다 한 이유</span>가 이것입니다
</div>

<!--
HEAD = "지금 나" 포인터

[click] checkout의 정체 = HEAD 이동

[click] 작업 디렉터리가 통째로 그 시점으로 (파일이 나타나고 사라지는 이유)

[click] 어제 실습 회수 (feature.txt 미스터리 해소)

→ 다음: HEAD를 뒤로 보내면? (되돌리기)
-->

---

# 되돌리기: reset vs revert

<div class="text-xl opacity-75 -mt-2 pb-2">
"되돌릴 수 있다"의 실제 명령들
</div>

<div class="grid grid-cols-2 gap-4">

<div v-click class="rounded-lg border border-gray-400/30 p-3">
<div class="font-bold text-sm pb-1">reset · 이력을 지운다</div>

```bash
git reset --hard HEAD~1
```

<div class="text-xs opacity-80 pt-1">HEAD를 과거로 끌어내림.<br>이후 커밋은 이력에서 사라짐.<br><strong>push 전 로컬에서만</strong></div>
</div>

<div v-click class="rounded-lg border border-gray-400/30 p-3">
<div class="font-bold text-sm pb-1">revert · 되돌림을 기록한다</div>

```bash
git revert HEAD
```

<div class="text-xs opacity-80 pt-1">반대 내용의 <strong>새 커밋</strong>을 쌓음.<br>이력이 보존됨.<br><strong>공유한 이력에도 안전</strong></div>
</div>

</div>

<div v-click class="pt-3 text-sm">
판단 기준은 하나: <span style="color: var(--lane-main)">이미 push했다면 무조건 revert</span>
</div>

<!--
1일차 키워드 "되돌릴 수 있다"가 드디어 실제 명령으로

[click] reset: HEAD 이동의 응용 / --hard 위험 고지 (작업 내용도 날아감, 신중히)

[click] revert: 지우는 게 아니라 "되돌렸다"는 사실도 기록

[click] 기준 한 줄 암기 / Q: 왜? (남이 이미 그 이력 위에서 작업 중일 수 있으니)

→ 다음: 지우지도 커밋하지도 않고 잠깐 치워두기
-->

---

# stash: 잠깐 치워두기

<div class="text-xl opacity-75 -mt-2 pb-2">
커밋하기엔 애매한 작업이 있을 때
</div>

```bash
git stash        # 1. 하던 작업을 선반에 올려두고
git checkout main   # 2. 급한 일을 처리한 뒤
git stash pop    # 3. 선반에서 다시 꺼낸다
```

<v-clicks>

- 시나리오: 작업이 반쯤 됐는데 **급하게 다른 브랜치로** 가야 할 때
- 커밋은 완성된 시점의 기록, stash는 **미완성 작업의 임시 보관**

</v-clicks>

<div v-click class="pt-3 text-sm">
지저분한 채로 커밋하지 마세요. <span style="color: var(--lane-main)">치워두는 선반</span>이 따로 있습니다
</div>

<!--
현실 시나리오로 시작: 작업 중 긴급 수정 요청

[click] 브랜치 전환 직전, 미완성 변경이 발목 잡는 상황

[click] 커밋 vs stash 구분 (완성 기록 vs 임시 보관)

[click] "wip 커밋" 남발 방지 팁

→ 3막: 이제 규칙 이야기 (실무 워크플로우)
-->

---

# branch 전략: GitHub Flow

<div class="text-xl opacity-75 -mt-2 pb-2">
요즘 팀 다수가 쓰는 단순한 규칙
</div>

```mermaid {scale: 0.55, theme: 'base', themeVariables: {git0: '#f5a524', git1: '#7c3aed', gitBranchLabel0: '#ffffff', gitBranchLabel1: '#ffffff', commitLabelFontSize: '13px'}}
gitGraph
  commit id: "배포 v1"
  branch feature-search
  commit id: "검색 개발"
  commit id: "검색 완성"
  checkout main
  merge feature-search id: "PR 머지"
  commit id: "배포 v2"
```

<v-clicks>

- **main은 항상 배포 가능** 상태로 지킨다
- 모든 작업은 **브랜치에서**, 합류는 **PR로**
- 더 복잡한 Git Flow도 있지만, 단순함이 이긴 시대입니다

</v-clicks>

<!--
규칙은 단 두 줄 (main 보호 + 브랜치 작업)

[click] main = 언제든 배포 가능 (어제 "본진" 비유의 실무 버전)

[click] PR이 유일한 합류 경로 → 그래서 PR이 중요 문서가 됨

[click] Git Flow는 이름만 언급 (develop/release 브랜치를 두는 무거운 방식, 요즘은 축소 추세)

→ 다음: 그 브랜치 위 커밋들의 작명 규칙
-->

---

# conventional commits

<div class="text-xl opacity-75 -mt-2 pb-2">
커밋 메시지의 공용어
</div>

```text
feat: 검색 자동완성 추가
fix: 로그인 실패 시 무한 로딩 수정
docs: README 설치 절차 갱신
refactor: 결제 모듈 중복 로직 정리
chore: 의존성 버전 올림
```

<v-clicks>

- 형식: `타입: 요약` — 타입은 feat / fix / docs / refactor / test / chore
- 왜 쓰나: **히스토리 검색**, **자동 체인지로그**, 그리고 팀의 공용어

</v-clicks>

<div v-click class="pt-3 text-sm">
<code>git log --oneline</code>이 <span style="color: var(--lane-main)">그대로 읽히는 문서</span>가 됩니다
</div>

<!--
어제 "커밋 메시지 한 줄" 이야기의 실무 규격

[click] 타입 6개만 (scope 등 확장 문법은 존재만 언급)

[click] 효용 3개: fix만 골라 검색 / 릴리스 노트 자동 생성 / 리뷰어가 제목만 봐도 성격 파악

[click] log --oneline 시연 큐

→ 다음: 한 커밋에 담을 양
-->

---

# 좋은 커밋의 단위

<div class="text-xl opacity-75 -mt-2 pb-2">
판별법: 메시지에 "그리고"가 들어가면 쪼개세요
</div>

```text
❌ fix: 로그인 버그 수정 그리고 버튼 색 변경 그리고 오타 수정

✅ fix: 로그인 실패 시 무한 로딩 수정
✅ style: 로그인 버튼 색상을 브랜드 컬러로 변경
✅ docs: 로그인 안내 문구 오타 수정
```

<v-clicks>

- 한 커밋 = **한 가지 의도** (원자적 커밋)
- 스테이징이 존재하는 이유가 이것: **골라서 무대에 올리니까**

</v-clicks>

<!--
나쁜 예 먼저 읽고 웃기 (다들 해봤을 것)

[click] 원자적 = 되돌리기도, 리뷰도, cherry-pick도 단위가 깔끔

[click] 단체사진 회수: add로 골라 담는 습관이 원자적 커밋을 만든다

→ 4막: 협업의 구조 (권한 이야기)
-->

---

# 권한이 협업 방식을 가른다

<div class="text-xl opacity-75 -mt-2 pb-2">
fork 버튼을 눌러야 했던 진짜 이유
</div>

<div class="grid grid-cols-2 gap-4">

<div v-click class="rounded-lg border border-gray-400/30 p-4">
<div class="font-bold">write 권한이 있다</div>
<div class="text-xs opacity-70 pb-2">팀 저장소 · collaborator</div>
<div class="text-sm opacity-80">같은 저장소에 브랜치를 만들고<br>직접 push합니다</div>
</div>

<div v-click class="rounded-lg border border-gray-400/30 p-4">
<div class="font-bold">write 권한이 없다</div>
<div class="text-xs opacity-70 pb-2">남의 저장소 · 오픈소스</div>
<div class="text-sm opacity-80"><strong>fork</strong>로 내 사본을 만들어 작업하고<br>PR로 제안합니다</div>
</div>

</div>

<div v-click class="pt-4 text-sm">
어제 fork를 눌렀던 이유: <span style="color: var(--lane-main)">first-contributions에 write 권한이 없었으니까</span>
</div>

<!--
훅 질문 1번(왜 fork?)의 답

[click] 팀: 권한 있음 → fork 불필요, 브랜치로 충분

[click] 오픈소스: 권한 없음 → 내 사본(fork)에서 작업

[click] 어제의 경험 회수 / read/write/admin 3단계는 말로만

→ 다음: 그 fork의 이름이 origin이었다는 이야기
-->

---

# origin과 upstream

<div class="text-xl opacity-75 -mt-2 pb-2">
fork 협업에서 가장 헷갈리는 두 이름
</div>

```mermaid {scale: 0.62, theme: 'base', themeVariables: {primaryColor: '#27272a', primaryTextColor: '#ffffff', primaryBorderColor: '#f5a524', lineColor: '#f5a524', edgeLabelBackground: '#27272a', tertiaryTextColor: '#ffffff', clusterBkg: '#18181b', clusterBorder: '#f5a524', fontSize: '15px'}, themeCSS: 'foreignObject { overflow: visible; } .labelBkg { background: transparent !important; } span.edgeLabel { display: inline-block; padding: 4px 12px; border-radius: 8px; transform: translate(-12px, -4px); }'}
flowchart LR
  L["💻 내 컴퓨터<br/><small>&nbsp;로컬 저장소&nbsp;</small>"] -- "git push" --> O
  subgraph gh["&nbsp;☁️ GitHub&nbsp;"]
    direction LR
    O["내 fork<br/><small>&nbsp;origin&nbsp;</small>"] -- "Pull Request" --> U["원본 저장소<br/><small>&nbsp;upstream&nbsp;</small>"]
  end
```

<div v-click class="pt-3 text-sm">
어제 clone한 주소 = <span style="color: var(--lane-main)">origin(내 fork)</span>이었습니다. PR은 origin의 브랜치를 <span style="color: var(--lane-main)">upstream에 제안</span>하는 것
</div>

<div v-click class="pt-2 text-sm opacity-80">
원본이 바뀌면 <code>git fetch upstream</code>으로 내 로컬에 최신을 받아옵니다
</div>

<!--
훅 질문 2·3·4번의 답이 이 그림 하나에

[click] 어제의 동작 재구성: clone(origin에서) → push(origin으로) → PR(origin → upstream 제안)

원본 최신 따라가기: git remote add upstream <원본 주소> 후 fetch/pull (미션에서 실습)

→ 다음: 이 구조 위에서 일감이 도는 방식
-->

---

# GitHub 프로젝트 관리 루프

<div class="text-xl opacity-75 -mt-2 pb-2">
실무의 일감은 이 궤도를 돕니다
</div>

```mermaid {scale: 0.6, theme: 'base', themeVariables: {primaryColor: '#27272a', primaryTextColor: '#ffffff', primaryBorderColor: '#f5a524', lineColor: '#f5a524', edgeLabelBackground: '#27272a', tertiaryTextColor: '#ffffff', fontSize: '15px'}, themeCSS: 'foreignObject { overflow: visible; } .labelBkg { background: transparent !important; } span.edgeLabel { display: inline-block; padding: 4px 12px; border-radius: 8px; transform: translate(-12px, -4px); }'}
flowchart LR
  I["Issue #12<br/><small>&nbsp;무엇을 할지&nbsp;</small>"] --> B["브랜치<br/><small>&nbsp;fix/12-login&nbsp;</small>"] --> C["커밋들"] --> P["PR<br/><small>&nbsp;Fixes #12&nbsp;</small>"] --> M["머지 + 이슈 자동 닫힘"]
```

<v-clicks>

- 일감 하나 = 이슈 하나 = 브랜치 하나 = PR 하나
- PR 설명에 `Fixes #12`를 쓰면 머지될 때 **이슈가 자동으로 닫힙니다**

</v-clicks>

<!--
"프로젝트 관리 도구 따로 안 써도 GitHub 안에 다 있다"

[click] 1:1:1:1 대응이 추적성의 핵심 (누가 왜 바꿨는지 이슈까지 거슬러 올라감)

[click] Fixes #N 매직 키워드 시연 큐

→ 다음: 이 루프의 중심 문서, PR
-->

---

# PR이라는 문서

<div class="text-xl opacity-75 -mt-2 pb-2">
리뷰어가 읽는 순서대로 쓰세요
</div>

```text
제목:  feat: 검색 자동완성 추가

## 무엇을 / 왜
검색 입력 시 자동완성 표시 (Fixes #12)

## 확인 방법
"git" 입력 → 하단에 제안 5개 표시
```

<v-clicks>

- 제목은 conventional commits 규격 그대로. 본문은 **무엇을 / 왜 / 확인 방법**
- 어제 만든 PR의 정체: <span style="color: var(--lane-main)">origin의 브랜치를 upstream에 제안하는 문서</span>였습니다

</v-clicks>

<!--
1막 훅 질문이 여기서 완전히 풀림 (수미상관 지점)

[click] 제목 규격 = 커밋 규격 재사용

[click] 3문단 템플릿 / "리뷰어가 코드를 열기 전에 읽는 것"

[click] 훅 회수 선언 + 리뷰 왕복은 내일(3일차) 예고

→ 5막: 이 기록들이 자산이 되는 이야기
-->

---

# README.md: 프로젝트의 얼굴

<div class="text-xl opacity-75 -mt-2 pb-2">
저장소에서 사람들이 처음 읽는 단 하나의 문서
</div>

<v-clicks>

- **무엇을** 하는 프로젝트인가 (한 문장)
- **왜** 만들었나 (문제와 동기)
- **설치**: 따라 치면 되는 명령
- **사용법**: 가장 흔한 사용 예 1개

</v-clicks>

<div v-click class="pt-4 text-sm">
기준: <span style="color: var(--lane-main)">처음 온 사람이 5분 안에 실행</span>할 수 있는가
</div>

<!--
저장소 열면 자동으로 보이는 유일한 문서

[click]x4: 필수 4섹션 (스크린샷·배지 등 꾸미기는 4일차)

[click] 5분 기준 / 나쁜 README = 빈 파일 or 프레임워크 기본 문구 방치

→ 다음: 이 기록들을 누가 보는가
-->

---

# 깃허브에 기록 = 공개 이력서

<div class="text-xl opacity-75 -mt-2 pb-2">
채용담당자는 정말로 봅니다
</div>

<v-clicks>

- **잔디**(contribution graph): 꾸준함의 증거
- **커밋 메시지**: 글쓰기와 일하는 방식이 드러남
- **PR 설명**: 커뮤니케이션 능력의 표본

</v-clicks>

<div v-click class="pt-4 text-sm">
오늘 만드는 저장소가 <span style="color: var(--lane-main)">3일차(CI 배지) → 4일차(포트폴리오)</span>로 자랍니다
</div>

<!--
개발자 채용에서 GitHub 프로필 확인은 흔한 절차

[click] 잔디: 양보다 꾸준함

[click] 커밋 메시지: 오늘 배운 conventional commits가 그대로 보임 (회수)

[click] PR 설명: 방금 배운 3문단 템플릿이 그대로 보임

[click] 로드맵 한 줄 (완성은 4일차)

→ 6막: 실전 준비
-->

---

# 미션 준비: Git과 GitHub 연결

<div class="text-xl opacity-75 -mt-2 pb-2">
push에서 막히면 십중팔구 인증 문제입니다
</div>

<div class="grid grid-cols-2 gap-4">

<div v-click class="rounded-lg border border-gray-400/30 p-3">
<div class="font-bold text-sm">HTTPS</div>
<div class="text-xs opacity-70 pb-2">https://github.com/...</div>
<div class="text-xs opacity-80">PAT 토큰 발급 → 첫 push 때 입력<br><strong>credential helper</strong>가 기억해줌<br>시작이 쉬움</div>
</div>

<div v-click class="rounded-lg border border-gray-400/30 p-3">
<div class="font-bold text-sm">SSH</div>
<div class="text-xs opacity-70 pb-2">git@github.com:...</div>
<div class="text-xs opacity-80">키 생성 → GitHub에 공개키 등록<br>이후 <strong>비밀번호 없이</strong> push<br>한 번 고생, 오래 편함</div>
</div>

</div>

<div v-click class="pt-4 text-sm">
오늘은 <span style="color: var(--lane-main)">HTTPS + credential helper</span>로 갑니다. SSH는 익숙해지면 전환
</div>

<!--
GitHub는 계정 비밀번호로 push 불가 (2021년부터) → 토큰 or 키

[click] HTTPS: PAT 발급 경로 안내 (Settings > Developer settings) / helper가 저장

[click] SSH: ssh-keygen → 공개키 등록 (설정 가이드 링크 제공)

[click] 오늘의 선택 고지 / "push 401·403 뜨면 이 장으로"

→ 다음: 미션
-->

---

# 미션: 두 번째 PR

<div class="text-xl opacity-75 -mt-2 pb-2">
이번엔 이해하고 보냅니다
</div>

<v-clicks>

- ① 강의 Organization의 연습 저장소를 **fork** (write 권한이 없으니까)
- ② **clone** (origin = 내 fork)
- ③ 브랜치 만들고 작업, **conventional commit**
- ④ **push** (origin으로) → **PR** (origin에서 upstream으로 제안)

</v-clicks>

<div v-click class="pt-4 text-sm">
어제는 따라 했고, <span style="color: var(--lane-main)">오늘은 각 단계의 이유를 알고 합니다</span>
</div>

<!--
어제와 같은 절차, 다른 점은 "이해"

[click]x4: 각 단계에 오늘 배운 개념 붙이기 (권한→fork, origin, conventional, upstream 제안)

[click] 차이 체감이 목표 / 막히면: 인증은 앞 장, 상태 확인은 git status

미션 체크는 강의 사이트에서 (수동 체크)
-->

---
layout: center
---

# 오늘 남긴 것

이해하고 보낸 PR 하나, 그리고 읽히는 커밋 히스토리

<div class="pt-4 opacity-70 text-sm">
내일: 이 PR에 CI와 코드 리뷰가 붙습니다
</div>

<!--
정리: 어제의 모든 동작 설명 가능 + 두 번째 PR 완료

3일차 예고: 이 PR 위에 자동 검사(CI)와 리뷰가 붙는 것을 직접 봄

수고 인사
-->
