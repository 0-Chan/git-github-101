import git from "isomorphic-git";
import { beforeEach, describe, expect, it } from "vitest";
import { gitCommands } from "@/lib/shell/commands/git";
import { createFS } from "@/lib/shell/filesystem";
import type { ShellContext } from "@/types";

function makeContext(fs: any): ShellContext {
  let pendingMerge: { theirs: string } | null = null;
  return {
    fs,
    dir: "/",
    cwd: "/",
    get pendingMerge() {
      return pendingMerge;
    },
    setPendingMerge: (m) => {
      pendingMerge = m;
    },
  };
}

describe("git commands", () => {
  let fs: any;
  let ctx: ShellContext;

  beforeEach(() => {
    fs = createFS(`test-git-${Math.random()}`);
    ctx = makeContext(fs);
  });

  describe("git init", () => {
    it('initializes repo with main branch, output contains "Initialized"', async () => {
      const result = await gitCommands.init([], ctx);
      expect(result.output).toContain("Initialized");

      const branch = await git.currentBranch({ fs, dir: "/" });
      expect(branch).toBe("main");
    });
  });

  describe("git add + git status", () => {
    it("after adding file, status output contains filename", async () => {
      await git.init({ fs, dir: "/", defaultBranch: "main" });
      await fs.promises.writeFile("/hello.txt", "hello world");

      await gitCommands.add(["hello.txt"], ctx);
      const result = await gitCommands.status([], ctx);
      expect(result.output).toContain("hello.txt");
    });
  });

  describe("git commit", () => {
    it("creates commit, output contains message, log has 1 entry", async () => {
      await git.init({ fs, dir: "/", defaultBranch: "main" });
      await git.setConfig({ fs, dir: "/", path: "user.name", value: "학습자" });
      await git.setConfig({ fs, dir: "/", path: "user.email", value: "learner@git101.dev" });
      await fs.promises.writeFile("/hello.txt", "hello");
      await git.add({ fs, dir: "/", filepath: "hello.txt" });

      const result = await gitCommands.commit(["-m", "initial commit"], ctx);
      expect(result.output).toContain("initial commit");

      const log = await git.log({ fs, dir: "/", depth: 10 });
      expect(log).toHaveLength(1);
      expect(log[0].commit.message).toContain("initial commit");
    });
  });

  describe("git log", () => {
    it("shows commit history with message", async () => {
      await git.init({ fs, dir: "/", defaultBranch: "main" });
      await git.setConfig({ fs, dir: "/", path: "user.name", value: "학습자" });
      await git.setConfig({ fs, dir: "/", path: "user.email", value: "learner@git101.dev" });
      await fs.promises.writeFile("/a.txt", "a");
      await git.add({ fs, dir: "/", filepath: "a.txt" });
      await git.commit({
        fs,
        dir: "/",
        message: "first commit",
        author: { name: "학습자", email: "learner@git101.dev" },
      });

      const result = await gitCommands.log([], ctx);
      expect(result.output).toContain("first commit");
      expect(result.output).toContain("commit");
    });
  });

  describe("git branch", () => {
    it("creates a branch", async () => {
      await git.init({ fs, dir: "/", defaultBranch: "main" });
      await git.setConfig({ fs, dir: "/", path: "user.name", value: "학습자" });
      await git.setConfig({ fs, dir: "/", path: "user.email", value: "learner@git101.dev" });
      await fs.promises.writeFile("/a.txt", "a");
      await git.add({ fs, dir: "/", filepath: "a.txt" });
      await git.commit({ fs, dir: "/", message: "init", author: { name: "학습자", email: "learner@git101.dev" } });

      const result = await gitCommands.branch(["feature"], ctx);
      expect(result.output).toBe("");

      const branches = await git.listBranches({ fs, dir: "/" });
      expect(branches).toContain("feature");
    });

    it("lists branches with no args", async () => {
      await git.init({ fs, dir: "/", defaultBranch: "main" });
      await git.setConfig({ fs, dir: "/", path: "user.name", value: "학습자" });
      await git.setConfig({ fs, dir: "/", path: "user.email", value: "learner@git101.dev" });
      await fs.promises.writeFile("/a.txt", "a");
      await git.add({ fs, dir: "/", filepath: "a.txt" });
      await git.commit({ fs, dir: "/", message: "init", author: { name: "학습자", email: "learner@git101.dev" } });

      const result = await gitCommands.branch([], ctx);
      expect(result.output).toContain("main");
      expect(result.output).toContain("*");
    });
  });

  describe("git checkout", () => {
    it("switches branch", async () => {
      await git.init({ fs, dir: "/", defaultBranch: "main" });
      await git.setConfig({ fs, dir: "/", path: "user.name", value: "학습자" });
      await git.setConfig({ fs, dir: "/", path: "user.email", value: "learner@git101.dev" });
      await fs.promises.writeFile("/a.txt", "a");
      await git.add({ fs, dir: "/", filepath: "a.txt" });
      await git.commit({ fs, dir: "/", message: "init", author: { name: "학습자", email: "learner@git101.dev" } });
      await git.branch({ fs, dir: "/", ref: "feature" });

      const result = await gitCommands.checkout(["feature"], ctx);
      expect(result.output).toContain("feature");

      const current = await git.currentBranch({ fs, dir: "/" });
      expect(current).toBe("feature");
    });
  });

  describe("git merge", () => {
    it("merges branch (fast-forward case)", async () => {
      await git.init({ fs, dir: "/", defaultBranch: "main" });
      await git.setConfig({ fs, dir: "/", path: "user.name", value: "학습자" });
      await git.setConfig({ fs, dir: "/", path: "user.email", value: "learner@git101.dev" });
      await fs.promises.writeFile("/a.txt", "a");
      await git.add({ fs, dir: "/", filepath: "a.txt" });
      await git.commit({ fs, dir: "/", message: "init", author: { name: "학습자", email: "learner@git101.dev" } });

      // Create feature branch and add a commit
      await git.branch({ fs, dir: "/", ref: "feature" });
      await git.checkout({ fs, dir: "/", ref: "feature" });
      await fs.promises.writeFile("/b.txt", "b");
      await git.add({ fs, dir: "/", filepath: "b.txt" });
      await git.commit({
        fs,
        dir: "/",
        message: "feature commit",
        author: { name: "학습자", email: "learner@git101.dev" },
      });

      // Switch back to main and merge
      await git.checkout({ fs, dir: "/", ref: "main" });
      const result = await gitCommands.merge(["feature"], ctx);
      expect(result.output).toMatch(/^Updating [0-9a-f]{7}\.\.[0-9a-f]{7}\nFast-forward$/);
    });

    it("with conflict — sets pendingMerge, output contains CONFLICT", async () => {
      await git.init({ fs, dir: "/", defaultBranch: "main" });
      await git.setConfig({ fs, dir: "/", path: "user.name", value: "학습자" });
      await git.setConfig({ fs, dir: "/", path: "user.email", value: "learner@git101.dev" });

      // Initial commit on main
      await fs.promises.writeFile("/file.txt", "original");
      await git.add({ fs, dir: "/", filepath: "file.txt" });
      await git.commit({ fs, dir: "/", message: "init", author: { name: "학습자", email: "learner@git101.dev" } });

      // Create feature branch and modify file
      await git.branch({ fs, dir: "/", ref: "feature" });
      await git.checkout({ fs, dir: "/", ref: "feature" });
      await fs.promises.writeFile("/file.txt", "feature change");
      await git.add({ fs, dir: "/", filepath: "file.txt" });
      await git.commit({
        fs,
        dir: "/",
        message: "feature change",
        author: { name: "학습자", email: "learner@git101.dev" },
      });

      // Back to main and make conflicting change
      await git.checkout({ fs, dir: "/", ref: "main" });
      await fs.promises.writeFile("/file.txt", "main change");
      await git.add({ fs, dir: "/", filepath: "file.txt" });
      await git.commit({
        fs,
        dir: "/",
        message: "main change",
        author: { name: "학습자", email: "learner@git101.dev" },
      });

      const result = await gitCommands.merge(["feature"], ctx);
      expect(result.output).toContain("CONFLICT (content): Merge conflict in file.txt");
      expect(ctx.pendingMerge).not.toBeNull();
    });
  });

  describe("git diff", () => {
    it("shows changes", async () => {
      await git.init({ fs, dir: "/", defaultBranch: "main" });
      await git.setConfig({ fs, dir: "/", path: "user.name", value: "학습자" });
      await git.setConfig({ fs, dir: "/", path: "user.email", value: "learner@git101.dev" });
      await fs.promises.writeFile("/a.txt", "hello");
      await git.add({ fs, dir: "/", filepath: "a.txt" });
      await git.commit({ fs, dir: "/", message: "init", author: { name: "학습자", email: "learner@git101.dev" } });

      // Modify file
      await fs.promises.writeFile("/a.txt", "hello\nworld");
      const result = await gitCommands.diff([], ctx);
      expect(result.output).toContain("a.txt");
      expect(result.output).toContain("world");
    });
  });

  describe("git remote add", () => {
    it("stores remote config", async () => {
      await git.init({ fs, dir: "/", defaultBranch: "main" });

      const result = await gitCommands.remote(["add", "origin", "https://github.com/user/repo.git"], ctx);
      expect(result.output).toBe("");

      const remotes = await git.listRemotes({ fs, dir: "/" });
      expect(remotes).toContainEqual({ remote: "origin", url: "https://github.com/user/repo.git" });
    });
  });

  describe("git log flags", () => {
    const author = (timestamp: number) => ({
      name: "Learner",
      email: "learner@git101.dev",
      timestamp,
      timezoneOffset: 0,
    });

    async function seedLinear() {
      await git.init({ fs, dir: "/", defaultBranch: "main" });
      await fs.promises.writeFile("/a.txt", "1");
      await git.add({ fs, dir: "/", filepath: "a.txt" });
      await git.commit({ fs, dir: "/", message: "first", author: author(100) });
      await fs.promises.writeFile("/a.txt", "2");
      await git.add({ fs, dir: "/", filepath: "a.txt" });
      await git.commit({ fs, dir: "/", message: "second", author: author(200) });
    }

    async function seedDiverged() {
      await git.init({ fs, dir: "/", defaultBranch: "main" });
      await fs.promises.writeFile("/base.txt", "base");
      await git.add({ fs, dir: "/", filepath: "base.txt" });
      await git.commit({ fs, dir: "/", message: "base", author: author(100) });
      await git.branch({ fs, dir: "/", ref: "feature" });
      await git.checkout({ fs, dir: "/", ref: "feature" });
      await fs.promises.writeFile("/f.txt", "f");
      await git.add({ fs, dir: "/", filepath: "f.txt" });
      await git.commit({ fs, dir: "/", message: "feature work", author: author(200) });
      await git.checkout({ fs, dir: "/", ref: "main" });
      await fs.promises.writeFile("/m.txt", "m");
      await git.add({ fs, dir: "/", filepath: "m.txt" });
      await git.commit({ fs, dir: "/", message: "main work", author: author(300) });
    }

    it("--oneline prints short hash, decoration, and first message line", async () => {
      await seedLinear();
      const result = await gitCommands.log(["--oneline"], ctx);
      const lines = result.output.split("\n");
      expect(lines).toHaveLength(2);
      expect(lines[0]).toMatch(/^[0-9a-f]{7} \(HEAD -> main\) second$/);
      expect(lines[1]).toMatch(/^[0-9a-f]{7} first$/);
    });

    it("--graph draws a linear chain", async () => {
      await seedLinear();
      const result = await gitCommands.log(["--oneline", "--graph"], ctx);
      const lines = result.output.split("\n");
      expect(lines[0]).toMatch(/^\* [0-9a-f]{7} \(HEAD -> main\) second$/);
      expect(lines[1]).toMatch(/^\* [0-9a-f]{7} first$/);
    });

    it("--all unions commits from every branch with decorations", async () => {
      await seedDiverged();
      const headOnly = await gitCommands.log(["--oneline"], ctx);
      expect(headOnly.output).not.toContain("feature work");
      const result = await gitCommands.log(["--oneline", "--all"], ctx);
      expect(result.output).toContain("feature work");
      expect(result.output).toContain("main work");
      expect(result.output).toContain("(feature)");
    });

    it("--oneline --graph --all draws the diverged shape like real git", async () => {
      await seedDiverged();
      const result = await gitCommands.log(["--oneline", "--graph", "--all"], ctx);
      const lines = result.output.split("\n");
      expect(lines[0]).toMatch(/^\* [0-9a-f]{7} \(HEAD -> main\) main work$/);
      expect(lines[1]).toMatch(/^\| \* [0-9a-f]{7} \(feature\) feature work$/);
      expect(lines[2]).toBe("|/");
      expect(lines[3]).toMatch(/^\* [0-9a-f]{7} base$/);
    });

    it("--graph draws the merge diamond after merging", async () => {
      await seedDiverged();
      const merged = await gitCommands.merge(["feature"], ctx);
      expect(merged.isError).toBeUndefined();
      const result = await gitCommands.log(["--oneline", "--graph"], ctx);
      const lines = result.output.split("\n");
      expect(lines[0]).toMatch(/^\* [0-9a-f]{7} \(HEAD -> main\) Merge/);
      expect(lines[1]).toBe("|\\");
      expect(lines[2]).toMatch(/^\* \| [0-9a-f]{7} main work$/);
      expect(lines[3]).toMatch(/^\| \* [0-9a-f]{7} \(feature\) feature work$/);
      expect(lines[4]).toBe("|/");
      expect(lines[5]).toMatch(/^\* [0-9a-f]{7} base$/);
    });

    it("rejects unknown flags with a hint", async () => {
      await seedLinear();
      const result = await gitCommands.log(["--oneline-"], ctx);
      expect(result.isError).toBe(true);
      expect(result.output).toContain("unrecognized argument");
      expect(result.output).toContain("--oneline");
    });
  });

  describe("git diff --staged", () => {
    async function seedStaged() {
      await git.init({ fs, dir: "/", defaultBranch: "main" });
      await fs.promises.writeFile("/a.txt", "hello");
      await git.add({ fs, dir: "/", filepath: "a.txt" });
      await git.commit({
        fs,
        dir: "/",
        message: "init",
        author: { name: "Learner", email: "learner@git101.dev", timestamp: 100, timezoneOffset: 0 },
      });
    }

    it("shows staged modifications against HEAD", async () => {
      await seedStaged();
      await fs.promises.writeFile("/a.txt", "hello\nworld");
      await git.add({ fs, dir: "/", filepath: "a.txt" });
      const result = await gitCommands.diff(["--staged"], ctx);
      expect(result.output).toContain("a.txt");
      expect(result.output).toContain("+world");
    });

    it("is empty when nothing is staged", async () => {
      await seedStaged();
      await fs.promises.writeFile("/a.txt", "hello\nworld"); // 수정만, add 안 함
      const result = await gitCommands.diff(["--staged"], ctx);
      expect(result.output).toBe("");
    });

    it("accepts --cached as an alias", async () => {
      await seedStaged();
      await fs.promises.writeFile("/b.txt", "new");
      await git.add({ fs, dir: "/", filepath: "b.txt" });
      const result = await gitCommands.diff(["--cached"], ctx);
      expect(result.output).toContain("b.txt");
      expect(result.output).toContain("+new");
    });
  });

  describe("git branch -d", () => {
    it("deletes a non-current branch", async () => {
      await git.init({ fs, dir: "/", defaultBranch: "main" });
      await fs.promises.writeFile("/a.txt", "a");
      await git.add({ fs, dir: "/", filepath: "a.txt" });
      await git.commit({
        fs,
        dir: "/",
        message: "init",
        author: { name: "Learner", email: "learner@git101.dev", timestamp: 100, timezoneOffset: 0 },
      });
      await git.branch({ fs, dir: "/", ref: "feature" });

      const result = await gitCommands.branch(["-d", "feature"], ctx);
      expect(result.output).toContain("Deleted branch feature");
      expect(await git.listBranches({ fs, dir: "/" })).not.toContain("feature");
    });

    it("refuses to delete the current branch", async () => {
      await git.init({ fs, dir: "/", defaultBranch: "main" });
      await fs.promises.writeFile("/a.txt", "a");
      await git.add({ fs, dir: "/", filepath: "a.txt" });
      await git.commit({
        fs,
        dir: "/",
        message: "init",
        author: { name: "Learner", email: "learner@git101.dev", timestamp: 100, timezoneOffset: 0 },
      });
      const result = await gitCommands.branch(["-d", "main"], ctx);
      expect(result.isError).toBe(true);
    });
  });

  describe("git remote -v", () => {
    it("lists remotes with urls in fetch/push pairs", async () => {
      await git.init({ fs, dir: "/", defaultBranch: "main" });
      await git.addRemote({ fs, dir: "/", remote: "origin", url: "https://github.com/user/repo.git" });
      const result = await gitCommands.remote(["-v"], ctx);
      expect(result.output).toBe(
        "origin\thttps://github.com/user/repo.git (fetch)\norigin\thttps://github.com/user/repo.git (push)",
      );
    });
  });

  describe("git push", () => {
    it("outputs simulation text", async () => {
      await git.init({ fs, dir: "/", defaultBranch: "main" });
      await git.setConfig({ fs, dir: "/", path: "user.name", value: "학습자" });
      await git.setConfig({ fs, dir: "/", path: "user.email", value: "learner@git101.dev" });
      await fs.promises.writeFile("/a.txt", "a");
      await git.add({ fs, dir: "/", filepath: "a.txt" });
      await git.commit({ fs, dir: "/", message: "init", author: { name: "학습자", email: "learner@git101.dev" } });
      await git.addRemote({ fs, dir: "/", remote: "origin", url: "https://github.com/user/repo.git" });

      const result = await gitCommands.push([], ctx);
      expect(result.output).toContain("Enumerating objects");
      expect(result.output).toContain("Writing objects");
    });
  });
});
