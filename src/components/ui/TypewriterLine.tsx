"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

const PHRASES = [
  "سایت، فروشگاه و محصول دیجیتال",
  "ربات تلگرام، پنل و اتوماسیون",
  "دیزاین، کد و لانچ در یک تیم",
];

export function TypewriterLine({ className }: { className?: string }) {
  const reduceMotion = useReducedMotion();
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [text, setText] = useState(reduceMotion ? PHRASES[0] : "");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (reduceMotion) {
      setText(PHRASES[0]);
      return;
    }

    const current = PHRASES[phraseIndex];
    const doneTyping = text === current && !deleting;
    const doneDeleting = deleting && text.length === 0;

    if (doneTyping) {
      const pause = window.setTimeout(() => setDeleting(true), 1800);
      return () => window.clearTimeout(pause);
    }

    if (doneDeleting) {
      setDeleting(false);
      setPhraseIndex((i) => (i + 1) % PHRASES.length);
      return;
    }

    const delay = deleting ? 28 : 42;
    const tick = window.setTimeout(() => {
      setText((prev) =>
        deleting
          ? current.slice(0, Math.max(0, prev.length - 1))
          : current.slice(0, prev.length + 1),
      );
    }, delay);

    return () => window.clearTimeout(tick);
  }, [text, deleting, phraseIndex, reduceMotion]);

  return (
    <p
      className={cn(
        "min-h-[2.8em] text-[14px] leading-[1.7] text-muted sm:min-h-[1.7em] sm:text-[15px] md:text-base",
        className,
      )}
      aria-live="polite"
    >
      {text}
      {!reduceMotion ? (
        <span
          className="ms-0.5 inline-block h-[1.05em] w-[2px] translate-y-[0.15em] bg-accent align-middle animate-pulse"
          aria-hidden
        />
      ) : null}
    </p>
  );
}
