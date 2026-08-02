import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import type { ProjectItem } from "@/types";
import { cn } from "@/lib/utils";
import { LiveSitePreview } from "@/components/ui/LiveSitePreview";

interface ProjectCardProps {
  project: ProjectItem;
  featured?: boolean;
  priority?: boolean;
  className?: string;
}

export function ProjectCard({
  project,
  featured = false,
  priority = false,
  className,
}: ProjectCardProps) {
  const isExternal = project.href.startsWith("http");
  const isStatic = project.comingSoon || project.href.startsWith("#");

  const content = (
    <article
      className={cn(
        "group flex h-full w-full flex-col overflow-hidden border border-border bg-surface/30 transition-colors duration-300 hover:border-accent/30",
        className,
      )}
    >
      <div
        className={cn(
          "relative w-full overflow-hidden bg-void",
          featured ? "aspect-[16/9]" : "aspect-[4/3]",
        )}
      >
        {project.previewUrl ? (
          <LiveSitePreview src={project.previewUrl} title={project.title} />
        ) : project.image ? (
          <Image
            src={project.image}
            alt={project.title}
            fill
            priority={priority}
            className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.02]"
            sizes={featured ? "100vw" : "(max-width: 768px) 100vw, 50vw"}
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, ${project.gradient[0]}, ${project.gradient[1]})`,
            }}
          />
        )}
        {!project.previewUrl ? (
          <div className="absolute inset-0 bg-gradient-to-t from-void/80 via-transparent to-transparent" />
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5 md:p-6">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="label-mono text-dim">{project.tag}</span>
            {project.year ? (
              <span className="label-mono text-dim">· {project.year}</span>
            ) : null}
            {project.comingSoon ? (
              <span className="label-mono text-dim">· به‌زودی</span>
            ) : null}
          </div>
          <h3
            className={cn(
              "mt-2 font-display text-foreground",
              featured ? "text-xl md:text-2xl" : "text-lg md:text-xl",
            )}
          >
            {project.title}
          </h3>
          <p className="mt-2 text-sm leading-[1.8] text-muted md:text-[15px]">
            {project.description}
          </p>
          {project.tech?.length ? (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {project.tech.map((t) => (
                <span
                  key={t}
                  dir="ltr"
                  className="border border-border px-2 py-0.5 font-mono text-[10px] text-dim"
                >
                  {t}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        {!isStatic ? (
          <span className="flex h-9 w-9 items-center justify-center self-end border border-border text-muted transition-colors group-hover:border-accent/40 group-hover:text-accent">
            <ArrowLeft className="h-4 w-4" weight="bold" />
          </span>
        ) : null}
      </div>
    </article>
  );

  if (isStatic) {
    return <div className="block w-full">{content}</div>;
  }

  return (
    <Link
      href={project.href}
      className="block w-full"
      {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {content}
    </Link>
  );
}
