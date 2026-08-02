"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react";
import type { ProjectItem } from "@/types";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/ui/Reveal";
import { LiveSitePreview } from "@/components/ui/LiveSitePreview";

export function ProjectArchiveCard({
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

  const linkProps = !isStatic
    ? {
        href: project.href,
        ...(isExternal
          ? { target: "_blank" as const, rel: "noopener noreferrer" }
          : {}),
      }
    : null;

  return (
    <Reveal delay={Math.min(index * 0.04, 0.28)} className="h-full">
      <article
        className={cn(
          "group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] transition-colors duration-500 hover:border-white/18",
          isLuxury && "hover:border-gold/35",
          isInfra && "hover:border-accent/30",
        )}
      >
        <div
          className="relative aspect-[16/10] overflow-hidden bg-[#0a0a0e]"
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
              className="object-cover opacity-80 transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-[1.04]"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          ) : null}
          <div
            className={cn(
              "pointer-events-none absolute inset-0",
              project.previewUrl
                ? "bg-gradient-to-t from-void/55 via-transparent to-transparent"
                : "bg-gradient-to-t from-void via-transparent to-transparent",
            )}
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4">
            <span className="label-mono text-[10px] text-foreground/80">
              {project.tag}
            </span>
            {project.year ? (
              <span className="label-mono text-[10px] text-dim">
                {project.year}
              </span>
            ) : null}
          </div>
        </div>

        <div className="relative flex flex-1 flex-col p-5">
          <h3 className="font-display text-xl text-foreground">
            {project.title}
          </h3>
          <p className="mt-2 line-clamp-3 text-[13.5px] leading-[1.8] text-muted">
            {project.description}
          </p>
          {project.tech?.length ? (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {project.tech.slice(0, 3).map((t) => (
                <span
                  key={t}
                  dir="ltr"
                  className="rounded-md border border-border px-2 py-0.5 font-mono text-[10px] text-dim"
                >
                  {t}
                </span>
              ))}
            </div>
          ) : null}
          <span className="mt-auto flex items-center gap-2 pt-5 text-sm text-dim transition-colors group-hover:text-accent">
            {project.comingSoon ? "به‌زودی" : "مشاهده"}
            {!project.comingSoon ? (
              <ArrowLeft
                className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-x-0.5"
                weight="bold"
              />
            ) : null}
          </span>
        </div>

        {linkProps ? (
          <Link
            {...linkProps}
            className="absolute inset-0 z-[1]"
            aria-label={`مشاهده ${project.title}`}
          />
        ) : null}
      </article>
    </Reveal>
  );
}
