import { ReferenceCard } from "@/components/ReferenceCard";
import { getReferences } from "@/lib/references";

export const metadata = { title: "자료 · git-github-101" };

export default function ReferencePage() {
  const { categories } = getReferences();

  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <header className="mb-10">
        <p className="font-mono text-sm text-lane-main">참고 자료</p>
        <h1 className="mt-1 text-2xl font-bold text-ink">강의 자료 모음</h1>
        <p className="mt-2 text-sm text-muted">강의에서 소개한 레퍼런스입니다. 필요할 때 찾아보세요.</p>
      </header>

      {categories.map((category) => (
        <section key={category.title} className="mb-10">
          <h2 className="mb-3 text-lg font-bold text-ink">{category.title}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {category.items.map((item) => (
              <ReferenceCard key={item.url} item={item} />
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}
