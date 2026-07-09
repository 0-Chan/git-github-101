import type { Activity, Course, Session } from "@/types";
import courseData from "../../content/course.json";

// 정적 import라 서버·클라이언트·테스트 어디서든 동일하게 동작한다
// (reset.ts의 sections.json 패턴). 커리큘럼은 빌드 시점에 고정된다.
const course = courseData as Course;

export function getCourse(): Course {
  return course;
}

// 콘텐츠(덱·활동)가 준비된 회차만 nav에서 연다. 회차가 준비되면 여기에 추가.
export const READY_SESSIONS = new Set(["s1", "s2"]);

// 덱은 회차 페이지보다 먼저 열릴 수 있다 (슬라이드만 완성된 회차용 별도 게이트).
export const READY_DECKS = new Set(["s1", "s2", "s3"]);

export function getSession(id: string): Session | null {
  return course.sessions.find((s) => s.id === id) ?? null;
}

export function findLessonActivity(
  c: Course,
  slug: string,
): { sessionId: string; activity: Extract<Activity, { type: "lesson" }> } | null {
  for (const session of c.sessions) {
    for (const activity of session.activities) {
      if (activity.type === "lesson" && activity.slug === slug) {
        return { sessionId: session.id, activity };
      }
    }
  }
  return null;
}

export function findMissionActivity(
  c: Course,
  missionId: string,
): { sessionId: string; activity: Extract<Activity, { type: "mission" }> } | null {
  for (const session of c.sessions) {
    for (const activity of session.activities) {
      if (activity.type === "mission" && activity.id === missionId) {
        return { sessionId: session.id, activity };
      }
    }
  }
  return null;
}
