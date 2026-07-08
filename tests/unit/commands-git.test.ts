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

    it("blocks switching with a dirty conflicting file and suggests stash", async () => {
      const author = { name: "학습자", email: "learner@git101.dev" };
      await git.init({ fs, dir: "/", defaultBranch: "main" });
      await git.setConfig({ fs, dir: "/", path: "user.name", value: "학습자" });
      await git.setConfig({ fs, dir: "/", path: "user.email", value: "learner@git101.dev" });
      await fs.promises.writeFile("/app.txt", "main\n");
      await git.add({ fs, dir: "/", filepath: "app.txt" });
      await git.commit({ fs, dir: "/", message: "main", author });
      await git.branch({ fs, dir: "/", ref: "feature" });
      await git.checkout({ fs, dir: "/", ref: "feature" });
      await fs.promises.writeFile("/app.txt", "feature\n");
      await git.add({ fs, dir: "/", filepath: "app.txt" });
      await git.commit({ fs, dir: "/", message: "feature", author });
      // uncommitted change on feature
      await fs.promises.writeFile("/app.txt", "feature\nWIP\n");

      const result = await gitCommands.checkout(["main"], ctx);
      expect(result.isError).toBe(true);
      expect(result.output).toContain("git stash");
      // the switch did not happen
      expect(await git.currentBranch({ fs, dir: "/" })).toBe("feature");
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

      // 마커는 실제 git 형식이어야 한다 — ours 라벨은 HEAD, 마커는 줄 시작에.
      // 원본 파일에 끝 줄바꿈이 없어도 블록이 깨지지 않아야 한다.
      const conflicted = await fs.promises.readFile("/file.txt", "utf8");
      expect(conflicted).toContain("<<<<<<< HEAD\nmain change\n=======\nfeature change\n>>>>>>> feature");
      expect(conflicted).not.toContain("<<<<<<< main");

      // 충돌 중에는 status가 unmerged 파일을 보여줘야 한다.
      // (statusMatrix에서 충돌 row는 stage 열이 3으로 나온다)
      const during = await gitCommands.status([], ctx);
      expect(during.output).toContain("You have unmerged paths.");
      expect(during.output).toContain("both modified:   file.txt");
      expect(during.output).not.toContain("nothing to commit");

      // 해결(양쪽 병합) + add → 충돌이 걷히고 staged로 잡힌다
      await fs.promises.writeFile("/file.txt", "main change + feature change");
      await gitCommands.add(["file.txt"], ctx);
      const resolved = await gitCommands.status([], ctx);
      expect(resolved.output).not.toContain("Unmerged paths");
      expect(resolved.output).toContain("All conflicts fixed but you are still merging.");
      expect(resolved.output).toContain("modified:   file.txt");

      // 머지 커밋으로 마무리된다
      const commit = await gitCommands.commit(["-m", "merge"], ctx);
      expect(commit.output).toContain("[merge ");
      expect(ctx.pendingMerge).toBeNull();
    });

    it("resolving by keeping one side (content equal to HEAD) still allows add and merge commit", async () => {
      await git.init({ fs, dir: "/", defaultBranch: "main" });
      await git.setConfig({ fs, dir: "/", path: "user.name", value: "학습자" });
      await git.setConfig({ fs, dir: "/", path: "user.email", value: "learner@git101.dev" });
      const author = { name: "학습자", email: "learner@git101.dev" };

      await fs.promises.writeFile("/file.txt", "original\n");
      await git.add({ fs, dir: "/", filepath: "file.txt" });
      await git.commit({ fs, dir: "/", message: "init", author });
      await git.branch({ fs, dir: "/", ref: "feature" });
      await git.checkout({ fs, dir: "/", ref: "feature" });
      await fs.promises.writeFile("/file.txt", "feature change\n");
      await git.add({ fs, dir: "/", filepath: "file.txt" });
      await git.commit({ fs, dir: "/", message: "feature change", author });
      await git.checkout({ fs, dir: "/", ref: "main" });
      await fs.promises.writeFile("/file.txt", "main change\n");
      await git.add({ fs, dir: "/", filepath: "file.txt" });
      await git.commit({ fs, dir: "/", message: "main change", author });

      await gitCommands.merge(["feature"], ctx);

      // 한쪽(HEAD 쪽) 내용만 남겨 해결 — add 후 인덱스가 HEAD와 같아져
      // git-staged 검증은 불가능하지만, add와 머지 커밋은 정상 동작해야 한다.
      await fs.promises.writeFile("/file.txt", "main change\n");
      const addResult = await gitCommands.add(["file.txt"], ctx);
      expect(addResult.isError).toBeFalsy();

      const status = await gitCommands.status([], ctx);
      expect(status.output).not.toContain("Unmerged paths");
      expect(status.output).toContain("All conflicts fixed but you are still merging.");

      const commit = await gitCommands.commit(["-m", "merge"], ctx);
      expect(commit.output).toContain("[merge ");
      const log = await git.log({ fs, dir: "/", depth: 1 });
      expect(log[0].commit.parent).toHaveLength(2);
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

  describe("git fetch", () => {
    it("outputs simulation text for a registered remote", async () => {
      await git.init({ fs, dir: "/", defaultBranch: "main" });
      await git.addRemote({ fs, dir: "/", remote: "upstream", url: "https://github.com/source/repo.git" });

      const result = await gitCommands.fetch(["upstream"], ctx);
      expect(result.output).toContain("From https://github.com/source/repo.git");
      expect(result.output).toContain("upstream/main");
    });

    it("errors for an unknown remote", async () => {
      await git.init({ fs, dir: "/", defaultBranch: "main" });

      const result = await gitCommands.fetch(["upstream"], ctx);
      expect(result.isError).toBe(true);
      expect(result.output).toContain("does not appear to be a git repository");
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

    it("pushes a tag when the second arg names an existing tag", async () => {
      await git.init({ fs, dir: "/", defaultBranch: "main" });
      await git.setConfig({ fs, dir: "/", path: "user.name", value: "학습자" });
      await git.setConfig({ fs, dir: "/", path: "user.email", value: "learner@git101.dev" });
      await fs.promises.writeFile("/a.txt", "a");
      await git.add({ fs, dir: "/", filepath: "a.txt" });
      await git.commit({ fs, dir: "/", message: "init", author: { name: "학습자", email: "learner@git101.dev" } });
      await git.tag({ fs, dir: "/", ref: "v1.0.0" });

      const result = await gitCommands.push(["origin", "v1.0.0"], ctx);
      expect(result.output).toContain("[new tag]");
      expect(result.output).toContain("v1.0.0 -> v1.0.0");
      expect(result.output).not.toContain("Branch");

      // 태그가 아닌 두 번째 인자는 기존 브랜치 push 출력 유지
      const branchPush = await gitCommands.push(["origin", "main"], ctx);
      expect(branchPush.output).toContain("Branch 'main' pushed to 'origin'");
    });
  });

  describe("git reset", () => {
    const author = { name: "Learner", email: "learner@git101.dev" };
    async function seed() {
      await git.init({ fs, dir: "/", defaultBranch: "main" });
      await git.setConfig({ fs, dir: "/", path: "user.name", value: "Learner" });
      await git.setConfig({ fs, dir: "/", path: "user.email", value: "learner@git101.dev" });
      await fs.promises.writeFile("/hello.txt", "good\n");
      await git.add({ fs, dir: "/", filepath: "hello.txt" });
      await git.commit({ fs, dir: "/", message: "good commit", author });
      await fs.promises.writeFile("/hello.txt", "good\noops\n");
      await git.add({ fs, dir: "/", filepath: "hello.txt" });
      await git.commit({ fs, dir: "/", message: "oops commit", author });
    }

    it("--hard HEAD~1 drops the last commit and restores the working tree", async () => {
      await seed();
      const result = await gitCommands.reset(["--hard", "HEAD~1"], ctx);
      expect(result.isError).toBeFalsy();
      expect(result.output).toContain("HEAD is now at");

      const log = await git.log({ fs, dir: "/" });
      expect(log).toHaveLength(1);
      expect(log[0].commit.message.trim()).toBe("good commit");
      expect(await fs.promises.readFile("/hello.txt", "utf8")).toBe("good\n");
    });

    it("--soft moves the ref but keeps the working tree", async () => {
      await seed();
      await fs.promises.writeFile("/hello.txt", "good\noops\nextra\n");
      const result = await gitCommands.reset(["--soft", "HEAD~1"], ctx);
      expect(result.isError).toBeFalsy();

      const log = await git.log({ fs, dir: "/" });
      expect(log).toHaveLength(1);
      // 작업트리 변경은 그대로 남는다
      expect(await fs.promises.readFile("/hello.txt", "utf8")).toBe("good\noops\nextra\n");
    });

    it("rejects an unknown option", async () => {
      await seed();
      const result = await gitCommands.reset(["--bogus"], ctx);
      expect(result.isError).toBe(true);
    });
  });

  describe("git stash", () => {
    const author = { name: "Learner", email: "learner@git101.dev" };
    async function seed() {
      await git.init({ fs, dir: "/", defaultBranch: "main" });
      await git.setConfig({ fs, dir: "/", path: "user.name", value: "Learner" });
      await git.setConfig({ fs, dir: "/", path: "user.email", value: "learner@git101.dev" });
      await fs.promises.writeFile("/hello.txt", "committed\n");
      await git.add({ fs, dir: "/", filepath: "hello.txt" });
      await git.commit({ fs, dir: "/", message: "init", author });
    }

    it("push hides the dirty change, pop restores it", async () => {
      await seed();
      await fs.promises.writeFile("/hello.txt", "committed\nwork in progress\n");

      const push = await gitCommands.stash(["push"], ctx);
      expect(push.isError).toBeFalsy();
      expect(await fs.promises.readFile("/hello.txt", "utf8")).toBe("committed\n");

      const pop = await gitCommands.stash(["pop"], ctx);
      expect(pop.isError).toBeFalsy();
      expect(await fs.promises.readFile("/hello.txt", "utf8")).toBe("committed\nwork in progress\n");
    });

    it("defaults to push when no op is given", async () => {
      await seed();
      await fs.promises.writeFile("/hello.txt", "committed\nchange\n");
      const result = await gitCommands.stash([], ctx);
      expect(result.isError).toBeFalsy();
      expect(await fs.promises.readFile("/hello.txt", "utf8")).toBe("committed\n");
    });

    it("rejects an unknown op", async () => {
      await seed();
      const result = await gitCommands.stash(["bogus"], ctx);
      expect(result.isError).toBe(true);
    });
  });

  describe("git tag", () => {
    const author = { name: "Learner", email: "learner@git101.dev" };
    async function seed() {
      await git.init({ fs, dir: "/", defaultBranch: "main" });
      await git.setConfig({ fs, dir: "/", path: "user.name", value: "Learner" });
      await git.setConfig({ fs, dir: "/", path: "user.email", value: "learner@git101.dev" });
      await fs.promises.writeFile("/README.md", "# proj\n");
      await git.add({ fs, dir: "/", filepath: "README.md" });
      await git.commit({ fs, dir: "/", message: "init", author });
    }

    it("creates a lightweight tag on HEAD (silent) and lists it", async () => {
      await seed();
      const create = await gitCommands.tag(["v1.0.0"], ctx);
      expect(create.isError).toBeFalsy();
      expect(create.output).toBe("");
      expect(await git.listTags({ fs, dir: "/" })).toContain("v1.0.0");

      const list = await gitCommands.tag([], ctx);
      expect(list.output).toContain("v1.0.0");
    });

    it("lists tags sorted", async () => {
      await seed();
      await gitCommands.tag(["v1.1.0"], ctx);
      await gitCommands.tag(["v1.0.0"], ctx);
      const list = await gitCommands.tag([], ctx);
      expect(list.output).toBe("v1.0.0\nv1.1.0");
    });

    it("-d deletes a tag", async () => {
      await seed();
      await gitCommands.tag(["v1.0.0"], ctx);
      const del = await gitCommands.tag(["-d", "v1.0.0"], ctx);
      expect(del.output).toContain("Deleted tag 'v1.0.0'");
      expect(await git.listTags({ fs, dir: "/" })).not.toContain("v1.0.0");
    });
  });

  describe("git rebase", () => {
    const author = { name: "Learner", email: "learner@git101.dev" };

    async function commit(path: string, content: string, message: string) {
      await fs.promises.writeFile(path, content);
      await git.add({ fs, dir: "/", filepath: path.slice(1) });
      await git.commit({ fs, dir: "/", message, author });
    }

    async function seedRepo() {
      await git.init({ fs, dir: "/", defaultBranch: "main" });
      await git.setConfig({ fs, dir: "/", path: "user.name", value: "Learner" });
      await git.setConfig({ fs, dir: "/", path: "user.email", value: "learner@git101.dev" });
    }

    // main과 feature가 서로 다른 파일을 고쳐 갈라진 상태 (충돌 없음), feature 위에서 종료
    async function seedDiverged() {
      await seedRepo();
      await commit("/app.txt", "base\n", "c1 base");
      await git.branch({ fs, dir: "/", ref: "feature" });
      await git.checkout({ fs, dir: "/", ref: "feature" });
      await commit("/feature.txt", "feat\n", "c2 feature");
      await git.checkout({ fs, dir: "/", ref: "main" });
      await commit("/app.txt", "base\nfix\n", "c3 main fix");
      await git.checkout({ fs, dir: "/", ref: "feature" });
    }

    it("replays feature commits onto main: linear history, new hash, message preserved", async () => {
      await seedDiverged();
      const beforeTip = (await git.log({ fs, dir: "/" }))[0].oid;

      const result = await gitCommands.rebase(["main"], ctx);
      expect(result.isError).toBeFalsy();
      expect(result.output).toContain("Successfully rebased");

      const log = await git.log({ fs, dir: "/" });
      expect(log.map((e) => e.commit.message.trim())).toEqual(["c2 feature", "c3 main fix", "c1 base"]);
      expect(log.every((e) => e.commit.parent.length <= 1)).toBe(true); // 선형
      expect(log[0].oid).not.toBe(beforeTip); // 재적용된 커밋은 새 해시

      // 작업트리에 양쪽 변경이 모두 반영
      expect(await fs.promises.readFile("/app.txt", "utf8")).toBe("base\nfix\n");
      expect(await fs.promises.readFile("/feature.txt", "utf8")).toBe("feat\n");
    });

    it("reports up to date when the base is already an ancestor", async () => {
      await seedDiverged();
      await gitCommands.rebase(["main"], ctx);
      const again = await gitCommands.rebase(["main"], ctx);
      expect(again.output).toContain("up to date");
    });

    it("fast-forwards when the current branch has no commits of its own", async () => {
      await seedRepo();
      await commit("/app.txt", "base\n", "c1");
      await git.branch({ fs, dir: "/", ref: "feature" });
      await commit("/app.txt", "base\nmore\n", "c2 main only");
      await git.checkout({ fs, dir: "/", ref: "feature" });

      const result = await gitCommands.rebase(["main"], ctx);
      expect(result.output).toContain("Fast-forwarded");
      const featureTip = await git.resolveRef({ fs, dir: "/", ref: "feature" });
      const mainTip = await git.resolveRef({ fs, dir: "/", ref: "main" });
      expect(featureTip).toBe(mainTip);
    });

    it("aborts and restores the original state on conflict", async () => {
      // 같은 파일 같은 줄을 양쪽에서 수정 → cherry-pick 충돌
      await seedRepo();
      await commit("/app.txt", "hello\n", "c1");
      await git.branch({ fs, dir: "/", ref: "feature" });
      await git.checkout({ fs, dir: "/", ref: "feature" });
      await commit("/app.txt", "hello feature\n", "c2 feature edit");
      await git.checkout({ fs, dir: "/", ref: "main" });
      await commit("/app.txt", "hello main\n", "c3 main edit");
      await git.checkout({ fs, dir: "/", ref: "feature" });
      const beforeTip = (await git.log({ fs, dir: "/" }))[0].oid;

      const result = await gitCommands.rebase(["main"], ctx);
      expect(result.isError).toBe(true);
      expect(result.output).toContain("CONFLICT");

      // 원상 복구: 브랜치 팁과 작업트리가 rebase 이전 그대로
      expect((await git.log({ fs, dir: "/" }))[0].oid).toBe(beforeTip);
      expect(await fs.promises.readFile("/app.txt", "utf8")).toBe("hello feature\n");
    });

    it("requires a branch argument", async () => {
      await seedDiverged();
      const result = await gitCommands.rebase([], ctx);
      expect(result.isError).toBe(true);
      expect(result.output).toContain("usage");
    });

    it("refuses to start with uncommitted changes", async () => {
      await seedDiverged();
      await fs.promises.writeFile("/feature.txt", "dirty\n");
      const result = await gitCommands.rebase(["main"], ctx);
      expect(result.isError).toBe(true);
      expect(result.output).toContain("unstaged");
    });
  });
});
