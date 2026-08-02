"use client";

import { useEffect, useMemo, useState } from "react";
import { useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

export function TypewriterLine({
  className,
  phrases,
}: {
  className?: string;
  phrases: string[];
}) {
  const lines = useMemo(() => {
    const cleaned = phrases.map((p) => p.trim()).filter(Boolean);
    return cleaned.length ? cleaned : [" "];
  }, [phrases]);

  const key = lines.join("\u0001");
  const reduceMotion = useReducedMotion();
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [text, setText] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setPhraseIndex(0);
    setDeleting(false);
    setText(reduceMotion ? lines[0]! : "");
  }, [key, reduceMotion, lines]);

  useEffect(() => {
    if (reduceMotion) {
      setText(lines[0]!);
      return;
    }

    if (lines.length === 1) {
      const current = lines[0]!;
      if (text === current) return;
      const tick = window.setTimeout(() => {
        setText(current.slice(0, text.length + 1));
      }, 42);
      return () => window.clearTimeout(tick);
    }

    const current = lines[phraseIndex % lines.length]!;
    const doneTyping = text === current && !deleting;
    const doneDeleting = deleting && text.length === 0;

    if (doneTyping) {
      const pause = window.setTimeout(() => setDeleting(true), 1800);
      return () => window.clearTimeout(pause);
    }

    if (doneDeleting) {
      setDeleting(false);
      setPhraseIndex((i) => (i + 1) % lines.length);
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
  }, [text, deleting, phraseIndex, reduceMotion, lines, key]);

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

/** Split CMS description into typewriter phrases (`|` or newlines). */
export function phrasesFromDescription(description: string): string[] {
  return description
    .split(/\n|\|/)
    .map((p) => p.trim())
    .filter(Boolean);
}
