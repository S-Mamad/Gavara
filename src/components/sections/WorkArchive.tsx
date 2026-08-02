"use client";

import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react";
import projects from "@/data/projects.json";
import capabilities from "@/data/capabilities.json";
import type { CapabilityItem, ProjectItem } from "@/types";
import { Reveal } from "@/components/ui/Reveal";
import { ProjectArchiveCard } from "@/components/sections/ProjectArchiveCard";
import { CapabilityCard } from "@/components/sections/CapabilityCard";

const projectData = projects as ProjectItem[];
const capabilityData = capabilities as CapabilityItem[];

export function WorkArchive() {
  return (
    <div className="relative overflow-hidden pb-20 pt-28 sm:pb-28 sm:pt-32 md:pb-36 md:pt-36">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 md:px-10">
        <Reveal className="mb-10 max-w-2xl sm:mb-14">
          <Link
            href="/#work"
            className="mb-6 inline-flex items-center gap-2 text-[13px] text-dim transition-colors hover:text-accent"
          >
            <ArrowLeft className="h-3.5 w-3.5 rotate-180" weight="bold" />
            بازگشت
          </Link>
          <h1 className="font-display text-[clamp(2rem,6vw,3.5rem)] leading-[1.1] tracking-tight text-foreground">
            کارها و خدمات
          </h1>
          <p className="mt-4 max-w-xl text-[14px] leading-[1.85] text-muted sm:text-[15px]">
            نمونه‌کارهای واقعی، بعد خدمات استودیو؛ از وب و تلگرام تا برند و
            زیرساخت.
          </p>
        </Reveal>

        <Reveal className="mb-6 sm:mb-8">
          <p className="label-mono text-[11px] text-dim">Selected work</p>
          <h2 className="mt-2 font-display text-xl text-foreground sm:text-2xl">
            نمونه‌کارها
          </h2>
        </Reveal>

        <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
          {projectData.map((project, index) => (
            <ProjectArchiveCard
              key={project.id}
              project={project}
              index={index}
            />
          ))}
        </div>

        <section className="mt-20 border-t border-white/10 pt-14 sm:mt-24 sm:pt-16 md:mt-28 md:pt-20">
          <Reveal className="mb-8 max-w-2xl sm:mb-10 md:mb-12">
            <p className="label-mono text-[11px] text-dim">Services</p>
            <h2 className="mt-3 font-display text-[clamp(1.75rem,4.5vw,2.75rem)] leading-[1.15] tracking-tight text-foreground">
              خدمات استودیو
            </h2>
            <p className="mt-4 max-w-lg text-[14px] leading-[1.85] text-muted sm:text-[15px]">
              این‌ها محصول فروشگاهی نیستند؛ کارهایی‌ست که انجام می‌دهیم. هر کدام
              را بزن تا درباره همان پروژه حرف بزنیم.
            </p>
          </Reveal>

          <div className="grid sm:grid-cols-2 sm:gap-3 lg:grid-cols-4 lg:gap-4">
            {capabilityData.map((item, index) => (
              <CapabilityCard key={item.id} item={item} index={index} />
            ))}
          </div>
        </section>

        <Reveal className="mt-14 flex justify-center sm:mt-16 md:mt-20">
          <Link
            href="/#contact"
            className="group inline-flex h-12 items-center gap-2.5 rounded-full bg-accent px-6 text-sm font-medium text-void transition-colors hover:bg-accent-bright"
          >
            شروع پروژه
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-void/10 transition-transform duration-300 group-hover:-translate-x-0.5">
              <ArrowLeft className="h-3.5 w-3.5" weight="bold" />
            </span>
          </Link>
        </Reveal>
      </div>
    </div>
  );
}
