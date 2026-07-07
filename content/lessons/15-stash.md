---
title: "잠깐 치워두기: stash"
slug: stash
order: 15
hasTerminal: true
steps:
  - id: make-change
    instruction: "app.txt를 열어 자동완성 작업 중 이라는 줄을 추가하세요"
    hint: "edit app.txt"
    validation:
      type: file-content
      path: /app.txt
      contains: "자동완성"
  - id: try-switch
    instruction: "급한 요청이 왔습니다. main 브랜치로 이동해보세요"
    hint: "git checkout main"
    validation:
      type: command-run
      matches: "^git checkout main$"
  - id: stash-push
    instruction: "전환이 막혔습니다. 하던 작업을 잠깐 치워두세요"
    hint: "git stash"
    validation:
      type: command-run
      matches: "^git stash$"
  - id: switch-main
    instruction: "이제 main 브랜치로 이동하세요"
    hint: "git checkout main"
    validation:
      type: current-branch
      name: main
  - id: switch-back
    instruction: "급한 일을 마쳤습니다. feature 브랜치로 돌아오세요"
    hint: "git checkout feature"
    validation:
      type: command-run
      matches: "^git checkout feature$"
  - id: stash-pop
    instruction: "치워둔 작업을 다시 꺼내 이어서 작업하세요"
    hint: "git stash pop"
    validation:
      type: command-run
      matches: "^git stash pop$"
---

## 상황: 작업 중에 끼어든 급한 일

지금 여러분은 `feature` 브랜치에서 검색 자동완성 기능을 만드는 중입니다. 아직 완성되지 않아 커밋하기는 이릅니다. 그런데 팀에서 `main` 브랜치를 급하게 확인해달라는 요청이 왔습니다.

먼저 작업 중인 줄을 하나 추가해봅시다. `edit`으로 `app.txt`를 열어 `자동완성 작업 중`을 적고 저장하세요:

```bash
edit app.txt
```

## 브랜치를 옮기려는데 막힌다

급한 요청부터 처리하려고 `main`으로 이동해봅니다:

```bash
git checkout main
```

이동이 되지 않고 이런 메시지가 나옵니다:

```
Your local changes to the following files would be overwritten by checkout: app.txt
```

커밋하지 않은 변경이 있으면 Git은 브랜치 전환을 막습니다. 옮기는 순간 그 변경이 사라질 수 있기 때문입니다. 커밋하자니 미완성이고, 버리자니 아깝습니다.

## 선반에 잠깐 올려두기

이럴 때 `stash`가 하던 작업을 안전하게 치워둡니다:

```bash
git stash
```

`cat app.txt`로 확인하면 방금 추가한 줄이 사라지고 작업트리가 깨끗해졌습니다. 변경은 없어진 게 아니라 **선반에 보관**된 것입니다. 목록은 `git stash list`로 볼 수 있습니다.

## 급한 일 처리하고 돌아오기

이제 브랜치를 옮길 수 있습니다:

```bash
git checkout main
```

같은 명령인데 이번엔 됩니다. 급한 확인을 마쳤으면 원래 작업하던 곳으로 돌아옵니다:

```bash
git checkout feature
git stash pop
```

`cat app.txt`로 확인하면 `자동완성 작업 중` 줄이 돌아와 있습니다. 끊겼던 작업을 그대로 이어서 하면 됩니다.

## 커밋 vs stash

- **커밋**: 완성된 시점의 영구 기록
- **stash**: 미완성 작업의 임시 보관

지저분한 중간 상태를 `WIP` 커밋으로 남발하지 마세요. 잠깐 치워둘 선반이 따로 있습니다.

---

Git의 로컬 안전망(reset, stash)까지 익혔습니다. 이제 이 도구들을 실전 미션에서 겁내지 않고 쓸 수 있습니다.
