import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  serverExternalPackages: ['gray-matter'],
  async rewrites() {
    // public/ has no directory-index resolution; the Slidev deck lives at
    // /slides/index.html (built into public/slides by the slides package).
    return [{ source: '/slides', destination: '/slides/index.html' }]
  },
}

export default nextConfig
