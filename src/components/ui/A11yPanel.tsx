"use client";

import { useEffect, useRef, useState } from "react";
import { GearSix, X } from "@phosphor-icons/react";
import { usePrefs } from "@/context/PrefsContext";
import { cn } from "@/lib/utils";

export function A11yPanel() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const {
    highContrast,
    forceReducedMotion,
    setHighContrast,
    setForceReducedMotion,
  } = usePrefs();

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="a11y-panel"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-9 w-9 items-center justify-center border border-border bg-surface/80 text-muted transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
        aria-label="تنظیمات دسترسی‌پذیری"
      >
        <GearSix className="h-4 w-4" weight="bold" />
      </button>

      {open ? (
        <div
          id="a11y-panel"
          ref={panelRef}
          role="dialog"
          aria-label="پنل دسترسی‌پذیری"
          className="absolute end-0 top-11 z-[var(--z-panel)] w-64 border border-border bg-elevated p-4 shadow-xl"
        >
          <div className="mb-3 flex items-center justify-between">
            <p className="font-mono text-[11px] text-muted">a11y / prefs</p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-dim hover:text-foreground"
              aria-label="بستن"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <ul className="space-y-3 text-sm">
            <ToggleRow
              label="کنتراست بالا"
              checked={highContrast}
              onChange={setHighContrast}
            />
            <ToggleRow
              label="کاهش حرکت"
              checked={forceReducedMotion}
              onChange={setForceReducedMotion}
            />
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <li className="flex items-center justify-between gap-3">
      <span className="text-foreground">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-6 w-10 rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50",
          checked ? "border-accent bg-accent/20" : "border-border bg-surface",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-4 w-4 rounded-full bg-foreground transition-transform duration-200",
            checked ? "start-5" : "start-0.5",
          )}
        />
      </button>
    </li>
  );
}
