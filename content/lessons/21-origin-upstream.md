---
title: "origin과 upstream"
slug: origin-upstream
order: 21
hasTerminal: true
steps:
  - id: inspect-origin
    instruction: "현재 등록된 원격 저장소를 확인하세요"
    hint: "git remote -v"
    validation:
      type: command-run
      matches: "^git remote -v$"
  - id: add-upstream
    instruction: "원본 저장소를 upstream이라는 이름으로 추가하세요"
    hint: "git remote add upstream https://github.com/firstcontributions/first-contributions.git"
    validation:
      type: remote-exists
      name: upstream
  - id: fetch-upstream
    instruction: "upstream에서 최신 이력을 받아오는 명령을 실행하세요"
    hint: "git fetch upstream"
    validation:
      type: command-run
      matches: "^git fetch upstream$"
---

## fork 협업의 세 곳

fork로 협업하면 저장소가 세 곳으로 나뉩니다.

```text
내 컴퓨터(로컬)  →  내 fork(origin)  →  원본 저장소(upstream)
```

어제 clone한 주소는 원본 저장소가 아니라 보통 **내 fork**였습니다. 그래서 로컬에서 보는 `origin`은 내 GitHub 계정 아래의 사본입니다.

## origin은 내가 push하는 곳

먼저 현재 원격 저장소를 확인합니다.

```bash
git remote -v
```

이 레슨의 가상 저장소에는 이미 `origin`이 등록되어 있습니다. `origin`은 내가 push할 수 있는 내 fork라고 생각하면 됩니다.

## upstream은 원본 저장소

원본 저장소도 이름을 붙여 등록해두면 최신 변경을 받아올 수 있습니다.

```bash
git remote add upstream https://github.com/firstcontributions/first-contributions.git
```

다시 확인하면 `origin`과 `upstream` 두 원격 저장소가 보입니다.

```bash
git remote -v
```

## 원본이 바뀌면 upstream에서 가져온다

원본 저장소의 최신 이력은 `upstream`에서 받아옵니다.

```bash
git fetch upstream
```

이 브라우저 터미널에서는 네트워크 없이 명령 흐름만 시뮬레이션합니다. 실제 Git에서는 이 명령이 원본 저장소의 새 커밋과 브랜치 정보를 내려받습니다.

## 어제 한 일이 다시 보입니다

- fork: 원본 저장소의 내 사본을 만들었다.
- clone: 내 fork를 로컬로 가져왔다. 그래서 `origin`이 내 fork였다.
- push: 내 브랜치를 `origin`으로 올렸다.
- PR: `origin`의 브랜치를 `upstream`에 제안했다.

---

이제 원격 저장소의 방향이 보입니다. 다음은 이 구조 위에서 일감이 어떻게 흐르는지 봅니다.
