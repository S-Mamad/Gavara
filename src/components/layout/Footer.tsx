"use client";

import Link from "next/link";
import { GithubLogo, TelegramLogo } from "@phosphor-icons/react";
import site from "@/data/site.json";
import type { SiteConfig } from "@/types";
import { BrandLogo } from "@/components/ui/BrandLogo";

const data = site as SiteConfig;
const github = data.links.find((l) => l.id === "github");
const telegram = data.links.find((l) => l.id === "telegram");
const email = data.links.find((l) => l.id === "email");

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border/80">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-7 sm:px-6 sm:py-8 md:flex-row md:items-center md:justify-between md:px-10">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <BrandLogo className="text-[15px]" />
          <span className="hidden h-3 w-px bg-border sm:block" aria-hidden />
          <p className="text-[12px] text-dim sm:text-[13px]">
            © {year} {data.brand.name}
            {data.brand.suffix}
          </p>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          {github ? (
            <a
              href={github.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="گیت‌هاب"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-muted transition-colors hover:border-accent/40 hover:text-accent"
            >
              <GithubLogo className="h-4 w-4" weight="fill" />
            </a>
          ) : null}
          {telegram ? (
            <a
              href={telegram.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="تلگرام"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-muted transition-colors hover:border-accent/40 hover:text-accent"
            >
              <TelegramLogo className="h-4 w-4" weight="fill" />
            </a>
          ) : null}
          {email ? (
            <a
              href={email.href}
              dir="ltr"
              className="hidden text-[12px] text-dim transition-colors hover:text-accent sm:inline md:text-[13px]"
            >
              {email.label}
            </a>
          ) : null}
          <Link
            href="/#contact"
            className="ms-1 rounded-full border border-accent/30 bg-accent/10 px-3.5 py-1.5 text-[12px] text-accent transition-colors hover:bg-accent/20 hover:text-accent-bright sm:text-[13px]"
          >
            شروع پروژه
          </Link>
        </div>
      </div>
    </footer>
  );
}
