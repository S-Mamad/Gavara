"use client";

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
 * Uploaded/static `image` wins by default so admin uploads always show.
 * Set `preferLivePreview` on the project to try the live iframe first.
 */
export function ProjectCover({
  project,
  className,
  sizes = "(max-width: 1024px) 100vw, 50vw",
}: ProjectCoverProps) {
  const hasImage = Boolean(project.image);
  const hasLive = Boolean(project.previewUrl);
  const preferImage = !project.preferLivePreview;
  const useImage = hasImage && (preferImage || !hasLive);
  const useLive = hasLive && !useImage;

  if (useLive && project.previewUrl) {
    return (
      <LiveSitePreview
        src={project.previewUrl}
        title={project.title}
        fallbackGradient={project.gradient}
        fallbackImage={project.image}
        className={className}
      />
    );
  }

  if (hasImage && project.image) {
    return (
      <CmsImage
        src={project.image}
        alt={project.title}
        fill
        className={cn(
          "object-cover object-center transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-[1.04]",
          className,
        )}
        sizes={sizes}
      />
    );
  }

  return (
    <div
      className={cn("absolute inset-0", className)}
      style={{
        background: `linear-gradient(135deg, ${project.gradient[0]}, ${project.gradient[1]})`,
      }}
    />
  );
}
