---
title: "고정된 이름표: tag"
slug: tag
order: 13
hasTerminal: true
steps:
  - id: create-tag
    instruction: "현재 커밋에 v1.0.0 태그를 붙이세요"
    hint: "git tag v1.0.0"
    validation:
      type: tag-exists
      name: v1.0.0
  - id: list-tags
    instruction: "태그 목록을 확인하세요"
    hint: "git tag"
    validation:
      type: command-run
      matches: "^git tag$"
---

## 브랜치와 태그

브랜치는 새 커밋을 쌓으면 따라 움직이는 이름표였습니다. **태그는 특정 커밋에 고정되는 이름표**입니다. 한번 붙이면 그 자리에 그대로 남습니다.

주 용도는 **릴리스 지점 표시**입니다. `v1.0.0`, `v1.1.0`처럼 배포한 버전에 이름을 붙여두면, 나중에 "그때 그 버전"을 정확히 찾아갈 수 있습니다.

## 태그 붙이기

현재 커밋(HEAD)에 태그를 붙입니다:

```bash
git tag v1.0.0
```

성공하면 실제 git처럼 아무 메시지도 나오지 않습니다. 태그가 조용히 만들어진 것입니다.

## 태그 목록 보기

붙인 태그는 이렇게 확인합니다:

```bash
git tag
```

방금 만든 `v1.0.0`이 보입니다.

## 원격에 올리면 Release가 된다

태그는 자동으로 원격에 올라가지 않습니다. 따로 밀어줘야 합니다:

```bash
git push origin v1.0.0
```

GitHub에서 태그는 곧 **Release**입니다. 올라간 태그가 릴리스 페이지의 버전이 되고, 3일차에는 이 태그를 기준으로 자동 릴리스(CI)를 만들어봅니다.

---

움직이는 이름표인 브랜치와 고정된 이름표인 태그를 구분할 수 있게 됐습니다. 다음은 `HEAD`가 지금 어디를 가리키는지 살펴봅니다.
