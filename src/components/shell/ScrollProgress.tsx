"use client";

import { motion, useReducedMotion, useScroll, useSpring } from "motion/react";

export function ScrollProgress() {
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  if (reduceMotion) return null;

  return (
    <motion.div
      className="motion-safe fixed inset-x-0 top-0 z-[var(--z-progress)] h-[2px] origin-[100%_50%] bg-accent/80"
      style={{ scaleX }}
      aria-hidden
    />
  );
}
