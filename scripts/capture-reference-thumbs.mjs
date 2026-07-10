// 자료 페이지 썸네일 캡처: references.json의 각 URL을 chromium으로 열어
// public/reference-thumbs/<slug>.jpg 로 저장하고, 성공 항목에 thumb 필드를 기록한다.
// 빌드 파이프라인에 넣지 않는 원샷 도구 — 자료가 바뀌면 다시 실행한다:
//   node scripts/capture-reference-thumbs.mjs
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "@playwright/test";

const ROOT = path.resolve(import.meta.dirname, "..");
const JSON_PATH = path.join(ROOT, "content/references.json");
const OUT_DIR = path.join(ROOT, "public/reference-thumbs");

function slugOf(url) {
  const u = new URL(url);
  return `${u.hostname}${u.pathname}`
    .replace(/^www\./, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

const data = JSON.parse(await readFile(JSON_PATH, "utf8"));
await mkdir(OUT_DIR, { recursive: true });

const browser = await chromium.launch();
const failures = [];

for (const category of data.categories) {
  for (const item of category.items) {
    const slug = slugOf(item.url);
    const file = path.join(OUT_DIR, `${slug}.jpg`);
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    try {
      await page.goto(item.url, { waitUntil: "load", timeout: 25000 });
      // 웹폰트/지연 렌더가 안착할 시간을 잠깐 준다
      await page.waitForTimeout(2500);
      await page.screenshot({ path: file, type: "jpeg", quality: 60 });
      item.thumb = `/reference-thumbs/${slug}.jpg`;
      console.log(`✓ ${item.title} → ${slug}.jpg`);
    } catch (err) {
      failures.push({ title: item.title, url: item.url, reason: String(err).split("\n")[0] });
      console.warn(`✗ ${item.title}: ${String(err).split("\n")[0]}`);
    } finally {
      await page.close();
    }
  }
}

await browser.close();
await writeFile(JSON_PATH, `${JSON.stringify(data, null, 2)}\n`);

if (failures.length > 0) {
  console.warn(`\n실패 ${failures.length}건 (thumb 없이 유지):`);
  for (const f of failures) console.warn(`- ${f.title}: ${f.reason}`);
}
console.log("\ndone.");
