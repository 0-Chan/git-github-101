---
title: "파일 수정과 변경사항 비교"
slug: modify-and-diff
order: 5
hasTerminal: true
steps:
  - id: modify-file
    instruction: "hello.txt를 열어 내용을 Hello, Git! 으로 바꿔보세요"
    hint: "edit hello.txt"
    validation:
      type: file-content
      path: /hello.txt
      contains: "Hello, Git"
  - id: stage-changes
    instruction: "변경사항을 스테이징하세요"
    hint: "git add hello.txt"
    validation:
      type: git-staged
      path: hello.txt
  - id: commit-changes
    instruction: "변경사항을 커밋하세요"
    hint: 'git commit -m "update hello.txt"'
    validation:
      type: commit-count
      min: 2
---

## 파일 수정하고 변경사항 확인하기

이전 레슨에서 만든 `hello.txt` 파일에 내용을 추가하고, 변경사항을 Git으로 확인해보겠습니다.

## 파일 수정하기

`edit` 명령어로 파일을 에디터에서 열 수 있습니다:

```bash
edit hello.txt
```

에디터가 열리면 기존 내용(`Hello, World!`)을 지우고 `Hello, Git!`으로 바꾼 뒤 **저장** 버튼을 누르세요. 평소 쓰던 메모장처럼 자유롭게 수정하면 됩니다.

> **참고**: 개발자들은 `echo "Hello, Git!" > hello.txt`처럼 한 줄로 파일을 덮어쓰기도 합니다. 결과는 같습니다.

## git diff로 변경사항 비교하기

파일을 수정했지만 아직 스테이징하지 않은 상태에서 `git diff`를 실행하면 변경사항을 볼 수 있습니다:

```bash
git diff
```

출력 결과에서:
- `+`로 시작하는 줄: 새로 추가된 내용 (초록색)
- `-`로 시작하는 줄: 삭제된 내용 (빨간색)

## 변경사항 스테이징하고 커밋하기

변경사항을 확인했다면 스테이징 후 커밋합니다:

```bash
git add hello.txt
```

스테이징 후에도 변경사항을 확인할 수 있습니다:

```bash
git diff --staged
```

이제 커밋을 만들어보세요:

```bash
git commit -m "update hello.txt"
```

## git status로 현재 상태 파악하기

작업 중에는 `git status`를 자주 실행해서 현재 상태를 확인하는 습관을 들이세요:

```bash
git status
```

- **Untracked files**: Git이 아직 추적하지 않는 새 파일
- **Changes not staged**: 수정되었지만 아직 스테이징되지 않은 파일
- **Changes to be committed**: 스테이징되어 커밋 대기 중인 파일

---

파일 수정과 비교 방법을 익혔습니다! 다음 레슨에서는 브랜치를 만들고 관리하는 방법을 배워보겠습니다.
