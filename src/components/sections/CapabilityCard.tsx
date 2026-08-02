"use client";

import Link from "next/link";
import {
  ChartLineUp,
  Layout,
  PaintBrush,
  PenNib,
  ShoppingBag,
  HardDrives,
  TelegramLogo,
  Image as ImageIcon,
  ArrowLeft,
  type Icon,
} from "@phosphor-icons/react";
import type { CapabilityItem } from "@/types";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/utils";

const ICONS: Record<string, Icon> = {
  layout: Layout,
  telegram: TelegramLogo,
  poster: ImageIcon,
  brand: PaintBrush,
  store: ShoppingBag,
  chart: ChartLineUp,
  pen: PenNib,
  server: HardDrives,
};

export function CapabilityCard({
  item,
  index,
}: {
  item: CapabilityItem;
  index: number;
}) {
  const Icon = ICONS[item.icon] ?? Layout;
  const featured = index < 2;

  return (
    <Reveal
      delay={Math.min(index * 0.045, 0.3)}
      className={cn("h-full", featured && "sm:col-span-1 lg:col-span-1")}
    >
      <Link
        href="/#contact"
        className={cn(
          "group relative flex h-full flex-col border-b border-white/10 py-6 transition-colors duration-400 sm:border sm:border-white/10 sm:rounded-2xl sm:bg-white/[0.015] sm:px-5 sm:py-6 sm:hover:border-accent/35 sm:hover:bg-white/[0.03] md:px-6 md:py-7",
          featured && "lg:min-h-[220px]",
        )}
      >
        <div className="flex items-center justify-between gap-3">
          <span
            dir="ltr"
            className="font-mono text-[11px] tracking-wider text-dim"
          >
            {item.tag}
          </span>
          <Icon
            className="h-[18px] w-[18px] text-accent/70 transition-colors duration-300 group-hover:text-accent"
            weight="regular"
          />
        </div>

        <h3 className="mt-5 font-display text-[1.15rem] leading-snug text-foreground sm:mt-6 sm:text-xl">
          {item.title}
        </h3>
        <p className="mt-2.5 max-w-[34ch] flex-1 text-[13.5px] leading-[1.8] text-muted">
          {item.description}
        </p>

        <span className="mt-6 inline-flex items-center gap-2 text-[13px] text-dim transition-colors duration-300 group-hover:text-accent">
          درخواست این خدمت
          <ArrowLeft
            className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-x-0.5"
            weight="bold"
          />
        </span>
      </Link>
    </Reveal>
  );
}
