import { LeaderboardMatrix } from "@/components/LeaderboardMatrix";
import { ParticipantGate } from "@/components/ParticipantGate";
import { getCourse } from "@/lib/course";

export const metadata = { title: "리더보드 — git-github-101" };

export default function LeaderboardPage() {
  const course = getCourse();

  return (
    <main className="mx-auto max-w-screen-xl px-4 py-12">
      <header className="mb-8">
        <p className="font-mono text-sm text-lane-main">{course.cohort}</p>
        <h1 className="mt-1 text-2xl font-bold text-ink">리더보드</h1>
        <p className="mt-2 text-sm text-muted">지금은 내 진행만 보여요. 곧 같은 기수 전원이 여기에 나타납니다.</p>
      </header>
      <ParticipantGate>
        <LeaderboardMatrix />
      </ParticipantGate>
    </main>
  );
}
