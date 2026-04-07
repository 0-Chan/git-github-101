import type { ParsedCommand } from "@/types";

export function parseCommand(input: string): ParsedCommand | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const tokens: string[] = [];
  let current = "";
  let inQuote: string | null = null;

  for (let i = 0; i < trimmed.length; i++) {
    const ch = trimmed[i];

    if (inQuote) {
      if (ch === inQuote) {
        inQuote = null;
      } else {
        current += ch;
      }
    } else if (ch === '"' || ch === "'") {
      inQuote = ch;
    } else if (ch === " " || ch === "\t") {
      if (current) {
        tokens.push(current);
        current = "";
      }
    } else {
      current += ch;
    }
  }
  if (current) tokens.push(current);
  if (tokens.length === 0) return null;

  // Detect redirect operators
  let redirectOp: ">" | ">>" | undefined;
  let redirectTarget: string | undefined;

  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i] === ">>" || tokens[i] === ">") {
      redirectOp = tokens[i] as ">" | ">>";
      redirectTarget = tokens[i + 1];
      tokens.splice(i); // remove redirect and everything after
      break;
    }
  }

  const [command, ...args] = tokens;
  return { command, args, ...(redirectOp && { redirectOp, redirectTarget }) };
}
