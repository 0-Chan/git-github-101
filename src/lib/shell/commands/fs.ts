import type { CommandResult, ShellContext } from "@/types";
import { resolvePath } from "../filesystem";

type FsCommandHandler = (args: string[], ctx: ShellContext) => Promise<CommandResult>;

export const fsCommands: Record<string, FsCommandHandler> = {
  ls: async (args, ctx) => {
    const target = args[0] ? resolvePath(ctx.cwd, args[0]) : ctx.cwd;
    try {
      const entries = await ctx.fs.promises.readdir(target);
      return { output: entries.join("  ") };
    } catch {
      return { output: `ls: cannot access '${args[0] || target}': No such file or directory`, isError: true };
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
      "  ls [경로]              디렉토리 내용 나열",
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
      "  git log                커밋 히스토리",
      "  git branch <이름>      브랜치 생성",
      "  git checkout <브랜치>  브랜치 전환",
      "  git merge <브랜치>     브랜치 머지",
      "  git diff               변경사항 비교",
      "  git remote add <이름> <URL>  원격 저장소 추가",
      "  git push <원격> <브랜치>     푸시 (시뮬레이션)",
    ].join("\n");
    return { output: help };
  },
};
