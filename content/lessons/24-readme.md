---
title: "README.md"
slug: readme
order: 24
hasTerminal: true
steps:
  - id: write-summary
    instruction: "README.md 첫 문단에 프로젝트 설명을 적으세요"
    hint: "edit README.md"
    validation:
      type: file-content
      path: /README.md
      contains: "작은 Git 연습 도구"
  - id: add-install-section
    instruction: "설치 섹션을 추가하세요"
    hint: "README.md에 ## 설치 추가"
    validation:
      type: file-content
      path: /README.md
      contains: "## 설치"
  - id: add-usage-section
    instruction: "사용법 섹션을 추가하세요"
    hint: "README.md에 ## 사용법 추가"
    validation:
      type: file-content
      path: /README.md
      contains: "## 사용법"
---

## README는 프로젝트의 얼굴

GitHub 저장소를 열면 README가 가장 먼저 보입니다. 처음 온 사람이 이 프로젝트가 무엇인지, 왜 만들었는지, 어떻게 실행하는지 알 수 있어야 합니다.

2회차에서는 꾸미기보다 기본 구조만 잡습니다.

## 꼭 들어가야 하는 네 가지

- **무엇을** 하는 프로젝트인가
- **왜** 만들었나
- **설치**: 따라 치면 되는 명령
- **사용법**: 가장 흔한 사용 예 하나

기준은 "처음 온 사람이 5분 안에 실행할 수 있는가"입니다.

## README 고쳐보기

`README.md`를 열어 아래 형태로 정리하세요.

```bash
edit README.md
```

예시는 다음과 같습니다.

```md
# Mini Git Tool

작은 Git 연습 도구입니다.

## 설치

pnpm install

## 사용법

pnpm dev
```

문장을 그대로 써도 됩니다. 중요한 것은 비어 있는 README가 아니라, 처음 온 사람이 읽을 수 있는 안내문으로 바꾸는 것입니다.

## 4회차에서 더 키웁니다

스크린샷, 배지, 배포 링크, 포트폴리오용 설명은 4회차에서 다듬습니다. 오늘은 저장소의 기본 얼굴을 만드는 데 집중합니다.

---

다음은 커밋, PR, README가 왜 나의 공개 기록이 되는지 살펴봅니다.
