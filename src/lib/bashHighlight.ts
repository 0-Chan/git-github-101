import { tokenizeForDisplay } from "./shell/interactive/highlight";

// 레슨의 ```bash 블록을 "$ 프롬프트 + 시맨틱 컬러" HTML로 변환한다.
// 토크나이저를 터미널과 공유하므로 문서와 터미널이 같은 색 언어를 쓴다.

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function highlightCommandLine(line: string): string {
  let out = "";
  for (const token of tokenizeForDisplay(line)) {
    const text = escapeHtml(token.text);
    switch (token.kind) {
      case "command":
      case "subcommand":
        out += `<span class="${token.valid ? "cmd" : "cmd-bad"}">${text}</span>`;
        break;
      case "string":
        out += `<span class="str">${text}</span>`;
        break;
      case "redirect":
        out += `<span class="redir">${text}</span>`;
        break;
      default:
        out += text;
    }
  }
  return out;
}

export function bashBlockToHtml(code: string): string {
  const lines = code.replace(/\n$/, "").split("\n");
  const rendered = lines.map((line) => {
    if (!line.trim()) return "";
    if (line.trimStart().startsWith("#")) {
      return `<span class="comment">${escapeHtml(line)}</span>`;
    }
    // 프롬프트는 user-select 제외 대상이라 복사에 섞이지 않는다 (CSS)
    return `<span class="prompt">$ </span>${highlightCommandLine(line)}`;
  });
  return `<pre class="bash-block"><code>${rendered.join("\n")}</code></pre>`;
}
