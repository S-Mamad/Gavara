"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { useRef } from "react";
import projects from "@/data/projects.json";
import type { ProjectItem } from "@/types";
import { useCopy } from "@/hooks/useCopy";
import { Reveal } from "@/components/ui/Reveal";
import { LiveSitePreview } from "@/components/ui/LiveSitePreview";
import { cn } from "@/lib/utils";

const projectData = projects as ProjectItem[];
const preview = projectData.slice(0, 2);

export function Work() {
  const copy = useCopy();

  return (
    <section
      id="work"
      className="relative overflow-hidden border-b border-border py-20 sm:py-28 md:py-36"
    >
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 md:px-10">
        <Reveal className="mb-10 max-w-2xl sm:mb-12 md:mb-16">
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
  const imageScale = useTransform(scrollYProgress, [0, 0.45, 1], [0.94, 1, 1.02]);
  const imageOpacity = useTransform(
    scrollYProgress,
    [0, 0.2, 0.85, 1],
    [0.55, 1, 1, 0.7],
  );

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
          "relative aspect-[16/10] overflow-hidden rounded-[calc(1rem-2px)] sm:rounded-[calc(1.75rem-0.375rem)] lg:min-h-[300px] lg:aspect-[5/4]",
          isLuxury ? "bg-[#1a0f05]" : "bg-[#0a0a0e]",
        )}
      >
        <motion.div
          className="absolute inset-0"
          style={
            reduceMotion || project.previewUrl
              ? undefined
              : { scale: imageScale, opacity: imageOpacity }
          }
        >
          {project.previewUrl ? (
            <LiveSitePreview
              src={project.previewUrl}
              title={project.title}
              fallbackGradient={project.gradient}
            />
          ) : project.image ? (
            <Image
              src={project.image}
              alt={project.title}
              fill
              className="object-cover object-center transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-[1.04]"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          ) : (
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(135deg, ${project.gradient[0]}, ${project.gradient[1]})`,
              }}
            />
          )}
        </motion.div>
        {!project.previewUrl ? (
          <div className="absolute inset-0 bg-gradient-to-t from-void/75 via-transparent to-transparent" />
        ) : (
          <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/5" />
        )}
        {linkProps ? (
          <Link
            {...linkProps}
            className="absolute inset-0 z-[1]"
            aria-label={`مشاهده ${project.title}`}
          />
        ) : null}
      </div>

      <div className="relative flex flex-col rounded-[calc(1rem-2px)] bg-elevated/40 p-5 sm:rounded-[calc(1.75rem-0.375rem)] sm:p-6 md:p-9">
        {linkProps ? (
          <Link
            {...linkProps}
            className="absolute inset-0 z-[1] rounded-[inherit]"
            aria-hidden
            tabIndex={-1}
          />
        ) : null}
        <div className="relative z-[2] flex flex-wrap items-center gap-2">
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

        <h3 className="relative z-[2] mt-3 font-display text-[1.35rem] leading-snug text-foreground sm:text-2xl md:text-3xl">
          {project.title}
        </h3>
        <p className="relative z-[2] mt-3 text-[13.5px] leading-[1.85] text-muted sm:text-sm md:text-[15px]">
          {project.description}
        </p>

        {project.businessValue?.length ? (
          <ul className="relative z-[2] mt-5 flex flex-wrap gap-2">
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

        {!isStatic ? (
          <span className="relative z-[2] mt-auto flex items-center gap-2 self-start pt-8 text-sm text-muted transition-colors duration-300 group-hover:text-accent">
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
