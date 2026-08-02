"use client";

import site from "@/data/site.json";
import type { SiteConfig, TeamMember } from "@/types";
import { Reveal } from "@/components/ui/Reveal";
import { TeamImage } from "@/components/ui/TeamImage";
import { TeamLinks } from "@/components/ui/TeamLinks";
import { useCopy } from "@/hooks/useCopy";

const data = site as SiteConfig;

function TeamCard({ member }: { member: TeamMember }) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-1 sm:rounded-[1.5rem] sm:p-1.5">
      <div className="relative aspect-[4/5] overflow-hidden rounded-[calc(1rem-2px)] bg-void sm:aspect-[3/4] sm:rounded-[calc(1.5rem-0.375rem)]">
        <TeamImage member={member} />
        <div className="absolute inset-0 bg-gradient-to-t from-void/90 via-void/15 to-transparent" />
      </div>

      <div className="space-y-2.5 p-4 sm:space-y-3 sm:p-5 md:p-6">
        <div>
          <h3 className="font-display text-lg text-foreground sm:text-xl md:text-2xl">
            {member.name}
          </h3>
          <p className="mt-1 text-[13px] text-accent sm:text-sm">{member.role}</p>
        </div>
        <p className="text-[13.5px] leading-[1.8] text-muted sm:text-sm">
          {member.bio}
        </p>
        <TeamLinks member={member} />
      </div>
    </article>
  );
}

export function About() {
  const copy = useCopy();

  return (
    <section
      id="about"
      className="relative overflow-hidden border-b border-border py-20 sm:py-24 md:py-32"
    >
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 md:px-10">
        <Reveal className="mb-10 max-w-xl sm:mb-12 md:mb-14">
          <h2 className="font-display text-[clamp(1.65rem,5vw,2.4rem)] leading-[1.15] text-foreground">
            {copy.about.title}
          </h2>
          <p className="mt-4 text-[14px] leading-[1.85] text-muted sm:text-[15px]">
            {copy.about.description}
          </p>
        </Reveal>

        <div className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-2 sm:gap-5 md:gap-6">
          {data.team.map((member, i) => (
            <Reveal key={member.id} delay={i * 0.05}>
              <TeamCard member={member} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
