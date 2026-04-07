import Link from 'next/link'
import { ThemeToggle } from './ThemeToggle'

export function Nav() {
  return (
    <header className="sticky top-0 z-50 h-14 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur">
      <div className="max-w-screen-xl mx-auto h-full flex items-center justify-between px-4">
        <Link href="/" className="font-mono font-bold text-lg text-orange-500">
          ▸ git-github-101
        </Link>
        <div className="flex items-center gap-2">
          <a href="https://github.com/0-Chan/git-github-101" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-sm">
            GitHub
          </a>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
