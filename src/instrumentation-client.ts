import posthog from "posthog-js";

// Vercel PostHog 통합이 Preview/Production에만 토큰을 주입한다 —
// 로컬 dev는 토큰이 없어 전체가 no-op이고, 개발 트래픽이 섞이지 않는다.
const token = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;

// Vercel 통합이 주입하는 호스트는 앱 도메인(us.posthog.com)이라 그대로 쓰면
// 이벤트가 전송되지 않는다 — 인제스트 도메인(us.i.posthog.com)으로 정규화한다.
const apiHost = (process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com").replace(
  /\/\/(us|eu)\.posthog\.com/,
  "//$1.i.posthog.com",
);

if (token) {
  try {
    posthog.init(token, {
      api_host: apiHost,
      // 프리셋이 SPA history 전환 페이지뷰 캡처를 포함한다
      defaults: "2026-05-30",
      // 교실 신뢰 모델: 이름·체크인 이유 입력까지 리플레이에서 그대로 본다
      session_recording: { maskAllInputs: false },
    });
  } catch (err) {
    console.warn("PostHog 초기화 실패:", err);
  }
}
