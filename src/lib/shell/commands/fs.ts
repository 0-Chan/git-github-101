import type { CommandResult, ShellContext } from "@/types";
import { resolvePath } from "../filesystem";

type FsCommandHandler = (args: string[], ctx: ShellContext) => Promise<CommandResult>;

export const fsCommands: Record<string, FsCommandHandler> = {
  ls: async (args, ctx) => {
    const flags = new Set<string>();
    let pathArg: string | undefined;
    for (const arg of args) {
      if (arg.startsWith("-") && arg.length > 1) {
        for (const ch of arg.slice(1)) {
          if (ch !== "a" && ch !== "l") {
            return {
              output: `ls: invalid option -- '${ch}'\n💡 지원하는 옵션: -a (숨김 파일 표시), -l (자세히 보기)`,
              isError: true,
            };
          }
          flags.add(ch);
        }
      } else if (pathArg === undefined) {
        pathArg = arg;
      }
    }

    const target = pathArg ? resolvePath(ctx.cwd, pathArg) : ctx.cwd;
    try {
      let entries: string[] = await ctx.fs.promises.readdir(target);
      // 진짜 ls처럼 숨김 파일(.git 등)은 -a를 줘야 보인다
      if (!flags.has("a")) entries = entries.filter((e) => !e.startsWith("."));
      entries.sort();

      if (!flags.has("l")) return { output: entries.join("  ") };

      const lines: string[] = [];
      for (const name of entries) {
        const stat = await ctx.fs.promises.stat(resolvePath(target, name));
        const type = stat.isDirectory() ? "d" : "-";
        const size = String(stat.isDirectory() ? 0 : (stat.size ?? 0)).padStart(6);
        lines.push(`${type} ${size}  ${name}`);
      }
      return { output: lines.join("\n") };
    } catch {
      return { output: `ls: cannot access '${pathArg || target}': No such file or directory`, isError: true };
    }
  },
  cat: async (args, ctx) => {
    if (!args[0]) return { output: "cat: missing file operand", isError: true };
    const filePath = resolvePath(ctx.cwd, args[0]);
    try {
      const content = await ctx.fs.promises.readFile(filePath, "utf8");
      return { output: content };
    } catch {
      return { output: `cat: ${args[0]}: No such file or directory`, isError: true };
    }
  },
  mkdir: async (args, ctx) => {
    if (!args[0]) return { output: "mkdir: missing operand", isError: true };
    const dirPath = resolvePath(ctx.cwd, args[0]);
    try {
      await ctx.fs.promises.mkdir(dirPath);
      return { output: "" };
    } catch {
      return { output: `mkdir: cannot create directory '${args[0]}': File exists`, isError: true };
    }
  },
  touch: async (args, ctx) => {
    if (!args[0]) return { output: "touch: missing file operand", isError: true };
    const filePath = resolvePath(ctx.cwd, args[0]);
    try {
      await ctx.fs.promises.readFile(filePath);
    } catch {
      await ctx.fs.promises.writeFile(filePath, "");
    }
    return { output: "" };
  },
  echo: async (args) => {
    return { output: args.join(" ") };
  },
  edit: async (args, ctx) => {
    if (!args[0]) return { output: "edit: missing file operand\n사용법: edit <파일>", isError: true };
    const filePath = resolvePath(ctx.cwd, args[0]);
    try {
      const stat = await ctx.fs.promises.stat(filePath);
      if (stat.isDirectory()) {
        return { output: `edit: ${args[0]}: Is a directory`, isError: true };
      }
      const content = await ctx.fs.promises.readFile(filePath, "utf8");
      return { output: "", edit: { path: filePath, content } };
    } catch {
      // 없는 파일 — 빈 에디터를 열고 저장 시 생성한다
      return { output: "", edit: { path: filePath, content: "" } };
    }
  },
  cd: async (args, ctx) => {
    if (!args[0] || args[0] === "~") return { output: "", cwd: "/" };
    const target = resolvePath(ctx.cwd, args[0]);
    try {
      const stat = await ctx.fs.promises.stat(target);
      if (!stat.isDirectory()) {
        return { output: `cd: not a directory: ${args[0]}`, isError: true };
      }
      return { output: "", cwd: target };
    } catch {
      return { output: `cd: no such file or directory: ${args[0]}`, isError: true };
    }
  },
  pwd: async (_args, ctx) => {
    return { output: ctx.cwd };
  },
  clear: async () => {
    return { output: "", clear: true };
  },
  help: async () => {
    const help = [
      "사용 가능한 명령어:",
      "",
      "📁 파일 시스템:",
      "  ls [-a] [-l] [경로]    디렉토리 내용 나열 (-a: 숨김 파일, -l: 자세히)",
      "  cat <파일>             파일 내용 출력",
      "  mkdir <디렉토리>       디렉토리 생성",
      "  touch <파일>           빈 파일 생성",
      "  edit <파일>            에디터로 파일 열기/수정",
      '  echo "텍스트" > 파일   파일에 쓰기',
      '  echo "텍스트" >> 파일  파일에 추가',
      "  cd <디렉토리>          작업 디렉토리 변경",
      "  pwd                    현재 디렉토리 출력",
      "  clear                  화면 지우기",
      "",
      "🔧 Git:",
      "  git init               저장소 초기화",
      "  git add <파일>         스테이징",
      "  git status             상태 확인",
      '  git commit -m "메시지" 커밋',
      "  git log [--oneline] [--graph] [--all]  커밋 히스토리",
      "  git branch [-d] <이름> 브랜치 생성/삭제 (인자 없으면 목록)",
      "  git checkout <브랜치>  브랜치 전환",
      "  git merge <브랜치>     브랜치 머지",
      "  git diff [--staged]    변경사항 비교",
      "  git reset [--soft|--hard] <대상>  커밋 되돌리기 (예: git reset --hard HEAD~1)",
      "  git stash [pop|list]   하던 작업 잠깐 치워두기/꺼내기",
      "  git tag [<이름>]       태그 생성/목록 (예: git tag v1.0.0)",
      "  git remote add <이름> <URL>  원격 저장소 추가 (-v: 목록)",
      "  git push <원격> <브랜치>     푸시 (시뮬레이션)",
    ].join("\n");
    return { output: help };
  },
};
