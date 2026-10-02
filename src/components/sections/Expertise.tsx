"use client";

import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { useRef } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { useCopy } from "@/hooks/useCopy";
import { usePrefs } from "@/context/PrefsContext";
import { useSite } from "@/context/CmsContext";
import type { ServiceItem } from "@/types";

const ease = [0.22, 1, 0.36, 1] as const;

function FeatureCard({
  children,
  index,
}: {
  children: React.ReactNode;
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const { forceReducedMotion } = usePrefs();
  const reduceMotion = useReducedMotion() || forceReducedMotion;

  return (
    <motion.div
      ref={ref}
      className="relative flex h-full min-h-0 w-[min(85vw,320px)] shrink-0 flex-col overflow-hidden rounded-2xl bg-panel p-4 sm:min-h-[280px] sm:w-auto sm:shrink sm:p-5 md:rounded-[1.5rem] md:p-6"
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      animate={
        isInView || reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }
      }
      transition={{ delay: index * 0.08, duration: 0.5, ease }}
    >
      {children}
    </motion.div>
  );
}

function ServiceCard({
  service,
  index,
}: {
  service: ServiceItem;
  index: number;
}) {
  const number = String(index).padStart(2, "0");

  return (
    <FeatureCard index={index}>
      <div className="mb-4 flex items-baseline justify-between gap-3 sm:mb-6">
        <h3 className="text-base font-semibold text-foreground sm:text-lg md:text-xl">
          {service.title}
        </h3>
        <span className="text-[11px] text-dim sm:text-xs" dir="ltr">
          {number}
        </span>
      </div>

      {service.description ? (
        <p className="mb-auto text-[13px] leading-relaxed text-muted sm:text-sm">
          {service.description}
        </p>
      ) : null}

      <Link
        href={`/?service=${encodeURIComponent(service.title)}#contact`}
        aria-label={`شروع گفتگو درباره ${service.title}`}
        className="mt-5 inline-flex items-center gap-2 text-[13px] text-accent transition-opacity hover:opacity-80 sm:mt-6 sm:text-sm"
      >
        شروع گفتگو
        <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" weight="bold" />
      </Link>
    </FeatureCard>
  );
}

export function Expertise() {
  const copy = useCopy();
  const data = useSite();

  return (
    <section
      id="expertise"
      className="relative overflow-hidden bg-void px-4 py-16 sm:px-6 sm:py-20 md:px-8 md:py-24"
    >
      <div className="bg-noise pointer-events-none absolute inset-0 opacity-[0.1]" />

      <div className="relative z-10 mx-auto max-w-7xl">
        <Reveal className="mx-auto mb-8 max-w-2xl text-center sm:mb-12 md:mb-14">
          {copy.bento.eyebrow ? (
            <p className="mb-2 text-[12px] text-dim sm:mb-3 sm:text-[13px]">
              {copy.bento.eyebrow}
            </p>
          ) : null}
          <h2 className="font-display text-[clamp(1.45rem,6vw,2.75rem)] leading-[1.25] text-foreground">
            {copy.bento.title}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-[13.5px] leading-[1.8] text-muted sm:mt-4 sm:text-[15px]">
            {copy.bento.description}
          </p>
        </Reveal>

        <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [-ms-overflow-style:none] sm:mx-0 sm:grid sm:snap-none sm:grid-cols-2 sm:gap-3 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-4 [&::-webkit-scrollbar]:hidden">
          {data.services.map((service, i) => (
            <div key={service.id} className="snap-center sm:snap-align-none sm:contents">
              <ServiceCard service={service} index={i + 1} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
