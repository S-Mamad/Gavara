"use client";

import type { ServiceItem } from "@/types";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/ui/Reveal";
import { ServiceIcon } from "@/components/ui/ServiceIcon";
import { useCopy } from "@/hooks/useCopy";
import { useSite } from "@/context/CmsContext";

function ServiceRow({
  service,
  index,
}: {
  service: ServiceItem;
  index: number;
}) {
  return (
    <Reveal delay={index * 0.05}>
      <article
        className={cn(
          "group flex gap-4 border-b border-border/80 py-6 transition-colors duration-300 last:border-b-0 sm:gap-5 sm:py-7 md:gap-6 md:py-8",
          index === 0 && "pt-0",
        )}
      >
        <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-accent transition-colors duration-300 group-hover:border-accent/35 group-hover:bg-accent/10 sm:h-11 sm:w-11">
          <ServiceIcon name={service.icon} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h3 className="font-display text-lg text-foreground sm:text-xl md:text-[1.35rem]">
              {service.title}
            </h3>
            <span className="font-mono text-[10px] text-dim" dir="ltr">
              0{index + 1}
            </span>
          </div>
          <p className="mt-2 max-w-2xl text-[13.5px] leading-[1.85] text-muted sm:text-sm md:text-[15px]">
            {service.description}
          </p>
        </div>
      </article>
    </Reveal>
  );
}

export function Expertise() {
  const copy = useCopy();
  const data = useSite();

  return (
    <section
      id="expertise"
      className="relative overflow-hidden border-b border-border py-20 sm:py-28 md:py-36"
    >
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:gap-12 sm:px-6 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:gap-16 md:px-10">
        <Reveal className="md:sticky md:top-28 md:self-start">
          {copy.bento.eyebrow ? (
            <p className="mb-3 text-[12px] tracking-wide text-dim sm:text-[13px]">
              {copy.bento.eyebrow}
            </p>
          ) : null}
          <h2 className="font-display text-[clamp(1.65rem,5vw,2.75rem)] leading-[1.15] text-foreground text-balance">
            {copy.bento.title}
          </h2>
          <p className="mt-4 max-w-md text-[14px] leading-[1.85] text-muted sm:mt-5 sm:text-[15px] md:text-base">
            {copy.bento.description}
          </p>
        </Reveal>

        <div>
          {data.services.map((service, index) => (
            <ServiceRow key={service.id} service={service} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
