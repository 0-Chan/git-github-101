"use client";
import { useState } from "react";
import { appendEvent } from "@/lib/events";
import type { ActivityStatus } from "@/types";

const SCORES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

interface CheckinFormProps {
  sessionId: string;
  kind: "checkin" | "checkout";
  status: Extract<ActivityStatus, { type: "checkin" | "checkout" }>;
}

export function CheckinForm({ sessionId, kind, status }: CheckinFormProps) {
  const [score, setScore] = useState<number | null>(null);
  const [reason, setReason] = useState("");
  const label = kind === "checkin" ? "체크인" : "체크아웃";
  const question =
    kind === "checkin" ? "오늘 세션에 대한 기대와 컨디션은 몇 점인가요?" : "오늘 세션에서 얼마나 얻어가나요?";

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
      </section>
    );
  }

  return (
    <form
      className="rounded-xl border border-edge bg-surface p-5 space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (score === null) return;
        appendEvent({ kind, sessionId, score, reason: reason.trim(), at: Date.now() });
      }}
    >
      <div>
        <h3 className="font-mono text-sm text-muted">{label}</h3>
        <p className="mt-1 text-sm text-ink">{question}</p>
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
      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="이유를 한 줄로 적어주세요"
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
