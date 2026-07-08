import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import html from "remark-html";
import type { LessonContent, LessonMeta, SectionsData } from "@/types";
import { bashBlockToHtml } from "./bashHighlight";

// ```bash 블록을 렌더 타임에 "$ 프롬프트 + 시맨틱 컬러" HTML로 치환한다.
// 콘텐츠(md)는 평범한 bash 블록으로 유지 — 복사·작성 모두 오염되지 않는다.
interface MdNode {
  type: string;
  lang?: string | null;
  value?: string;
  children?: unknown[];
}

function remarkBashPrompt() {
  return (tree: unknown) => {
    const walk = (node: MdNode) => {
      if (node.type === "code" && node.lang === "bash" && typeof node.value === "string") {
        node.type = "html";
        node.value = bashBlockToHtml(node.value);
        node.lang = undefined;
      }
      if (Array.isArray(node.children)) {
        for (const child of node.children) walk(child as MdNode);
      }
    };
    walk(tree as unknown as MdNode);
  };
}

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

  // singleTilde:false — 단일 ~는 취소선으로 보지 않는다. Git 튜토리얼은 HEAD~1
  // 같은 표기를 자주 써서, ~ 하나가 <del>로 묶이면 문장이 깨진다.
  const processed = remark()
    .use(remarkGfm, { singleTilde: false })
    .use(remarkBashPrompt)
    .use(html, { sanitize: false })
    .processSync(content);

  return {
    meta: data as LessonMeta,
    html: processed.toString(),
  };
}
