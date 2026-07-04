"use client";
import { FitAddon } from "@xterm/addon-fit";
import { Terminal } from "@xterm/xterm";
import { useCallback, useEffect, useRef } from "react";
import "@xterm/xterm/css/xterm.css";
import { emitLessonStep } from "@/lib/events";
import { FIXTURE_VERSION_KEY, getFixture } from "@/lib/fixtures";
import { Shell } from "@/lib/shell/Shell";
import { runValidation } from "@/lib/validation";
import type { LessonStep } from "@/types";

interface TerminalPanelProps {
  namespace: string;
  steps: LessonStep[];
  currentStep: number;
  onStepComplete: (stepIndex: number) => void;
  onReady: (shell: Shell) => void;
}

export function TerminalPanel({ namespace, steps, currentStep, onStepComplete, onReady }: TerminalPanelProps) {
  const termRef = useRef<HTMLDivElement>(null);
  const shellRef = useRef<Shell | null>(null);
  const terminalRef = useRef<Terminal | null>(null);
  const inputRef = useRef("");
  const currentStepRef = useRef(currentStep);
  const onStepCompleteRef = useRef(onStepComplete);
  const stepsRef = useRef(steps);

  useEffect(() => {
    currentStepRef.current = currentStep;
  }, [currentStep]);
  useEffect(() => {
    onStepCompleteRef.current = onStepComplete;
  }, [onStepComplete]);
  useEffect(() => {
    stepsRef.current = steps;
  }, [steps]);
  const onReadyRef = useRef(onReady);
  useEffect(() => {
    onReadyRef.current = onReady;
  }, [onReady]);

  const writePrompt = useCallback(() => {
    const shell = shellRef.current;
    const terminal = terminalRef.current;
    if (!shell || !terminal) return;
    terminal.write(`\r\n${shell.prompt}`);
  }, []);

  useEffect(() => {
    if (!termRef.current) return;

    // Strict Mode (dev) runs this effect twice. Guard the async init chain so the
    // torn-down instance never writes to a disposed terminal or re-runs fixture setup.
    let cancelled = false;

    const terminal = new Terminal({
      theme: {
        background: "#18181b",
        foreground: "#f4f4f5",
        cursor: "#f97316",
        selectionBackground: "#f9731640",
      },
      fontFamily: "var(--font-plex-mono), monospace",
      fontSize: 14,
      cursorBlink: true,
    });

    const fitAddon = new FitAddon();
    terminal.loadAddon(fitAddon);
    terminal.open(termRef.current);
    fitAddon.fit();
    terminalRef.current = terminal;

    const shell = new Shell(namespace);
    shellRef.current = shell;

    shell.init().then(async () => {
      if (cancelled) return;
      const slug = namespace.replace(/^lesson-/, "");
      const fixture = getFixture(slug);
      const versionKey = `${FIXTURE_VERSION_KEY}-${slug}`;
      const storedVersion = localStorage.getItem(versionKey);

      if (!storedVersion || parseInt(storedVersion, 10) !== fixture.version) {
        await shell.reset();
        await fixture.setup(shell.getFS());
        localStorage.setItem(versionKey, String(fixture.version));
      }

      if (cancelled) return;
      terminal.writeln("Git & GitHub 101 터미널");
      terminal.writeln("'help'를 입력하면 사용 가능한 명령어를 볼 수 있어요.\r\n");
      writePrompt();
      onReadyRef.current(shell);
    });

    terminal.onKey(async ({ key, domEvent }) => {
      if (domEvent.key === "Enter") {
        const input = inputRef.current.trim();
        inputRef.current = "";
        terminal.write("\r\n");

        if (input) {
          const result = await shell.execute(input);
          if (result.clear) {
            terminal.clear();
          } else if (result.output) {
            const lines = result.output.split("\n");
            lines.forEach((line, i) => {
              terminal.write(line);
              if (i < lines.length - 1) terminal.write("\r\n");
            });
          }

          // Run validation using refs to avoid stale closures
          const stepIdx = currentStepRef.current;
          if (stepIdx < stepsRef.current.length) {
            const step = stepsRef.current[stepIdx];
            const passed = await runValidation(step.validation, shell.getFS(), "/");
            if (passed) {
              emitLessonStep(namespace.replace(/^lesson-/, ""), step.id);
              onStepCompleteRef.current(stepIdx);
            }
          }
        }

        writePrompt();
      } else if (domEvent.key === "Backspace") {
        if (inputRef.current.length > 0) {
          inputRef.current = inputRef.current.slice(0, -1);
          terminal.write("\b \b");
        }
      } else if (key.length === 1 && !domEvent.ctrlKey && !domEvent.altKey) {
        inputRef.current += key;
        terminal.write(key);
      }
    });

    const resizeObserver = new ResizeObserver(() => fitAddon.fit());
    resizeObserver.observe(termRef.current);

    return () => {
      cancelled = true;
      resizeObserver.disconnect();
      terminal.dispose();
    };
  }, [namespace, writePrompt]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-col h-full bg-zinc-900 rounded-xl border border-zinc-700 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2 bg-zinc-800 border-b border-zinc-700">
        <span className="w-3 h-3 rounded-full bg-red-500" />
        <span className="w-3 h-3 rounded-full bg-yellow-500" />
        <span className="w-3 h-3 rounded-full bg-green-500" />
        <span className="ml-2 text-xs text-zinc-400 font-mono">터미널</span>
      </div>
      <div ref={termRef} className="flex-1 p-2" />
    </div>
  );
}
