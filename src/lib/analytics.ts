import posthog from "posthog-js";

// init 전(로컬 dev 등)에는 조용히 무시하는 안전 capture.
// 학습 이벤트(appendEvent) 배선을 추가할 때도 이 헬퍼를 쓴다.
export function capture(event: string, props?: Record<string, unknown>): void {
  if (posthog.__loaded) posthog.capture(event, props);
}
