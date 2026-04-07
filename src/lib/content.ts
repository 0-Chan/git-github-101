import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import html from "remark-html";
import type { LessonContent, LessonMeta, SectionsData } from "@/types";

const contentDir = path.join(process.cwd(), "content/lessons");
const sectionsPath = path.join(process.cwd(), "content/sections.json");

export function getSections(): SectionsData {
  const raw = fs.readFileSync(sectionsPath, "utf8");
  return JSON.parse(raw);
}

export function getAllLessons(): LessonMeta[] {
  const files = fs.readdirSync(contentDir).filter((f) => f.endsWith(".md"));
  return files
    .map((file) => {
      const raw = fs.readFileSync(path.join(contentDir, file), "utf8");
      const { data } = matter(raw);
      return data as LessonMeta;
    })
    .sort((a, b) => a.order - b.order);
}

export function getLessonBySlug(slug: string): LessonContent | null {
  const sections = getSections();
  const section = sections.sections.find((s) => s.slug === slug);
  if (!section) return null;

  const filePath = path.join(contentDir, section.file);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);

  const processed = remark().use(remarkGfm).use(html).processSync(content);

  return {
    meta: data as LessonMeta,
    html: processed.toString(),
  };
}
