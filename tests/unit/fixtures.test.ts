import git from "isomorphic-git";
import { describe, expect, it } from "vitest";
import { getFixture } from "@/lib/fixtures";
import { createFS } from "@/lib/shell/filesystem";
import { runValidation } from "@/lib/validation";

describe("fixtures", () => {
  it("first-repo: creates empty directory", async () => {
    const fs = createFS(`fixture-test-${Math.random()}`);
    const fixture = getFixture("first-repo");
    expect(fixture).toBeDefined();
    await fixture.setup(fs);
    // Should NOT have .git
    const entries = await fs.promises.readdir("/");
    expect(entries).not.toContain(".git");
  });

  it("first-commit: creates an initialized repo pointing at main (unborn, no commits)", async () => {
    const fs = createFS(`fixture-test-${Math.random()}`);
    const fixture = getFixture("first-commit");
    await fixture.setup(fs);
    // 브랜치 ref는 첫 커밋 때 생긴다. HEAD 심볼릭 참조만 main을 가리키면 된다
    expect(await git.currentBranch({ fs, dir: "/", fullname: false })).toBe("main");
    const entries = await fs.promises.readdir("/");
    expect(entries).toContain(".git");
  });

  it("commit-history: has multiple commits", async () => {
    const fs = createFS(`fixture-test-${Math.random()}`);
    const fixture = getFixture("commit-history");
    await fixture.setup(fs);
    const log = await git.log({ fs, dir: "/" });
    expect(log.length).toBeGreaterThanOrEqual(2);
  });

  it("merge-conflict: creates two branches with different content", async () => {
    const fs = createFS(`fixture-test-${Math.random()}`);
    const fixture = getFixture("merge-conflict");
    await fixture.setup(fs);
    const branches = await git.listBranches({ fs, dir: "/" });
    expect(branches).toContain("main");
    expect(branches).toContain("feature");
  });

  it("returns fixture with version number", () => {
    const fixture = getFixture("first-repo");
    expect(fixture.version).toBeTypeOf("number");
  });

  it("first-commit: starts with zero commits so lesson 03's commit step cannot pre-pass", async () => {
    const fs = createFS(`fixture-test-${Math.random()}`);
    const fixture = getFixture("first-commit");
    await fixture.setup(fs);

    // 커밋이 하나라도 있으면 commit-count(min 1) 검증이 git add만으로
    // 통과해버리는 회귀 (placeholder 커밋 버그)
    await expect(git.log({ fs, dir: "/" })).rejects.toThrow(); // unborn HEAD

    // 학생 플로우가 그대로 성립하는지: add(스테이징 검증) → 루트 커밋
    await fs.promises.writeFile("/hello.txt", "");
    await git.add({ fs, dir: "/", filepath: "hello.txt" });
    expect(await runValidation({ type: "git-staged", path: "hello.txt" }, fs, "/")).toBe(true);
    expect(await runValidation({ type: "commit-count", min: 1 }, fs, "/")).toBe(false);

    await git.commit({
      fs,
      dir: "/",
      message: "my first commit",
      author: { name: "Learner", email: "learner@git101.dev", timestamp: 100, timezoneOffset: 0 },
    });
    expect(await runValidation({ type: "commit-count", min: 1 }, fs, "/")).toBe(true);
  });

  it("rebase: starts on feature with main and feature diverged", async () => {
    const fs = createFS(`fixture-test-${Math.random()}`);
    const fixture = getFixture("rebase");
    await fixture.setup(fs);

    expect(await git.currentBranch({ fs, dir: "/" })).toBe("feature");
    const branches = await git.listBranches({ fs, dir: "/" });
    expect(branches).toContain("main");
    expect(branches).toContain("feature");
    // 아직 갈라진 상태 — 레슨의 rebased-onto 단계가 미리 통과하면 안 된다
    expect(await runValidation({ type: "rebased-onto", name: "main" }, fs, "/")).toBe(false);
  });
});
