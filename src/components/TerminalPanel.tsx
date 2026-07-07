"use client";
import { FitAddon } from "@xterm/addon-fit";
import { WebglAddon } from "@xterm/addon-webgl";
import { Terminal } from "@xterm/xterm";
import { useCallback, useEffect, useRef, useState } from "react";
import "@xterm/xterm/css/xterm.css";
import { emitLessonStep } from "@/lib/events";
import { FIXTURE_VERSION_KEY, getFixture } from "@/lib/fixtures";
import { HistoryNavigator, loadHistory, pushHistory, saveHistory } from "@/lib/shell/interactive/history";
import { renderLine, rowOf } from "@/lib/shell/interactive/render";
import { complete, ghostSuggestion } from "@/lib/shell/interactive/suggest";
import { Shell } from "@/lib/shell/Shell";
import { runValidation } from "@/lib/validation";
import type { LessonStep } from "@/types";
import { EditorOverlay } from "./EditorOverlay";

interface TerminalPanelProps {
  namespace: string;
  steps: LessonStep[];
  currentStep: number;
  onStepComplete: (stepIndex: number) => void;
  onReady: (shell: Shell) => void;
  /** 확대 모드 — 폰트가 커지고 컬럼 폭은 LessonLayout이 함께 넓힌다 */
  expanded: boolean;
  onToggleExpand: () => void;
}

const FONT_SIZE_NORMAL = 14;
const FONT_SIZE_EXPANDED = 18;

