import { describe, expect, it } from "vitest";
import { getAllLessons, getLessonBySlug } from "@/lib/content";

// 레슨 마크다운을 실제 remark 파이프라인으로 렌더해 콘텐츠 규칙을 집행한다.
// - 리터럴 ** 잔존 = CommonMark 강조 파싱 실패 (닫는 **가 괄호·따옴표 뒤 + 조사 앞이면 발생)
// - em dash(—) = 시리즈 윤문 규칙 위반 (humanize-korean 기준)
describe("lesson rendering rules", () => {
  const lessons = getAllLessons().map((meta) => getLessonBySlug(meta.slug));

  it("loads all lessons", () => {
    expect(lessons.length).toBeGreaterThanOrEqual(11);
  });

  it.each(getAllLessons().map((m) => [m.slug]))("%s renders without literal **", (slug) => {
    const lesson = getLessonBySlug(slug);
    expect(lesson, `lesson not found: ${slug}`).toBeTruthy();
    const idx = (lesson as NonNullable<typeof lesson>).html.indexOf("**");
    const context =
      idx === -1 ? "" : (lesson as NonNullable<typeof lesson>).html.slice(Math.max(0, idx - 60), idx + 60);
    expect(idx, `깨진 볼드 발견: …${context}…`).toBe(-1);
  });

  it.each(getAllLessons().map((m) => [m.slug]))("%s contains no em dash", (slug) => {
    const lesson = getLessonBySlug(slug);
    const html = (lesson as NonNullable<typeof lesson>).html;
    expect(html.includes("—"), "em dash(—)는 윤문 규칙상 금지").toBe(false);
  });
});
