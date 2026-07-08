import git from "isomorphic-git";
import { beforeEach, describe, expect, it } from "vitest";
import { createFS } from "@/lib/shell/filesystem";
import { runValidation } from "@/lib/validation";

describe("runValidation", () => {
  let fs: any;
  beforeEach(async () => {
    fs = createFS(`test-validation-${Math.random()}`);
    await git.init({ fs, dir: "/", defaultBranch: "main" });
    await git.setConfig({ fs, dir: "/", path: "user.name", value: "학습자" });
    await git.setConfig({ fs, dir: "/", path: "user.email", value: "learner@git101.dev" });
  });

  it("file-exists: pass when file exists", async () => {
    await fs.promises.writeFile("/hello.txt", "hi");
    const result = await runValidation({ type: "file-exists", path: "/hello.txt" }, fs, "/");
    expect(result).toBe(true);
  });

  it("file-exists: fail when file does not exist", async () => {
    const result = await runValidation({ type: "file-exists", path: "/missing.txt" }, fs, "/");
    expect(result).toBe(false);
  });

  it("file-content: pass when content contains string", async () => {
    await fs.promises.writeFile("/hello.txt", "hello world");
    const result = await runValidation({ type: "file-content", path: "/hello.txt", contains: "hello" }, fs, "/");
    expect(result).toBe(true);
  });

  it("file-content: fail when content does not contain string", async () => {
    await fs.promises.writeFile("/hello.txt", "hello world");
    const result = await runValidation({ type: "file-content", path: "/hello.txt", contains: "goodbye" }, fs, "/");
    expect(result).toBe(false);
  });

  it("git-staged: pass when file is staged", async () => {
    await fs.promises.writeFile("/hello.txt", "hi");
    await git.add({ fs, dir: "/", filepath: "hello.txt" });
    const result = await runValidation({ type: "git-staged", path: "hello.txt" }, fs, "/");
    expect(result).toBe(true);
  });

  it("git-staged: fail when file is not staged", async () => {
    await fs.promises.writeFile("/hello.txt", "hi");
    const result = await runValidation({ type: "git-staged", path: "hello.txt" }, fs, "/");
    expect(result).toBe(false);
  });

  it("commit-count: pass when enough commits exist", async () => {
    await fs.promises.writeFile("/a.txt", "a");
    await git.add({ fs, dir: "/", filepath: "a.txt" });
    await git.commit({ fs, dir: "/", message: "first", author: { name: "학습자", email: "learner@git101.dev" } });
    const result = await runValidation({ type: "commit-count", min: 1 }, fs, "/");
    expect(result).toBe(true);
  });

  it("commit-count: fail when not enough commits", async () => {
    const result = await runValidation({ type: "commit-count", min: 1 }, fs, "/");
    expect(result).toBe(false);
  });

  it("branch-exists: pass when branch exists", async () => {
    await fs.promises.writeFile("/a.txt", "a");
    await git.add({ fs, dir: "/", filepath: "a.txt" });
    await git.commit({ fs, dir: "/", message: "first", author: { name: "학습자", email: "learner@git101.dev" } });
    await git.branch({ fs, dir: "/", ref: "feature" });
    const result = await runValidation({ type: "branch-exists", name: "feature" }, fs, "/");
    expect(result).toBe(true);
  });

  it("branch-exists: fail when branch does not exist", async () => {
    const result = await runValidation({ type: "branch-exists", name: "nonexistent" }, fs, "/");
    expect(result).toBe(false);
  });

  it("current-branch: pass when on the correct branch", async () => {
    const result = await runValidation({ type: "current-branch", name: "main" }, fs, "/");
    expect(result).toBe(true);
  });

  it("current-branch: fail when on different branch", async () => {
    const result = await runValidation({ type: "current-branch", name: "feature" }, fs, "/");
    expect(result).toBe(false);
  });

  it("commit-message: pass when last commit matches pattern", async () => {
    await fs.promises.writeFile("/a.txt", "a");
    await git.add({ fs, dir: "/", filepath: "a.txt" });
    await git.commit({
      fs,
      dir: "/",
      message: "feat: add feature",
      author: { name: "학습자", email: "learner@git101.dev" },
    });
    const result = await runValidation({ type: "commit-message", pattern: "^feat:" }, fs, "/");
    expect(result).toBe(true);
  });

  it("commit-message: fail when last commit does not match pattern", async () => {
    await fs.promises.writeFile("/a.txt", "a");
    await git.add({ fs, dir: "/", filepath: "a.txt" });
    await git.commit({
      fs,
      dir: "/",
      message: "random message",
      author: { name: "학습자", email: "learner@git101.dev" },
    });
    const result = await runValidation({ type: "commit-message", pattern: "^feat:" }, fs, "/");
    expect(result).toBe(false);
  });

  it("merge-commit: pass when last commit is a merge commit", async () => {
    // Setup: create two branches and merge
    await fs.promises.writeFile("/a.txt", "a");
    await git.add({ fs, dir: "/", filepath: "a.txt" });
    await git.commit({ fs, dir: "/", message: "first", author: { name: "학습자", email: "learner@git101.dev" } });
    await git.branch({ fs, dir: "/", ref: "feature" });
    await fs.promises.writeFile("/b.txt", "b");
    await git.add({ fs, dir: "/", filepath: "b.txt" });
    await git.commit({ fs, dir: "/", message: "on feature", author: { name: "학습자", email: "learner@git101.dev" } });
    const featureOid = await git.resolveRef({ fs, dir: "/", ref: "feature" });
    await git.checkout({ fs, dir: "/", ref: "main" });
    const mainOid = await git.resolveRef({ fs, dir: "/", ref: "HEAD" });
    // Create merge commit manually
    await git.commit({
      fs,
      dir: "/",
      message: "Merge feature into main",
      author: { name: "학습자", email: "learner@git101.dev" },
      parent: [mainOid, featureOid],
    });
    const result = await runValidation({ type: "merge-commit" }, fs, "/");
    expect(result).toBe(true);
  });

  it("no-conflict-markers: pass when file has no conflict markers", async () => {
    await fs.promises.writeFile("/clean.txt", "clean content");
    const result = await runValidation({ type: "no-conflict-markers", path: "/clean.txt" }, fs, "/");
    expect(result).toBe(true);
  });

  it("no-conflict-markers: fail when file has conflict markers", async () => {
    await fs.promises.writeFile("/conflict.txt", "<<<<<<< HEAD\nhello\n=======\nworld\n>>>>>>> feature");
    const result = await runValidation({ type: "no-conflict-markers", path: "/conflict.txt" }, fs, "/");
    expect(result).toBe(false);
  });

  it("remote-exists: pass when remote exists", async () => {
    await git.addRemote({ fs, dir: "/", remote: "origin", url: "https://github.com/test/repo.git" });
    const result = await runValidation({ type: "remote-exists", name: "origin" }, fs, "/");
    expect(result).toBe(true);
  });

  it("remote-exists: fail when remote does not exist", async () => {
    const result = await runValidation({ type: "remote-exists", name: "origin" }, fs, "/");
    expect(result).toBe(false);
  });

  it("tag-exists: pass when the tag exists", async () => {
    await fs.promises.writeFile("/a.txt", "hi");
    await git.add({ fs, dir: "/", filepath: "a.txt" });
    await git.commit({ fs, dir: "/", message: "init", author: { name: "학습자", email: "learner@git101.dev" } });
    await git.tag({ fs, dir: "/", ref: "v1.0.0" });
    const result = await runValidation({ type: "tag-exists", name: "v1.0.0" }, fs, "/");
    expect(result).toBe(true);
  });

  it("tag-exists: fail when the tag does not exist", async () => {
    const result = await runValidation({ type: "tag-exists", name: "v1.0.0" }, fs, "/");
    expect(result).toBe(false);
  });

  describe("rebased-onto", () => {
    const author = { name: "학습자", email: "learner@git101.dev" };
    async function commit(path: string, content: string, message: string) {
      await fs.promises.writeFile(path, content);
      await git.add({ fs, dir: "/", filepath: path.slice(1) });
      await git.commit({ fs, dir: "/", message, author });
    }

    it("passes for a linear history sitting on top of the base tip", async () => {
      await commit("/a.txt", "1\n", "c1");
      await commit("/a.txt", "1\n2\n", "c2 main tip");
      await git.branch({ fs, dir: "/", ref: "feature" });
      await git.checkout({ fs, dir: "/", ref: "feature" });
      await commit("/b.txt", "b\n", "c3 on top");
      expect(await runValidation({ type: "rebased-onto", name: "main" }, fs, "/")).toBe(true);
    });

    it("fails while the branches are still diverged", async () => {
      await commit("/a.txt", "1\n", "c1");
      await git.branch({ fs, dir: "/", ref: "feature" });
      await git.checkout({ fs, dir: "/", ref: "feature" });
      await commit("/b.txt", "b\n", "feature work");
      await git.checkout({ fs, dir: "/", ref: "main" });
      await commit("/a.txt", "1\nfix\n", "main fix");
      await git.checkout({ fs, dir: "/", ref: "feature" });
      expect(await runValidation({ type: "rebased-onto", name: "main" }, fs, "/")).toBe(false);
    });

    it("fails when the base was merged in instead of rebased", async () => {
      await commit("/a.txt", "1\n", "c1");
      await git.branch({ fs, dir: "/", ref: "feature" });
      await git.checkout({ fs, dir: "/", ref: "feature" });
      await commit("/b.txt", "b\n", "feature work");
      await git.checkout({ fs, dir: "/", ref: "main" });
      await commit("/a.txt", "1\nfix\n", "main fix");
      await git.checkout({ fs, dir: "/", ref: "feature" });
      await git.merge({ fs, dir: "/", ours: "feature", theirs: "main", author });
      expect(await runValidation({ type: "rebased-onto", name: "main" }, fs, "/")).toBe(false);
    });

    it("fails when HEAD is the base tip itself", async () => {
      await commit("/a.txt", "1\n", "c1");
      expect(await runValidation({ type: "rebased-onto", name: "main" }, fs, "/")).toBe(false);
    });
  });
});

