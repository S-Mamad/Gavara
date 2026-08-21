"use client";

import Link from "next/link";
import { CmsImage } from "@/components/ui/CmsImage";
import { cn } from "@/lib/utils";

type BrandLockupVariant = "hero" | "panel" | "nav";

export function BrandLockup({
  variant = "panel",
  className,
  href,
}: {
  variant?: BrandLockupVariant;
  className?: string;
  href?: string;
}) {
  const sizes =
    variant === "hero"
      ? {
          wrap: "max-w-[280px] p-3 sm:max-w-[320px] sm:p-4",
          image: "aspect-square w-full",
          sizes: "(max-width: 640px) 280px, 320px",
          priority: true,
        }
      : variant === "nav"
        ? {
            wrap: "h-10 w-10 overflow-hidden p-0.5 sm:h-11 sm:w-11",
            image: "relative h-full w-full",
            sizes: "44px",
            priority: true,
            object: "object-cover object-[center_22%] scale-[1.35]",
          }
        : {
            wrap: "w-full max-w-[200px] p-2.5",
            image: "aspect-square w-full",
            sizes: "200px",
            priority: false,
            object: "object-cover object-center",
          };

  const objectClass =
    "object" in sizes ? sizes.object : "object-cover object-center";

  const inner = (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-white/12 bg-[#0b0b0f]/90 shadow-[0_24px_60px_-36px_rgba(0,0,0,0.95)] backdrop-blur-md",
        "before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_30%_20%,rgba(0,180,255,0.16),transparent_45%),radial-gradient(circle_at_75%_70%,rgba(255,90,40,0.14),transparent_42%)]",
        "after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:ring-1 after:ring-inset after:ring-white/10",
        "transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-[1.015]",
        sizes.wrap,
        className,
      )}
    >
      <div className={cn("relative z-[1]", sizes.image)}>
        <CmsImage
          src="/brand/raxinshop-logo.png"
          alt="Raxin Shop"
          fill
          priority={sizes.priority}
          className={objectClass}
          sizes={sizes.sizes}
        />
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex shrink-0" aria-label="راکسین‌شاپ">
        {inner}
      </Link>
    );
  }

  return inner;
}

export function BrandTitleBlock({
  eyebrow,
  subtitle,
  className,
}: {
  eyebrow?: string;
  subtitle?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center text-center", className)}>
      <BrandLockup variant="panel" />
      {eyebrow ? (
        <p className="mt-3 text-[11px] tracking-[0.18em] text-dim">{eyebrow}</p>
      ) : null}
      {subtitle ? (
        <p className="mt-1.5 max-w-[18ch] text-xs leading-6 text-muted">{subtitle}</p>
      ) : null}
    </div>
  );
}
