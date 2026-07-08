// 명령 출력은 순수 텍스트로 반환되고(테스트가 문자열을 단정하므로), 색은
// 렌더 시점에만 입힌다. 입력 하이라이트(highlight.ts)와 같은 "표시 전용" 분리.

const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const YELLOW = "\x1b[33m";
const CYAN = "\x1b[36m";
const DIM = "\x1b[2m";
const ORANGE = "\x1b[38;2;249;115;22m"; // 테마 액센트 #f97316
const RESET = "\x1b[0m";

const wrap = (color: string, text: string) => color + text + RESET;

// diff/status/log에서 매칭되지 않은 줄이 타는 공통 규칙.
function colorizeGeneric(line: string): string {
  const trimmed = line.trimStart();
  if (trimmed.startsWith("💡")) return wrap(ORANGE, line);
  if (line.includes("CONFLICT") || /^(fatal|error):/.test(trimmed)) return wrap(RED, line);
  return line;
}

function colorizeDiffLine(line: string): string {
  if (line.startsWith("@@")) return wrap(CYAN, line);
  if (
    line.startsWith("+++") ||
    line.startsWith("---") ||
    line.startsWith("diff ") ||
    line.startsWith("index ") ||
    line === "new file" ||
    line === "deleted file"
  ) {
    return wrap(DIM, line);
  }
  if (line.startsWith("+")) return wrap(GREEN, line);
  if (line.startsWith("-")) return wrap(RED, line);
  return colorizeGeneric(line);
}

// (HEAD -> main), (feature) 같은 ref 데코레이션을 청록으로. 그래프/해시 뒤에
// 붙는 괄호만 대상이라, 튜토리얼의 짧은 커밋 메시지와 충돌하지 않는다.
const DECO = /\(([^)]*)\)/g;
const colorizeDeco = (line: string) => line.replace(DECO, (m) => wrap(CYAN, m));

function colorizeLogLine(line: string): string {
  // full 로그: "commit <hash>" (그래프 접두 가능)
  const commitMatch = line.match(/^([\s*|\\/]*)commit ([0-9a-f]{7,40})(.*)$/);
  if (commitMatch) {
    const [, prefix, hash, restRaw] = commitMatch;
    return `${prefix}commit ${wrap(YELLOW, hash)}${colorizeDeco(restRaw)}`;
  }
  // Author:/Date: 메타 줄 (그래프 접두 가능)
  if (/^[\s*|\\/]*(Author|Date):/.test(line)) return wrap(DIM, line);
  // oneline: "[그래프 ]<hash> 메시지" — 선두 해시만 노랑, 데코레이션 청록
  const onelineMatch = line.match(/^([\s*|\\/]*)([0-9a-f]{7,40})(\b.*)$/);
  if (onelineMatch) {
    const [, prefix, hash, restRaw] = onelineMatch;
    return `${prefix}${wrap(YELLOW, hash)}${colorizeDeco(restRaw)}`;
  }
  return colorizeGeneric(line);
}

function colorizeStatus(lines: string[]): string[] {
  let section: "staged" | "unstaged" | null = null;
  return lines.map((line) => {
    if (line.includes("Changes to be committed")) {
      section = "staged";
      return line;
    }
    if (line.includes("Changes not staged") || line.includes("Untracked files") || line.includes("Unmerged paths")) {
      section = "unstaged";
      return line;
    }
    if (line.startsWith("\t")) {
      return wrap(section === "staged" ? GREEN : RED, line);
    }
    if (line.startsWith("On branch ")) {
      return `On branch ${wrap(ORANGE, line.slice("On branch ".length))}`;
    }
    if (line.includes("working tree clean")) return wrap(GREEN, line);
    return colorizeGeneric(line);
  });
}

/** 실행한 명령줄을 근거로 출력에 ANSI 색을 입힌다. 폭·내용은 보존. */
export function colorizeOutput(commandLine: string, output: string): string {
  if (!output) return output;
  const words = commandLine.trim().split(/\s+/);
  const sub = words[0] === "git" ? words[1] : undefined;
  const lines = output.split("\n");

  let colored: string[];
  if (sub === "diff") colored = lines.map(colorizeDiffLine);
  else if (sub === "log") colored = lines.map(colorizeLogLine);
  else if (sub === "status") colored = colorizeStatus(lines);
  else colored = lines.map(colorizeGeneric);

  return colored.join("\n");
}
