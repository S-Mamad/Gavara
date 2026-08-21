import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface BrowserFrameProps {
  children: ReactNode;
  label?: string;
  className?: string;
}

export function BrowserFrame({ children, label, className }: BrowserFrameProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[1.35rem] border border-border-bright bg-elevated shadow-[0_32px_80px_-24px_rgba(0,0,0,0.75)]",
        className,
      )}
    >
      <div className="relative overflow-hidden">{children}</div>
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-[2] flex h-10 items-center gap-2 border-b border-white/10 bg-[#0c0c10]/92 px-4 backdrop-blur-md"
        aria-hidden
      >
        <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-signal/70" />
        <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-amber-500/50" />
        <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-accent/50" />
        {label ? (
          <span
            className="ms-auto max-w-[65%] truncate rounded-md border border-white/8 bg-black/35 px-2 py-0.5 font-mono text-[10px] text-dim"
            dir="ltr"
          >
            {label}
          </span>
        ) : null}
      </div>
    </div>
  );
}
