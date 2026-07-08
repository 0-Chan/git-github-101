import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans_KR } from "next/font/google";
import Script from "next/script";
import { Nav } from "@/components/Nav";
import "./globals.css";

// "Human voice" — teaching prose and headlines, covers Hangul.
const plexSans = IBM_Plex_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-plex-sans",
  display: "swap",
  // KR font files are large and not unicode-range split; serve on demand, don't preload.
  preload: false,
});
// "Machine voice" — hashes, lane labels, the terminal, the wordmark (ASCII only).
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Git & GitHub 101",
  description: "브라우저에서 배우는 Git & GitHub 입문",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <Script src="/theme-init.js" strategy="beforeInteractive" />
      </head>
      <body className={`${plexSans.variable} ${plexMono.variable} font-sans antialiased bg-ground text-ink`}>
        <Nav />
        {children}
      </body>
    </html>
  );
}
