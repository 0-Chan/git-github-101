"use client";
import type { ReactNode } from "react";
import { capture } from "@/lib/analytics";

interface DeckLinkProps {
  source: "nav" | "lecture-card";
  href?: string;
  className?: string;
  children: ReactNode;
}

// Slidev 덱은 계측하지 않으므로, 덱으로 나가는 진입점에서 횟수를 센다.
export function DeckLink({ source, href = "/slides", className, children }: DeckLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={() => capture("deck_opened", { source, href })}
    >
      {children}
    </a>
  );
}
