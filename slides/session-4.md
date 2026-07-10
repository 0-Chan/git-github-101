---
theme: default
title: Git & GitHub 101 (4회차)
info: 브라우저에서 배우는 Git & GitHub 입문 강의 슬라이드 (4회차)
routerMode: hash
colorSchema: dark
canvasWidth: 740
deckBackground: s4/background-s4.png
favicon: /favicon.ico
fonts:
  sans: IBM Plex Sans KR
  mono: IBM Plex Mono
highlighter: shiki
drawings:
  persist: false
transition: slide-left
---

# ▸ 4회차: 오픈소스 기여와 포트폴리오

세상의 코드에 기여하고 내 것으로 남기기

<div class="pt-8 font-mono text-sm opacity-70">
$ gh pr create
</div>

<!--
4회차를 시작하겠습니다. 오늘은 실제 오픈소스 프로젝트에 기여해 보고 여러분의 GitHub 저장소와 프로필을 포트폴리오로 완성합니다. 수업이 끝나면 보여줄 수 있는 실물이 남는 날입니다.
-->

---

# 오늘 배울 것

<v-clicks>

- **작업 공간 분리**: worktree로 브랜치마다 폴더 만들기
- **gh CLI**: 터미널에서 PR·이슈, 코딩 에이전트로 자동화
- **오픈소스 기여**: 이슈 찾기부터 첫 기여 PR까지
- **포트폴리오 저장소**: README, 커밋 히스토리, CI 배지 다듬기
- **GitHub 프로필**: pinned repo와 프로필 README 완성

</v-clicks>

<!--
오늘은 worktree로 작업 공간을 나누는 법부터 익힙니다.

그다음 이슈를 고른 뒤 별도 작업 공간에서 수정하고 PR로 기여하는 흐름을 연결합니다. 마지막에는 저장소와 GitHub 프로필을 포트폴리오 관점에서 다듬습니다.
-->

---
layout: center
---

# 작업 공간부터 나눕니다

<div class="text-xl opacity-75 -mt-1 pb-6">
4일차 첫 도구: <code>git worktree</code>
</div>

<div class="text-2xl leading-relaxed">
새 작업을 시작할 때<br>
<span style="color: var(--lane-main)" class="font-bold">브랜치와 폴더를 함께 분리</span>합니다
</div>

<!--
3일차에는 worktree의 개념과 장점을 살펴봤습니다.

4일차에는 실제로 명령을 실행하면 무엇이 생기고 어느 폴더에서 어떻게 작업하며 끝난 뒤 무엇을 정리해야 하는지 차례대로 확인합니다.
-->

---

# 브랜치 전환만으로는 비교가 어렵습니다

<div class="grid grid-cols-2 gap-5 pt-5">
  <div class="rounded-lg border border-rose-300/40 p-5">
    <div class="font-mono text-sm opacity-60 pb-2">한 폴더만 사용할 때</div>
    <div class="text-xl font-bold">계속 브랜치를 바꿉니다</div>
    <div class="pt-3 opacity-75 leading-relaxed">
      미완성 변경을 정리하고<br>
      서버를 끄고 다시 켜야 합니다
    </div>
  </div>
  <div class="rounded-lg border border-emerald-300/40 p-5">
    <div class="font-mono text-sm opacity-60 pb-2">폴더를 나눌 때</div>
    <div class="text-xl font-bold">두 브랜치를 함께 엽니다</div>
    <div class="pt-3 opacity-75 leading-relaxed">
      작업을 그대로 둔 채<br>
      결과를 바로 비교할 수 있습니다
    </div>
  </div>
</div>

<!--
브랜치만으로도 이력은 충분히 나눌 수 있습니다. 문제는 작업 디렉터리가 하나라는 점입니다.

한 폴더에서 main과 feature 브랜치를 오가려면 수정 중인 파일을 커밋하거나 stash해야 할 때가 있습니다. 실행 중인 개발 서버도 같은 폴더를 바라봅니다.

worktree를 사용하면 브랜치마다 폴더를 열어 두고 전환 없이 오갈 수 있습니다.
-->

