---
title: "권한과 fork"
slug: fork-permissions
order: 20
hasTerminal: false
steps: []
---

## fork는 권한 문제의 해결책

GitHub 저장소에는 권한이 있습니다. 내가 그 저장소에 직접 쓸 수 있느냐에 따라 협업 방식이 달라집니다.

| 상황 | 작업 방식 |
| --- | --- |
| write 권한이 있다 | 같은 저장소에 브랜치를 만들고 push |
| write 권한이 없다 | fork로 내 사본을 만들고 PR로 제안 |

어제 first-contributions에서 fork 버튼을 눌렀던 이유는 단순합니다. 원본 저장소에 직접 push할 권한이 없었기 때문입니다.

## 팀 저장소에서는 보통 fork가 필요 없다

회사나 팀 저장소에서 collaborator 권한을 받으면 보통 같은 저장소 안에 브랜치를 만듭니다.

```bash
git checkout -b feature/profile
git push origin feature/profile
```

이때 `origin`은 팀 저장소입니다.

## 오픈소스에서는 fork가 안전한 통로

남의 오픈소스 저장소에는 보통 write 권한이 없습니다. 그래서 내 계정 아래에 사본을 만들고, 그 사본에서 작업한 브랜치를 원본에 제안합니다.

이 흐름이 fork 기반 PR입니다.

```text
원본 저장소에 직접 push할 수 없다
→ 내 계정으로 fork한다
→ 내 fork에 push한다
→ 원본 저장소에 PR로 제안한다
```

## fork는 복사가 아니라 제안 통로다

fork는 "남의 프로젝트를 훔쳐오는 것"이 아닙니다. 권한이 없는 저장소에 안전하게 기여하기 위한 GitHub의 협업 구조입니다.

---

다음 레슨에서는 fork 흐름에서 가장 헷갈리는 `origin`과 `upstream`을 정리합니다.
