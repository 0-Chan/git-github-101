import type {
  Activity,
  ActivityStatus,
  ActivityStatusMap,
  Course,
  LeaderboardRow,
  Participant,
  ProgressEvent,
} from "@/types";
import { findLessonActivity, findMissionActivity } from "./course";

function initialStatus(activity: Activity): ActivityStatus {
  switch (activity.type) {
    case "checkin":
    case "checkout":
      return { type: activity.type, done: false };
    case "survey":
      return { type: "survey", done: false };
    case "lecture":
      return { type: "lecture", done: false };
    case "lesson":
      return { type: "lesson", done: false, stepsDone: [] };
    case "mission":
      return { type: "mission", done: false, steps: {} };
  }
}

function findSessionActivity(
  course: Course,
  sessionId: string,
  type: "checkin" | "checkout" | "survey",
): Activity | null {
  const session = course.sessions.find((s) => s.id === sessionId);
  return session?.activities.find((a) => a.type === type) ?? null;
}

/**
 * 이벤트 로그 → activity별 상태. 리더보드와 세션 페이지가 공유하는 유일한
 * 파생 뷰로, 별도 저장이 없다. 어떤 커리큘럼에도 매핑되지 않는 이벤트는
 * 조용히 무시한다 — course.json이 바뀌어도 과거 로그가 앱을 깨지 않는다.
 */
export function reduceEvents(course: Course, events: ProgressEvent[]): ActivityStatusMap {
  const map: ActivityStatusMap = {};
  for (const session of course.sessions) {
    for (const activity of session.activities) {
      map[activity.id] = initialStatus(activity);
    }
  }

  for (const e of events) {
    switch (e.kind) {
      case "checkin":
      case "checkout": {
        const activity = findSessionActivity(course, e.sessionId, e.kind);
        if (!activity) break;
        const status = map[activity.id];
        if (status.type !== e.kind || status.done) break; // 회차당 1회 — 첫 이벤트 승리
        map[activity.id] = { type: e.kind, done: true, score: e.score, reason: e.reason, at: e.at };
        break;
      }
      case "survey": {
        const activity = findSessionActivity(course, e.sessionId, "survey");
        if (!activity) break;
        const status = map[activity.id];
        if (status.type !== "survey" || status.done) break; // 1회 제출
        map[activity.id] = { type: "survey", done: true, answers: e.answers, at: e.at };
        break;
      }
      case "lecture-done": {
        const status = map[e.activityId];
        if (!status || status.type !== "lecture" || status.done) break;
        map[e.activityId] = { type: "lecture", done: true, at: e.at };
        break;
      }
      case "lesson-step": {
        const found = findLessonActivity(course, e.slug);
        if (!found) break;
        const status = map[found.activity.id];
        if (status.type !== "lesson" || status.stepsDone.includes(e.stepId)) break;
        map[found.activity.id] = { ...status, stepsDone: [...status.stepsDone, e.stepId], at: e.at };
        break;
      }
      case "lesson-done": {
        const found = findLessonActivity(course, e.slug);
        if (!found) break;
        const status = map[found.activity.id];
        if (status.type !== "lesson") break;
        map[found.activity.id] = { ...status, done: true, at: e.at };
        break;
      }
      case "mission-step": {
        const found = findMissionActivity(course, e.missionId);
        if (!found) break;
        const status = map[found.activity.id];
        if (status.type !== "mission") break;
        const steps = { ...status.steps, [e.stepId]: e.done }; // 토글 — 마지막 이벤트 승리
        const done = found.activity.steps.every((s) => steps[s.id]);
        map[found.activity.id] = { type: "mission", done, steps, at: e.at };
        break;
      }
    }
  }
  return map;
}

/**
 * 리더보드 = 참가자별 reduce. Phase 1은 peers=[나] 한 명,
 * Phase 2는 SyncAdapter.subscribe가 남의 이벤트를 공급 — UI 무변경.
 */
export function buildLeaderboard(
  course: Course,
  peers: { participant: Participant; events: ProgressEvent[] }[],
): LeaderboardRow[] {
  return peers.map(({ participant, events }) => ({
    participant,
    statuses: reduceEvents(course, events),
    lastActivityAt: events.length > 0 ? Math.max(...events.map((e) => e.at)) : null,
  }));
}
