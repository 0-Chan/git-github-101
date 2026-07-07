import git from "isomorphic-git";
import type { FixtureConfig } from "@/types";

const author = { name: "Learner", email: "learner@git101.dev" };

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
    version: 3,
    setup: async (fs) => {
      // 커밋 0개의 갓 초기화된 저장소. placeholder 커밋을 두면 commit-count
      // 검증(min 1)이 시작부터 충족되어 git add만으로 레슨이 완료되는 버그가
      // 있었다. 스테이징 검증·루트 커밋 모두 unborn HEAD에서 정상 동작한다.
      await initRepo(fs);
    },
  },
  "commit-history": {
    version: 2,
    setup: async (fs) => {
      await initRepo(fs);
      await addAndCommit(fs, "README.md", "# My Project", "start project");
      await addAndCommit(fs, "hello.txt", "Hello!", "add greeting");
      await addAndCommit(fs, "config.txt", "setting=true", "add config file");
    },
  },
  "modify-and-diff": {
    version: 2,
    setup: async (fs) => {
      await initRepo(fs);
      await addAndCommit(fs, "hello.txt", "Hello, World!", "create hello.txt");
    },
  },
  branches: {
    version: 2,
    setup: async (fs) => {
      await initRepo(fs);
      await addAndCommit(fs, "main.txt", "main content", "create main file");
    },
  },
  merge: {
    version: 3,
    setup: async (fs) => {
      await initRepo(fs);
      await addAndCommit(fs, "main.txt", "main", "commit on main");
      await git.branch({ fs, dir: "/", ref: "feature" });
      await git.checkout({ fs, dir: "/", ref: "feature" });
      await addAndCommit(fs, "feature.txt", "feature work", "commit on feature");
      // feature에 남겨둔다 — 레슨 스텝 1이 "main으로 이동"이므로
      // 시작점은 feature여야 한다.
    },
  },
  "merge-conflict": {
    version: 3,
    setup: async (fs) => {
      // 파일은 끝 줄바꿈으로 끝나야 한다 — 없으면 diff3가 충돌 마커를
      // 마지막 줄에 이어 붙여 <<<<<<< 블록이 깨진 모양으로 나온다.
      await initRepo(fs);
      await addAndCommit(fs, "greeting.txt", "Hello\n", "add greeting");
      await git.branch({ fs, dir: "/", ref: "feature" });
      await git.checkout({ fs, dir: "/", ref: "feature" });
      await fs.promises.writeFile("/greeting.txt", "Hi! Nice to meet you!\n");
      await git.add({ fs, dir: "/", filepath: "greeting.txt" });
      await git.commit({ fs, dir: "/", message: "feature: update greeting", author });
      await git.checkout({ fs, dir: "/", ref: "main" });
      await fs.promises.writeFile("/greeting.txt", "Hello! Welcome!\n");
      await git.add({ fs, dir: "/", filepath: "greeting.txt" });
      await git.commit({ fs, dir: "/", message: "main: update greeting", author });
    },
  },
  remote: {
    version: 2,
    setup: async (fs) => {
      await initRepo(fs);
      await addAndCommit(fs, "README.md", "# My Project", "start project");
    },
  },
  reset: {
    version: 1,
    setup: async (fs) => {
      // 정상 커밋 2개 위에 버릴 "실수" 커밋 1개를 얹는다. 레슨에서
      // reset --hard HEAD~1로 마지막 커밋을 되돌린다.
      await initRepo(fs);
      await addAndCommit(fs, "hello.txt", "Hello, Git!\n", "create hello.txt");
      await addAndCommit(fs, "hello.txt", "Hello, Git!\nSecond line.\n", "add second line");
      await addAndCommit(fs, "hello.txt", "Hello, Git!\nSecond line.\nOops, mistake!\n", "WIP: 실수로 남긴 커밋");
    },
  },
  stash: {
    version: 1,
    setup: async (fs) => {
      // 커밋된 파일 하나, 작업트리는 깨끗. 레슨에서 edit으로 더티 변경을
      // 만든 뒤 stash로 치웠다가 pop으로 되꺼낸다.
      await initRepo(fs);
      await addAndCommit(fs, "hello.txt", "Hello, Git!\n", "create hello.txt");
    },
  },
};

export function getFixture(slug: string): FixtureConfig {
  return fixtures[slug] || { version: 1, setup: async () => {} };
}

export const FIXTURE_VERSION_KEY = "git101-fixture-versions";
