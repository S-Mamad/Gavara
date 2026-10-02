"use client";

import { Hero } from "@/components/sections/Hero";
import { Work } from "@/components/sections/Work";
import { Expertise } from "@/components/sections/Expertise";
import { About } from "@/components/sections/About";
import { Contact } from "@/components/sections/Contact";
import { useLayout } from "@/context/CmsContext";
import type { HomeSectionId } from "@/lib/cms/types";
import type { ComponentType } from "react";

const SECTION_MAP: Record<HomeSectionId, ComponentType> = {
  hero: Hero,
  work: Work,
  expertise: Expertise,
  about: About,
  contact: Contact,
};

export function HomeSections({
  initialService = null,
}: {
  initialService?: string | null;
}) {
  const layout = useLayout();

  return (
    <>
      {layout.sections
        .filter((s) => s.enabled)
        .map((section) => {
          if (section.id === "contact") {
            return <Contact key="contact" initialService={initialService} />;
          }
          const Comp = SECTION_MAP[section.id];
          if (!Comp) return null;
          return <Comp key={section.id} />;
        })}
    </>
  );
}
