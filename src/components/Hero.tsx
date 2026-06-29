import Link from "next/link";

const MAIN = "var(--color-lane-main)";
const FEATURE = "var(--color-lane-feature)";

// Animations live in globals.css under prefers-reduced-motion: no-preference;
// here we only stagger them via animationDelay. Reduced motion => final state.
const delay = (s: number) => ({ animationDelay: `${s}s` });

export function Hero() {
  return (
    <section className="px-4 pt-20 pb-16">
      <div className="mx-auto max-w-2xl text-center">
        {/* The thesis: a branch diverges and merges back. */}
        <svg
          viewBox="0 0 320 112"
          className="mx-auto w-full max-w-md"
          fill="none"
          role="img"
          aria-label="브랜치가 갈라졌다가 머지로 다시 합쳐지는 커밋 그래프"
        >
          <path
            d="M16 76 H 304"
            stroke={MAIN}
            strokeWidth={2.5}
            strokeLinecap="round"
            pathLength={1}
            className="anim-rail"
            style={delay(0)}
          />
          <path
            d="M104 76 C 128 76 128 40 152 40 H 208 C 232 40 232 76 256 76"
            stroke={FEATURE}
            strokeWidth={2.5}
            strokeLinecap="round"
            pathLength={1}
            className="anim-rail"
            style={delay(0.5)}
          />
          <circle cx={56} cy={76} r={6.5} fill={MAIN} className="anim-node" style={delay(0.3)} />
          <circle cx={104} cy={76} r={6.5} fill={MAIN} className="anim-node" style={delay(0.5)} />
          <circle cx={152} cy={40} r={6.5} fill={FEATURE} className="anim-node" style={delay(1.0)} />
          <circle cx={208} cy={40} r={6.5} fill={FEATURE} className="anim-node" style={delay(1.2)} />
          <circle
            cx={256}
            cy={76}
            r={7.5}
            fill="var(--color-surface)"
            stroke={MAIN}
            strokeWidth={3}
            className="anim-node"
            style={delay(1.5)}
          />
          <text x={268} y={70} className="anim-text font-mono" fontSize={11} fill={MAIN} style={delay(1.8)}>
            HEAD
          </text>
        </svg>

        <p className="anim-text mt-8 font-mono text-sm text-muted" style={delay(1.1)}>
          $ git init
        </p>
        <h1 className="anim-text mt-3 text-3xl font-bold leading-snug text-ink sm:text-4xl" style={delay(1.3)}>
          브랜치가 갈라지고 합쳐지는 걸
          <br />
          직접 만들어 보세요
        </h1>
        <p className="anim-text mx-auto mt-4 max-w-md text-muted" style={delay(1.5)}>
          설치 없이, 브라우저에서 바로. 11개의 레슨으로 Git의 핵심을 손에 익힙니다.
        </p>
        <div className="anim-text" style={delay(1.7)}>
          <Link
            href="/lessons/what-is-git"
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-lane-main px-6 py-3 font-medium text-[#1a1205] transition-transform hover:scale-[1.03]"
          >
            시작하기 <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
