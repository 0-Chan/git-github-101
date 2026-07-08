---
title: "되돌리기: reset"
slug: reset
order: 15
hasTerminal: true
steps:
  - id: view-log
    instruction: "git log로 방금 남긴 실수 커밋을 확인해보세요"
    hint: "git log --oneline"
    validation:
      type: command-run
      matches: "^git log"
  - id: reset-hard
    instruction: "마지막 커밋을 되돌리세요"
    hint: "git reset --hard HEAD~1"
    validation:
      type: commit-message
      pattern: "add second line"
---

## 되돌릴 수 있다는 것

1일차에 "커밋은 세이브 포인트"라고 했습니다. 세이브 포인트가 있으면 언제든 그 시점으로 돌아갈 수 있습니다. 그 되돌리기 명령이 `reset`입니다.

이 저장소에는 지금 실수로 남긴 마지막 커밋(`WIP: 실수로 남긴 커밋`)이 하나 있습니다. 이걸 없던 일로 만들어보겠습니다.

## 지금 상태 확인하기

먼저 커밋 이력을 봅니다:

```bash
git log --oneline
```

가장 위에 실수 커밋이 보입니다. 바로 아래가 되돌아갈 지점(`add second line`)입니다.

## reset으로 되돌리기

```bash
git reset --hard HEAD~1
```

- `HEAD~1`: 지금 위치에서 커밋 하나 뒤
- `--hard`: 커밋 이력과 작업 파일까지 그 시점으로 완전히 되돌림

실행 후 `git log --oneline`과 `cat hello.txt`로 확인해보세요. 실수 커밋이 사라지고 `Oops, mistake!` 줄도 함께 없어졌습니다.

## reset vs revert

| | reset | revert |
| --- | --- | --- |
| 방식 | 이력을 지우고 뒤로 이동 | 되돌리는 새 커밋을 쌓음 |
| 이력 | 사라짐 | 보존됨 |
| 안전한 곳 | push 전 로컬 | 이미 공유한 이력 |

> **주의**: `reset --hard`는 작업 내용까지 지웁니다. **이미 push한 커밋에는 쓰지 마세요.** 남이 그 이력 위에서 작업 중일 수 있습니다. 공유한 이력을 되돌릴 때는 `revert`를 씁니다.

---

되돌리기를 배웠습니다. 다음 레슨에서는 커밋하기엔 애매한 작업을 잠깐 치워두는 `stash`를 배웁니다.
