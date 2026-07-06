---
title: "브랜치 합치기 (Merge)"
slug: merge
order: 7
hasTerminal: true
steps:
  - id: switch-to-main
    instruction: "main 브랜치로 이동하세요"
    hint: "git checkout main"
    validation:
      type: current-branch
      name: main
  - id: merge-feature
    instruction: "feature 브랜치를 main에 병합하세요"
    hint: "git merge feature"
    validation:
      type: file-exists
      path: /feature.txt
---

## 머지(Merge)란?

브랜치에서 작업이 완료되면, 그 내용을 메인 브랜치에 합쳐야 합니다. 이 과정을 **머지(Merge)**라고 합니다.

## main 브랜치로 이동하기

머지는 **합쳐지는 쪽** 브랜치에서 실행합니다. `feature` 브랜치의 내용을 `main`에 합치려면 먼저 `main` 브랜치로 이동합니다:

```bash
git checkout main
```

이 시점에서 `ls`를 실행하면 `feature.txt`가 보이지 않는 것을 확인할 수 있습니다. `feature.txt`는 `feature` 브랜치에만 존재하기 때문입니다.

## feature 브랜치 병합하기

이제 `feature` 브랜치를 현재 브랜치(`main`)에 병합합니다:

```bash
git merge feature
```

성공하면 다음과 같은 메시지가 나타납니다:

```
Updating abc1234..def5678
Fast-forward
```

이제 `ls`를 실행하면 `feature.txt`가 `main` 브랜치에도 나타납니다!

## Fast-forward 머지란?

위 예시에서 "Fast-forward"라는 단어가 보입니다. 이는 가장 단순한 형태의 머지입니다.

`main` 브랜치에 새로운 커밋이 없고, `feature` 브랜치가 `main`에서 직선으로 이어져 있을 때 발생합니다. Git은 단순히 포인터를 앞으로 이동시킵니다.

## 병합 후 브랜치 정리

병합이 완료된 브랜치는 삭제해도 됩니다:

```bash
git branch -d feature
```

---

브랜치 병합을 배웠습니다! 하지만 항상 깔끔하게 머지되지는 않습니다. 다음 레슨에서는 **충돌(Conflict)**이 발생했을 때 해결하는 방법을 배워보겠습니다.