describe("command-run", () => {
  const fsStub = null as any; // fs를 쓰지 않는 검증

  it("passes when a matching command exists in history", async () => {
    const ok = await runValidation({ type: "command-run", matches: "^git log" }, fsStub, "/", {
      history: ["ls", "git log"],
    });
    expect(ok).toBe(true);
  });

  it("supports lookahead patterns for flag combos regardless of order", async () => {
    const rule = { type: "command-run", matches: "^git log(?=.*--graph)(?=.*--oneline)" } as const;
    expect(await runValidation(rule, fsStub, "/", { history: ["git log --oneline --graph --all"] })).toBe(true);
    expect(await runValidation(rule, fsStub, "/", { history: ["git log --graph --oneline"] })).toBe(true);
    expect(await runValidation(rule, fsStub, "/", { history: ["git log --oneline"] })).toBe(false);
  });

  it("fails without history or matching command", async () => {
    expect(await runValidation({ type: "command-run", matches: "^git log" }, fsStub, "/")).toBe(false);
    expect(
      await runValidation({ type: "command-run", matches: "^git log" }, fsStub, "/", { history: ["git status"] }),
    ).toBe(false);
  });

  it("trims whitespace around history entries", async () => {
    const ok = await runValidation({ type: "command-run", matches: "^git checkout main$" }, fsStub, "/", {
      history: ["  git checkout main  "],
    });
    expect(ok).toBe(true);
  });
});