---

# 브랜치는 이력을 나누고, worktree는 폴더를 나눕니다

<div class="grid grid-cols-2 gap-5 pt-5">
  <div class="rounded-lg border border-amber-300/40 p-5">
    <div class="font-mono text-sm opacity-60 pb-2">branch</div>
    <div class="text-2xl font-bold">커밋 이력의 갈래</div>
    <div class="pt-3 opacity-75">무엇을 만들지 나눕니다</div>
    <div class="pt-4 font-mono text-sm">main / feature/profile</div>
  </div>
  <div class="rounded-lg border border-violet-300/40 p-5">
    <div class="font-mono text-sm opacity-60 pb-2">worktree</div>
    <div class="text-2xl font-bold">작업 폴더의 갈래</div>
    <div class="pt-3 opacity-75">어디에서 열지 나눕니다</div>
    <div class="pt-4 font-mono text-sm">project / project-profile</div>
  </div>
</div>

<div class="pt-5 text-lg opacity-80">
브랜치가 먼저 있고 worktree가 그 브랜치를 별도 폴더에 펼칩니다.
</div>

<!--
둘의 역할을 섞으면 명령도 헷갈립니다.

브랜치는 특정 커밋을 가리키는 이름 붙은 포인터입니다. worktree는 그 브랜치의 파일을 별도 폴더에 열어 둡니다.

Git 저장소 데이터는 함께 쓰지만 현재 브랜치와 수정 중인 파일은 폴더마다 따로 관리됩니다.
-->

---

# 시작할 때는 작업 폴더가 하나입니다

```mermaid {scale: 0.46, theme: 'base', themeVariables: {primaryColor: '#27272a', primaryTextColor: '#ffffff', primaryBorderColor: '#f5a524', lineColor: '#f5a524', fontSize: '15px'}}
flowchart LR
  G[(Git 저장소 데이터)] --- M[git-github-101<br/>main]
```

<div class="grid grid-cols-2 gap-5 -mt-2">
  <div class="rounded-lg border border-gray-400/30 p-4">
    <div class="font-mono text-sm opacity-60">현재 폴더</div>
    <div class="font-mono pt-2">~/workspace/git-github-101</div>
  </div>
  <div class="rounded-lg border border-gray-400/30 p-4">
    <div class="font-mono text-sm opacity-60">현재 브랜치</div>
    <div class="font-mono pt-2">main</div>
  </div>
</div>

<!--
처음에는 평소처럼 clone한 폴더 하나가 있고 이 폴더에서 main 브랜치를 열었다고 가정합니다.

지금은 Git 저장소와 작업 폴더가 하나씩 연결돼 있습니다.

main 폴더는 그대로 두고 feature/profile 브랜치를 열기 위한 두 번째 폴더를 옆에 만들겠습니다.
-->

---

# 새 브랜치와 폴더를 한 번에 만듭니다

```bash
git worktree add -b feature/profile ../git-github-101-profile main
```

<div class="grid grid-cols-4 gap-3 pt-5 text-center">
  <div class="rounded-lg border border-amber-300/40 p-3">
    <div class="font-mono text-sm font-bold">worktree add</div>
    <div class="text-sm opacity-70 pt-2">작업 폴더 추가</div>
  </div>
  <div class="rounded-lg border border-violet-300/40 p-3">
    <div class="font-mono text-sm font-bold">-b feature/profile</div>
    <div class="text-sm opacity-70 pt-2">새 브랜치 생성</div>
  </div>
  <div class="rounded-lg border border-sky-300/40 p-3">
    <div class="font-mono text-sm font-bold">../git-github-101-profile</div>
    <div class="text-sm opacity-70 pt-2">새 폴더 위치</div>
  </div>
  <div class="rounded-lg border border-emerald-300/40 p-3">
    <div class="font-mono text-sm font-bold">main</div>
    <div class="text-sm opacity-70 pt-2">시작 기준</div>
  </div>
</div>

<!--
이 명령은 새 브랜치와 작업 폴더를 함께 만듭니다.

