"use client";

import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react";
import type { ProjectItem } from "@/types";
import { cn, previewHost } from "@/lib/utils";
import { Reveal } from "@/components/ui/Reveal";
import { ProjectCover } from "@/components/ui/ProjectCover";

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
  const host = previewHost(project.previewUrl || project.href);

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
        <div className="relative aspect-[16/10] overflow-hidden bg-[#0a0a0e]">
          <ProjectCover
            project={project}
            sizes="(max-width: 768px) 100vw, 33vw"
          />
          {/* Soft edge only — no tag/year overlay competing with showcase chrome */}
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-16 bg-gradient-to-t from-black/50 to-transparent"
            aria-hidden
          />
          {host ? (
            <span
              dir="ltr"
              className="pointer-events-none absolute bottom-3 start-3 z-[2] max-w-[70%] truncate rounded-md border border-white/10 bg-black/50 px-2 py-0.5 font-mono text-[9px] text-foreground/75 backdrop-blur-sm"
            >
              {host}
            </span>
          ) : null}
        </div>

        <div className="relative flex flex-1 flex-col gap-3 p-5">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "label-mono text-[10px]",
                isLuxury ? "text-gold" : isInfra ? "text-accent" : "text-dim",
              )}
            >
              {project.tag}
            </span>
            {project.year ? (
              <span className="label-mono text-[10px] text-dim">
                · {project.year}
              </span>
            ) : null}
          </div>
          <h3 className="font-display text-xl text-foreground">
            {project.title}
          </h3>
          <p className="line-clamp-3 text-[13.5px] leading-[1.8] text-muted">
            {project.description}
          </p>
          {project.tech?.length ? (
            <div className="flex flex-wrap gap-1.5">
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
          <span className="mt-auto flex items-center gap-2 pt-2 text-sm text-dim transition-colors group-hover:text-accent">
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
