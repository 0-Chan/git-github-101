import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  serverExternalPackages: ['gray-matter'],
  async redirects() {
    // 회차 분할 전의 단일 덱 URL 호환용.
    return [{ source: '/slides', destination: '/slides/s1', permanent: false }]
  },
  async rewrites() {
    // public/ has no directory-index resolution; the per-session Slidev decks
    // live at /slides/s{1..4}/index.html (built into public/slides/s{N} by the
    // slides package). Static assets under /slides/sN/assets resolve from the
    // filesystem first, so this only catches the directory URLs.
    return [{ source: '/slides/:deck', destination: '/slides/:deck/index.html' }]
  },
}

export default nextConfig
