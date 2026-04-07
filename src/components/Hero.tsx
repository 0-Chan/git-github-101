'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

const TYPEWRITER_TEXT = '브라우저에서 Git을 배워보세요'
const TYPING_SPEED = 80

export function Hero() {
  const [text, setText] = useState('')
  const [showCursor, setShowCursor] = useState(true)

  useEffect(() => {
    let i = 0
    const timer = setInterval(() => {
      if (i < TYPEWRITER_TEXT.length) {
        setText(TYPEWRITER_TEXT.slice(0, i + 1))
        i++
      } else {
        clearInterval(timer)
      }
    }, TYPING_SPEED)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const cursor = setInterval(() => setShowCursor((c) => !c), 520)
    return () => clearInterval(cursor)
  }, [])

  return (
    <section className="py-20 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Terminal window */}
        <div className="rounded-xl border border-zinc-700 bg-zinc-900 overflow-hidden shadow-2xl">
          <div className="flex items-center gap-2 px-4 py-3 bg-zinc-800 border-b border-zinc-700">
            <span className="w-3 h-3 rounded-full bg-red-500" />
            <span className="w-3 h-3 rounded-full bg-yellow-500" />
            <span className="w-3 h-3 rounded-full bg-green-500" />
            <span className="ml-2 text-xs text-zinc-400 font-mono">terminal</span>
          </div>
          <div className="p-6 font-mono text-sm">
            <p className="text-zinc-400">$ git-github-101</p>
            <p className="text-orange-400 mt-2 text-lg">
              {text}
              <span className={`${showCursor ? 'opacity-100' : 'opacity-0'} transition-opacity`}>▊</span>
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-8 text-center">
          <h1 className="text-3xl font-bold mb-4">Git & GitHub 101</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mb-6">
            설치 없이, 브라우저에서 바로 Git을 실습해보세요.
          </p>
          <Link
            href="/lessons/what-is-git"
            className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors"
          >
            시작하기 →
          </Link>
        </div>
      </div>
    </section>
  )
}
