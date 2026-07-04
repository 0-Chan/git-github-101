import type { Activity, Course, Session } from "@/types";
import courseData from "../../content/course.json";

// 정적 import라 서버·클라이언트·테스트 어디서든 동일하게 동작한다
// (reset.ts의 sections.json 패턴). 커리큘럼은 빌드 시점에 고정된다.
const course = courseData as Course;

export function getCourse(): Course {
  return course;
}

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
