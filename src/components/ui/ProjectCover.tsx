"use client";

import { useState } from "react";
import { CmsImage } from "@/components/ui/CmsImage";
import { LiveSitePreview } from "@/components/ui/LiveSitePreview";
import type { ProjectItem } from "@/types";
import { cn } from "@/lib/utils";

type ProjectCoverProps = {
  project: ProjectItem;
  className?: string;
  sizes?: string;
};

/**
 * Cover for case-study cards.
 * Cover image is the default (fast, reliable). Live iframe only when
 * preferLivePreview is explicitly true.
 */
export function ProjectCover({
  project,
  className,
  sizes = "(max-width: 1024px) 100vw, 50vw",
}: ProjectCoverProps) {
  const [broken, setBroken] = useState(false);
  const hasImage = Boolean(project.image) && !broken;
  const hasLive = Boolean(project.previewUrl);
  const preferLive = project.preferLivePreview === true && hasLive;
  const objectPosition = project.imagePosition ?? "50% 0%";

  if (preferLive && project.previewUrl) {
    return (
      <LiveSitePreview
        src={project.previewUrl}
        title={project.title}
        fallbackGradient={project.gradient}
        fallbackImage={project.image}
        objectPosition={objectPosition}
        className={className}
      />
    );
  }

  return (
    <div
      className={cn(
        "absolute inset-0 overflow-hidden bg-[#0a0a0e]",
        className,
      )}
    >
      {hasImage && project.image ? (
        <CmsImage
          src={project.image}
          alt={project.title}
          fill
          className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] will-change-transform group-hover:scale-[1.03]"
          style={{ objectPosition }}
          sizes={sizes}
          onError={() => setBroken(true)}
        />
      ) : hasLive && project.previewUrl ? (
        <LiveSitePreview
          src={project.previewUrl}
          title={project.title}
          fallbackGradient={project.gradient}
          objectPosition={objectPosition}
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
  );
}
