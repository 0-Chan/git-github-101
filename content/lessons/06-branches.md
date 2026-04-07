---
title: "브랜치 만들고 사용하기"
slug: branches
order: 6
hasTerminal: true
steps:
  - id: create-branch
    instruction: "feature라는 이름의 브랜치를 만드세요"
    hint: "git branch feature"
    validation:
      type: branch-exists
      name: feature
  - id: switch-branch
    instruction: "feature 브랜치로 이동하세요"
    hint: "git checkout feature"
    validation:
      type: current-branch
      name: feature
  - id: create-file-on-branch
    instruction: "feature.txt 파일을 만들고 커밋하세요"
    hint: 'touch feature.txt && git add feature.txt && git commit -m "feature 브랜치에서 파일 추가"'
    validation:
      type: file-exists
      path: /feature.txt
---

## 브랜치(Branch)란?

브랜치는 독립적인 작업 공간입니다. 나무의 가지처럼 메인 코드에서 갈라져 나와, 원본에 영향을 주지 않고 새로운 기능을 개발하거나 실험을 할 수 있습니다.

기본 브랜치의 이름은 보통 `main`(또는 예전에는 `master`)입니다.

## 브랜치 만들기

새 브랜치를 만드는 명령어:

```bash
git branch feature
```

현재 존재하는 브랜치 목록을 확인하려면:

```bash
git branch
```

`*` 표시가 붙은 브랜치가 현재 작업 중인 브랜치입니다.

## 브랜치로 이동하기

브랜치를 만들었다고 자동으로 이동하지는 않습니다. `checkout` 명령어로 이동해야 합니다:

```bash
git checkout feature
```

> **팁**: 브랜치 생성과 이동을 한 번에 하려면 `-b` 옵션을 사용하세요:
> ```bash
> git checkout -b feature
> ```

## feature 브랜치에서 작업하기

이제 `feature` 브랜치에서 새 파일을 만들고 커밋해봅시다:

```bash
touch feature.txt
git add feature.txt
git commit -m "feature 브랜치에서 파일 추가"
```

이 변경사항은 `feature` 브랜치에만 존재합니다. `main` 브랜치로 돌아가면 `feature.txt` 파일이 보이지 않습니다.

## 브랜치 전략

실제 개발 현장에서는 보통 이런 식으로 브랜치를 활용합니다:
- `main`: 배포 가능한 안정적인 코드
- `develop`: 개발 중인 코드
- `feature/기능명`: 새 기능 개발
- `bugfix/버그명`: 버그 수정

---

브랜치의 기본을 익혔습니다! 다음 레슨에서는 브랜치를 합치는 **머지(Merge)**를 배워보겠습니다.
