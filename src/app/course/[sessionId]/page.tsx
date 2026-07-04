import { notFound } from "next/navigation";
import { ActivityList } from "@/components/ActivityList";
import { ParticipantGate } from "@/components/ParticipantGate";
import { getCourse, getSession } from "@/lib/course";
import type { Period } from "@/types";

export function generateStaticParams() {
  return getCourse().sessions.map((session) => ({ sessionId: session.id }));
}

function PeriodTable({ periods }: { periods: Period[] }) {
  return (
    <section className="rounded-xl border border-edge bg-surface p-5">
      <h3 className="font-mono text-sm text-muted">시간표</h3>
      <ol className="mt-3 space-y-1.5">
        {periods.map((period) => (
          <li key={period.order} className="flex items-baseline gap-3 text-sm">
            <span className="shrink-0 font-mono text-xs text-lane-main">
              {period.order}교시 · {period.durationMin}분
            </span>
            <span className="text-ink">{period.title}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

export default async function SessionPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  const session = getSession(sessionId);
  if (!session) notFound();

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <header className="mb-8">
        <p className="font-mono text-sm text-lane-main">{session.order}회차</p>
        <h1 className="mt-1 text-2xl font-bold text-ink">{session.title}</h1>
        <p className="mt-2 text-sm text-muted">🎯 {session.goal}</p>
      </header>
      <div className="space-y-4">
        <PeriodTable periods={session.periods} />
        <ParticipantGate>
          <ActivityList session={session} />
        </ParticipantGate>
      </div>
    </main>
  );
}
