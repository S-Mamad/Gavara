"use client";

import Link from "next/link";
import { ArrowLeft, Broadcast, GithubLogo, TelegramLogo } from "@phosphor-icons/react";
import { useMotionValueEvent, useScroll } from "motion/react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useActiveSection } from "@/hooks/useScrollSpy";
import { BrandLink } from "@/components/ui/BrandLogo";
import { MobileMenu } from "./MobileMenu";
import { useSite } from "@/context/CmsContext";
import { useVisibleNav } from "@/hooks/useVisibleNav";
import { useCopy } from "@/hooks/useCopy";
import { publicHref } from "@/lib/links";

export function Header() {
  const data = useSite();
  const copy = useCopy();
  const nav = useVisibleNav();
  const sectionIds = nav.map((n) => n.id);
  const telegram = data.links.find((l) => l.id === "telegram");
  const githubHref = publicHref(
    data.links.find((l) => l.id === "github")?.href,
  );
  const channel = data.links.find((l) => l.id === "channel");
  const [scrolled, setScrolled] = useState(false);
  const activeId = useActiveSection(sectionIds);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 12);
  });

  return (
    <header className="fixed inset-x-0 top-0 z-[var(--z-header)] px-3 pt-3 sm:px-4 sm:pt-3.5 md:px-6 md:pt-4">
      <nav
        className={cn(
          "mx-auto flex h-12 max-w-6xl items-center gap-2 rounded-full border px-3 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] sm:h-14 sm:px-4 md:gap-3 md:px-5",
          scrolled
            ? "border-accent/20 bg-black/90 shadow-[0_16px_48px_rgba(0,0,0,0.45)] backdrop-blur-xl"
            : "border-accent/10 bg-black/55 backdrop-blur-md",
        )}
        aria-label="ناوبری اصلی"
      >
        <BrandLink className="shrink-0" />

        <ul className="mx-auto hidden items-center gap-0.5 md:flex">
          {nav.map((item) => (
            <li key={item.id}>
              <Link
                href={item.href}
                className={cn(
                  "rounded-full px-3.5 py-2 text-[13px] transition-colors duration-300",
                  activeId === item.id
                    ? "bg-accent/10 text-foreground"
                    : "text-dim hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="ms-auto flex items-center gap-1.5 md:gap-2">
          {githubHref ? (
            <a
              href={githubHref}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden h-9 w-9 items-center justify-center rounded-full border border-accent/15 text-muted transition-colors hover:border-accent/35 hover:text-accent sm:inline-flex"
              aria-label="گیت‌هاب"
            >
              <GithubLogo className="h-4 w-4" weight="fill" />
            </a>
          ) : null}
          {telegram ? (
            <a
              href={telegram.href}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden h-9 w-9 items-center justify-center rounded-full border border-accent/15 text-muted transition-colors hover:border-accent/35 hover:text-accent sm:inline-flex"
              aria-label="تلگرام"
            >
              <TelegramLogo className="h-4 w-4" weight="fill" />
            </a>
          ) : null}
          {channel ? (
            <a
              href={channel.href}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden h-9 w-9 items-center justify-center rounded-full border border-accent/15 text-muted transition-colors hover:border-accent/35 hover:text-accent sm:inline-flex"
              aria-label={channel.label}
            >
              <Broadcast className="h-4 w-4" weight="fill" />
            </a>
          ) : null}
          <Link
            href="/#contact"
            className="group hidden items-center gap-2 rounded-full bg-accent px-4 py-2 text-[13px] font-medium text-black transition-colors hover:bg-accent-bright md:inline-flex"
          >
            {copy.hero.primaryCta}
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-black/10 transition-transform duration-300 group-hover:-translate-x-0.5">
              <ArrowLeft className="h-3.5 w-3.5" weight="bold" />
            </span>
          </Link>
          <MobileMenu />
        </div>
      </nav>
    </header>
  );
}
