import { beforeEach, describe, expect, it } from "vitest";
import { createFS } from "@/lib/shell/filesystem";
import { complete } from "@/lib/shell/interactive/suggest";

describe("complete", () => {
  let fs: any;
  let ctx: { fs: any; cwd: string };

  beforeEach(async () => {
    fs = createFS(`test-complete-${Math.random()}`);
    ctx = { fs, cwd: "/" };
    try {
      await fs.promises.readdir("/");
    } catch {
      await fs.promises.mkdir("/");
    }
    await fs.promises.writeFile("/readme.md", "hi");
    await fs.promises.writeFile("/recipe.txt", "x");
    await fs.promises.mkdir("/docs");
    await fs.promises.writeFile("/docs/note.md", "n");
  });

  it("completes a unique command with a trailing space", async () => {
    expect(await complete("pw", ctx)).toEqual({ kind: "single", insert: "d ", candidates: [] });
  });

  it("extends the common prefix of multiple commands", async () => {
    // c → cat/cd/clear: 공통 접두 "c" 자체라 확장 없음 → multiple
    const result = await complete("c", ctx);
    expect(result.kind).toBe("multiple");
    expect(result.candidates).toEqual(["cat", "cd", "clear"]);
  });

  it("completes git subcommands after 'git '", async () => {
    expect(await complete("git ini", ctx)).toEqual({ kind: "single", insert: "t ", candidates: [] });
    const multi = await complete("git c", ctx);
    // checkout/commit → 공통 접두 "c" 확장 없음 → multiple
    expect(multi.kind).toBe("multiple");
    expect(multi.candidates).toEqual(["checkout", "commit"]);
  });

  it("completes a unique file path with a trailing space", async () => {
    expect(await complete("cat readm", ctx)).toEqual({ kind: "single", insert: "e.md ", candidates: [] });
  });

  it("completes a unique directory with a trailing slash", async () => {
    expect(await complete("cd do", ctx)).toEqual({ kind: "single", insert: "cs/", candidates: [] });
  });

  it("extends the longest common prefix of paths", async () => {
    // re → readme.md / recipe.txt → 공통 접두 "re" 자체... 확장 없음 → multiple
    const result = await complete("cat re", ctx);
    expect(result.kind).toBe("multiple");
    expect(result.candidates).toEqual(["readme.md", "recipe.txt"]);
  });

  it("completes inside a subdirectory path", async () => {
    expect(await complete("cat docs/no", ctx)).toEqual({ kind: "single", insert: "te.md ", candidates: [] });
  });

  it("completes a fresh token when input ends with a space", async () => {
    const result = await complete("cat docs/", ctx);
    expect(result).toEqual({ kind: "single", insert: "note.md ", candidates: [] });
  });

  it("returns none when the directory does not exist", async () => {
    expect(await complete("cat nope/x", ctx)).toEqual({ kind: "none", insert: "", candidates: [] });
  });

  it("returns none when nothing matches", async () => {
    expect(await complete("cat zzz", ctx)).toEqual({ kind: "none", insert: "", candidates: [] });
  });

  it("resolves relative to cwd", async () => {
    const sub = { fs, cwd: "/docs" };
    expect(await complete("cat no", sub)).toEqual({ kind: "single", insert: "te.md ", candidates: [] });
  });

  it("returns a prefix extension when candidates share more than typed", async () => {
    await fs.promises.writeFile("/prefix-one.txt", "a");
    await fs.promises.writeFile("/prefix-two.txt", "b");
    const result = await complete("cat pre", ctx);
    expect(result).toEqual({ kind: "prefix", insert: "fix-", candidates: [] });
  });
});
