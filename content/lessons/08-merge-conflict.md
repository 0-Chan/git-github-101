---
title: "충돌 해결하기 (Merge Conflict)"
slug: merge-conflict
order: 8
hasTerminal: true
steps:
  - id: resolve-conflict
    instruction: "greeting.txt를 열어 충돌 마커를 지우고 원하는 내용만 남기세요"
    hint: "edit greeting.txt"
    validation:
      type: no-conflict-markers
      path: /greeting.txt
  - id: stage-resolved
    instruction: "충돌이 해결된 파일을 스테이징하세요"
    hint: "git add greeting.txt"
    validation:
      type: git-staged
      path: greeting.txt
  - id: commit-merge
    instruction: "머지 커밋을 만드세요"
    hint: 'git commit -m "merge: resolve greeting.txt conflict"'
    validation:
      type: commit-count
      min: 3
---

## 충돌(Conflict)이란?

두 브랜치에서 **같은 파일의 같은 부분**을 서로 다르게 수정하면, Git은 어느 쪽을 선택해야 할지 알 수 없습니다. 이때 **충돌**(Merge Conflict)이 발생합니다.

## 충돌이 발생한 파일 확인하기

충돌이 발생하면 Git은 머지를 중단하고 충돌한 파일을 알려줍니다:

```bash
git merge feature
# Auto-merging greeting.txt
# CONFLICT (content): Merge conflict in greeting.txt
# Automatic merge failed; fix conflicts and then commit the result.
```

## 충돌 마커 이해하기

충돌이 발생한 파일을 열면 다음과 같은 내용이 보입니다:

```
<<<<<<< HEAD
Hello! Welcome! (main 브랜치의 내용)
=======
Hi! Nice to meet you! (feature 브랜치의 내용)
>>>>>>> feature
```

- `<<<<<<< HEAD` ~ `=======`: 현재 브랜치(`main`)의 내용
- `=======` ~ `>>>>>>> feature`: 병합하려는 브랜치(`feature`)의 내용

## 충돌 해결하기

충돌을 해결하려면 파일을 직접 편집해야 합니다. `edit` 명령어로 파일을 열어보세요:

```bash
edit greeting.txt
```

에디터에 충돌 마커가 포함된 내용이 그대로 보입니다. 마커 세 줄(`<<<<<<<`, `=======`, `>>>>>>>`)을 모두 지우고 남기고 싶은 내용만 남긴 뒤 **저장**하세요. 두 브랜치의 내용을 합쳐 `Hello! Welcome! Nice to meet you!`처럼 만들어도 좋습니다.

저장 후 파일 내용을 확인해보세요:

```bash
cat greeting.txt
```

## 해결 후 커밋하기

충돌을 해결한 파일을 스테이징하고 커밋합니다:

```bash
git add greeting.txt
git commit -m "merge: resolve greeting.txt conflict"
```

> **팁**: 실무에서 쓰는 VS Code 같은 에디터는 충돌 마커를 하이라이트하고 "Accept Current/Incoming" 버튼도 제공합니다. 원리는 방금 한 것과 같습니다. 마커를 지우고 원하는 내용만 남기면 됩니다.

---

충돌 해결까지 배웠습니다! 다음 레슨에서는 협업의 핵심 플랫폼인 **GitHub**에 대해 알아보겠습니다.