add 다음에는 새 폴더의 경로를 적습니다. -b 뒤에는 새로 만들 브랜치 이름이 옵니다. 마지막 main은 브랜치를 시작할 기준입니다.

이미 존재하는 브랜치를 열 때는 -b 없이 `git worktree add 폴더경로 브랜치이름`을 사용합니다.
-->

---

# 실행하면 옆에 새 폴더가 생깁니다

<div class="font-mono text-xs opacity-60 pb-1">예시 출력</div>

```text
Preparing worktree (new branch 'feature/profile')
HEAD is now at a1b2c3d chore: start project
```

```mermaid {scale: 0.4, theme: 'base', themeVariables: {primaryColor: '#27272a', primaryTextColor: '#ffffff', primaryBorderColor: '#f5a524', lineColor: '#f5a524', fontSize: '14px'}}
flowchart LR
  G[(공유하는 Git 데이터)] --- M[git-github-101<br/>main]
  G --- F[git-github-101-profile<br/>feature/profile]
```

<div class="text-center text-sm opacity-75 -mt-5">
SHA와 커밋 메시지는 저장소마다 다르게 표시됩니다.
</div>

<!--
첫 줄에는 feature/profile 브랜치를 만들었다는 안내가 나옵니다. 다음 줄에는 새 폴더의 HEAD가 가리키는 커밋이 표시됩니다.

실행이 끝나면 원래 폴더와 같은 상위 폴더 아래에 git-github-101-profile이 생깁니다.

두 폴더는 Git 객체와 커밋 이력을 공유하지만 각각 main과 feature/profile을 체크아웃하고 있습니다.
-->

---

# Git은 연결된 작업 공간을 기억합니다

```bash
git worktree list
```

<div class="font-mono text-xs opacity-60 pt-3 pb-1">예시 출력</div>

<pre class="rounded-lg border border-gray-500/30 bg-black/30 p-4 text-[13px] leading-relaxed"><code>/work/git-github-101          a1b2c3d [main]
/work/git-github-101-profile  a1b2c3d [feature/profile]</code></pre>

<div class="grid grid-cols-3 gap-4 pt-4 text-sm">
  <div><span class="font-bold text-amber-300">경로</span><br><span class="opacity-70">어느 폴더인지</span></div>
  <div><span class="font-bold text-violet-300">커밋</span><br><span class="opacity-70">현재 HEAD가 어디인지</span></div>
  <div><span class="font-bold text-emerald-300">브랜치</span><br><span class="opacity-70">무엇을 열었는지</span></div>
</div>

<!--
git worktree list는 Git에 연결된 모든 작업 폴더를 보여 줍니다.

한 줄이 worktree 하나입니다. 왼쪽부터 폴더 경로, 현재 커밋의 짧은 SHA, 체크아웃한 브랜치 이름입니다.

실제 출력의 경로는 절대 경로로 표시됩니다. 슬라이드에서는 읽기 쉽도록 /work 아래의 예시 경로를 사용했습니다.
-->

---

# 두 폴더는 다른 브랜치를 보고 있습니다

<div class="grid grid-cols-2 gap-5 pt-4">
  <div>
    <div class="font-mono text-sm opacity-60 pb-2">원래 폴더</div>
    <pre class="rounded-lg border border-amber-300/40 bg-black/30 p-4 text-sm leading-relaxed"><code>$ cd ~/workspace/git-github-101
$ git branch --show-current
main</code></pre>
  </div>
  <div>
    <div class="font-mono text-sm opacity-60 pb-2">새 worktree</div>
    <pre class="rounded-lg border border-violet-300/40 bg-black/30 p-4 text-sm leading-relaxed"><code>$ cd ~/workspace/git-github-101-profile
$ git branch --show-current
feature/profile</code></pre>
  </div>
</div>

<div class="pt-5 text-lg opacity-80">
브랜치를 전환하지 않아도 두 작업 상태를 동시에 열어 둘 수 있습니다.
</div>

<!--
각 폴더에서 git branch --show-current를 실행하면 서로 다른 결과가 나옵니다.

원래 폴더는 계속 main을 보고 있고 새 worktree는 feature/profile을 보고 있습니다.

