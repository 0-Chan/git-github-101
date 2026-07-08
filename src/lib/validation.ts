import git from "isomorphic-git";
import type { ValidationRule } from "@/types";

export interface ValidationContext {
  /** 레슨 터미널에서 실행된 명령 히스토리 (oldest→newest) */
  history?: string[];
}

export async function runValidation(
  rule: ValidationRule,
  fs: any,
  dir: string,
  context?: ValidationContext,
): Promise<boolean> {
  try {
    switch (rule.type) {
      case "command-run": {
        // 읽기 명령(git log 등)은 상태를 바꾸지 않아 결과 스냅샷으로 검증할
        // 수 없다 — 실제로 실행했는지를 명령 히스토리로 판정한다.
        const pattern = new RegExp(rule.matches ?? "$^");
        return (context?.history ?? []).some((cmd) => pattern.test(cmd.trim()));
      }
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
      case "tag-exists": {
        const tags = await git.listTags({ fs, dir });
        return tags.includes(rule.name!);
      }
      case "file-modified": {
        // 추적 중인 파일에 커밋되지 않은 변경이 있으면 통과. 내용은 묻지 않는다
        // (어떤 수정이든 인정) — "더티 상태 만들기"가 목적인 단계용.
        const matrix = await git.statusMatrix({ fs, dir, filepaths: [rule.path!] });
        const row = matrix.find((r: any) => r[0] === rule.path);
        return row ? row[1] === 1 && row[2] === 2 : false; // HEAD에 있고 workdir이 달라짐
      }
      case "rebased-onto": {
        // rebase 성공 판정: base 브랜치 팁이 HEAD의 조상이고(HEAD 자신은 아님),
        // 그 사이 히스토리가 전부 단일 부모(선형)여야 한다 — merge로는 통과 불가.
        const baseTip = await git.resolveRef({ fs, dir, ref: `refs/heads/${rule.name!}` });
        const log = await git.log({ fs, dir, ref: "HEAD" });
        if (log.length === 0 || log[0].oid === baseTip) return false;
        for (const entry of log) {
          if (entry.oid === baseTip) return true;
          if (entry.commit.parent.length !== 1) return false;
        }
        return false;
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
  context?: ValidationContext,
): Promise<boolean[]> {
  return Promise.all(steps.map((step) => runValidation(step.validation, fs, dir, context)));
}
