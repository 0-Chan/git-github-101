import type { Section } from "@/types";

/** 현재 레슨의 다음 레슨. 마지막이거나 못 찾으면 null. */
export function nextSection(sections: Section[], slug: string): Section | null {
  const idx = sections.findIndex((s) => s.slug === slug);
  if (idx === -1 || idx + 1 >= sections.length) return null;
  return sections[idx + 1];
}
