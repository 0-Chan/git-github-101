import { describe, expect, it } from "vitest";
import { bashBlockToHtml } from "@/lib/bashHighlight";
import { getLessonBySlug } from "@/lib/content";

describe("bashBlockToHtml", () => {
  it("prefixes command lines with a non-copyable prompt and colors the command", () => {
    const html = bashBlockToHtml("git init\n");
    expect(html).toContain('<span class="prompt">$ </span>');
    expect(html).toContain('<span class="cmd">git</span>');
    expect(html).toContain('<span class="cmd">init</span>');
    expect(html.startsWith('<pre class="bash-block"><code>')).toBe(true);
  });

  it("colors strings and redirects", () => {
    const html = bashBlockToHtml('echo "hello" > f.txt\n');
    expect(html).toContain('<span class="str">&quot;hello&quot;</span>');
    expect(html).toContain('<span class="redir">&gt;</span>');
  });

  it("renders comment lines muted without a prompt", () => {
    const html = bashBlockToHtml("git merge feature\n# CONFLICT (content)\n");
    const lines = html.split("\n");
    expect(lines[0]).toContain('class="prompt"');
    expect(lines[1]).toContain('<span class="comment"># CONFLICT (content)</span>');
    expect(lines[1]).not.toContain("prompt");
  });

  it("handles multi-line blocks with one prompt per command", () => {
    const html = bashBlockToHtml('touch a.txt\ngit add a.txt\ngit commit -m "add a"\n');
    expect(html.match(/class="prompt"/g)).toHaveLength(3);
  });

  it("escapes HTML in arguments", () => {
    const html = bashBlockToHtml("echo <b>&\n");
    expect(html).toContain("&lt;b&gt;");
    expect(html).toContain("&amp;");
    expect(html).not.toContain("<b>");
  });
});

describe("lesson pipeline integration", () => {
  it("renders lesson bash blocks with the bash-block class and prompts", () => {
    const lesson = getLessonBySlug("first-repo");
    expect(lesson?.html).toContain('class="bash-block"');
    expect(lesson?.html).toContain('<span class="prompt">$ </span>');
    expect(lesson?.html).toContain('<span class="cmd">git</span>');
  });

  it("leaves plain (non-bash) code blocks untouched", () => {
    const lesson = getLessonBySlug("first-repo"); // 02는 출력 예시용 plain 블록 보유
    expect(lesson?.html).toContain("Initialized empty Git repository in /.git/");
    // plain 블록엔 프롬프트가 붙지 않는다
    const plainBlock = lesson?.html.split('class="bash-block"')[0] ?? "";
    expect(plainBlock).not.toContain('class="prompt"');
  });
});
