import git from "isomorphic-git";
import type { ValidationRule } from "@/types";

export async function runValidation(rule: ValidationRule, fs: any, dir: string): Promise<boolean> {
  try {
    switch (rule.type) {
      case "file-exists": {
        await fs.promises.stat(rule.path!);
        return true;
      }
      case "file-content": {
        const content = await fs.promises.readFile(rule.path!, "utf8");
        if (rule.contains) return content.includes(rule.contains);
        if (rule.matches) return new RegExp(rule.matches).test(content);
        return false;
      }
      case "git-staged": {
        const matrix = await git.statusMatrix({ fs, dir });
        const entry = matrix.find((row: any) => row[0] === rule.path);
        return entry ? entry[3] === 2 : false; // [filepath, HEAD, WORKDIR, STAGE]
      }
      case "commit-count": {
        const log = await git.log({ fs, dir });
        return log.length >= (rule.min || 1);
      }
      case "branch-exists": {
        const branches = await git.listBranches({ fs, dir });
        return branches.includes(rule.name!);
      }
      case "current-branch": {
        const current = await git.currentBranch({ fs, dir });
        return current === rule.name;
      }
      case "commit-message": {
        const log = await git.log({ fs, dir, depth: 1 });
        if (log.length === 0) return false;
        return new RegExp(rule.pattern!).test(log[0].commit.message);
      }
      case "merge-commit": {
        const log = await git.log({ fs, dir, depth: 1 });
        if (log.length === 0) return false;
        return log[0].commit.parent.length === 2;
      }
      case "no-conflict-markers": {
        const content = await fs.promises.readFile(rule.path!, "utf8");
        return !content.includes("<<<<<<<") && !content.includes(">>>>>>>");
      }
      case "remote-exists": {
        const remotes = await git.listRemotes({ fs, dir });
        return remotes.some((r: any) => r.remote === rule.name);
      }
      default:
        return false;
    }
  } catch {
    return false;
  }
}

export async function validateAllSteps(
  steps: Array<{ validation: ValidationRule }>,
  fs: any,
  dir: string,
): Promise<boolean[]> {
  return Promise.all(steps.map((step) => runValidation(step.validation, fs, dir)));
}
