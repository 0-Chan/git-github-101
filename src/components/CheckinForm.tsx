"use client";
import { useState } from "react";
import { appendEvent } from "@/lib/events";
import type { Activity, ActivityStatus } from "@/types";

const SCORES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

interface CheckinFormProps {
  sessionId: string;
  kind: "checkin" | "checkout";
  status: Extract<ActivityStatus, { type: "checkin" | "checkout" }>;
  /** 있으면 자가진단 체크박스를 이 질문지에 병합해 함께 제출한다 */
  survey?: Extract<Activity, { type: "survey" }>;
  surveyStatus?: Extract<ActivityStatus, { type: "survey" }>;
}

export function CheckinForm({ sessionId, kind, status, survey, surveyStatus }: CheckinFormProps) {
  const [score, setScore] = useState<number | null>(null);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [expectation, setExpectation] = useState("");
  const label = kind === "checkin" ? "체크인" : "체크아웃";

  if (status.done) {
    return (
      <section className="rounded-xl border border-edge bg-surface p-5">
        <h3 className="font-mono text-sm text-muted">
          {label} <span className="text-lane-main">✓</span>
        </h3>
        <p className="mt-2 text-2xl font-bold text-ink">
          {status.score}
          <span className="text-sm font-normal text-muted"> / 10</span>
        </p>
        {status.reason && <p className="mt-1 text-sm text-muted">{status.reason}</p>}
        {survey && surveyStatus?.done && (
          <ul className="mt-3 space-y-1 border-t border-edge pt-3">
            {survey.items.map((item) => (
              <li key={item.id} className="flex items-start gap-2 text-sm">
                <span className={surveyStatus.answers?.[item.id] ? "text-lane-main" : "text-muted"}>
                  {surveyStatus.answers?.[item.id] ? "✓" : "–"}
                </span>
                <span className={surveyStatus.answers?.[item.id] ? "text-ink" : "text-muted"}>{item.label}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    );
  }

  return (
    <form
      className="rounded-xl border border-edge bg-surface p-5 space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (score === null) return;
        appendEvent({ kind, sessionId, score, reason: expectation.trim(), at: Date.now() });
        if (survey && !surveyStatus?.done) {
          const answers = Object.fromEntries(survey.items.map((item) => [item.id, !!checked[item.id]]));
          appendEvent({ kind: "survey", sessionId, answers, at: Date.now() });
        }
      }}
    >
      <div>
        <h3 className="font-mono text-sm text-muted">{label}</h3>
        <p className="mt-1 text-sm text-ink">지금 기분은 몇 점인가요?</p>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {SCORES.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setScore(n)}
            aria-pressed={score === n}
            className={`h-9 w-9 rounded-lg border text-sm font-medium transition-colors ${
              score === n ? "border-orange-500 bg-orange-500 text-white" : "border-edge text-ink hover:bg-ground"
            }`}
          >
            {n}
          </button>
        ))}
      </div>
      {survey && !surveyStatus?.done && (
        <div>
          <p className="text-sm text-ink">이미 알고 있는 것이 있다면 체크해 주세요.</p>
          <ul className="mt-2 space-y-2">
            {survey.items.map((item) => (
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
        </div>
      )}
      <textarea
        value={expectation}
        onChange={(e) => setExpectation(e.target.value)}
        placeholder="이번 강의에서 기대하는 바를 짧게 적어주세요"
        rows={2}
        className="w-full rounded-lg border border-edge bg-ground px-3 py-2 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-orange-500"
      />
      <button
        type="submit"
        disabled={score === null}
        className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600 disabled:opacity-40"
      >
        {label} 제출
      </button>
    </form>
  );
}
