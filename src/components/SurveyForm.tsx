"use client";
import { useState } from "react";
import { appendEvent } from "@/lib/events";
import type { Activity, ActivityStatus } from "@/types";

interface SurveyFormProps {
  sessionId: string;
  activity: Extract<Activity, { type: "survey" }>;
  status: Extract<ActivityStatus, { type: "survey" }>;
}

export function SurveyForm({ sessionId, activity, status }: SurveyFormProps) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  if (status.done) {
    return (
      <section className="rounded-xl border border-edge bg-surface p-5">
        <h3 className="font-mono text-sm text-muted">
          자가진단 <span className="text-lane-main">✓</span>
        </h3>
        <ul className="mt-3 space-y-2">
          {activity.items.map((item) => (
            <li key={item.id} className="flex items-start gap-2 text-sm text-ink">
              <span className={status.answers?.[item.id] ? "text-lane-main" : "text-muted"}>
                {status.answers?.[item.id] ? "✓" : "–"}
              </span>
              <span className={status.answers?.[item.id] ? "" : "text-muted"}>{item.label}</span>
            </li>
          ))}
        </ul>
      </section>
    );
  }

  return (
    <form
      className="rounded-xl border border-edge bg-surface p-5 space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        const answers = Object.fromEntries(activity.items.map((item) => [item.id, !!checked[item.id]]));
        appendEvent({ kind: "survey", sessionId, answers, at: Date.now() });
      }}
    >
      <div>
        <h3 className="font-mono text-sm text-muted">자가진단</h3>
        <p className="mt-1 text-sm text-ink">지금 할 수 있는 것에 체크해 주세요. 못 해도 전혀 괜찮아요.</p>
      </div>
      <ul className="space-y-2">
        {activity.items.map((item) => (
          <li key={item.id}>
            <label className="flex cursor-pointer items-start gap-2 text-sm text-ink">
              <input
                type="checkbox"
                checked={!!checked[item.id]}
                onChange={(e) => setChecked((prev) => ({ ...prev, [item.id]: e.target.checked }))}
                className="mt-0.5 accent-orange-500"
              />
              <span>{item.label}</span>
            </label>
          </li>
        ))}
      </ul>
      <button
        type="submit"
        className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600"
      >
        제출
      </button>
    </form>
  );
}
