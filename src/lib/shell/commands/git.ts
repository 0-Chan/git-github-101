import { diffLines } from "diff";
import git from "isomorphic-git";
import type { CommandResult, ShellContext } from "@/types";

type GitSubcommand = (args: string[], ctx: ShellContext) => Promise<CommandResult>;

function errorResult(err: unknown, hint: string): CommandResult {
  const msg = err instanceof Error ? err.message : String(err);
  return { output: `${msg}\n💡 ${hint}`, isError: true };
}

interface LogEntry {
  oid: string;
  commit: { parent: string[]; message: string; author: { name: string; email: string; timestamp: number } };
}

/**
 * 2레인 ASCII 그래프. 튜토리얼 저장소의 세 형태(선형·분기·머지)를 실제 git과
 * 같은 모양으로 그린다. 3레인 이상이 필요해지면 null을 돌려 폴백시킨다.
 */
function buildGraph(commits: LogEntry[]): { commitPrefix: string; bodyPrefix: string; rowsAfter: string[] }[] | null {
  const lanes: string[] = [];
  const out: { commitPrefix: string; bodyPrefix: string; rowsAfter: string[] }[] = [];

  for (const entry of commits) {
    let lane = lanes.indexOf(entry.oid);
    if (lane === -1) {
      lanes.push(entry.oid);
      lane = lanes.length - 1;
    }
    if (lanes.length > 2) return null;

    const commitPrefix = lanes.map((_, i) => (i === lane ? "*" : "|")).join(" ");
    const rowsAfter: string[] = [];
    const parents = entry.commit.parent;

    if (parents.length === 0) {
      lanes.splice(lane, 1);
    } else {
      lanes[lane] = parents[0];
      if (parents.length > 1) {
        lanes.splice(lane + 1, 0, parents[1]);
        if (lanes.length > 2) return null;
        rowsAfter.push("|\\");
      }
    }

    // 두 레인이 같은 커밋으로 수렴하면 |/ 로 합친다
    if (lanes.length === 2 && lanes[0] === lanes[1]) {
      rowsAfter.push("|/");
      lanes.pop();
    }

    const bodyPrefix = lanes.map(() => "|").join(" ") || " ";
    out.push({ commitPrefix, bodyPrefix, rowsAfter });
  }
  return out;
}

