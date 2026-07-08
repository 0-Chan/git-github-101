import fs from "node:fs";
import path from "node:path";
import type { ReferenceData } from "@/types";

const referencesPath = path.join(process.cwd(), "content/references.json");

export function getReferences(): ReferenceData {
  return JSON.parse(fs.readFileSync(referencesPath, "utf8"));
}
