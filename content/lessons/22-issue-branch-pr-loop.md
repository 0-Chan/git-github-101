---
title: "Issue → branch → PR"
slug: issue-branch-pr-loop
order: 22
hasTerminal: false
steps: []
---

## 실무의 일감은 한 바퀴를 돈다

GitHub에서 일감은 보통 다음 순서로 움직입니다.

```text
Issue → branch → commit → PR → merge
```

이 흐름을 지키면 "무엇을 하려고 했는지", "어떤 코드가 바뀌었는지", "어떻게 합쳐졌는지"가 한 줄로 연결됩니다.

## Issue는 할 일을 적는 곳

Issue에는 문제, 목표, 완료 기준을 적습니다.

```text
Issue #12: 로그인 실패 시 안내 문구가 없다
```

작업을 시작할 때는 이슈 번호가 드러나는 브랜치를 만들면 추적하기 쉽습니다.

```bash
git checkout -b fix/12-login-error-message
```

## PR은 이슈를 닫는 제안서

작업이 끝나면 PR 본문에 연결 문구를 넣습니다.

```text
Fixes #12
```

GitHub에서는 이 PR이 머지될 때 `#12` 이슈가 자동으로 닫힙니다. 코드 변경과 일감 기록이 서로 연결되는 것입니다.

## 1:1:1:1로 작게 유지하기

처음에는 다음 기준을 추천합니다.

- 이슈 하나
- 브랜치 하나
- 의도별 커밋 몇 개
- PR 하나

한 PR에 여러 이슈를 섞으면 리뷰가 어려워집니다. 좋은 커밋 단위와 마찬가지로 PR도 작을수록 좋습니다.

---

다음은 이 루프의 중심 문서인 PR 설명을 어떻게 쓰는지 봅니다.
