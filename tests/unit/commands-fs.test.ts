import { beforeEach, describe, expect, it } from "vitest";
import { fsCommands } from "@/lib/shell/commands/fs";
import { createFS } from "@/lib/shell/filesystem";
import type { ShellContext } from "@/types";

function makeContext(fs: any, cwd = "/"): ShellContext {
  return { fs, dir: "/", cwd, pendingMerge: null, setPendingMerge: () => {} };
}

describe("fs commands", () => {
  let fs: any;
  let ctx: ShellContext;

  beforeEach(() => {
    fs = createFS(`test-fs-${Math.random()}`);
    ctx = makeContext(fs);
  });

  describe("touch", () => {
    it("creates an empty file", async () => {
      const result = await fsCommands.touch(["hello.txt"], ctx);
      expect(result.output).toBe("");
      const content = await fs.promises.readFile("/hello.txt", "utf8");
      expect(content).toBe("");
    });
  });

  describe("ls", () => {
    it("lists files in directory", async () => {
      await fs.promises.writeFile("/a.txt", "a");
      await fs.promises.writeFile("/b.txt", "b");
      const result = await fsCommands.ls([], ctx);
      expect(result.output).toContain("a.txt");
      expect(result.output).toContain("b.txt");
    });
  });

  describe("cat", () => {
    it("reads file content", async () => {
      await fs.promises.writeFile("/hello.txt", "world");
      const result = await fsCommands.cat(["hello.txt"], ctx);
      expect(result.output).toBe("world");
    });
    it("errors on nonexistent file", async () => {
      const result = await fsCommands.cat(["nope.txt"], ctx);
      expect(result.isError).toBe(true);
    });
  });

  describe("mkdir", () => {
    it("creates directory", async () => {
      await fsCommands.mkdir(["mydir"], ctx);
      const stat = await fs.promises.stat("/mydir");
      expect(stat.isDirectory()).toBe(true);
    });
  });

  describe("pwd", () => {
    it("returns current directory", async () => {
      const result = await fsCommands.pwd([], { ...ctx, cwd: "/src/lib" });
      expect(result.output).toBe("/src/lib");
    });
  });

  describe("echo", () => {
    it("outputs text (no redirect)", async () => {
      const result = await fsCommands.echo(["hello", "world"], ctx);
      expect(result.output).toBe("hello world");
    });
  });

  describe("help", () => {
    it("returns help text", async () => {
      const result = await fsCommands.help([], ctx);
      expect(result.output).toContain("ls");
      expect(result.output).toContain("git");
    });
  });
});
