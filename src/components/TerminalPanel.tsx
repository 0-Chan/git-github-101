"use client";
import { FitAddon } from "@xterm/addon-fit";
import { WebglAddon } from "@xterm/addon-webgl";
import { Terminal } from "@xterm/xterm";
import { useCallback, useEffect, useRef, useState } from "react";
import "@xterm/xterm/css/xterm.css";
import { emitLessonStep } from "@/lib/events";
import { FIXTURE_VERSION_KEY, getFixture } from "@/lib/fixtures";
import { renderLine, rowOf } from "@/lib/shell/interactive/render";
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

function probeWebgl(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

export function TerminalPanel({ namespace, steps, currentStep, onStepComplete, onReady }: TerminalPanelProps) {
  const termRef = useRef<HTMLDivElement>(null);
  const shellRef = useRef<Shell | null>(null);
  const terminalRef = useRef<Terminal | null>(null);
  const inputRef = useRef("");
  // WebGL 렌더러 여부가 리플레이 녹화 방식을 가른다 (아래 ph-no-capture 참고).
  // 첫 렌더 전에 확정해야 rrweb 초기 스냅샷이 올바른 모드로 찍힌다.
  const [gpuRenderer, setGpuRenderer] = useState(probeWebgl);
  const gpuRef = useRef(gpuRenderer);
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

  // 현재 입력 블록에서 커서가 위치한 행 (soft-wrap 리페인트용)
  const prevCursorRowRef = useRef(0);

  const writePrompt = useCallback(() => {
    const shell = shellRef.current;
    const terminal = terminalRef.current;
    if (!shell || !terminal) return;
    terminal.write(`\r\n${shell.prompt}`);
    prevCursorRowRef.current = 0;
  }, []);

  useEffect(() => {
    if (!termRef.current) return;

    // Strict Mode (dev) runs this effect twice. Guard the async init chain so the
    // torn-down instance never writes to a disposed terminal or re-runs fixture setup.
    let cancelled = false;

    // WebGL/캔버스 렌더러는 CSS 변수를 해석하지 못하므로 실제 폰트명으로 푼다
    const monoVar = getComputedStyle(termRef.current).getPropertyValue("--font-plex-mono").trim();
    const terminal = new Terminal({
      theme: {
        background: "#18181b",
        foreground: "#f4f4f5",
        cursor: "#f97316",
        selectionBackground: "#f9731640",
      },
      fontFamily: monoVar ? `${monoVar}, monospace` : "monospace",
      fontSize: 14,
      cursorBlink: true,
    });

    const fitAddon = new FitAddon();
    terminal.loadAddon(fitAddon);
    terminal.open(termRef.current);

    // GPU 렌더러: DOM 변이가 사라져 rrweb 직렬화 비용이 없어지고,
    // 터미널은 PostHog 캔버스 녹화(주기 스냅샷)로 리플레이에 담긴다.
    if (gpuRef.current) {
      try {
        const webgl = new WebglAddon();
        webgl.onContextLoss(() => {
          webgl.dispose(); // xterm이 DOM 렌더러로 자동 복귀
          gpuRef.current = false;
          setGpuRenderer(false);
        });
        terminal.loadAddon(webgl);
      } catch {
        gpuRef.current = false;
        setGpuRenderer(false);
      }
    }

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

    // 프롬프트 + 컬러 입력(+ ghost) 한 블록을 통째로 다시 그린다.
    // WebGL 렌더러라 키 입력마다 리페인트해도 비용이 없다.
    const paint = (ghost = "") => {
      const { data, cursorRow } = renderLine({
        prompt: shell.prompt,
        input: inputRef.current,
        ghost,
        cols: terminal.cols,
        prevCursorRow: prevCursorRowRef.current,
      });
      terminal.write(data);
      prevCursorRowRef.current = cursorRow;
    };

    terminal.onKey(async ({ key, domEvent }) => {
      if (domEvent.key === "Enter") {
        paint(""); // 스크롤백에 ghost 잔상이 남지 않도록 최종 줄을 확정
        terminal.write("\r\n");
        prevCursorRowRef.current = 0;
        const input = inputRef.current.trim();
        inputRef.current = "";

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
          paint();
        }
      } else if (domEvent.key === "Tab") {
        // 리터럴 \t 유입 방지 (key="\t"는 length 1이라 아래 분기로 새어 들어간다)
        domEvent.preventDefault();
      } else if (key.length === 1 && !domEvent.ctrlKey && !domEvent.altKey) {
        inputRef.current += key;
        paint();
      }
    });

    const resizeObserver = new ResizeObserver(() => {
      fitAddon.fit();
      // 리플로우 후 행 수가 달라질 수 있으니 재계산 후 다시 그린다
      if (inputRef.current.length > 0) {
        prevCursorRowRef.current = rowOf(shell.prompt.length + inputRef.current.length, terminal.cols);
        paint();
      }
    });
    resizeObserver.observe(termRef.current);

    return () => {
      cancelled = true;
      resizeObserver.disconnect();
      terminal.dispose();
    };
  }, [namespace, writePrompt]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    // DOM 렌더러 폴백일 때만 ph-no-capture: xterm DOM 렌더러는 키 입력·출력마다
    // 행 전체 span을 다시 그려서 rrweb 직렬화가 키 하나에 50~200ms씩 메인
    // 스레드를 막는다 (프로덕션에서 명령당 수 초 지연). WebGL 렌더러일 때는
    // 캔버스 녹화가 담당하므로 제외하지 않는다.
    <div
      className={`${gpuRenderer ? "" : "ph-no-capture "}flex flex-col h-full bg-zinc-900 rounded-xl border border-zinc-700 overflow-hidden`}
    >
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
