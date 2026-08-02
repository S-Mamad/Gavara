"use client";

import Image from "next/image";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { useRef } from "react";
import { BrowserFrame } from "@/components/ui/BrowserFrame";

export function HeroShowcase() {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, 24]);

  return (
    <motion.div
      ref={ref}
      className="relative w-full"
      initial={reduceMotion ? false : { opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.7,
        delay: 0.24,
        ease: [0.32, 0.72, 0, 1],
      }}
    >
      <div
        className="pointer-events-none absolute -inset-8 rounded-full bg-accent/6 blur-3xl md:-inset-12"
        aria-hidden
      />
      <motion.div style={reduceMotion ? undefined : { y }}>
        <BrowserFrame label="حاجی‌عسل" className="relative">
          <div className="relative aspect-[16/10] w-full">
            <Image
              src="/portfolio/hero-showcase.webp"
              alt="پیش‌نمایش فروشگاه حاجی عسل، پروژه راکسین‌شاپ"
              fill
              priority
              className="object-cover object-top"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </BrowserFrame>
      </motion.div>
    </motion.div>
  );
}
