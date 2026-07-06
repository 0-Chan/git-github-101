---
title: "첫 번째 저장소 만들기"
slug: first-repo
order: 2
hasTerminal: true
steps:
  - id: git-init
    instruction: "현재 디렉토리에 Git 저장소를 초기화하세요"
    hint: "git init"
    validation:
      type: file-exists
      path: /.git
---

## Git 저장소 초기화하기

Git으로 프로젝트를 관리하려면 먼저 **저장소**(Repository)를 만들어야 합니다. 저장소를 만드는 명령어는 `git init`입니다.

## git init 실행하기

터미널에서 다음 명령어를 실행해보세요:

```bash
git init
```

명령어를 실행하면 아래와 같은 메시지가 나타납니다:

```
Initialized empty Git repository in /.git/
```

축하합니다! 첫 번째 Git 저장소가 만들어졌습니다.

## .git 디렉토리란?

`git init`을 실행하면 현재 디렉토리 안에 `.git`이라는 숨겨진 폴더가 생성됩니다. 이 폴더가 바로 Git 저장소의 핵심입니다.

`.git` 디렉토리 안에는 다음과 같은 정보가 저장됩니다:
- 모든 커밋 이력
- 브랜치 정보
- 설정 파일

> **주의**: `.git` 폴더를 직접 수정하거나 삭제하면 저장소가 손상될 수 있습니다. 이 폴더는 Git이 관리하도록 두세요.

## 확인해보기

`.git` 디렉토리가 잘 생성되었는지 확인하려면 아래 명령어를 사용하세요:

```bash
ls -la
```

숨긴 파일까지 모두 표시하면 `.git` 폴더를 볼 수 있습니다.

---

저장소가 만들어졌으니, 다음 레슨에서는 첫 번째 커밋을 만들어보겠습니다!
