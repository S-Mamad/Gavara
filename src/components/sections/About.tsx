"use client";

import { Reveal } from "@/components/ui/Reveal";
import { TeamImage } from "@/components/ui/TeamImage";
import { TeamLinks } from "@/components/ui/TeamLinks";
import { useCopy } from "@/hooks/useCopy";
import { useSite } from "@/context/CmsContext";

export function About() {
  const copy = useCopy();
  const data = useSite();
  const member = data.team[0];

  if (!member) return null;

  return (
    <section
      id="about"
      className="relative overflow-hidden border-b border-border py-20 sm:py-24 md:py-32"
    >
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 md:px-10">
        <div className="grid items-center gap-10 md:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] md:gap-14 lg:gap-20">
          <Reveal>
            <div className="relative mx-auto w-full max-w-[420px] overflow-hidden rounded-[1.5rem] bg-void sm:rounded-[1.75rem] md:mx-0 md:max-w-none">
              <div className="relative aspect-[3/4] w-full">
                <TeamImage member={member} />
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.06} className="text-center md:text-start">
            <p className="text-[12px] tracking-wide text-dim sm:text-[13px]">
              {copy.about.eyebrow || "درباره"}
            </p>
            <h2 className="mt-3 font-display text-[clamp(1.85rem,5vw,3rem)] leading-[1.12] text-foreground text-balance">
              {copy.about.title?.trim() || member.name}
            </h2>
            <p className="mt-3 text-[14px] text-accent sm:mt-4 sm:text-[15px]">
              {member.role}
            </p>
            <p className="mx-auto mt-5 max-w-md text-[14px] leading-[1.9] text-muted sm:mt-6 sm:text-[15px] md:mx-0 md:max-w-lg md:text-base">
              {member.bio}
            </p>
            {copy.about.description ? (
              <p className="mx-auto mt-4 max-w-md text-[13.5px] leading-[1.85] text-dim sm:text-sm md:mx-0">
                {copy.about.description}
              </p>
            ) : null}
            <div className="mt-7 flex justify-center md:justify-start">
              <TeamLinks member={member} />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