에디터도 폴더별로 하나씩 열 수 있습니다. main 화면과 새 기능 화면을 오가며 바로 비교할 수 있습니다.
-->

---

# 파일 변경도 폴더별로 나뉩니다

<div class="grid grid-cols-2 gap-5 pt-4">
  <div>
    <div class="font-mono text-sm opacity-60 pb-2">feature/profile에서 README 수정</div>
    <pre class="rounded-lg border border-violet-300/40 bg-black/30 p-4 text-sm leading-relaxed"><code>$ git status --short
 M README.md</code></pre>
  </div>
  <div>
    <div class="font-mono text-sm opacity-60 pb-2">main 폴더에서 확인</div>
    <pre class="rounded-lg border border-amber-300/40 bg-black/30 p-4 text-sm leading-relaxed"><code>$ git status --short
(출력 없음)</code></pre>
  </div>
</div>

<div class="pt-5 text-lg opacity-80">
커밋 데이터는 공유하지만 작업 파일과 스테이징 영역은 폴더마다 따로 관리합니다.
</div>

<!--
feature/profile 폴더에서 README를 수정했다고 가정해 봅니다. 이 폴더의 status에는 수정 파일이 나타납니다.

main 폴더로 돌아가 같은 명령을 실행하면 아무것도 나오지 않습니다. main의 작업 파일은 바뀌지 않았기 때문입니다.

작업 디렉터리와 스테이징 영역은 worktree마다 따로 관리합니다. 한쪽의 미완성 변경이 다른 쪽의 작업 화면을 어지럽히지 않습니다.
-->

---

# 커밋과 PR은 평소와 같습니다

```bash
git add README.md
git commit -m "docs: 소개 문구 추가"
git push -u origin feature/profile
```

<div class="flex items-center justify-center gap-3 pt-6 text-lg">
  <div class="rounded-lg border border-violet-300/40 px-4 py-3">로컬 worktree</div>
  <div class="opacity-50">-></div>
  <div class="rounded-lg border border-sky-300/40 px-4 py-3">원격 브랜치</div>
  <div class="opacity-50">-></div>
  <div class="rounded-lg border border-emerald-300/40 px-4 py-3">Pull Request</div>
</div>

<div class="pt-5 text-center text-sm opacity-70">
worktree는 로컬 폴더만 추가합니다. push와 PR은 직접 진행합니다.
</div>

<!--
새 worktree 안에서도 add, commit, push는 평소와 완전히 같습니다.

worktree를 만들었다고 GitHub에 브랜치가 생기는 것은 아닙니다. push해야 원격 브랜치가 생기고 그다음 PR을 만들 수 있습니다.

worktree가 바꾸는 것은 협업 절차가 아니라 로컬 작업 공간입니다.
-->

---

# 작업이 끝나면 폴더부터 정리합니다

<div class="font-mono text-sm opacity-60 pt-2 pb-2">PR이 병합되고 변경 파일이 없는지 확인한 뒤</div>

<pre class="rounded-lg border border-gray-400/30 bg-black/30 p-3 text-[13px] leading-relaxed"><code>$ cd ~/workspace/git-github-101
$ git pull --ff-only
$ git worktree remove ../git-github-101-profile
$ git branch -d feature/profile
$ git worktree list</code></pre>

<div class="grid grid-cols-4 gap-3 pt-3 text-center text-sm">
  <div class="rounded-lg border border-gray-400/30 px-2 py-2">
    <span class="font-bold text-amber-300">1.</span> main 갱신
  </div>
  <div class="rounded-lg border border-gray-400/30 px-2 py-2">
    <span class="font-bold text-violet-300">2.</span> worktree 제거
  </div>
  <div class="rounded-lg border border-gray-400/30 px-2 py-2">
    <span class="font-bold text-sky-300">3.</span> 브랜치 제거
  </div>
  <div class="rounded-lg border border-gray-400/30 px-2 py-2">
    <span class="font-bold text-emerald-300">4.</span> 목록 재확인
  </div>
</div>

