"use client";
import Image from "next/image";
import { capture } from "@/lib/analytics";
import type { Reference } from "@/types";

// URL에서 표시용 호스트만 뽑는다 (www. 제거). 잘못된 URL이면 원본 그대로.
function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function ReferenceCard({ item }: { item: Reference }) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => capture("reference_opened", { url: item.url, title: item.title })}
      className="group flex flex-col overflow-hidden rounded-xl border border-edge bg-surface transition-colors hover:border-orange-500/50"
    >
      {item.thumb && (
        <Image
          src={item.thumb}
          alt={`${item.title} 미리보기`}
          width={1280}
          height={800}
          className="aspect-video w-full border-b border-edge object-cover object-top"
        />
      )}
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex items-center justify-between gap-2">
          {item.tag && (
            <span className="rounded-full bg-ground px-2 py-0.5 font-mono text-xs text-lane-main">{item.tag}</span>
          )}
          <span className="ml-auto text-muted transition-colors group-hover:text-lane-main" aria-hidden="true">
            ↗
          </span>
        </div>
        <h3 className="font-bold text-ink">{item.title}</h3>
        <p className="mt-1 flex-1 text-sm text-muted">{item.description}</p>
        <p className="mt-3 font-mono text-xs text-muted">{hostOf(item.url)}</p>
      </div>
    </a>
  );
}
