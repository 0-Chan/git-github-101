---
title: "conventional commits"
slug: conventional-commits
order: 18
hasTerminal: true
steps:
  - id: inspect-log
    instruction: "현재 커밋 메시지 형식을 확인해보세요"
    hint: "git log --oneline"
    validation:
      type: command-run
      matches: "^git log(?=.*--oneline)"
  - id: update-search-copy
    instruction: "search.txt를 열어 검색 결과가 없을 때 안내 문구를 추가하세요"
    hint: "edit search.txt"
    validation:
      type: file-content
      path: /search.txt
      contains: "검색 결과가 없을 때"
  - id: stage-search-copy
    instruction: "변경한 search.txt를 스테이징하세요"
    hint: "git add search.txt"
    validation:
      type: command-run
      matches: "^git add search.txt$"
  - id: commit-with-type
    instruction: "fix 타입으로 커밋 메시지를 작성하세요"
    hint: 'git commit -m "fix: 빈 검색 결과 안내 추가"'
    validation:
      type: commit-message
      pattern: "^fix: 빈 검색 결과 안내 추가"
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

이미 `feat:`과 `docs:`로 시작하는 커밋이 있습니다. 이제 작은 버그 수정 커밋을 하나 추가해보겠습니다.

## 작은 수정 만들기

`search.txt`를 열고 검색 결과가 없을 때 보여줄 안내 문구를 한 줄 추가하세요.

```bash
edit search.txt
```

예를 들면 이렇게 적을 수 있습니다.

```text
검색 결과가 없을 때: 다시 검색어를 확인하세요.
```

## 타입을 붙여 커밋하기

변경을 스테이징하고 `fix:` 타입으로 커밋합니다.

```bash
git add search.txt
git commit -m "fix: 빈 검색 결과 안내 추가"
```

이 커밋은 "기능 추가"가 아니라 "문제 상황 보완"에 가깝기 때문에 `fix:`가 어울립니다.

---

메시지 형식을 맞췄습니다. 다음은 한 커밋에 얼마만큼 담아야 하는지 봅니다.
