"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { ArrowLeft } from "@phosphor-icons/react";
import { motion, useReducedMotion } from "motion/react";
import { useCopy } from "@/hooks/useCopy";
import { usePrefs } from "@/context/PrefsContext";
import { useSite } from "@/context/CmsContext";

const HERO_VIDEO =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_170732_8a9ccda6-5cff-4628-b164-059c500a2b41.mp4";
const HERO_POSTER = "/hero/poster.jpg";

const ease = [0.16, 1, 0.3, 1] as const;

export function Hero() {
  const copy = useCopy();
  const site = useSite();
  const { forceReducedMotion } = usePrefs();
  const reduceMotion = useReducedMotion() || forceReducedMotion;
  const videoRef = useRef<HTMLVideoElement>(null);
  const heading = copy.hero.title.trim() || site.brand.name;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (reduceMotion) {
      video.pause();
      return;
    }
    void video.play().catch(() => {});
  }, [reduceMotion]);

  return (
    <section
      id="home"
      className="relative z-[1] min-h-[100dvh] p-3 pt-20 sm:p-4 sm:pt-24 md:p-6 md:pt-28"
    >
      <div className="relative flex min-h-[calc(100dvh-6rem)] overflow-hidden rounded-2xl md:min-h-[calc(100dvh-7.5rem)] md:rounded-[2rem]">
        <img
          src={HERO_POSTER}
          alt=""
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        />
        {reduceMotion ? null : (
          <video
            ref={videoRef}
            className="pointer-events-none absolute inset-0 h-full w-full object-cover"
            src={HERO_VIDEO}
            poster={HERO_POSTER}
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            controls={false}
            disablePictureInPicture
            aria-hidden
          />
        )}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/45 via-black/20 to-black/75" />

        <div className="relative z-10 flex w-full flex-col justify-end px-5 pb-8 pt-16 sm:px-8 sm:pb-10 md:px-12 md:pb-14">
          <div dir="ltr" className="flex w-full justify-end">
            <motion.div
              dir="rtl"
              className="flex w-full max-w-md flex-col gap-4 md:w-[min(100%,28rem)]"
              initial={reduceMotion ? false : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12, duration: 0.65, ease }}
            >
              <h1 className="font-display text-[clamp(2rem,6vw,3.35rem)] leading-[1.15] text-foreground">
                {heading}
              </h1>
              {copy.hero.highlight ? (
                <p className="text-[15px] leading-relaxed text-accent sm:text-base">
                  {copy.hero.highlight}
                </p>
              ) : null}
              {copy.hero.description ? (
                <p className="text-[14px] leading-[1.85] text-foreground/90 sm:text-[15px] md:text-base">
                  {copy.hero.description}
                </p>
              ) : null}

              <div className="flex flex-wrap items-center gap-3 pt-1">
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
                  className="rounded-full border border-accent/40 px-4 py-2.5 text-sm text-foreground transition-colors hover:border-accent/70 hover:text-accent"
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
