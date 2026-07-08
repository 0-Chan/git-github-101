---
title: "conventional commits"
slug: conventional-commits
order: 19
hasTerminal: true
steps:
  - id: inspect-log
    instruction: "현재 커밋 메시지 형식을 확인해보세요"
    hint: "git log --oneline"
    validation:
      type: command-run
      matches: "^git log(?=.*--oneline)"
  - id: make-file
    instruction: "연습용 memo.txt 파일을 만드세요"
    hint: "touch memo.txt"
    validation:
      type: file-exists
      path: /memo.txt
  - id: feat-commit
    instruction: "스테이징 후 feat 타입으로 커밋하세요 (문구는 자유)"
    hint: 'git commit -m "feat: 메모 기능 추가"'
    validation:
      type: command-run
      matches: "^git commit -m [\"']feat: .+"
  - id: fix-commit
    instruction: "memo.txt를 고친 뒤 fix 타입으로 커밋하세요 (문구는 자유)"
    hint: 'git commit -m "fix: 메모 오타 수정"'
    validation:
      type: commit-message
      pattern: "^fix: .+"
---

## 커밋 메시지의 공용어

conventional commits는 커밋 메시지를 일정한 형식으로 쓰는 약속입니다.

```text
feat: 검색 자동완성 추가
fix: 로그인 실패 시 무한 로딩 수정
docs: README 설치 절차 갱신
refactor: 결제 모듈 중복 로직 정리
chore: 의존성 버전 올림
```

형식은 `타입: 요약`입니다. 타입만 봐도 변경 성격이 바로 보입니다.

## 왜 굳이 형식을 맞출까요?

- `git log --oneline`이 읽히는 문서가 됩니다.
- `fix:`만 모아 버그 수정 이력을 찾을 수 있습니다.
- 릴리스 노트와 changelog를 자동으로 만들기 쉬워집니다.
- 팀원이 제목만 보고 리뷰 방향을 잡을 수 있습니다.

## 먼저 현재 이력을 봅니다

```bash
git log --oneline
```

이미 `feat:`과 `docs:`로 시작하는 커밋이 있습니다. 이 형식을 직접 써볼 차례입니다.

## 직접 써보기

내용은 중요하지 않습니다. **타입을 고르고 형식을 지키는 것**이 이번 미션의 전부입니다.

먼저 연습용 파일을 하나 만들어 커밋합니다. 새로운 것을 추가했으니 타입은 `feat:`입니다. 요약 문구는 마음대로 적으세요:

```bash
touch memo.txt
git add memo.txt
git commit -m "feat: 메모 기능 추가"
```

이번엔 방금 만든 파일을 고쳐봅니다. `edit memo.txt`로 아무 내용이나 적어 저장한 뒤, 잘못된 것을 바로잡았다는 의미의 `fix:` 타입으로 커밋하세요:

```bash
edit memo.txt
git add memo.txt
git commit -m "fix: 메모 오타 수정"
```

## 타입 고르는 감각

- 새로운 것을 **추가**했다면 `feat:`
- 잘못된 것을 **고쳤다면** `fix:`
- 코드가 아니라 **문서**를 바꿨다면 `docs:`
- 동작은 같은데 **구조만 정리**했다면 `refactor:`

`git log --oneline`으로 확인해보세요. 타입이 붙은 이력은 그 자체로 변경 기록 문서가 됩니다.

---

메시지 형식을 맞췄습니다. 다음은 한 커밋에 얼마만큼 담아야 하는지 봅니다.
