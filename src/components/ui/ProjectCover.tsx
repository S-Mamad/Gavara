"use client";

import { useState } from "react";
import { CmsImage } from "@/components/ui/CmsImage";
import type { ProjectItem } from "@/types";
import { cn, previewHost } from "@/lib/utils";

type ProjectCoverProps = {
  project: ProjectItem;
  className?: string;
  sizes?: string;
};

/**
 * Screenshot locked inside a browser chrome frame.
 * Chrome is an overlay so the media box aspect never shifts
 * and the image always fills the template.
 */
export function ProjectCover({
  project,
  className,
  sizes = "(max-width: 1024px) 100vw, 50vw",
}: ProjectCoverProps) {
  const [broken, setBroken] = useState(false);
  const host = previewHost(project.previewUrl || project.href);
  const src = project.image;
  const showImage = Boolean(src) && !broken;

  return (
    <div
      className={cn(
        "absolute inset-0 overflow-hidden bg-[#0a0a0e]",
        className,
      )}
    >
      {/* Media plane — always fills the full frame aspect */}
      <div className="absolute inset-0 overflow-hidden">
        {showImage && src ? (
          <CmsImage
            src={src}
            alt={project.title}
            fill
            className="object-cover object-top transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] will-change-transform group-hover:scale-[1.03]"
            sizes={sizes}
            onError={() => setBroken(true)}
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(145deg, ${project.gradient[0]}, ${project.gradient[1]})`,
            }}
          />
        )}
      </div>

      {/* Browser chrome overlay — does not consume layout height */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-[2] flex h-9 items-center gap-2 border-b border-white/10 bg-[#0c0c10]/92 px-3 backdrop-blur-md sm:h-10 sm:px-3.5"
        aria-hidden
      >
        <span className="h-2 w-2 shrink-0 rounded-full bg-signal/75 sm:h-2.5 sm:w-2.5" />
        <span className="h-2 w-2 shrink-0 rounded-full bg-amber-500/55 sm:h-2.5 sm:w-2.5" />
        <span className="h-2 w-2 shrink-0 rounded-full bg-accent/55 sm:h-2.5 sm:w-2.5" />
        {host ? (
          <span
            dir="ltr"
            className="ms-auto max-w-[65%] truncate rounded-md border border-white/8 bg-black/35 px-2 py-0.5 font-mono text-[9px] text-dim sm:text-[10px]"
          >
            {host}
          </span>
        ) : null}
      </div>
    </div>
  );
}
