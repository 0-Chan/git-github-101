import Link from "next/link";
import { getCourse } from "@/lib/course";

export const metadata = { title: "강의 — git-github-101" };

export default function CoursePage() {
  const course = getCourse();

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <header className="mb-8">
        <p className="font-mono text-sm text-lane-main">{course.cohort}</p>
        <h1 className="mt-1 text-2xl font-bold text-ink">Git & GitHub 101</h1>
        <p className="mt-2 text-sm text-muted">6시간 × 4회차. 회차를 골라 오늘의 활동을 시작하세요.</p>
      </header>
      <ul className="space-y-3">
        {course.sessions.map((session) => (
          <li key={session.id}>
            <Link
              href={`/course/${session.id}`}
              className="block rounded-xl border border-edge bg-surface p-5 transition-colors hover:border-orange-500/50"
            >
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-sm text-lane-main">{session.order}회차</span>
                <h2 className="font-bold text-ink">{session.title}</h2>
              </div>
              <p className="mt-1 text-sm text-muted">{session.goal}</p>
              <p className="mt-2 font-mono text-xs text-muted">활동 {session.activities.length}개</p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