<div class="pt-3 text-xs opacity-70">
수정 파일이 남아 있으면 Git이 제거를 막습니다. <code>git status</code>로 확인한 뒤 정리합니다.
</div>

<!--
작업이 끝나면 폴더를 Finder나 rm으로 바로 지우지 말고 git worktree remove를 사용합니다. 그래야 Git의 연결 정보와 폴더가 함께 정리됩니다.

PR이 병합됐다면 pull --ff-only로 로컬 main을 갱신합니다. worktree를 제거한 뒤에는 branch -d로 로컬 브랜치를 지웁니다. -d는 병합되지 않은 커밋이 있으면 삭제를 거부하므로 초보자에게 더 안전합니다.

worktree list를 다시 실행해 원래 main 폴더만 남았는지 확인합니다.
-->

---

# worktree에서 자주 막히는 네 지점

<div class="grid grid-cols-2 gap-4 pt-4 text-base">
  <div class="rounded-lg border border-rose-300/40 p-4">
    <div class="font-bold">같은 브랜치를 또 열 수 없음</div>
    <div class="opacity-70 pt-2"><code>git worktree list</code>로 이미 열린 폴더를 찾습니다.</div>
  </div>
  <div class="rounded-lg border border-amber-300/40 p-4">
    <div class="font-bold">수정 파일이 있으면 제거되지 않음</div>
    <div class="opacity-70 pt-2"><code>git status</code>로 커밋하거나 버릴 내용을 먼저 판단합니다.</div>
  </div>
  <div class="rounded-lg border border-sky-300/40 p-4">
    <div class="font-bold">의존성은 폴더마다 필요할 수 있음</div>
    <div class="opacity-70 pt-2"><code>node_modules</code>처럼 추적하지 않는 파일은 공유되지 않습니다.</div>
  </div>
  <div class="rounded-lg border border-violet-300/40 p-4">
    <div class="font-bold">개발 서버 포트가 충돌할 수 있음</div>
    <div class="opacity-70 pt-2">두 서버를 함께 켤 때 서로 다른 포트를 사용합니다.</div>
  </div>
</div>

<!--
같은 브랜치는 두 worktree에서 동시에 열 수 없습니다. list로 어느 폴더에서 사용 중인지 찾습니다.

수정하거나 새로 만든 파일이 남아 있으면 remove가 실패합니다. --force부터 쓰지 말고 status로 보존할 작업인지 판단합니다.

node_modules와 빌드 결과처럼 Git이 추적하지 않는 파일은 새 폴더에 자동으로 생기지 않습니다. 필요한 설치를 다시 실행합니다.

개발 서버를 두 개 켜면 같은 포트를 쓰려다 충돌할 수 있습니다. 두 작업을 함께 실행할 때는 포트를 나눕니다.
-->

---

# Issue마다 작업 공간을 나눌 수 있습니다

<div class="flex items-center justify-center gap-1.5 pt-6 text-sm">
  <div class="shrink-0 whitespace-nowrap rounded-lg border border-amber-300/40 px-3 py-3 text-center">Issue 선택</div>
  <div class="opacity-50">-></div>
  <div class="shrink-0 whitespace-nowrap rounded-lg border border-violet-300/40 px-3 py-3 text-center">branch + worktree</div>
  <div class="opacity-50">-></div>
  <div class="shrink-0 whitespace-nowrap rounded-lg border border-sky-300/40 px-3 py-3 text-center">수정과 검사</div>
  <div class="opacity-50">-></div>
  <div class="shrink-0 whitespace-nowrap rounded-lg border border-emerald-300/40 px-3 py-3 text-center">push + PR</div>
  <div class="opacity-50">-></div>
  <div class="shrink-0 whitespace-nowrap rounded-lg border border-gray-400/40 px-3 py-3 text-center">정리</div>
</div>

<div class="pt-8 text-2xl leading-relaxed text-center">
한 기여가 한 폴더에 머물면<br>
<span style="color: var(--lane-main)" class="font-bold">여러 작업을 섞지 않고 끝까지 추적</span>할 수 있습니다.
</div>