export const gitCommands: Record<string, GitSubcommand> = {
  async init(_args, ctx) {
    try {
      const { fs, dir } = ctx;
      await git.init({ fs, dir, defaultBranch: "main" });
      await git.setConfig({ fs, dir, path: "user.name", value: "Learner" });
      await git.setConfig({ fs, dir, path: "user.email", value: "learner@git101.dev" });
      return { output: `Initialized empty Git repository in ${dir === "/" ? "" : dir}/.git/` };
    } catch (err) {
      return errorResult(err, "git init은 새로운 저장소를 만드는 명령어입니다.");
    }
  },

  async add(args, ctx) {
    try {
      const { fs, dir } = ctx;
      if (args.length === 0) {
        return {
          output: "Nothing specified, nothing added.\n💡 추가할 파일을 지정하세요. 예: git add <파일명>",
          isError: true,
        };
      }

      if (args[0] === ".") {
        // Add all untracked/modified files
        const matrix = await git.statusMatrix({ fs, dir });
        for (const [filepath, head, workdir, stage] of matrix) {
          if (workdir !== head || stage !== workdir) {
            await git.add({ fs, dir, filepath });
          }
        }
      } else {
        for (const filepath of args) {
          await git.add({ fs, dir, filepath });
        }
      }

      return { output: "" };
    } catch (err) {
      return errorResult(err, "파일을 스테이징 영역에 추가하려면 git add <파일명>을 사용하세요.");
    }
  },

  async status(_args, ctx) {
    try {
      const { fs, dir } = ctx;
      const matrix = await git.statusMatrix({ fs, dir });
      const staged: string[] = [];
      const modified: string[] = [];
      const untracked: string[] = [];

      for (const [filepath, head, workdir, stage] of matrix) {
        if (head === 0 && stage === 0 && workdir === 2) {
          // Untracked
          untracked.push(filepath as string);
        } else if (head === 0 && stage === 2) {
          // New file staged
          staged.push(`new file:   ${filepath}`);
        } else if (head === 1 && stage === 2) {
          // Modified and staged
          staged.push(`modified:   ${filepath}`);
        } else if (head === 1 && workdir === 2 && stage === 1) {
          // Modified but not staged
          modified.push(filepath as string);
        }
      }

      const lines: string[] = [];
      const branch = (await git.currentBranch({ fs, dir })) || "main";
      lines.push(`On branch ${branch}`);

      if (staged.length > 0) {
        lines.push("");
        lines.push("Changes to be committed:");
        for (const s of staged) {
          lines.push(`\t${s}`);
        }
      }

      if (modified.length > 0) {
        lines.push("");
        lines.push("Changes not staged for commit:");
        for (const m of modified) {
          lines.push(`\tmodified:   ${m}`);
        }
      }

      if (untracked.length > 0) {
        lines.push("");
        lines.push("Untracked files:");
        for (const u of untracked) {
          lines.push(`\t${u}`);
        }
      }

      if (staged.length === 0 && modified.length === 0 && untracked.length === 0) {
        lines.push("");
        lines.push("nothing to commit, working tree clean");
      }

      return { output: lines.join("\n") };
    } catch (err) {
      return errorResult(err, "현재 저장소의 상태를 확인하는 명령어입니다.");
    }
  },

  async commit(args, ctx) {
    try {
      const { fs, dir } = ctx;
      const mIdx = args.indexOf("-m");
      if (mIdx === -1 || mIdx + 1 >= args.length) {
        return {
          output: 'error: switch `m` requires a value\n💡 커밋 메시지를 입력하세요. 예: git commit -m "메시지"',
          isError: true,
        };
      }

      const message = args[mIdx + 1];
      const name = (await git.getConfig({ fs, dir, path: "user.name" })) || "학습자";
      const email = (await git.getConfig({ fs, dir, path: "user.email" })) || "learner@git101.dev";
      const author = { name, email };

      const commitOptions: any = { fs, dir, message, author };

      // Handle merge commit
      if (ctx.pendingMerge) {
        const headOid = await git.resolveRef({ fs, dir, ref: "HEAD" });
        commitOptions.parent = [headOid, ctx.pendingMerge.theirs];
        const oid = await git.commit(commitOptions);
        ctx.setPendingMerge(null);
        const short = oid.slice(0, 7);
        return { output: `[merge ${short}] ${message}` };
      }

      const oid = await git.commit(commitOptions);
      const branch = (await git.currentBranch({ fs, dir })) || "main";
      const short = oid.slice(0, 7);
      return { output: `[${branch} ${short}] ${message}` };
    } catch (err) {
      return errorResult(err, "변경사항을 커밋하려면 먼저 git add로 파일을 추가하세요.");
    }
  },

  async log(args, ctx) {
    try {
      const { fs, dir } = ctx;
      let oneline = false;
      let graph = false;
      let all = false;
      for (const arg of args) {
        if (arg === "--oneline") oneline = true;
        else if (arg === "--graph") graph = true;
        else if (arg === "--all") all = true;
        else {
          return {
            output: `fatal: unrecognized argument: ${arg}\n💡 지원하는 옵션: --oneline, --graph, --all`,
            isError: true,
          };
        }
      }

      const current = (await git.currentBranch({ fs, dir })) || null;
      const branches = await git.listBranches({ fs, dir });

      // 커밋 수집 (--all이면 모든 브랜치의 합집합, oid로 중복 제거)
      const refs = all ? [...new Set([...(current ? [current] : []), ...branches])] : ["HEAD"];
      const byOid = new Map<string, LogEntry>();
      for (const ref of refs) {
        const entries = (await git.log({ fs, dir, ref, depth: 50 })) as LogEntry[];
        for (const e of entries) if (!byOid.has(e.oid)) byOid.set(e.oid, e);
      }

      // 세대 수(루트로부터의 깊이) 내림차순 정렬 — 픽스처 커밋들은 같은 초에
      // 만들어질 수 있어 타임스탬프만으로는 자식이 부모보다 먼저임을 보장 못 한다.
      const gen = new Map<string, number>();
      const genOf = (oid: string): number => {
        if (gen.has(oid)) return gen.get(oid) as number;
        gen.set(oid, 0); // 사이클 방어
        const e = byOid.get(oid);
        const g = e ? 1 + Math.max(0, ...e.commit.parent.map(genOf)) : 0;
        gen.set(oid, g);
        return g;
      };
      const commits = [...byOid.values()].sort((a, b) => {
        const dg = genOf(b.oid) - genOf(a.oid);
        if (dg !== 0) return dg;
        return b.commit.author.timestamp - a.commit.author.timestamp;
      });

      // 브랜치 데코레이션: (HEAD -> main), (feature)
      const deco = new Map<string, string[]>();
      for (const b of branches) {
        const oid = await git.resolveRef({ fs, dir, ref: b });
        const label = b === current ? `HEAD -> ${b}` : b;
        deco.set(oid, [...(deco.get(oid) ?? []), label]);
      }
      const decoStr = (oid: string) => (deco.has(oid) ? ` (${(deco.get(oid) as string[]).join(", ")})` : "");

      const graphRows = graph ? buildGraph(commits) : null;
      const graphNote = graph && !graphRows ? "(그래프 표시는 브랜치 2개까지 지원합니다)\n" : "";

      const lines: string[] = [];
      commits.forEach((entry, i) => {
        const short = entry.oid.slice(0, 7);
        const row = graphRows?.[i];
        const commitPrefix = row ? `${row.commitPrefix} ` : "";
        const bodyPrefix = row ? `${row.bodyPrefix} ` : "";

        if (oneline) {
          lines.push(`${commitPrefix}${short}${decoStr(entry.oid)} ${entry.commit.message.trim().split("\n")[0]}`);
        } else {
          const date = new Date(entry.commit.author.timestamp * 1000).toLocaleString();
          lines.push(`${commitPrefix}commit ${short}${decoStr(entry.oid)}`);
          lines.push(`${bodyPrefix}Author: ${entry.commit.author.name} <${entry.commit.author.email}>`);
          lines.push(`${bodyPrefix}Date:   ${date}`);
          lines.push(bodyPrefix.trimEnd());
          lines.push(`${bodyPrefix}    ${entry.commit.message.trim()}`);
          if (i < commits.length - 1) lines.push(bodyPrefix.trimEnd());
        }
        if (row) for (const extra of row.rowsAfter) lines.push(extra);
      });

      return { output: graphNote + lines.join("\n").trimEnd() };
    } catch (err) {
      return errorResult(err, "커밋 기록을 확인하는 명령어입니다. 먼저 커밋을 만들어보세요.");
    }
  },

  async branch(args, ctx) {
    try {
      const { fs, dir } = ctx;

      if (args.length === 0) {
        // List branches
        const branches = await git.listBranches({ fs, dir });
        const current = await git.currentBranch({ fs, dir });
        const lines = branches.map((b) => (b === current ? `* ${b}` : `  ${b}`));
        return { output: lines.join("\n") };
      }

      if (args[0] === "-d" || args[0] === "-D") {
        const ref = args[1];
        if (!ref) {
          return { output: "error: branch name required after -d\n💡 삭제할 브랜치 이름을 입력하세요.", isError: true };
        }
        const current = await git.currentBranch({ fs, dir });
        if (ref === current) {
          return { output: `error: Cannot delete branch '${ref}' checked out`, isError: true };
        }
        await git.deleteBranch({ fs, dir, ref });
        return { output: `Deleted branch ${ref}` };
      }

      // Create branch
      await git.branch({ fs, dir, ref: args[0] });
      return { output: "" };
    } catch (err) {
      return errorResult(err, "브랜치를 만들거나 목록을 확인하는 명령어입니다.");
    }
  },

  async checkout(args, ctx) {
    try {
      const { fs, dir } = ctx;

      if (args.length === 0) {
        return { output: "error: branch name required\n💡 전환할 브랜치 이름을 입력하세요.", isError: true };
      }

      if (args[0] === "-b") {
        if (args.length < 2) {
          return { output: "error: branch name required after -b\n💡 새 브랜치 이름을 입력하세요.", isError: true };
        }
        const ref = args[1];
        await git.branch({ fs, dir, ref });
        await git.checkout({ fs, dir, ref });
        return { output: `Switched to a new branch '${ref}'` };
      }

      const ref = args[0];
      await git.checkout({ fs, dir, ref });
      return { output: `Switched to branch '${ref}'` };
    } catch (err) {
      return errorResult(err, "브랜치를 전환하는 명령어입니다. git branch로 브랜치 목록을 확인하세요.");
    }
  },

  async merge(args, ctx) {
    try {
      const { fs, dir } = ctx;

      if (args.length === 0) {
        return { output: "error: branch name required\n💡 병합할 브랜치 이름을 입력하세요.", isError: true };
      }

      const theirs = args[0];
      const name = (await git.getConfig({ fs, dir, path: "user.name" })) || "학습자";
      const email = (await git.getConfig({ fs, dir, path: "user.email" })) || "learner@git101.dev";
      const author = { name, email };
      const ours = (await git.currentBranch({ fs, dir })) || "main";
      const beforeOid = await git.resolveRef({ fs, dir, ref: "HEAD" });

      try {
        const mergeResult = await git.merge({
          fs,
          dir,
          ours,
          theirs,
          author,
          abortOnConflict: false,
        });

        // Check if the merge produced a clean result
        if (mergeResult.alreadyMerged) {
          return { output: "Already up to date." };
        }

        // Fast-forward or clean merge succeeded
        // Checkout the merged tree
        await git.checkout({ fs, dir, ref: ours });

        if (mergeResult.fastForward) {
          const afterOid = await git.resolveRef({ fs, dir, ref: "HEAD" });
          return { output: `Updating ${beforeOid.slice(0, 7)}..${afterOid.slice(0, 7)}\nFast-forward` };
        }
        return { output: "Merge made by the 'ort' strategy." };
      } catch (_mergeErr: any) {
        // Merge conflict - isomorphic-git throws on conflicts
        const theirsOid = await git.resolveRef({ fs, dir, ref: theirs });
        ctx.setPendingMerge({ theirs: theirsOid });

        return {
          output: `Auto-merging failed\nCONFLICT (content): Merge conflict detected\n💡 충돌을 해결한 후 git add와 git commit을 사용하세요.`,
        };
      }
    } catch (err) {
      return errorResult(err, "브랜치를 병합하는 명령어입니다.");
    }
  },

  async diff(args, ctx) {
    try {
      const { fs, dir } = ctx;
      const staged = args.includes("--staged") || args.includes("--cached");
      const unknown = args.find((a) => a !== "--staged" && a !== "--cached");
      if (unknown) {
        return { output: `fatal: unrecognized argument: ${unknown}\n💡 지원하는 옵션: --staged`, isError: true };
      }

      const readHead = async (filepath: string): Promise<string> => {
        try {
          const headCommit = await git.resolveRef({ fs, dir, ref: "HEAD" });
          const { blob } = await git.readBlob({ fs, dir, oid: headCommit, filepath });
          return new TextDecoder().decode(blob);
        } catch {
          return ""; // HEAD에 없는 파일
        }
      };
      const readWorkdir = async (filepath: string): Promise<string> => {
        try {
          return await fs.promises.readFile(`${dir === "/" ? "" : dir}/${filepath}`, "utf8");
        } catch {
          return "";
        }
      };

      // --staged: 인덱스(스테이지)에 올라간 내용을 blob oid로 읽는다
      const stagedOids = new Map<string, string>();
      if (staged) {
        await git.walk({
          fs,
          dir,
          trees: [git.STAGE()],
          map: async (filepath: string, entries: any[]) => {
            const entry = entries?.[0];
            if (entry && filepath !== "." && (await entry.type()) === "blob") {
              stagedOids.set(filepath, await entry.oid());
            }
            return true;
          },
        });
      }

      const matrix = await git.statusMatrix({ fs, dir });
      const lines: string[] = [];

      for (const [filepath, head, workdir, stage] of matrix) {
        let oldContent: string;
        let newContent: string;
        let isNew: boolean;

        if (staged) {
          // HEAD vs 스테이지 — 스테이지가 HEAD와 다른 파일만
          if (stage < 2) continue;
          isNew = head === 0;
          oldContent = isNew ? "" : await readHead(filepath as string);
          const oid = stagedOids.get(filepath as string);
          if (oid === undefined) continue;
          const { blob } = await git.readBlob({ fs, dir, oid });
          newContent = new TextDecoder().decode(blob);
        } else if (workdir === 2 && head >= 1) {
          // 수정됐지만 스테이징 안 된 변경: HEAD vs 워킹 디렉토리
          isNew = false;
          oldContent = await readHead(filepath as string);
          newContent = await readWorkdir(filepath as string);
        } else if (head === 0 && workdir === 2 && stage === 0) {
          // 새 untracked 파일
          isNew = true;
          oldContent = "";
          newContent = await readWorkdir(filepath as string);
        } else {
          continue;
        }

        if (oldContent === newContent) continue;

        lines.push(`diff --git a/${filepath} b/${filepath}`);
        if (isNew) {
          lines.push("new file");
          lines.push("--- /dev/null");
        } else {
          lines.push(`--- a/${filepath}`);
        }
        lines.push(`+++ b/${filepath}`);

        const changes = diffLines(oldContent, newContent);
        for (const part of changes) {
          const prefix = part.added ? "+" : part.removed ? "-" : " ";
          if (isNew && !part.added) continue; // 새 파일은 전부 + 로만
          for (const l of part.value.replace(/\n$/, "").split("\n")) {
            lines.push(`${prefix}${l}`);
          }
        }
        lines.push("");
      }

      return { output: lines.join("\n").trimEnd() };
    } catch (err) {
      return errorResult(err, "변경사항을 확인하는 명령어입니다.");
    }
  },

  async remote(args, ctx) {
    try {
      const { fs, dir } = ctx;

      if (args.length === 0) {
        // List remotes
        const remotes = await git.listRemotes({ fs, dir });
        return { output: remotes.map((r) => r.remote).join("\n") };
      }

      if (args[0] === "-v") {
        const remotes = await git.listRemotes({ fs, dir });
        const lines = remotes.flatMap((r) => [`${r.remote}\t${r.url} (fetch)`, `${r.remote}\t${r.url} (push)`]);
        return { output: lines.join("\n") };
      }

      if (args[0] === "add") {
        if (args.length < 3) {
          return { output: "error: usage: git remote add <name> <url>\n💡 리모트 저장소를 추가하세요.", isError: true };
        }
        const remote = args[1];
        const url = args[2];
        await git.addRemote({ fs, dir, remote, url });
        return { output: "" };
      }

      return { output: `error: Unknown subcommand: ${args[0]}\n💡 사용법: git remote add <이름> <URL>`, isError: true };
    } catch (err) {
      return errorResult(err, "원격 저장소를 관리하는 명령어입니다.");
    }
  },

  async push(args, ctx) {
    try {
      const { fs, dir } = ctx;
      const branch = (await git.currentBranch({ fs, dir })) || "main";
      const remotes = await git.listRemotes({ fs, dir });
      const remoteName = args[0] || (remotes.length > 0 ? remotes[0].remote : "origin");

      const lines = [
        "Enumerating objects... done.",
        "Counting objects... done.",
        "Writing objects... done.",
        `Branch '${branch}' pushed to '${remoteName}'`,
      ];
      return { output: lines.join("\n") };
    } catch (err) {
      return errorResult(err, "원격 저장소에 변경사항을 보내는 명령어입니다.");
    }
  },
};
