"use client";

import { TeamImage } from "@/components/ui/TeamImage";
import { TeamLinks } from "@/components/ui/TeamLinks";
import { Reveal } from "@/components/ui/Reveal";
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
      className="relative overflow-hidden bg-void px-4 py-16 sm:px-6 sm:py-20 md:px-8 md:py-24"
    >
      <div className="mx-auto grid max-w-6xl items-center gap-10 rounded-2xl bg-surface px-5 py-10 sm:gap-12 sm:px-8 sm:py-14 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:gap-14 md:rounded-3xl md:px-12 md:py-16">
        <Reveal>
          <div className="relative mx-auto w-full max-w-[380px] overflow-hidden rounded-2xl bg-void md:mx-0 md:max-w-none">
            <div className="relative aspect-[3/4] w-full">
              <TeamImage member={member} />
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.06} className="text-center md:text-start">
          <p className="text-[12px] text-dim sm:text-[13px]">
            {copy.about.eyebrow || "درباره"}
          </p>
          <h2 className="mt-3 font-display text-[clamp(1.85rem,4.5vw,3rem)] leading-[1.15] text-foreground">
            {copy.about.title?.trim() || member.name}
          </h2>
          <p className="mt-3 text-[14px] text-accent sm:text-[15px]">
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
    </section>
  );
}
