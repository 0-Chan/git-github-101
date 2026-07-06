"use client";
import Link from "next/link";
import { useMemo } from "react";
import { useEvents } from "@/hooks/useEvents";
import { getCourse } from "@/lib/course";
import { reduceEvents } from "@/lib/courseProgress";
import { appendEvent } from "@/lib/events";
import type { Activity, ActivityStatusMap, Session } from "@/types";
import sectionsData from "../../content/sections.json";
import { DeckLink } from "./DeckLink";
import { MissionChecklist } from "./MissionChecklist";

const lessonMeta = new Map(sectionsData.sections.map((s) => [s.slug, s]));

// 연속된 lesson 활동은 카드 하나로 묶는다 — 11개가 각각 카드가 되면 난잡하다
type ActivityGroup =
  | { type: "lessons"; items: Extract<Activity, { type: "lesson" }>[] }
  | { type: "single"; activity: Activity };

function groupActivities(activities: Activity[]): ActivityGroup[] {
  const groups: ActivityGroup[] = [];
  for (const activity of activities) {
    const last = groups[groups.length - 1];
    if (activity.type === "lesson") {
      if (last?.type === "lessons") last.items.push(activity);
      else groups.push({ type: "lessons", items: [activity] });
    } else {
      groups.push({ type: "single", activity });
    }
  }
  return groups;
}

function LessonRows({
  items,
  statuses,
}: {
  items: Extract<Activity, { type: "lesson" }>[];
  statuses: ActivityStatusMap;
}) {
  return (
    <section className="rounded-xl border border-edge bg-surface p-5">
      <h3 className="font-mono text-sm text-muted">레슨</h3>
      <ul className="mt-3 divide-y divide-edge">
        {items.map((activity) => {
          const meta = lessonMeta.get(activity.slug);
          const status = statuses[activity.id];
          const done = status?.done ?? false;
          const stepsDone = status?.type === "lesson" ? status.stepsDone.length : 0;
          const totalHint = meta?.hasTerminal ? "터미널 실습" : "읽기";
          return (
            <li key={activity.id}>
              <Link href={`/lessons/${activity.slug}`} className="flex items-center gap-3 py-2.5 group">
                <span className={`shrink-0 font-mono text-sm ${done ? "text-lane-main" : "text-muted"}`} aria-hidden>
                  {done ? "✓" : "○"}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm text-ink group-hover:underline">
                  {meta?.title ?? activity.slug}
                </span>
                <span className="shrink-0 font-mono text-xs text-muted">
                  {!done && stepsDone > 0 ? `${stepsDone} steps` : totalHint}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function LectureCard({ activity, done }: { activity: Extract<Activity, { type: "lecture" }>; done: boolean }) {
  return (
    <section className="rounded-xl border border-edge bg-surface p-5">
      <h3 className="font-mono text-sm text-muted">강의 {done && <span className="text-lane-main">✓</span>}</h3>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink">{activity.title}</p>
        <div className="flex items-center gap-2">
          <DeckLink
            source="lecture-card"
            href={activity.deck ?? "/slides"}
            className="rounded-lg border border-edge px-3 py-1.5 text-xs text-ink transition-colors hover:bg-ground"
          >
            덱 열기 ↗
          </DeckLink>
          {!done && (
            <button
              type="button"
              onClick={() => appendEvent({ kind: "lecture-done", activityId: activity.id, at: Date.now() })}
              className="rounded-lg bg-orange-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-orange-600"
            >
              확인했어요
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

interface ActivityListProps {
  session: Session;
}

export function ActivityList({ session }: ActivityListProps) {
  const events = useEvents();
  const statuses = useMemo(() => reduceEvents(getCourse(), events), [events]);
  const groups = useMemo(() => groupActivities(session.activities), [session.activities]);

  return (
    <div className="space-y-4">
      {groups.map((group) => {
        if (group.type === "lessons") {
          return <LessonRows key={group.items[0].id} items={group.items} statuses={statuses} />;
        }
        const { activity } = group;
        const status = statuses[activity.id];
        switch (activity.type) {
          case "lecture":
            return <LectureCard key={activity.id} activity={activity} done={status?.done ?? false} />;
          case "mission":
            return (
              <MissionChecklist
                key={activity.id}
                mission={activity}
                status={status?.type === "mission" ? status : { type: "mission", done: false, steps: {} }}
              />
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
