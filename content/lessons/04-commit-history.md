---
title: "커밋 이력 확인하기"
slug: commit-history
order: 4
hasTerminal: true
steps:
  - id: view-log
    instruction: "커밋 이력을 확인해보세요"
    hint: "git log"
    validation:
      type: commit-count
      min: 1
---

## 커밋 이력이란?

Git의 가장 강력한 기능 중 하나는 모든 변경 이력을 보관한다는 것입니다. `git log` 명령어를 사용하면 지금까지 만든 모든 커밋을 시간 순서대로 확인할 수 있습니다.

## git log 실행하기

터미널에서 다음 명령어를 실행해보세요:

```bash
git log
```

출력 결과는 다음과 같이 생겼습니다:

```
commit abc123def456... (HEAD -> main)
Author: Learner <learner@git101.dev>
Date:   Mon Apr 7 10:00:00 2026 +0900

    my first commit
```

각 항목의 의미는 다음과 같습니다:
- **commit**: 커밋의 고유 ID (SHA 해시값)
- **Author**: 커밋을 만든 사람의 이름과 이메일
- **Date**: 커밋이 만들어진 날짜와 시간
- **메시지**: 커밋 메시지

## 더 간결하게 보기

커밋이 많아지면 `git log` 출력이 길어집니다. 한 줄로 간결하게 보고 싶다면:

```bash
git log --oneline
```

```
abc1234 (HEAD -> main) my first commit
```

## 그래프로 보기

브랜치 구조를 시각적으로 확인하려면:

```bash
git log --oneline --graph --all
```

## git log 종료하기

`git log`를 실행하면 터미널이 페이저(pager) 모드로 진입합니다. 종료하려면 키보드에서 `q`를 누르세요.

---

커밋 이력을 확인할 수 있게 되었습니다! 다음 레슨에서는 파일을 수정하고 변경사항을 비교하는 방법을 배워보겠습니다.
