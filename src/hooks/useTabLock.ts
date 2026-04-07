"use client";
import { useEffect, useState } from "react";

export function useTabLock(slug: string) {
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    const channel = new BroadcastChannel(`git101-lesson-${slug}`);
    channel.postMessage({ type: "check" });

    const handler = (event: MessageEvent) => {
      if (event.data.type === "check") {
        channel.postMessage({ type: "active" });
      } else if (event.data.type === "active") {
        setIsLocked(true);
      }
    };

    channel.addEventListener("message", handler);
    return () => {
      channel.removeEventListener("message", handler);
      channel.close();
    };
  }, [slug]);

  return isLocked;
}
