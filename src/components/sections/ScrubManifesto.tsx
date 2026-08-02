"use client";

import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";

const LINES = [
  "محصولی که فردا هم قابل نگهداری بماند.",
  "فرانت type-safe، زیرساخت پایدار، برند دقیق.",
  "از ایده تا لانچ، بدون لایه‌های اضافه.",
];

export function ScrubManifesto() {
  const ref = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  return (
    <section
      ref={ref}
      className="relative overflow-hidden border-b border-border py-32 md:py-44"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(143,164,196,0.08),transparent_60%)]"
        aria-hidden
      />

      <div className="relative mx-auto max-w-5xl px-5 md:px-10">
        <div className="space-y-8 md:space-y-10">
          {LINES.map((line, index) => (
            <ScrubLine
              key={line}
              text={line}
              progress={scrollYProgress}
              index={index}
              total={LINES.length}
              reduceMotion={!!reduceMotion}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function ScrubLine({
  text,
  progress,
  index,
  total,
  reduceMotion,
}: {
  text: string;
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
  index: number;
  total: number;
  reduceMotion: boolean;
}) {
  const start = index / (total + 1);
  const end = (index + 1.2) / (total + 1);
  const opacity = useTransform(progress, [start, end], [0.18, 1]);
  const y = useTransform(progress, [start, end], [28, 0]);

  if (reduceMotion) {
    return (
      <p className="font-display text-[clamp(1.6rem,4.2vw,3.25rem)] leading-[1.25] text-foreground">
        {text}
      </p>
    );
  }

  return (
    <motion.p
      style={{ opacity, y }}
      className="font-display text-[clamp(1.6rem,4.2vw,3.25rem)] leading-[1.25] text-foreground"
    >
      {text}
    </motion.p>
  );
}
