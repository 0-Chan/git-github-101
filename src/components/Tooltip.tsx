"use client";
import { cloneElement, type MouseEvent, type ReactElement, type ReactNode, useEffect, useRef, useState } from "react";

interface TooltipProps {
  content: ReactNode;
  /** A single interactive element (e.g. a button) that toggles the tooltip on click. */
  children: ReactElement<{ onClick?: (e: MouseEvent) => void }>;
}

/**
 * Click-triggered tooltip (popover). Clicking the trigger toggles it; clicking
 * outside or pressing Escape dismisses it. The toggle is attached to the passed
 * element itself so the trigger stays a real, keyboard-accessible control.
 */
export function Tooltip({ content, children }: TooltipProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const trigger = cloneElement(children, {
    onClick: (e: MouseEvent) => {
      children.props.onClick?.(e);
      setOpen((v) => !v);
    },
  });

  return (
    <span ref={ref} className="relative inline-block">
      {trigger}
      {open && (
        <span
          role="tooltip"
          className="absolute right-0 top-full z-50 mt-2 w-max max-w-[16rem] rounded-md border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-100 shadow-lg"
        >
          {content}
        </span>
      )}
    </span>
  );
}
