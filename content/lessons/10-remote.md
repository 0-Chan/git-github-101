---
title: "원격 저장소 연결하기"
slug: remote
order: 10
hasTerminal: true
steps:
  - id: add-remote
    instruction: "GitHub 원격 저장소를 origin이라는 이름으로 추가하세요"
    hint: "git remote add origin https://github.com/user/repo.git"
    validation:
      type: remote-exists
      name: origin
---

## 원격 저장소 연결하기

로컬 저장소를 GitHub의 원격 저장소와 연결해보겠습니다.

## GitHub에서 저장소 만들기

먼저 GitHub에서 새 저장소를 만들어야 합니다:

1. [github.com](https://github.com)에 로그인합니다.
2. 오른쪽 상단의 `+` 버튼을 클릭하고 **New repository**를 선택합니다.
3. 저장소 이름을 입력하고 **Create repository**를 클릭합니다.

저장소가 만들어지면 다음과 같은 URL을 얻게 됩니다:
```
https://github.com/your-username/your-repo.git
```

## 원격 저장소 추가하기

로컬 저장소에 원격 저장소 주소를 등록합니다. `origin`은 원격 저장소의 별칭(alias)으로, 관습적으로 사용하는 이름입니다:

```bash
git remote add origin https://github.com/user/repo.git
```

잘 추가되었는지 확인하려면:

```bash
git remote -v
```

```
origin  https://github.com/user/repo.git (fetch)
origin  https://github.com/user/repo.git (push)
```

## 코드 업로드하기 (Push)

이제 로컬 저장소의 커밋을 원격 저장소에 업로드합니다:

```bash
git push origin main
```

- `origin`: 원격 저장소의 이름
- `main`: 업로드할 로컬 브랜치 이름

처음 푸시할 때는 GitHub 계정 정보를 입력해야 할 수 있습니다.

## 원격 저장소에서 코드 가져오기 (Pull)

다른 사람이 원격 저장소에 변경사항을 올렸다면, 다음 명령어로 내 로컬 저장소를 최신 상태로 업데이트할 수 있습니다:

```bash
git pull origin main
```

---

원격 저장소 연결 방법을 배웠습니다! 마지막 레슨에서는 협업의 핵심인 **Pull Request**에 대해 알아보겠습니다.
