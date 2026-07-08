"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment } from "react";
import type { Section } from "@/types";

interface SidebarProps {
  sections: Section[];
  progress: Record<string, boolean>;
}

export function Sidebar({ sections, progress }: SidebarProps) {
  const pathname = usePathname();
  const sessionLabels: Record<number, string> = {
    1: "1회차",
    13: "2회차",
  };

  return (
    <aside className="w-64 shrink-0 border-r border-edge overflow-y-auto">
      <nav className="p-4 space-y-1">
        {sections.map((section) => {
          const href = `/lessons/${section.slug}`;
          const isActive = pathname === href;
          const isComplete = progress[section.slug];
          const sessionLabel = sessionLabels[section.order];

          return (
            <Fragment key={section.id}>
              {sessionLabel && (
                <div
                  className={`px-3 pb-1 font-mono text-xs font-semibold text-muted ${
                    section.order === 1 ? "pt-1" : "mt-3 border-t border-edge pt-3"
                  }`}
                >
                  {sessionLabel}
                </div>
              )}
              <Link
                href={href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "bg-orange-50 dark:bg-orange-950 text-orange-600 dark:text-orange-400 font-medium"
                    : "hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300"
                }`}
              >
                <span className="font-mono text-xs text-zinc-400 w-6">{String(section.order).padStart(2, "0")}</span>
                <span className="flex-1 truncate">{section.title}</span>
                {isComplete && <span className="text-green-500">✓</span>}
              </Link>
            </Fragment>
          );
        })}
      </nav>
    </aside>
  );
}
