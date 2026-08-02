"use client";

import { usePrefs } from "@/context/PrefsContext";
import { useCopy } from "@/hooks/useCopy";
import { cn } from "@/lib/utils";
import { useSonic } from "@/hooks/useSonic";

export function ModeToggle({ className }: { className?: string }) {
  const { mode, toggleMode } = usePrefs();
  const copy = useCopy();
  const { playSwoosh } = useSonic();

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded border border-border bg-surface/80 p-1 font-mono text-[10px]",
        className,
      )}
      role="group"
      aria-label="حالت مخاطب"
    >
      {(["dev", "executive"] as const).map((value) => {
        const active = mode === value;
        return (
          <button
            key={value}
            type="button"
            aria-pressed={active}
            onClick={() => {
              if (mode !== value) {
                playSwoosh();
                toggleMode();
              }
            }}
            className={cn(
              "rounded px-2.5 py-1.5 transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50",
              active
                ? "bg-accent/15 text-accent"
                : "text-dim hover:text-foreground",
            )}
          >
            {copy.modeLabels[value]}
          </button>
        );
      })}
    </div>
  );
}
