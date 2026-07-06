// 레슨 완료 축하 — canvas-confetti를 완료 순간에만 동적 로드한다.
// 축하는 부가 기능이므로 어떤 실패도 조용히 무시한다.

const THEME_COLORS = ["#f97316", "#fbbf24", "#7c3aed", "#f4f4f5", "#22c55e"];

export async function celebrate(target?: HTMLElement | null): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    const confetti = (await import("canvas-confetti")).default;

    let origins: { x: number; y: number; angle: number }[];
    if (target) {
      const rect = target.getBoundingClientRect();
      const y = Math.min((rect.top + rect.height * 0.7) / window.innerHeight, 0.95);
      const left = rect.left / window.innerWidth;
      const right = rect.right / window.innerWidth;
      const center = (rect.left + rect.width / 2) / window.innerWidth;
      // 터미널 좌하·우하에서 안쪽으로, 중앙에서 위로
      origins = [
        { x: left, y, angle: 60 },
        { x: right, y, angle: 120 },
        { x: center, y, angle: 90 },
      ];
    } else {
      origins = [{ x: 0.5, y: 0.6, angle: 90 }];
    }

    for (const { x, y, angle } of origins) {
      confetti({
        particleCount: 70,
        angle,
        spread: 65,
        startVelocity: 45,
        origin: { x, y },
        colors: THEME_COLORS,
        disableForReducedMotion: true,
      });
    }
  } catch {
    // no-op
  }
}
