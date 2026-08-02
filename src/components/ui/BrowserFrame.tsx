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
        "overflow-hidden rounded-[1.35rem] border border-border-bright bg-elevated shadow-[0_32px_80px_-24px_rgba(0,0,0,0.75)]",
        className,
      )}
    >
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-signal/70" aria-hidden />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-500/50" aria-hidden />
        <span className="h-2.5 w-2.5 rounded-full bg-accent/50" aria-hidden />
        {label ? (
          <span className="mr-auto truncate font-mono text-[10px] text-dim" dir="ltr">
            {label}
          </span>
        ) : null}
      </div>
      <div className="relative">{children}</div>
    </div>
  );
}
