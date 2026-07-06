---
title: "첫 번째 커밋"
slug: first-commit
order: 3
hasTerminal: true
steps:
  - id: create-file
    instruction: "hello.txt 파일을 만들어보세요"
    hint: "touch hello.txt"
    validation:
      type: file-exists
      path: /hello.txt
  - id: add-file
    instruction: "파일을 스테이징 영역에 추가하세요"
    hint: "git add hello.txt"
    validation:
      type: git-staged
      path: hello.txt
  - id: commit
    instruction: "첫 번째 커밋을 만들어보세요"
    hint: 'git commit -m "my first commit"'
    validation:
      type: commit-count
      min: 1
---

## 커밋(Commit)이란?

커밋은 파일의 변경사항을 저장소에 기록하는 행위입니다. 마치 게임의 세이브 포인트처럼, 커밋을 만들면 그 시점의 상태로 언제든지 돌아올 수 있습니다.

## 파일 만들기

먼저 연습용 파일을 하나 만들어봅시다:

```bash
touch hello.txt
```

`touch` 명령어는 빈 파일을 생성합니다. 파일이 잘 만들어졌는지 확인해보세요:

```bash
ls
```

## 스테이징 영역에 추가하기

Git은 파일을 바로 커밋하지 않습니다. **스테이징 영역**(Staging Area)이라는 임시 공간에 먼저 파일을 올려둡니다. 이 단계를 통해 어떤 변경사항을 커밋할지 세밀하게 제어할 수 있습니다.

```bash
git add hello.txt
```

현재 상태를 확인하려면:

```bash
git status
```

초록색으로 `hello.txt`가 표시되면 스테이징 영역에 잘 추가된 것입니다.

## 커밋 만들기

이제 커밋을 만들 차례입니다. `-m` 옵션으로 커밋 메시지를 함께 작성합니다:

```bash
git commit -m "my first commit"
```

좋은 커밋 메시지는 **무엇을 변경했는지** 명확하게 설명해야 합니다. 나중에 이력을 볼 때 큰 도움이 됩니다.

커밋이 성공하면 다음과 같은 메시지가 나타납니다:

```
[main (root-commit) abc1234] my first commit
 1 file changed, 0 insertions(+), 0 deletions(-)
 create mode 100644 hello.txt
```

---

첫 번째 커밋 완성! 다음 레슨에서는 커밋 이력을 확인하는 방법을 배워보겠습니다.
