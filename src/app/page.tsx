import { getSections } from '@/lib/content'
import { Hero } from '@/components/Hero'
import { Footer } from '@/components/Footer'
import Link from 'next/link'

export default function Home() {
  const { sections } = getSections()

  return (
    <main>
      <Hero />

      <section className="max-w-screen-xl mx-auto px-4 pb-16">
        <h2 className="text-2xl font-bold mb-8 text-center">레슨 목록</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sections.map((section) => (
            <Link
              key={section.id}
              href={`/lessons/${section.slug}`}
              className="block p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-orange-300 dark:hover:border-orange-700 transition-colors"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="font-mono text-sm text-zinc-400">
                  {String(section.order).padStart(2, '0')}
                </span>
                <h3 className="font-semibold">{section.title}</h3>
                {!section.hasTerminal && (
                  <span className="text-xs px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded text-zinc-500">
                    읽기
                  </span>
                )}
              </div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">{section.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  )
}
