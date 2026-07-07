---
title: "잠깐 치워두기: stash"
slug: stash
order: 14
hasTerminal: true
steps:
  - id: make-change
    instruction: "hello.txt를 열어 작업 중 이라는 줄을 추가해보세요"
    hint: "edit hello.txt"
    validation:
      type: file-content
      path: /hello.txt
      contains: "작업 중"
  - id: stash-push
    instruction: "하던 작업을 잠깐 치워두세요"
    hint: "git stash"
    validation:
      type: command-run
      matches: "^git stash$"
  - id: stash-pop
    instruction: "치워둔 작업을 다시 꺼내세요"
    hint: "git stash pop"
    validation:
      type: command-run
      matches: "^git stash pop$"
---

## 커밋하기엔 애매할 때

작업을 반쯤 하다가 급하게 다른 일을 처리해야 할 때가 있습니다. 지금 상태를 커밋하자니 미완성이고, 그냥 두자니 브랜치를 옮길 수 없습니다. 이럴 때 `stash`가 하던 작업을 **선반에 잠깐 올려둡니다.**

## 작업 중인 변경 만들기

`edit`으로 파일을 열어 `작업 중`이라는 줄을 추가하고 저장하세요:

```bash
edit hello.txt
```

`git status`를 실행하면 변경된 파일로 보입니다.

## 선반에 올려두기

```bash
git stash
```

다시 `cat hello.txt`와 `git status`를 확인해보세요. 방금 추가한 줄이 사라지고 작업트리가 깨끗해졌습니다. 변경은 없어진 게 아니라 **선반에 보관**된 것입니다. 목록은 `git stash list`로 볼 수 있습니다.

## 다시 꺼내기

급한 일을 처리했다면 선반에서 작업을 되꺼냅니다:

```bash
git stash pop
```

`cat hello.txt`로 확인하면 `작업 중` 줄이 돌아와 있습니다.

## 커밋 vs stash

- **커밋**: 완성된 시점의 영구 기록
- **stash**: 미완성 작업의 임시 보관

지저분한 중간 상태를 `WIP` 커밋으로 남발하지 마세요. 잠깐 치워둘 선반이 따로 있습니다.

---

Git의 로컬 안전망(reset, stash)까지 익혔습니다. 이제 이 도구들을 실전 미션에서 겁내지 않고 쓸 수 있습니다.
