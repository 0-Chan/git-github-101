import type { CommandResult, ParsedCommand, ShellContext } from "@/types";
import { fsCommands } from "./fs";
import { gitCommands } from "./git";

export async function executeCommand(parsed: ParsedCommand, ctx: ShellContext): Promise<CommandResult> {
  if (parsed.command === "git") {
    const subcommand = parsed.args[0];
    if (!subcommand) return { output: "usage: git <command> [<args>]", isError: true };
    const handler = gitCommands[subcommand];
    if (!handler)
      return {
        output: `git: '${subcommand}' is not a git command.\n💡 'help'를 입력하면 사용 가능한 명령어를 볼 수 있어요.`,
        isError: true,
      };
    return handler(parsed.args.slice(1), ctx);
  }
  const fsHandler = fsCommands[parsed.command];
  if (fsHandler) return fsHandler(parsed.args, ctx);
  return {
    output: `이 명령어는 아직 지원하지 않아요.\n💡 'help'를 입력하면 사용 가능한 명령어를 볼 수 있어요.`,
    isError: true,
  };
}
