---
title: "히스토리 다시 쓰기: rebase"
slug: rebase
order: 17
hasTerminal: true
steps:
  - id: graph-before
    instruction: "두 브랜치가 갈라진 모양을 그래프로 확인하세요"
    hint: "git log --oneline --graph --all"
    validation:
      type: command-run
      matches: "^git log(?=.*--graph)(?=.*--all)"
  - id: do-rebase
    instruction: "feature의 커밋을 main 위로 재적용하세요"
    hint: "git rebase main"
    validation:
      type: rebased-onto
      name: main
  - id: switch-main
    instruction: "main 브랜치로 이동하세요"
    hint: "git checkout main"
    validation:
      type: current-branch
      name: main
  - id: ff-merge
    instruction: "일직선이 된 feature를 main으로 합치세요"
    hint: "git merge feature"
    validation:
      type: command-run
      matches: "^git merge feature$"
  - id: graph-after
    instruction: "히스토리가 일직선이 된 것을 확인하세요"
    hint: "git log --oneline --graph"
    validation:
      type: command-run
      matches: "^git log --oneline --graph$"
---

## 상황: 작업하는 사이 main이 먼저 갔다

여러분은 `feature` 브랜치에서 검색 기능을 만들었습니다. 그런데 그 사이 `main`에는 버그 수정 커밋이 올라갔습니다. 그래프로 확인해봅시다:

```bash
git log --oneline --graph --all
```

두 브랜치가 한 지점에서 갈라져 서로 다른 커밋을 갖고 있습니다. 합치는 방법은 두 가지입니다:

- **merge**: 두 갈래를 매듭(머지 커밋)으로 묶는다. 갈라졌던 흔적이 남는다
- **rebase**: 내 커밋을 **main 위로 옮겨 심는다**. 처음부터 일직선이었던 것처럼 된다

## 옮겨 심기: rebase

`feature`에 서 있는 지금, main 위로 재적용해봅시다:

```bash
git rebase main
```

rebase는 마법이 아닙니다. 실제로는 이렇게 동작합니다:

1. 두 브랜치의 **분기점**을 찾는다
2. 내 브랜치에만 있는 커밋들을 기억해둔다
3. 브랜치를 main 끝으로 옮긴다
4. 기억해둔 커밋을 **하나씩 다시 적용**한다 (cherry-pick의 반복)

`git log --oneline --graph --all`로 다시 보면 갈라짐이 사라지고 내 커밋이 main의 버그 수정 **뒤에** 서 있습니다.

## 해시가 바뀌었다: rebase의 본질

자세히 보면 재적용된 커밋의 **해시가 이전과 다릅니다**. 내용은 같아도 "어디 위에 만들어졌는가"가 달라졌으니 완전히 **새 커밋**입니다. 그래서 rebase를 "히스토리를 다시 쓴다"라고 말합니다.

여기서 rebase의 황금률이 나옵니다:

> **다른 사람과 공유한 커밋은 rebase하지 마세요.** 남이 갖고 있는 커밋을 내가 새 커밋으로 바꿔치기하면, 히스토리가 어긋나 팀 전체가 혼란에 빠집니다. rebase는 아직 나만 가진 로컬 커밋에만 쓰는 도구입니다.

## 일직선이 된 브랜치 합치기

rebase의 보상은 합칠 때 옵니다. `main`으로 이동해 합쳐보세요:

```bash
git checkout main
git merge feature
```

`Fast-forward`가 출력됩니다. 머지 커밋 없이 이름표만 앞으로 이동한 것입니다. feature가 이미 main의 연장선 위에 있으니 매듭을 만들 필요가 없습니다:

```bash
git log --oneline --graph
```

완전한 일직선입니다. 갈라졌던 흔적조차 없습니다.

## merge vs rebase

- **merge**: 히스토리를 보존한다. 언제 갈라지고 합쳐졌는지 그대로 남아 공유 브랜치에 안전하다
- **rebase**: 히스토리를 다시 쓴다. 깔끔한 일직선이 되지만, 나만 가진 커밋에만 써야 한다

어느 쪽이 옳다기보다 팀의 규칙을 따르는 문제입니다. 다만 원리를 알면 규칙이 이해됩니다.

---

로컬 히스토리를 다루는 도구를 모두 익혔습니다. 이제 이 도구들을 팀에서 쓰는 협업 규칙 위에 얹어보겠습니다.
