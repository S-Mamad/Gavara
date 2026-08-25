"use client";

import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { useRef } from "react";
import type { ProjectItem } from "@/types";
import { useCopy } from "@/hooks/useCopy";
import { useProjects } from "@/context/CmsContext";
import { Reveal } from "@/components/ui/Reveal";
import { ProjectCover } from "@/components/ui/ProjectCover";
import { cn } from "@/lib/utils";

export function Work() {
  const copy = useCopy();
  const projects = useProjects();
  const preview = projects.filter((p) => p.featured).slice(0, 3);

  return (
    <section
      id="work"
      className="relative overflow-hidden bg-void py-20 sm:py-28 md:py-36"
    >
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 md:px-10">
        <Reveal className="mb-10 max-w-2xl sm:mb-12 md:mb-16">
          {copy.work.eyebrow ? (
            <p className="mb-3 text-[12px] tracking-wide text-dim sm:text-[13px]">
              {copy.work.eyebrow}
            </p>
          ) : null}
          <h2 className="font-display text-[clamp(1.65rem,5vw,2.75rem)] leading-[1.15] text-foreground">
            {copy.work.title}
          </h2>
          <p className="mt-4 max-w-xl text-[14px] leading-[1.85] text-muted sm:mt-5 sm:text-[15px] md:text-base">
            {copy.work.description}
          </p>
        </Reveal>

        <div className="flex flex-col gap-8 sm:gap-12 md:gap-16">
          {preview.map((project, index) => (
            <CaseStudy key={project.id} project={project} index={index} />
          ))}
        </div>

        <Reveal className="mt-12 flex justify-center sm:mt-14 md:mt-16">
          <Link
            href="/work"
            className="group inline-flex items-center gap-2 border-b border-transparent pb-1 text-[14px] text-muted transition-colors duration-300 hover:border-accent/40 hover:text-foreground sm:text-[15px]"
          >
            مشاهده همه
            <ArrowLeft
              className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-0.5"
              weight="bold"
            />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

function CaseStudy({
  project,
  index,
}: {
  project: ProjectItem;
  index: number;
}) {
  const isLuxury = project.caseStyle === "luxury";
  const isInfra = project.caseStyle === "infra";
  const isExternal = project.href.startsWith("http");
  const isStatic = project.comingSoon || project.href.startsWith("#");
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  // Oversized inner layer + subtle Y only — never scale the clip box (that left gaps).
  const imageY = useTransform(scrollYProgress, [0, 1], [18, -18]);

  const linkProps = !isStatic
    ? {
        href: project.href,
        ...(isExternal
          ? { target: "_blank" as const, rel: "noopener noreferrer" }
          : {}),
      }
    : null;

  return (
    <article
      ref={ref}
      className={cn(
        "group grid overflow-hidden rounded-2xl border border-border/80 bg-surface/25 p-1 transition-colors duration-500 hover:border-border-bright sm:rounded-[1.75rem] sm:p-1.5 lg:grid-cols-2",
        isLuxury && "border-gold/25 hover:border-gold/45",
        index % 2 === 1 && "lg:[&>*:first-child]:order-2",
      )}
    >
      <div
        className={cn(
          "relative aspect-[16/10] overflow-hidden rounded-[calc(1rem-2px)] sm:rounded-[calc(1.75rem-0.375rem)] lg:min-h-[280px] lg:aspect-[16/10]",
          isLuxury ? "bg-[#1a0f05]" : "bg-[#0a0a0e]",
        )}
      >
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute inset-0 will-change-transform"
            style={
              reduceMotion
                ? undefined
                : { y: imageY, scale: 1.08 }
            }
          >
            <ProjectCover project={project} />
          </motion.div>
        </div>
        {linkProps ? (
          <Link
            {...linkProps}
            className="absolute inset-0 z-[1]"
            aria-label={`مشاهده ${project.title}`}
          />
        ) : null}
      </div>

      <div className="relative flex flex-col justify-between gap-6 rounded-[calc(1rem-2px)] bg-elevated/40 p-5 sm:rounded-[calc(1.75rem-0.375rem)] sm:p-6 md:gap-8 md:p-9">
        {linkProps ? (
          <Link
            {...linkProps}
            className="absolute inset-0 z-[1] rounded-[inherit]"
            aria-hidden
            tabIndex={-1}
          />
        ) : null}
        <div className="relative z-[2]">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "label-mono text-[11px]",
                isLuxury ? "text-gold" : isInfra ? "text-accent" : "text-dim",
              )}
            >
              {project.tag}
            </span>
            {project.year ? (
              <span className="label-mono text-[11px] text-dim">
                · {project.year}
              </span>
            ) : null}
          </div>

          <h3 className="mt-3 font-display text-[1.35rem] leading-snug text-foreground sm:text-2xl md:text-3xl">
            {project.title}
          </h3>
          <p className="mt-3 text-[13.5px] leading-[1.85] text-muted sm:text-sm md:text-[15px]">
            {project.description}
          </p>

          {project.businessValue?.length ? (
            <ul className="mt-5 flex flex-wrap gap-2">
              {project.businessValue.map((label) => (
                <li
                  key={label}
                  className="rounded-full border border-border px-3 py-1 text-xs text-muted"
                >
                  {label}
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        {!isStatic ? (
          <span className="relative z-[2] flex items-center gap-2 self-start text-sm text-muted transition-colors duration-300 group-hover:text-accent">
            مشاهده
            <ArrowLeft
              className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-0.5"
              weight="bold"
            />
          </span>
        ) : null}
      </div>
    </article>
  );
}
