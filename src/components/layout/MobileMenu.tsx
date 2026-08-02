"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import site from "@/data/site.json";
import type { SiteConfig } from "@/types";
import { cn } from "@/lib/utils";
import { useScrollSpy } from "@/hooks/useScrollSpy";

const data = site as SiteConfig;
const sectionIds = data.nav.map((n) => n.id);

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const activeId = useScrollSpy(sectionIds);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        ref={triggerRef}
        type="button"
        aria-label={open ? "بستن منو" : "باز کردن منو"}
        aria-expanded={open}
        aria-controls="mobile-menu-panel"
        onClick={() => setOpen((v) => !v)}
        className="relative z-[61] flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04]"
      >
        <span
          className={cn(
            "absolute h-px w-5 bg-foreground transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
            open ? "translate-y-0 rotate-45" : "-translate-y-[3px]",
          )}
          aria-hidden
        />
        <span
          className={cn(
            "absolute h-px w-5 bg-foreground transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
            open ? "translate-y-0 -rotate-45" : "translate-y-[3px]",
          )}
          aria-hidden
        />
      </button>

      {mounted
        ? createPortal(
            <AnimatePresence>
              {open ? (
                <>
                  <motion.button
                    key="mobile-menu-scrim"
                    type="button"
                    aria-label="بستن منو"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 z-[78] bg-black/45"
                    onClick={() => setOpen(false)}
                  />
                  <motion.div
                    key="mobile-menu-panel"
                    id="mobile-menu-panel"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby={titleId}
                    initial={{ opacity: 0, y: -8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.98 }}
                    transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
                    className="fixed inset-x-3 top-[4.25rem] z-[79] mx-auto max-w-sm overflow-hidden rounded-2xl border border-white/10 bg-[#0e0e12]/96 shadow-[0_24px_60px_-28px_rgba(0,0,0,0.85)] backdrop-blur-xl sm:inset-x-auto sm:end-4 sm:start-auto sm:w-[280px]"
                  >
                    <p id={titleId} className="sr-only">
                      منوی موبایل
                    </p>
                    <nav className="flex flex-col p-2">
                      {data.nav.map((item) => (
                        <Link
                          key={item.id}
                          href={item.href}
                          onClick={() => setOpen(false)}
                          className={cn(
                            "rounded-xl px-3.5 py-3 text-[15px] transition-colors",
                            activeId === item.id
                              ? "bg-white/[0.06] text-accent"
                              : "text-foreground/90 hover:bg-white/[0.04]",
                          )}
                        >
                          {item.label}
                        </Link>
                      ))}
                      <div className="mt-1 border-t border-white/8 px-1 pt-2">
                        <Link
                          href="/#contact"
                          onClick={() => setOpen(false)}
                          className="flex h-10 items-center justify-center rounded-xl bg-accent text-[13px] font-medium text-void"
                        >
                          شروع پروژه
                        </Link>
                      </div>
                    </nav>
                  </motion.div>
                </>
              ) : null}
            </AnimatePresence>,
            document.body,
          )
        : null}
    </div>
  );
}
