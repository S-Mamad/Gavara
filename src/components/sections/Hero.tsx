"use client";

import { ArrowLeft } from "@phosphor-icons/react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { useRef } from "react";
import Link from "next/link";
import { useCopy } from "@/hooks/useCopy";
import { usePrefs } from "@/context/PrefsContext";
import { TypewriterLine } from "@/components/ui/TypewriterLine";
import { HeroCodeStage } from "@/components/sections/HeroCodeStage";

const ease = [0.32, 0.72, 0, 1] as const;

const ctaBase =
  "inline-flex h-11 w-full items-center justify-center gap-2 rounded-full px-5 text-[13px] font-medium transition-colors duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-void active:scale-[0.98] sm:h-12 sm:w-auto sm:gap-2.5 sm:px-6 sm:text-sm";

export function Hero() {
  const copy = useCopy();
  const { forceReducedMotion } = usePrefs();
  const reduceMotion = useReducedMotion() || forceReducedMotion;
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0.55]);

  return (
    <section
      ref={sectionRef}
      id="home"
      className="relative z-[1] flex min-h-[100dvh] items-center overflow-hidden"
    >
      <motion.div
        style={reduceMotion ? undefined : { opacity: contentOpacity }}
        className="relative z-[var(--z-content)] mx-auto grid w-full max-w-7xl items-center gap-8 px-4 pb-14 pt-24 sm:gap-10 sm:px-6 sm:pb-16 sm:pt-28 md:grid-cols-2 md:gap-10 md:px-10 md:pb-20 lg:gap-14"
      >
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}
          className="mx-auto w-full max-w-xl text-center md:mx-0 md:text-start"
        >
          <h1 className="font-display text-[clamp(2.15rem,9vw,4.75rem)] leading-[1.08] tracking-tight text-foreground">
            راکسین‌شاپ
          </h1>

          <p className="mt-4 font-display text-[clamp(1.05rem,3.8vw,1.65rem)] leading-[1.3] text-accent-bright sm:mt-5">
            {copy.hero.title} {copy.hero.highlight}
          </p>

          <TypewriterLine className="mx-auto mt-4 max-w-[28ch] sm:mt-5 sm:max-w-[34ch] md:mx-0" />

          <div className="mt-8 flex flex-col gap-2.5 sm:mt-9 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-3 md:justify-start">
            <Link
              href="#contact"
              className={`${ctaBase} group border border-accent/35 bg-accent text-void hover:bg-accent-bright`}
            >
              {copy.hero.primaryCta}
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-void/10 transition-transform duration-300 group-hover:-translate-x-0.5">
                <ArrowLeft className="h-3.5 w-3.5" weight="bold" />
              </span>
            </Link>
            <Link
              href="/work"
              className={`${ctaBase} border border-border-bright text-foreground hover:border-accent/40 hover:text-accent`}
            >
              {copy.hero.secondaryCta}
            </Link>
          </div>
        </motion.div>

        <div className="relative w-full">
          <HeroCodeStage />
        </div>
      </motion.div>
    </section>
  );
}
