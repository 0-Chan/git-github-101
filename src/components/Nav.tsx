import Link from "next/link";
import { getCourse } from "@/lib/course";
import { DeckMenu } from "./DeckMenu";
import { SessionMenu } from "./SessionMenu";
import { ThemeToggle } from "./ThemeToggle";

export function Nav() {
  const sessions = getCourse().sessions.map(({ id, order, title }) => ({ id, order, title }));

  return (
    <header className="sticky top-0 z-50 h-14 border-b border-edge bg-ground/80 backdrop-blur">
      <div className="max-w-screen-xl mx-auto h-full flex items-center justify-between px-4">
        <Link href="/" className="font-mono font-bold text-lg text-lane-main">
          ▸ git-github-101
        </Link>
        <div className="flex items-center gap-2">
          <SessionMenu sessions={sessions} />
          <DeckMenu sessions={sessions} />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
