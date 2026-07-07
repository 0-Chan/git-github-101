import { notFound } from "next/navigation";
import { ActivityList } from "@/components/ActivityList";
import { getCourse, getSession } from "@/lib/course";

export function generateStaticParams() {
  return getCourse().sessions.map((session) => ({ sessionId: session.id }));
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
      <ActivityList session={session} />
    </main>
  );
}
