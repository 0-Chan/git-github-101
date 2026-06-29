import { CommitGraph } from "@/components/CommitGraph";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { getSections } from "@/lib/content";

export default function Home() {
  const { sections } = getSections();

  return (
    <main>
      <Hero />

      <section className="mx-auto max-w-2xl px-4 pb-20">
        <div className="mb-6 flex items-baseline justify-between border-b border-edge pb-2">
          <h2 className="font-mono text-sm text-muted">git log --oneline --graph</h2>
          <span className="font-mono text-xs text-muted">{sections.length} commits</span>
        </div>
        <CommitGraph sections={sections} />
      </section>

      <Footer />
    </main>
  );
}
