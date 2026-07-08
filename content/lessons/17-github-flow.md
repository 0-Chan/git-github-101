---
title: "GitHub Flow"
slug: github-flow
order: 17
hasTerminal: false
steps: []
---

## 실무에서 많이 쓰는 가장 단순한 규칙

GitHub Flow는 여러 사람이 한 저장소에서 일하기 위한 작업 규칙입니다. 핵심은 복잡하지 않습니다.

1. `main`은 항상 배포 가능한 상태로 지킨다.
2. 모든 작업은 새 브랜치에서 한다.
3. 합류는 Pull Request(PR)로 한다.

## main은 본진이다

`main` 브랜치가 깨져 있으면 팀 전체가 흔들립니다. 그래서 기능 개발, 버그 수정, 문서 수정은 바로 `main`에 밀어 넣지 않고 작업 브랜치에서 진행합니다.

```bash
git checkout -b feature/search
```

작업이 끝나면 브랜치를 원격에 올리고 PR을 만듭니다. PR에서 변경 내용을 확인한 뒤 `main`에 합칩니다.

## Git Flow는 왜 짧게만 보나요?

예전에는 `develop`, `release`, `hotfix` 같은 브랜치를 나눠 쓰는 Git Flow가 많이 쓰였습니다. 지금도 릴리스 주기가 길고 절차가 무거운 팀에서는 유용합니다.

하지만 입문 단계와 작은 팀에서는 GitHub Flow가 더 적합합니다. 규칙이 적고, `main → branch → PR → main` 흐름만 지키면 바로 협업을 시작할 수 있기 때문입니다.

## 오늘 기억할 한 줄

브랜치는 작업 공간이고, PR은 합류 요청입니다. `main`을 깨끗하게 지키기 위해 브랜치와 PR을 씁니다.

---

이제 브랜치 위에 쌓이는 커밋 메시지도 팀의 공용어로 맞춰보겠습니다.