function probeWebgl(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

export function TerminalPanel({
  namespace,
  steps,
  currentStep,
  onStepComplete,
  onReady,
  expanded,
  onToggleExpand,
}: TerminalPanelProps) {
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
  // Tab 완성 비동기 처리 중 재진입 방지
  const completingRef = useRef(false);
  // edit 명령이 연 에디터 (열림 중에는 프롬프트가 보류된다)
  const [editing, setEditing] = useState<{ path: string; content: string } | null>(null);
  // 에디터 저장 후 재사용할 스텝 검증 (마운트 effect 안에서 채워진다)
  const validateCurrentStepRef = useRef<(() => Promise<void>) | null>(null);
  // 확대 토글 시 fit + 리페인트 재사용 (마운트 effect의 리사이즈 핸들러)
  const refitRef = useRef<(() => void) | null>(null);
  const expandedRef = useRef(expanded);

  useEffect(() => {
    expandedRef.current = expanded;
    const terminal = terminalRef.current;
    if (!terminal) return;
    terminal.options.fontSize = expanded ? FONT_SIZE_EXPANDED : FONT_SIZE_NORMAL;
    refitRef.current?.();
  }, [expanded]);

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
      fontSize: expandedRef.current ? FONT_SIZE_EXPANDED : FONT_SIZE_NORMAL,
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

    // 명령 히스토리 — 레슨(namespace) 단위로 localStorage에 유지
    let history = loadHistory(namespace);
    let historyNav = new HistoryNavigator(history);

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
    // ghost는 매 페인트마다 (입력, 히스토리)에서 재계산 — 별도 무효화 상태가 없다.
    const paint = (ghostOverride?: string) => {
      const { data, cursorRow } = renderLine({
        prompt: shell.prompt,
        input: inputRef.current,
        ghost: ghostOverride ?? ghostSuggestion(inputRef.current, history),
        cols: terminal.cols,
        prevCursorRow: prevCursorRowRef.current,
      });
      terminal.write(data);
      prevCursorRowRef.current = cursorRow;
    };

    // Run validation using refs to avoid stale closures.
    // 에디터 저장 후에도 동일한 검증이 돌도록 ref로 노출한다.
    const validateCurrentStep = async () => {
      // 한 명령이 여러 스텝을 충족할 수 있다(git checkout -b 등).
      // currentStepRef는 리렌더 후에야 갱신되므로 지역 인덱스로 이어서 검사한다.
      for (let stepIdx = currentStepRef.current; stepIdx < stepsRef.current.length; stepIdx++) {
        const step = stepsRef.current[stepIdx];
        const passed = await runValidation(step.validation, shell.getFS(), "/", { history });
        if (!passed) break;
        emitLessonStep(namespace.replace(/^lesson-/, ""), step.id);
        onStepCompleteRef.current(stepIdx);
      }
    };
    validateCurrentStepRef.current = validateCurrentStep;

    terminal.onKey(async ({ key, domEvent }) => {
      if (domEvent.key === "Enter") {
        paint(""); // 스크롤백에 ghost 잔상이 남지 않도록 최종 줄을 확정
        terminal.write("\r\n");
        prevCursorRowRef.current = 0;
        const input = inputRef.current.trim();
        inputRef.current = "";
        history = pushHistory(history, input);
        saveHistory(namespace, history);
        historyNav = new HistoryNavigator(history);

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

          await validateCurrentStep();

          if (result.edit) {
            // 에디터를 연다 — 프롬프트는 에디터가 닫힐 때 쓴다
            setEditing(result.edit);
            return;
          }
        }

        writePrompt();
      } else if (domEvent.key === "Backspace") {
        if (inputRef.current.length > 0) {
          inputRef.current = inputRef.current.slice(0, -1);
          paint();
        }
      } else if (domEvent.key === "ArrowUp") {
        const entry = historyNav.up(inputRef.current);
        if (entry !== null) {
          inputRef.current = entry;
          paint();
        }
      } else if (domEvent.key === "ArrowDown") {
        const entry = historyNav.down();
        if (entry !== null) {
          inputRef.current = entry;
          paint();
        }
      } else if (domEvent.key === "ArrowRight") {
        // ghost 수락 — 표시가 잘려 있어도 전체 제안을 붙인다.
        // (ArrowLeft는 의도적 no-op: 이 터미널은 커서 중간 편집을 지원하지 않는다)
        const ghost = ghostSuggestion(inputRef.current, history);
        if (ghost) {
          inputRef.current += ghost;
          paint();
        }
      } else if (domEvent.key === "Tab") {
        // 리터럴 \t 유입 방지 겸 완성 (key="\t"는 length 1이라 인쇄 분기로 샌다)
        domEvent.preventDefault();
        if (completingRef.current) return; // 재진입 가드 (readdir 대기 중 연타)
        completingRef.current = true;
        const inputAtTab = inputRef.current;
        try {
          const result = await complete(inputAtTab, { fs: shell.getFS(), cwd: shell.cwd });
          if (inputRef.current !== inputAtTab) return; // 대기 중 입력이 바뀌면 폐기
          if (result.kind === "single" || result.kind === "prefix") {
            inputRef.current += result.insert;
            paint();
          } else if (result.kind === "multiple") {
            // 후보를 아래 줄에 나열하고 입력 블록을 새로 그린다
            paint("");
            terminal.write(`\r\n${result.candidates.join("  ")}\r\n`);
            prevCursorRowRef.current = 0;
            paint();
          }
        } finally {
          completingRef.current = false;
        }
      } else if (domEvent.ctrlKey && domEvent.key === "c") {
        // 작성 중이던 줄을 버리고 새 프롬프트
        paint("");
        terminal.write("^C");
        inputRef.current = "";
        historyNav.reset();
        writePrompt();
      } else if (key.length === 1 && !domEvent.ctrlKey && !domEvent.altKey) {
        inputRef.current += key;
        paint();
      }
    });

    const refit = () => {
      fitAddon.fit();
      // 리플로우 후 행 수가 달라질 수 있으니 재계산 후 다시 그린다
      if (inputRef.current.length > 0) {
        prevCursorRowRef.current = rowOf(shell.prompt.length + inputRef.current.length, terminal.cols);
        paint();
      }
    };
    refitRef.current = refit; // 확대 토글(폰트 변경)도 같은 경로로 fit한다
    const resizeObserver = new ResizeObserver(refit);
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
      className={`${gpuRenderer ? "" : "ph-no-capture "}relative flex flex-col h-full bg-zinc-900 rounded-xl border border-zinc-700 overflow-hidden`}
    >
      <div className="flex items-center gap-2 px-4 py-2 bg-zinc-800 border-b border-zinc-700">
        <span className="w-3 h-3 rounded-full bg-red-500" />
        <span className="w-3 h-3 rounded-full bg-yellow-500" />
        <button
          type="button"
          onClick={onToggleExpand}
          aria-label="터미널 확대/축소"
          title={expanded ? "터미널 축소" : "터미널 확대"}
          className="w-3 h-3 rounded-full bg-green-500 transition-transform hover:scale-125 focus-visible:scale-125 cursor-pointer"
        />
        <span className="ml-2 text-xs text-zinc-400 font-mono">터미널</span>
      </div>
      <div ref={termRef} className="flex-1 p-2" />
      {editing && (
        <EditorOverlay
          path={editing.path}
          initialContent={editing.content}
          onSave={async (content) => {
            const shell = shellRef.current;
            const terminal = terminalRef.current;
            setEditing(null);
            if (!shell || !terminal) return;
            const fileName = editing.path.split("/").pop() || editing.path;
            try {
              await shell.getFS().promises.writeFile(editing.path, content);
              terminal.write(`"${fileName}" 저장됨`);
              await validateCurrentStepRef.current?.();
            } catch {
              terminal.write(`edit: "${fileName}" 저장 실패`);
            }
            writePrompt();
            terminal.focus();
          }}
          onCancel={() => {
            setEditing(null);
            writePrompt();
            terminalRef.current?.focus();
          }}
        />
      )}
    </div>
  );
}
