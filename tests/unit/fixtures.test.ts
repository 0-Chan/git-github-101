import git from "isomorphic-git";
import { describe, expect, it } from "vitest";
import { getFixture } from "@/lib/fixtures";
import { createFS } from "@/lib/shell/filesystem";

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

  it("first-commit: creates initialized repo", async () => {
    const fs = createFS(`fixture-test-${Math.random()}`);
    const fixture = getFixture("first-commit");
    await fixture.setup(fs);
    const branches = await git.listBranches({ fs, dir: "/" });
    expect(branches).toContain("main");
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
});
