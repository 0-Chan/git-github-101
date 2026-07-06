// slidev 52.16.0 우회: getSlidePath가 라우트 경로에 BASE_URL(/slides/)을
// 붙여서 다음 슬라이드 이동이 "#/slides/2" 같은 존재하지 않는 라우트로
// 떨어진다 ("Page /slides/2 not found"). 업스트림 수정(slidevjs/slidev#2630)이
// 릴리스에 포함되면 이 파일을 삭제한다.
export default function setupMain({ router }: { router: any }) {
  const base: string = import.meta.env.BASE_URL
  if (base === "/") return
  const prefix = base.replace(/\/$/, "") // '/slides'
  router.beforeEach((to: { path: string; query: unknown; hash: string }) => {
    if (to.path === prefix || to.path.startsWith(`${prefix}/`)) {
      const path = to.path.slice(prefix.length) || "/"
      return { path, query: to.query, hash: to.hash, replace: true }
    }
  })
}
