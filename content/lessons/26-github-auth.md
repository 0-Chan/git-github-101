---
title: "Git과 GitHub 인증"
slug: github-auth
order: 26
hasTerminal: false
steps: []
---

## push에서 막히면 인증 문제일 가능성이 높다

GitHub는 계정 비밀번호로 Git push를 받지 않습니다. 실제로 원격 저장소에 push하려면 HTTPS 토큰이나 SSH key를 써야 합니다.

2회차에서는 두 방식의 차이만 정확히 잡습니다.

## HTTPS: 시작이 쉽다

HTTPS 주소는 이런 모양입니다.

```text
https://github.com/user/repo.git
```

처음 push할 때 GitHub 계정과 Personal Access Token(PAT)을 입력합니다. 한 번 입력한 인증 정보는 운영체제의 credential helper가 기억해줄 수 있습니다.

장점은 시작이 쉽다는 것입니다. 단점은 토큰 만료나 권한 범위 때문에 다시 설정해야 할 때가 있다는 점입니다.

## SSH: 한 번 설정하면 오래 편하다

SSH 주소는 이런 모양입니다.

```text
git@github.com:user/repo.git
```

내 컴퓨터에서 key를 만들고, 공개키를 GitHub에 등록합니다. 이후에는 비밀번호를 입력하지 않고 push할 수 있습니다.

장점은 오래 쓰기 편하다는 것입니다. 단점은 처음 key를 만들고 등록하는 과정이 HTTPS보다 낯설 수 있다는 점입니다.

## 오늘의 선택

처음에는 HTTPS와 credential helper로 시작해도 충분합니다. push할 때 401, 403, authentication failed가 나오면 저장소 문제가 아니라 인증 설정 문제일 수 있습니다.

SSH는 Git과 GitHub 흐름이 익숙해진 뒤 전환해도 늦지 않습니다.

---

이제 2회차의 마지막은 새 PR 생성이 아니라, 앞으로 무엇을 작게 만들지 정하는 미션입니다.
