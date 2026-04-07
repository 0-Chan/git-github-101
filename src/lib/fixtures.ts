import git from "isomorphic-git";
import type { FixtureConfig } from "@/types";

const author = { name: "학습자", email: "learner@git101.dev" };

async function initRepo(fs: any) {
  await git.init({ fs, dir: "/", defaultBranch: "main" });
  await git.setConfig({ fs, dir: "/", path: "user.name", value: author.name });
  await git.setConfig({ fs, dir: "/", path: "user.email", value: author.email });
}

async function addAndCommit(fs: any, filepath: string, content: string, message: string) {
  await fs.promises.writeFile(`/${filepath}`, content);
  await git.add({ fs, dir: "/", filepath });
  await git.commit({ fs, dir: "/", message, author });
}

const fixtures: Record<string, FixtureConfig> = {
  "first-repo": {
    version: 1,
    setup: async () => {
      /* empty directory, nothing to do */
    },
  },
  "first-commit": {
    version: 1,
    setup: async (fs) => {
      await initRepo(fs);
      // Commit a placeholder so the 'main' branch ref is created;
      // then remove it so the working tree appears empty for the learner.
      await addAndCommit(fs, ".gitkeep", "", "(초기 설정)");
      await fs.promises.unlink("/.gitkeep");
    },
  },
  "commit-history": {
    version: 1,
    setup: async (fs) => {
      await initRepo(fs);
      await addAndCommit(fs, "README.md", "# My Project", "프로젝트 시작");
      await addAndCommit(fs, "hello.txt", "Hello!", "인사말 추가");
      await addAndCommit(fs, "config.txt", "setting=true", "설정 파일 추가");
    },
  },
  "modify-and-diff": {
    version: 1,
    setup: async (fs) => {
      await initRepo(fs);
      await addAndCommit(fs, "hello.txt", "Hello, World!", "파일 생성");
    },
  },
  branches: {
    version: 1,
    setup: async (fs) => {
      await initRepo(fs);
      await addAndCommit(fs, "main.txt", "main content", "main 파일 생성");
    },
  },
  merge: {
    version: 1,
    setup: async (fs) => {
      await initRepo(fs);
      await addAndCommit(fs, "main.txt", "main", "main 커밋");
      await git.branch({ fs, dir: "/", ref: "feature" });
      await git.checkout({ fs, dir: "/", ref: "feature" });
      await addAndCommit(fs, "feature.txt", "feature work", "feature 커밋");
      await git.checkout({ fs, dir: "/", ref: "main" });
    },
  },
  "merge-conflict": {
    version: 1,
    setup: async (fs) => {
      await initRepo(fs);
      await addAndCommit(fs, "greeting.txt", "안녕하세요", "인사말 추가");
      await git.branch({ fs, dir: "/", ref: "feature" });
      await git.checkout({ fs, dir: "/", ref: "feature" });
      await fs.promises.writeFile("/greeting.txt", "안녕! 반가워!");
      await git.add({ fs, dir: "/", filepath: "greeting.txt" });
      await git.commit({ fs, dir: "/", message: "feature: 인사말 수정", author });
      await git.checkout({ fs, dir: "/", ref: "main" });
      await fs.promises.writeFile("/greeting.txt", "안녕하세요! 환영합니다!");
      await git.add({ fs, dir: "/", filepath: "greeting.txt" });
      await git.commit({ fs, dir: "/", message: "main: 인사말 수정", author });
    },
  },
  remote: {
    version: 1,
    setup: async (fs) => {
      await initRepo(fs);
      await addAndCommit(fs, "README.md", "# My Project", "프로젝트 시작");
    },
  },
};

export function getFixture(slug: string): FixtureConfig {
  return fixtures[slug] || { version: 1, setup: async () => {} };
}

export const FIXTURE_VERSION_KEY = "git101-fixture-versions";
