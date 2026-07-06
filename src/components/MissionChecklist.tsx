"use client";
import { appendEvent } from "@/lib/events";
import type { Activity, ActivityStatus } from "@/types";

interface MissionChecklistProps {
  mission: Extract<Activity, { type: "mission" }>;
  status: Extract<ActivityStatus, { type: "mission" }>;
}

export function MissionChecklist({ mission, status }: MissionChecklistProps) {
  return (
    <section className="rounded-xl border border-edge bg-surface p-5">
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="font-mono text-sm text-muted">
          미션 · {mission.title} {status.done && <span className="text-lane-main">✓</span>}
        </h3>
        {mission.link && (
          <a
            href={mission.link}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 text-xs text-muted underline hover:text-ink"
          >
            안내 보기
          </a>
        )}
      </div>
      <ul className="mt-3 space-y-2">
        {mission.steps.map((step) => {
          const done = !!status.steps[step.id];
          return (
            <li key={step.id}>
              <label className="flex cursor-pointer items-start gap-2 text-sm text-ink">
                <input
                  type="checkbox"
                  checked={done}
                  onChange={(e) =>
                    appendEvent({
                      kind: "mission-step",
                      missionId: mission.id,
                      stepId: step.id,
                      done: e.target.checked,
                      at: Date.now(),
                    })
                  }
                  className="mt-0.5 accent-orange-500"
                />
                <span className={done ? "text-muted line-through" : ""}>{step.label}</span>
              </label>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
