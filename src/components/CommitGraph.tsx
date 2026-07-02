"use client";
import Link from "next/link";
import { useProgress } from "@/hooks/useProgress";
import type { Section } from "@/types";

const ROW_H = 84;
const TRUNK_X = 22;
const FEATURE_X = 46;
const NODE_R = 6.5;

// Lessons 06–08 (branches / merge / conflict) live on a feature lane; the rest
// ride the trunk. The nav graph literally branches where the content does.
function laneOf(order: number): 0 | 1 {
  return order >= 6 && order <= 8 ? 1 : 0;
}
const laneX = (lane: 0 | 1) => (lane === 1 ? FEATURE_X : TRUNK_X);
const laneColor = (lane: 0 | 1) => (lane === 1 ? "var(--color-lane-feature)" : "var(--color-lane-main)");

// Deterministic 7-char hex (FNV-1a) so the same slug always shows the same hash (SSR-safe).
function shortHash(slug: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < slug.length; i++) {
    h ^= slug.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, "0").slice(0, 7);
}

export function CommitGraph({ sections }: { sections: Section[] }) {
  const { progress } = useProgress();
  const ordered = [...sections].sort((a, b) => a.order - b.order);
  const currentIndex = ordered.findIndex((s) => !progress[s.slug]);
  const height = ordered.length * ROW_H;

  const yOf = (i: number) => i * ROW_H + ROW_H / 2;

  return (
    <div className="relative" style={{ minHeight: height }}>
      <svg
        className="absolute inset-y-0 left-0 z-10 pointer-events-none"
        width={64}
        height={height}
        viewBox={`0 0 64 ${height}`}
        fill="none"
        aria-hidden="true"
      >
        <title>레슨 커밋 그래프</title>
        {/* Rails: one segment per gap, curved where the lane changes. */}
        {ordered.slice(1).map((s, idx) => {
          const i = idx + 1;
          const prev = ordered[i - 1];
          const lp = laneOf(prev.order);
          const lc = laneOf(s.order);
          const y0 = yOf(i - 1);
          const y1 = yOf(i);
          const color = laneColor(lc);
          if (lp === lc) {
            const x = laneX(lc);
            return (
              <line key={s.id} x1={x} y1={y0} x2={x} y2={y1} stroke={color} strokeWidth={2.5} strokeLinecap="round" />
            );
          }
          const x0 = laneX(lp);
          const x1 = laneX(lc);
          const mid = (y0 + y1) / 2;
          return (
            <path
              key={s.id}
              d={`M ${x0} ${y0} C ${x0} ${mid}, ${x1} ${mid}, ${x1} ${y1}`}
              stroke={color}
              strokeWidth={2.5}
              strokeLinecap="round"
            />
          );
        })}
        {/* Nodes */}
        {ordered.map((s, i) => {
          const lane = laneOf(s.order);
          const x = laneX(lane);
          const y = yOf(i);
          const color = laneColor(lane);
          const done = !!progress[s.slug];
          const current = i === currentIndex;
          return (
            <g key={s.id}>
              {current && (
                <circle
                  cx={x}
                  cy={y}
                  r={NODE_R + 5}
                  fill="none"
                  stroke={color}
                  strokeWidth={2}
                  opacity={0.35}
                  className="motion-safe:animate-ping"
                  // SVG transforms default to the viewport origin; scale around the node itself.
                  style={{ transformBox: "fill-box", transformOrigin: "center" }}
                />
              )}
              <circle
                cx={x}
                cy={y}
                r={NODE_R}
                fill={done ? color : "var(--color-surface)"}
                stroke={done ? color : current ? color : "var(--color-edge)"}
                strokeWidth={done ? 0 : 2.5}
              />
              {done && (
                <path
                  d={`M ${x - 3} ${y} l 2 2.4 l 4.2 -5`}
                  fill="none"
                  stroke="var(--color-surface)"
                  strokeWidth={1.6}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
            </g>
          );
        })}
      </svg>

      <ol className="relative">
        {ordered.map((s, i) => {
          const lane = laneOf(s.order);
          const color = laneColor(lane);
          const done = !!progress[s.slug];
          const current = i === currentIndex;
          return (
            <li key={s.id} style={{ height: ROW_H }}>
              <Link
                href={`/lessons/${s.slug}`}
                className="group flex h-full items-center gap-4 rounded-lg pl-16 pr-4 transition-colors hover:bg-surface"
              >
                <span className="w-8 shrink-0 font-mono text-sm tabular-nums text-muted">
                  {String(s.order).padStart(2, "0")}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3
                      className="truncate font-medium text-ink group-hover:underline decoration-2 underline-offset-4"
                      style={{ textDecorationColor: color }}
                    >
                      {s.title}
                    </h3>
                    {!s.hasTerminal && (
                      <span className="shrink-0 rounded border border-edge px-1.5 py-0.5 font-mono text-[10px] text-muted">
                        읽기
                      </span>
                    )}
                    {current && (
                      <span
                        className="shrink-0 rounded px-1.5 py-0.5 font-mono text-[10px] font-medium"
                        style={{ color, border: `1px solid ${color}` }}
                      >
                        HEAD
                      </span>
                    )}
                  </div>
                  <p className="truncate text-sm text-muted">{s.description}</p>
                </div>
                <span className="hidden shrink-0 font-mono text-xs text-muted sm:block">
                  {done ? shortHash(s.slug) : "·······"}
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
