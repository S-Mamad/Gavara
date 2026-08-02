"use client";

import Link from "next/link";
import { ArrowLeft, GithubLogo, TelegramLogo } from "@phosphor-icons/react";
import { useMotionValueEvent, useScroll } from "motion/react";
import { useState } from "react";
import site from "@/data/site.json";
import type { SiteConfig } from "@/types";
import { cn } from "@/lib/utils";
import { useScrollSpy } from "@/hooks/useScrollSpy";
import { BrandLink } from "@/components/ui/BrandLogo";
import { MobileMenu } from "./MobileMenu";

const data = site as SiteConfig;
const sectionIds = data.nav.map((n) => n.id);
const telegram = data.links.find((l) => l.id === "telegram");
const github = data.links.find((l) => l.id === "github");

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const activeId = useScrollSpy(sectionIds);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 16);
  });

  return (
    <header className="fixed inset-x-0 top-0 z-[var(--z-header)] px-2.5 pt-2.5 sm:px-3 sm:pt-3 md:px-6 md:pt-4">
      <nav
        className={cn(
          "mx-auto flex h-12 max-w-6xl items-center gap-2 rounded-full border px-2 pe-1.5 ps-3 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] sm:h-14 sm:px-2 sm:pe-2 sm:ps-4 md:gap-3 md:px-3 md:pe-3",
          scrolled
            ? "border-white/12 bg-void/85 shadow-[0_20px_60px_rgba(0,0,0,0.4)] backdrop-blur-2xl"
            : "border-white/10 bg-void/45 backdrop-blur-xl",
        )}
        aria-label="ناوبری اصلی"
      >
        <BrandLink className="shrink-0" />

        <ul className="mx-auto hidden items-center lg:flex">
          {data.nav.map((item) => (
            <li key={item.id}>
              <Link
                href={item.href}
                className={cn(
                  "rounded-full px-3.5 py-2 text-[13px] transition-colors duration-300",
                  activeId === item.id
                    ? "bg-white/[0.07] text-foreground"
                    : "text-dim hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="ms-auto flex items-center gap-1.5 md:gap-2">
          {github ? (
            <a
              href={github.href}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden h-9 w-9 items-center justify-center rounded-full border border-white/10 text-muted transition-colors hover:border-accent/40 hover:text-accent sm:inline-flex"
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
              className="hidden h-9 w-9 items-center justify-center rounded-full border border-white/10 text-muted transition-colors hover:border-accent/40 hover:text-accent sm:inline-flex"
              aria-label="تلگرام"
            >
              <TelegramLogo className="h-4 w-4" weight="fill" />
            </a>
          ) : null}
          <Link
            href="/#contact"
            className="group hidden items-center gap-2 rounded-full bg-accent px-4 py-2 text-[13px] font-medium text-void transition-colors hover:bg-accent-bright md:inline-flex"
          >
            شروع پروژه
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-void/10 transition-transform duration-300 group-hover:-translate-x-0.5">
              <ArrowLeft className="h-3.5 w-3.5" weight="bold" />
            </span>
          </Link>
          <MobileMenu />
        </div>
      </nav>
    </header>
  );
}
