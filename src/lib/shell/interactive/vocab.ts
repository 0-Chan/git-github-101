import { fsCommands } from "../commands/fs";
import { gitCommands } from "../commands/git";

// 하이라이팅·자동완성의 어휘는 실제 명령 레지스트리에서 파생한다 —
// 명령이 추가되면 자동으로 여기에도 반영된다.
export const COMMAND_NAMES: readonly string[] = [...Object.keys(fsCommands), "git"].sort();

export const GIT_SUBCOMMANDS: readonly string[] = Object.keys(gitCommands).sort();
