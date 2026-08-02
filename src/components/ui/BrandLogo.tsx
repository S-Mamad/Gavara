import Link from "next/link";
import site from "@/data/site.json";
import type { SiteConfig } from "@/types";
import { cn } from "@/lib/utils";

const data = site as SiteConfig;

interface BrandLogoProps {
  className?: string;
  mono?: boolean;
}

export function BrandLogo({ className, mono = false }: BrandLogoProps) {
  if (mono) {
    return (
      <span className={cn("font-mono text-sm", className)}>
        <span className="text-accent">~/</span>
        {data.brand.slug}
      </span>
    );
  }

  return (
    <span className={cn("text-sm font-bold tracking-tight md:text-base", className)}>
      <span className="text-accent">{data.brand.name}</span>
      <span className="text-foreground">{data.brand.suffix}</span>
    </span>
  );
}

export function BrandLink({ className }: { className?: string }) {
  return (
    <Link href="/" className={className}>
      <BrandLogo />
    </Link>
  );
}
