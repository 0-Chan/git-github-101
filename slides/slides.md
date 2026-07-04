---
theme: default
title: Git & GitHub 101
info: 브라우저에서 배우는 Git & GitHub 입문 — 강의 슬라이드
routerMode: hash
fonts:
  sans: IBM Plex Sans KR
  mono: IBM Plex Mono
highlighter: shiki
drawings:
  persist: false
transition: slide-left
---

<style>
:root {
  --lane-main: #d97706;
  --lane-feature: #7c3aed;
}
.slidev-layout h1 { color: var(--lane-main); }
.slidev-layout code { color: var(--lane-main); }
</style>

# ▸ git-github-101

브라우저에서 배우는 Git & GitHub 입문

<div class="pt-8 font-mono text-sm opacity-70">
$ git init
</div>

---

# 커리큘럼

<div class="grid grid-cols-2 gap-8 pt-4">
<div>

**기초** <span class="font-mono text-sm opacity-60">— main</span>

1. Git이란?
2. 첫 번째 저장소
3. 첫 번째 커밋
4. 커밋 히스토리
5. 수정과 비교

</div>
<div>

**브랜치** <span class="font-mono text-sm" style="color: var(--lane-feature)">— feature</span>

6. 브랜치
7. 머지
8. 충돌 해결

**원격** <span class="font-mono text-sm opacity-60">— main</span>

9. GitHub란?
10. 원격 저장소
11. Pull Request

</div>
</div>

---

# 커밋은 세이브 포인트

파일의 변경사항을 저장소에 기록하는 행위

```bash
touch hello.txt        # 파일 만들기
git add hello.txt      # 스테이징
git commit -m "첫 커밋" # 기록
```

<div class="pt-4 opacity-70">
게임의 세이브 포인트처럼, 그 시점으로 언제든 돌아올 수 있습니다.
</div>

---
layout: center
---

# 직접 해보세요

튜토리얼과 함께 브라우저 터미널에서 바로 실습할 수 있습니다

<div class="font-mono pt-4">git-github-101 · /lessons/what-is-git</div>