<!--
worktree를 4일차 오픈소스 기여 흐름에 연결합니다.

기여할 Issue를 하나 고르고 그 Issue를 위한 브랜치와 worktree를 만듭니다. 해당 폴더에서만 수정하고 검사한 뒤 push와 PR을 진행합니다.

PR이 끝나면 worktree와 로컬 브랜치를 정리합니다. 이 루프를 기억한 상태에서 실제 오픈소스 기여 과정을 살펴보겠습니다.
-->

---
layout: center
---

<div class="text-sm opacity-60 font-mono pb-2">GITHUB CLI</div>

# gh: 터미널에서 다루는 GitHub

<div class="opacity-75 pb-6 -mt-1">방금 본 기여 루프의 push와 PR을 브라우저 대신 명령 한 줄로</div>

<div class="grid grid-cols-2 gap-6 max-w-3xl mx-auto">
  <div class="s3-card s3-card--violet p-5">
    <div class="font-mono text-sm opacity-60 pb-2">브라우저</div>
    <div class="text-xl font-bold">클릭 여러 번</div>
    <div class="opacity-75 pt-2">탭 열고 버튼 찾고 폼 채우기</div>
  </div>
  <div class="s3-card s3-card--amber p-5">
    <div class="font-mono text-sm opacity-60 pb-2">gh</div>
    <div class="text-xl font-bold">명령 한 줄</div>
    <div class="opacity-75 pt-2">터미널에서 그대로 이어서</div>
  </div>
</div>

<!--
worktree로 작업 공간을 나눴다면 그 작업을 GitHub에 올려 PR로 만들 차례입니다.

여기서 쓰는 게 gh, GitHub 공식 CLI입니다. 브라우저로 하던 PR 생성, 이슈 확인, 릴리스, Actions 상태 확인을 터미널에서 바로 합니다.

특히 코딩 에이전트와 함께 쓰면 자연어 지시만으로 이 명령들을 대신 실행하게 만들 수 있습니다.
-->

---

# 설치와 로그인은 한 번

```bash
brew install gh        # macOS (Windows: winget install GitHub.cli)
gh auth login          # 브라우저로 인증, 토큰은 로컬에 저장
gh auth status         # 연결 확인
```

<div class="pt-5 text-xl opacity-75">
인증은 처음 한 번만 하면 됩니다. 토큰은 내 컴퓨터에만 남습니다.
</div>

<!--
설치는 OS마다 다릅니다. macOS는 Homebrew, Windows는 winget, 리눅스는 apt나 dnf를 씁니다. 자세한 방법은 cli.github.com에 있습니다.

gh auth login을 한 번 실행하면 브라우저로 GitHub에 로그인하고 토큰이 내 컴퓨터에 저장됩니다. 이후 gh 명령은 이 인증을 그대로 씁니다.

코딩 에이전트도 이 인증을 함께 씁니다. 한 번 로그인해 두면 에이전트가 gh를 실행할 때 다시 인증하지 않아도 됩니다.
-->

---

# gh 기능 지도

<div class="grid grid-cols-3 gap-3 pt-4 text-left">
  <div class="s3-card s3-card--amber p-4">
    <div class="font-bold pb-1">인증·설정</div>
    <div class="font-mono text-xs opacity-80">auth · config · alias · extension</div>
    <div class="text-xs opacity-70 pt-2">로그인과 개인화</div>
  </div>
  <div class="s3-card s3-card--sky p-4">
    <div class="font-bold pb-1">저장소</div>
    <div class="font-mono text-xs opacity-80">repo · browse · search</div>
    <div class="text-xs opacity-70 pt-2">만들기·클론·포크·검색</div>
  </div>
  <div class="s3-card s3-card--violet p-4">
    <div class="font-bold pb-1">협업 PR·이슈</div>
    <div class="font-mono text-xs opacity-80">pr · issue · label · project</div>
    <div class="text-xs opacity-70 pt-2">리뷰와 이슈 트래킹</div>
  </div>
  <div class="s3-card s3-card--emerald p-4">
    <div class="font-bold pb-1">Actions·자동화</div>
    <div class="font-mono text-xs opacity-80">run · workflow · secret · cache</div>
    <div class="text-xs opacity-70 pt-2">CI 확인·트리거</div>
  </div>
  <div class="s3-card s3-card--rose p-4">
    <div class="font-bold pb-1">릴리스·공유</div>
    <div class="font-mono text-xs opacity-80">release · gist</div>
    <div class="text-xs opacity-70 pt-2">배포 기준점과 코드 조각</div>
  </div>
  <div class="s3-card s3-card--sky p-4">
    <div class="font-bold pb-1">고급</div>
    <div class="font-mono text-xs opacity-80">api · codespace · ssh-key · status</div>
    <div class="text-xs opacity-70 pt-2">원시 API·클라우드 환경</div>
  </div>
