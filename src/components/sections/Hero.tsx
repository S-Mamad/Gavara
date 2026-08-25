"use client";

import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react";
import { motion, useReducedMotion } from "motion/react";
import { useCopy } from "@/hooks/useCopy";
import { usePrefs } from "@/context/PrefsContext";

const HERO_VIDEO =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_170732_8a9ccda6-5cff-4628-b164-059c500a2b41.mp4";

const ease = [0.16, 1, 0.3, 1] as const;

export function Hero() {
  const copy = useCopy();
  const { forceReducedMotion } = usePrefs();
  const reduceMotion = useReducedMotion() || forceReducedMotion;

  return (
    <section
      id="home"
      className="relative z-[1] min-h-[100dvh] p-3 pt-20 sm:p-4 sm:pt-24 md:p-6 md:pt-28"
    >
      <div className="relative flex min-h-[calc(100dvh-6rem)] overflow-hidden rounded-2xl md:min-h-[calc(100dvh-7.5rem)] md:rounded-[2rem]">
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src={HERO_VIDEO}
          autoPlay={!reduceMotion}
          loop
          muted
          playsInline
          poster="/og/raxinshop.webp"
        />

        <div className="noise-overlay pointer-events-none absolute inset-0 opacity-50 mix-blend-overlay" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/50 via-black/25 to-black/75" />

        <div className="relative z-10 flex w-full flex-col justify-end px-5 pb-8 pt-10 sm:px-8 sm:pb-10 md:px-12 md:pb-14">
          <div dir="ltr" className="flex w-full justify-end">
            <motion.div
              dir="rtl"
              className="flex w-full max-w-md flex-col gap-5 md:w-[min(100%,26rem)]"
              initial={reduceMotion ? false : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12, duration: 0.65, ease }}
            >
              {copy.hero.description ? (
                <p className="text-[14px] leading-[1.85] text-accent/70 sm:text-[15px] md:text-base">
                  {copy.hero.description}
                </p>
              ) : null}

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="#contact"
                  className="group inline-flex items-center gap-2 rounded-full bg-accent py-1.5 pe-1.5 ps-5 text-sm font-medium text-black transition-[gap] duration-300 hover:gap-3 sm:text-[15px]"
                >
                  {copy.hero.primaryCta}
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black transition-transform duration-300 group-hover:scale-105 sm:h-10 sm:w-10">
                    <ArrowLeft className="h-4 w-4 text-accent" weight="bold" />
                  </span>
                </Link>
                <Link
                  href="/#work"
                  className="rounded-full border border-accent/25 px-4 py-2.5 text-sm text-accent/80 transition-colors hover:border-accent/45 hover:text-accent"
                >
                  {copy.hero.secondaryCta}
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
