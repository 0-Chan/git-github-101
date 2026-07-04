"use client";
import { useMemo, useState } from "react";
import { useEvents } from "@/hooks/useEvents";
import { useParticipant } from "@/hooks/useParticipant";
import { getCourse } from "@/lib/course";
import { buildLeaderboard } from "@/lib/courseProgress";
import type { Activity, ActivityStatus, Participant, ProgressEvent } from "@/types";
import sectionsData from "../../content/sections.json";
import { Tooltip } from "./Tooltip";

const lessonOrder = new Map(sectionsData.sections.map((s) => [s.slug, s.order]));

function activityLabel(activity: Activity): string {
  switch (activity.type) {
    case "checkin":
      return "체크인";
    case "checkout":
      return "체크아웃";
    case "survey":
      return "진단";
    case "lecture":
      return "강의";
    case "lesson":
      return `L${lessonOrder.get(activity.slug) ?? "?"}`;
    case "mission":
      return "미션";
  }
}

function timeAgo(at: number | null): string {
  if (at === null) return "–";
  const min = Math.floor((Date.now() - at) / 60_000);
  if (min < 1) return "방금";
  if (min < 60) return `${min}분 전`;
  const hours = Math.floor(min / 60);
  if (hours < 24) return `${hours}시간 전`;
  return `${Math.floor(hours / 24)}일 전`;
}

function Cell({ activity, status }: { activity: Activity; status: ActivityStatus | undefined }) {
  if (!status) return <span className="text-muted">–</span>;
  switch (status.type) {
    case "checkin":
    case "checkout":
      if (!status.done) return <span className="text-muted">–</span>;
      return (
        <Tooltip content={status.reason?.trim() ? status.reason : "이유 없음"}>
          <button type="button" className="font-mono font-medium text-lane-main underline decoration-dotted">
            {status.score}
          </button>
        </Tooltip>
      );
    case "survey": {
      if (!status.done) return <span className="text-muted">–</span>;
      const yes = Object.values(status.answers ?? {}).filter(Boolean).length;
      const total = activity.type === "survey" ? activity.items.length : 0;
      return (
        <span className="font-mono text-ink">
          {yes}/{total}
        </span>
      );
    }
    case "lecture":
      return status.done ? <span className="text-lane-main">✓</span> : <span className="text-muted">–</span>;
    case "lesson":
      if (status.done) return <span className="text-lane-main">✓</span>;
      return status.stepsDone.length > 0 ? (
        <span className="font-mono text-xs text-ink">{status.stepsDone.length}</span>
      ) : (
        <span className="text-muted">–</span>
      );
    case "mission": {
      if (status.done) return <span className="text-lane-main">✓</span>;
      const checked = Object.values(status.steps).filter(Boolean).length;
      const total = activity.type === "mission" ? activity.steps.length : 0;
      return checked > 0 ? (
        <span className="font-mono text-xs text-ink">
          {checked}/{total}
        </span>
      ) : (
        <span className="text-muted">–</span>
      );
    }
  }
}

export function LeaderboardMatrix() {
  const course = getCourse();
  const me = useParticipant();
  const events = useEvents();
  // Phase 2 결합점: SyncAdapter.subscribe가 이 배열을 채우면 전원이 표시된다.
  const [peers] = useState<{ participant: Participant; events: ProgressEvent[] }[]>([]);

  const rows = useMemo(
    () => buildLeaderboard(course, [...(me ? [{ participant: me, events }] : []), ...peers]),
    [course, me, events, peers],
  );

  return (
    <div className="overflow-x-auto rounded-xl border border-edge">
      <table className="w-full min-w-max border-collapse text-sm">
        <thead>
          <tr className="border-b border-edge bg-surface">
            <th className="sticky left-0 z-10 bg-surface px-4 py-2 text-left font-mono text-xs text-muted">참가자</th>
            {course.sessions.map((session) => (
              <th
                key={session.id}
                colSpan={session.activities.length}
                className="border-l border-edge px-2 py-2 text-center font-mono text-xs text-muted"
              >
                {session.order}회차
              </th>
            ))}
            <th className="border-l border-edge px-3 py-2 font-mono text-xs text-muted">마지막 활동</th>
          </tr>
          <tr className="border-b border-edge bg-surface">
            <th className="sticky left-0 z-10 bg-surface" aria-hidden />
            {course.sessions.flatMap((session) =>
              session.activities.map((activity, i) => (
                <th
                  key={activity.id}
                  className={`px-2 py-1.5 text-center font-mono text-[10px] font-normal text-muted ${i === 0 ? "border-l border-edge" : ""}`}
                >
                  {activityLabel(activity)}
                </th>
              )),
            )}
            <th className="border-l border-edge" aria-hidden />
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={99} className="px-4 py-8 text-center text-muted">
                아직 참가자가 없어요.
              </td>
            </tr>
          )}
          {rows.map((row) => (
            <tr key={row.participant.id} className="border-b border-edge last:border-b-0">
              <td className="sticky left-0 z-10 bg-ground px-4 py-2.5 font-medium text-ink">{row.participant.name}</td>
              {course.sessions.flatMap((session) =>
                session.activities.map((activity, i) => (
                  <td key={activity.id} className={`px-2 py-2.5 text-center ${i === 0 ? "border-l border-edge" : ""}`}>
                    <Cell activity={activity} status={row.statuses[activity.id]} />
                  </td>
                )),
              )}
              <td className="border-l border-edge px-3 py-2.5 text-center font-mono text-xs text-muted">
                {timeAgo(row.lastActivityAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
