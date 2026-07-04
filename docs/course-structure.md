# 강의 구조 기획 — 교시 운영 + 리더보드

> 상태: 기획 초안 (2026-07-04). TDD·클린코드 과정의 체크인 스프레드시트 운영 방식을
> git-github-101 웹앱에 내장하는 설계.

## 배경과 목표

참고한 운영 모델(TDD 과정 체크인 시트)의 핵심 장치:

- 회차를 **교시 단위**로 구성, 교시마다 결론형 학습 목표 한 줄
- **체크인/체크아웃**(1~10점 + 이유)으로 수업 앞뒤 정서 측정 → 난이도 조절 근거
- **사전 자가진단**을 "부족함"이 아니라 "성장으로 채울 목록"으로 프레이밍
- 실습을 **단계별 체크박스**로 쪼개 전원 진행 상황을 실시간 파악
- 시트 특성상 모두가 서로의 상태를 봄 → 상호 격려·자연스러운 도움

이 장치들을 스프레드시트 대신 **튜토리얼 웹앱 안에서** 구현한다. 진행 현황·체크인·자가진단은
**리더보드 형태로 수강생 전원이 함께 본다** (강사 전용 아님 — 시트 문화의 계승).

## 운영 구조 (확정)

| 항목 | 결정 |
|------|------|
| 규모 | **4회차 × 6시간** (총 24시간) |
| 교시 | 회차당 **45분 × 6교시** — 교시는 시간 구획일 뿐, 실습을 교시 단위로 끊지 않음 |
| 체크인/체크아웃 | **회차당 1회** (점수 1~10 + 이유) |
| 자가진단 | OT 때 1회, **덱의 체크리스트 4항목 그대로** |
| 회차 탐색 | **상단 nav에서 회차 선택** — 수강생이 현재 회차를 스스로 선택 |
| 미션 체크 | 우선 **수동 체크**(시트 방식)로 시작, 검증(PR URL 등)은 추후 개선 |

### 회차별 콘텐츠 배분 (초안)

| 회차 | 주제 | 내용 |
|------|------|------|
| 1 | Git 기초 | OT(체크인+자가진단+오프닝 덱) + 튜토리얼 레슨 01~ (브라우저 터미널) |
| 1.5~2 | 잔여 레슨 + 실전 시작 | 튜토리얼 잔여 레슨 마무리, **실질 GitHub 실습 시작** (fork→clone→commit→push→PR 미션) |
| 3 | 심화 | GitHub Actions 등 **CI/CD** 후보, 심화 내용 |
| 4 | 미정 | 고민 중 (후보: 되돌리기 reset/revert/restore, stash, rebase, 협업 시나리오 미션) |

⚠️ 현재 튜토리얼 11개 레슨은 1~1.5회차 분량. 2회차 이후는 덱 강의 + 실전 미션 콘텐츠를
새로 설계해야 한다.

## 설계 원칙

1. **교시(Period)는 시간표일 뿐, 추적 단위가 아니다.** 진행 추적은 활동(Activity) 단위,
   활동은 회차(Session)에 소속. 교시는 표시 전용.
2. **레슨은 자동, 미션은 수동.** 튜토리얼 레슨은 기존 검증 시스템(`docs/validation-criteria.md`)이
   자동 체크. GitHub 실전 미션은 수강생이 직접 체크하는 수동 스텝(시트의 "자동차 경주 5단계" 방식).
3. **이벤트 소싱, 로컬-퍼스트.** 상태 덮어쓰기 대신 append-only 이벤트 로그. 지금은
   localStorage, 추후 동기화 어댑터가 이벤트를 그대로 밀어올려 리더보드를 전원으로 확장.
   - 백엔드는 **보류** 상태. Phase 2에서 결정 (Supabase 실시간 구독 vs Next API+DB 폴링).

## 데이터 모델 (러프)

### 정적 커리큘럼 — `content/course.json` (sections.json의 형제)

```ts
interface Course {
  cohort: string;               // "1기"
  sessions: Session[];          // 4개
}

interface Session {             // 회차 (6시간)
  id: string;                   // "s1"
  order: number;                // 1~4
  title: string;                // "Git 기초 — 커밋이라는 세이브 포인트"
  goal: string;                 // 결론형 학습 목표 한 줄
  periods: Period[];            // 시간표 6칸 — 표시 전용
  activities: Activity[];       // 진행 추적 단위 — 교시에 묶이지 않음
}

interface Period {              // 교시 = 시간 구획 (추적 없음)
  order: number;                // 1~6
  title: string;                // "OT", "커밋 실습" …
  durationMin: number;          // 45
}

type Activity =
  | { type: "checkin";  id: string }                            // 회차당 1회
  | { type: "checkout"; id: string }                            // 회차당 1회
  | { type: "survey";   id: string; items: { id: string; label: string }[] }
  | { type: "lecture";  id: string; title: string; deck?: string }
  | { type: "lesson";   id: string; slug: string }              // 튜토리얼 레슨 → 자동 추적
  | { type: "mission";  id: string; title: string; link?: string;
      steps: { id: string; label: string }[] };                 // GitHub 실전 → 수동 체크
```