</div>

<div class="pt-5 opacity-75 text-center">외우지 말고 필요할 때 그룹만 떠올리면 됩니다.</div>

<!--
gh의 기능은 이렇게 그룹으로 묶어서 기억하는 게 좋습니다.

로그인은 auth, 저장소를 만들거나 포크할 때는 repo, PR과 이슈는 pr·issue, CI 실행 확인은 run·workflow, 릴리스는 release입니다.

전부 외울 필요는 없습니다. "이런 종류의 일은 gh로 되겠구나"만 떠올리면 나머지는 gh --help나 에이전트가 채워줍니다.
-->

---
layout: center
---

<div class="text-sm opacity-60 font-mono pb-2">실습</div>

# 실습: 에이전트에게 gh를 맡깁니다

<div class="opacity-75 pb-5 -mt-1">자연어로 지시하면 코딩 에이전트가 gh를 대신 실행합니다</div>

<div class="text-left max-w-2xl mx-auto pb-4">

- 각 실습은 **명령어 → 기대 결과 → 흔한 오류** 순서로 봅니다.
- Claude Code가 아니어도 gh를 실행할 수 있는 에이전트면 됩니다.
- 명령마다 승인을 묻지 않게 하려면 허용할 gh 명령을 미리 지정합니다.

</div>

```json
{ "permissions": { "allow": ["Bash(gh pr:*)", "Bash(gh issue:*)"] } }
```

<!--
gh 문법을 모두 외울 필요는 없습니다. 하고 싶은 일을 자연어로 말하면 에이전트가 알맞은 gh 명령으로 옮겨 실행합니다.

다만 에이전트가 셸 명령을 실행할 때마다 승인을 물으면 흐름이 끊깁니다. settings.json의 permissions.allow에 gh 관련 명령을 미리 등록하면 반복 승인 없이 진행됩니다.

세 가지 실습을 명령어·기대 결과·흔한 오류 순서로 보겠습니다.
-->

---

# 실습 ①: 브랜치 → PR 생성

```bash
# 에이전트에게: "docs 브랜치 만들고 README에 한 줄 추가한 뒤 main으로 PR 올려줘"
gh pr create --fill --base main
```

<div class="grid grid-cols-2 gap-4 pt-5">
  <div class="s3-card s3-card--emerald p-4">
    <div class="font-bold pb-1">기대 결과</div>
    <div class="text-sm opacity-80">PR이 생기고 URL이 출력됩니다.</div>
    <div class="font-mono text-xs opacity-70 pt-2">github.com/내계정/저장소/pull/1</div>
  </div>
  <div class="s3-card s3-card--rose p-4">
    <div class="font-bold pb-1">흔한 오류</div>
    <div class="text-sm opacity-80">커밋 없이 실행, 브랜치를 안 바꿈, 인증 만료</div>
    <div class="font-mono text-xs opacity-70 pt-2">→ 먼저 commit / gh auth login</div>
  </div>
</div>

<!--
브랜치에서 변경을 커밋했다면 PR을 만들 차례입니다.

브랜치를 만들고 변경을 커밋한 상태에서 gh pr create --fill을 실행하면, 커밋 메시지를 제목과 본문으로 채워 PR을 만듭니다. --base main은 어느 브랜치로 합칠지 정합니다.

