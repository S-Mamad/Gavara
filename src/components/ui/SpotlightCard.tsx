"use client";

import { useCallback, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SpotlightCardProps {
  children: ReactNode;
  className?: string;
  as?: "div" | "article" | "li";
}

export function SpotlightCard({
  children,
  className,
  as: Tag = "div",
}: SpotlightCardProps) {
  const onMove = useCallback((event: React.PointerEvent<HTMLElement>) => {
    const el = event.currentTarget;
    const rect = el.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    el.style.setProperty("--mouse-x", `${x}%`);
    el.style.setProperty("--mouse-y", `${y}%`);
  }, []);

  return (
    <Tag
      onPointerMove={onMove}
      className={cn("spotlight-card glass-panel rounded-xl", className)}
    >
      <div className="relative z-[1] h-full">{children}</div>
    </Tag>
  );
}