자가진단(survey) 항목은 덱과 동일한 4개:

1. `git init` `add` `commit` `status`로 단순한 버전 관리가 가능하다
2. working directory, staging area, repository 개념을 알고 있다
3. branch, merge, push, pull을 능숙하게 사용할 수 있다
4. conflict 해결, rebase, pull request 협업 흐름을 이해하고 쓴다

### 런타임 상태 — 참가자 로컬 (→ 추후 동기화)

```ts
interface Participant {         // localStorage "git101-participant"
  id: string;                   // uuid — 익명 식별자
  name: string;                 // 리더보드 표시명 (첫 진입 때 입력)
}

type ProgressEvent =            // localStorage "git101-events" (append-only)
  | { kind: "checkin";      sessionId: string; score: number; reason: string; at: number }
  | { kind: "checkout";     sessionId: string; score: number; reason: string; at: number }
  | { kind: "survey";       sessionId: string; answers: Record<string, boolean>; at: number }
  | { kind: "lecture-done"; activityId: string; at: number }
  | { kind: "mission-step"; missionId: string; stepId: string; done: boolean; at: number }
  | { kind: "lesson-step";  slug: string; stepId: string; at: number }   // 기존 자동 검증이 발행
  | { kind: "lesson-done";  slug: string; at: number };                  // 기존 markComplete가 발행
```

기존 코드 접점 (최소 침습): `TerminalPanel`의 검증 통과 지점과 `useProgress.markComplete`에
이벤트 발행 한 줄씩 추가. `sections.json`·검증 시스템은 무변경.

### 리더보드와 동기화 결합점

```ts
// 리더보드 = 이벤트 로그의 reduce (파생 뷰, 별도 저장 없음)
// Phase 1: 내 이벤트만 → 리더보드에 나 1명
// Phase 2: 어댑터가 남의 이벤트를 공급 → 전원 표시. UI 무변경.
interface SyncAdapter {
  publish(e: ProgressEvent, who: Participant): Promise<void>;
  subscribe(onPeer: (peer: { participant: Participant; events: ProgressEvent[] }) => void): () => void;
}
```

이벤트 소싱을 고른 이유: ① 추후 동기화가 "이벤트 전송"이라는 단순 문제로 환원(상태 병합 충돌
없음) ② 타임스탬프로 "마지막 활동 이후 경과"를 계산 → 누가 어디서 막혔는지 자동 파악.

## UI 골격 (초안)

- **상단 nav**: 회차 선택 (1~4회차). 회차 페이지 = 학습 목표 + 교시 시간표 + 활동 목록
  (체크인 → 자가진단/강의/레슨 링크/미션 체크박스 → 체크아웃 순).
- **리더보드 페이지**: 참가자 × 활동 매트릭스(시트의 가로×세로 그대로), 체크인/체크아웃
  점수·이유, 자가진단 응답. Phase 1에서는 본인 1명만 표시.
- 기존 튜토리얼(`/lessons/*`)은 그대로 — 회차 페이지가 레슨으로 링크하고, 완료가 이벤트로 흘러들어옴.

## 단계별 로드맵

| Phase | 내용 | 비고 |
|-------|------|------|
| 1 | course.json + 회차 nav/페이지 + 체크인·자가진단·미션 UI + 리더보드(로컬 1인) + 이벤트 발행 배선 | 백엔드 없음 |
| 2 | SyncAdapter 구현(Supabase 실시간 vs API 폴링 — 그때 결정) → 리더보드 전원 확장 | 백엔드 결정 시점 |
| 3+ | 미션 자동 검증(PR URL 등), 강사용 집계 뷰, 기수 데이터 보관 | 추후 개선 |

## 미해결 사항

- [ ] 4회차 콘텐츠 (고민 중)
- [ ] 2~3회차 미션·덱 콘텐츠 설계 (자동차 경주에 해당하는 Git 미션)
- [ ] 읽기 레슨(01·09·11) 완료 처리 — 리더보드에 "영원히 미완료"로 보이는 문제, 완료 장치 필요
- [ ] 리더보드 공개 범위 세부 (이유 텍스트까지 전부 공개인지)
- [ ] 체크인 시 회차 판별 UX 세부 (상단 nav 선택으로 확정, 잘못 선택 방지 장치는 추후)
- [ ] Phase 2 백엔드 선택 (Supabase vs Next API+DB)