흔한 오류는 대부분 순서 문제입니다. 커밋을 안 했거나, 아직 main에 있거나, 인증이 풀린 경우입니다. 에이전트에게 "먼저 커밋부터" 또는 "gh auth login 먼저"라고 안내합니다.
-->

---

# 실습 ②: PR 체크 읽기

```bash
# 에이전트에게: "방금 올린 PR의 CI 체크 상태 확인해줘"
gh pr checks          # 체크 목록과 통과 여부
gh run watch          # 진행 중인 실행을 실시간으로
```

<div class="grid grid-cols-2 gap-4 pt-5">
  <div class="s3-card s3-card--emerald p-4">
    <div class="font-bold pb-1">기대 결과</div>
    <div class="text-sm opacity-80">각 체크의 통과·실패 여부와 실패 로그 위치가 보입니다.</div>
  </div>
  <div class="s3-card s3-card--rose p-4">
    <div class="font-bold pb-1">흔한 오류</div>
    <div class="text-sm opacity-80">워크플로가 없어 "no checks reported", 또는 pending으로 대기</div>
  </div>
</div>

<!--
PR을 올렸으면 자동 검사가 어떻게 됐는지 봐야 합니다.

gh pr checks는 그 PR에 붙은 체크의 통과 여부를 한눈에 보여줍니다. gh run watch는 실행이 끝날 때까지 실시간으로 상태를 따라갑니다.

체크가 안 보이면 대개 저장소에 워크플로가 없어서입니다. 3일차에서 만든 CI 워크플로가 있어야 체크가 붙습니다. pending이면 잠시 기다리면 됩니다.
-->

---

# 실습 ③: 리뷰 코멘트 대응

```bash
# 에이전트에게: "이 PR에 달린 코멘트 보여주고, 요청대로 고쳐서 다시 push해줘"
gh pr view --comments   # 리뷰 코멘트 확인
# 수정 후
git push                # PR이 자동으로 업데이트됨
```

<div class="grid grid-cols-2 gap-4 pt-5">
  <div class="s3-card s3-card--emerald p-4">
    <div class="font-bold pb-1">기대 결과</div>
    <div class="text-sm opacity-80">코멘트 확인 → 수정 커밋 → PR 자동 업데이트 → 체크 재실행</div>
  </div>
  <div class="s3-card s3-card--rose p-4">
    <div class="font-bold pb-1">흔한 오류</div>
    <div class="text-sm opacity-80">브랜치가 어긋나 push 대상이 틀리거나, 체크 재실행을 기다려야 함</div>
  </div>
</div>

<!--
리뷰 코멘트가 달리면 내용을 읽고 고쳐 다시 push합니다.

gh pr view --comments로 코멘트를 확인하고 에이전트에게 요청대로 수정하게 한 뒤 push합니다. PR은 같은 브랜치를 계속 추적하므로 자동으로 갱신되고 체크도 다시 실행됩니다.

새 PR을 만들 필요는 없습니다. 같은 브랜치에 push하면 기존 PR이 갱신됩니다.
-->

---
layout: center
---

# 정리: 터미널에서 끝나는 협업 루프

<div class="text-left max-w-2xl mx-auto pt-2">

<v-clicks>

- 브라우저 왕복 없이 **PR·이슈·체크를 명령으로**
- 자연어 지시로 **에이전트가 gh를 대신 실행**
- **명령어·기대 결과·흔한 오류를 읽고 직접 판단**

</v-clicks>

</div>

<div class="pt-6 text-xl opacity-75 text-center">
worktree로 나눈 작업 공간 + gh로 만드는 PR = 오픈소스 기여의 실전 도구.
</div>

<!--
gh는 GitHub 작업을 터미널에서 처리하고 코딩 에이전트는 자연어 지시를 gh 명령으로 옮깁니다.

명령어보다 먼저 익힐 것은 결과와 오류를 읽는 법입니다. 그래야 에이전트가 무엇을 했는지 직접 판단할 수 있습니다.

worktree로 작업을 나누고 gh로 PR을 올리는 이 조합은 다음에 볼 실제 오픈소스 기여에서도 그대로 쓰입니다.
-->
