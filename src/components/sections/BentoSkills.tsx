"use client";

import site from "@/data/site.json";
import type { SiteConfig } from "@/types";
import { useCopy } from "@/hooks/useCopy";
import { Reveal } from "@/components/ui/Reveal";
import { ServiceIcon } from "@/components/ui/ServiceIcon";
import { AmbientField } from "@/components/ui/AmbientField";

const data = site as SiteConfig;

export function BentoSkills() {
  const copy = useCopy();
  const services = data.services.filter((s) => s.visual !== "snippet");

  return (
    <section id="skills" className="relative overflow-hidden border-b border-border py-24 md:py-32">
      <AmbientField tone="steel" className="opacity-50" />
      <div className="relative mx-auto max-w-7xl px-5 md:px-10">
        <Reveal className="mb-12 max-w-xl md:mb-14">
          <h2 className="font-display text-[1.85rem] text-foreground md:text-[2.4rem]">
            {copy.bento.title}
          </h2>
          <p className="mt-4 text-[15px] leading-[1.85] text-muted">
            {copy.bento.description}
          </p>
        </Reveal>

        <div className="grid gap-px overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/5 p-px md:grid-cols-2">
          <div className="grid gap-px overflow-hidden rounded-[calc(1.5rem-1px)] bg-border md:col-span-2 md:grid-cols-2">
            {services.map((service, index) => (
              <Reveal key={service.id} delay={index * 0.04}>
                <article className="group flex h-full gap-4 bg-void/95 p-6 transition-colors duration-500 hover:bg-elevated/60 md:p-8">
                  <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/8 bg-white/[0.03] text-accent shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                    <ServiceIcon name={service.icon} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-display text-lg text-foreground md:text-xl">
                      {service.title}
                    </h3>
                    <p className="mt-2 max-w-[42ch] text-sm leading-[1.8] text-muted">
                      {service.description}
                    </p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
