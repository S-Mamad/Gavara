"use client";

import Link from "next/link";
import { GithubLogo, TelegramLogo } from "@phosphor-icons/react";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { BrandLockup } from "@/components/ui/BrandLockup";
import { useSite } from "@/context/CmsContext";
import type { NavItem } from "@/types";

function FooterNavLink({ item }: { item: NavItem }) {
  const external =
    item.href.startsWith("http://") ||
    item.href.startsWith("https://") ||
    item.href.startsWith("mailto:") ||
    item.href.startsWith("tel:");

  const className =
    "text-[13px] text-muted transition-colors hover:text-accent";

  if (external) {
    return (
      <a
        href={item.href}
        className={className}
        target={item.href.startsWith("http") ? "_blank" : undefined}
        rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
        dir="ltr"
      >
        {item.label}
      </a>
    );
  }

  return (
    <Link href={item.href} className={className}>
      {item.label}
    </Link>
  );
}

export function Footer() {
  const data = useSite();
  const github = data.links.find((l) => l.id === "github");
  const telegram = data.links.find((l) => l.id === "telegram");
  const email = data.links.find((l) => l.id === "email");
  const year = new Date().getFullYear();
  const customNav = data.footerNav?.length ? data.footerNav : null;

  return (
    <footer className="hidden border-t border-border/80 bg-void md:block">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-7 sm:px-6 sm:py-8 md:flex-row md:items-center md:justify-between md:gap-8 md:px-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-5">
          <BrandLockup
            variant="panel"
            href="/"
            className="mx-auto hidden max-w-[132px] md:mx-0 md:block"
          />
          <div className="flex flex-col gap-1.5 text-center md:text-start">
            <BrandLogo className="justify-center text-[15px] md:hidden" />
            <p className="text-[12px] text-dim sm:text-[13px]">
              © {year} {data.brand.name}
              {data.brand.suffix}
            </p>
            {data.brand.tagline ? (
              <p className="text-[11px] text-dim/80">{data.brand.tagline}</p>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2.5 sm:gap-x-5 md:justify-end">
          {customNav
            ? customNav.map((item) => (
                <FooterNavLink key={`${item.id}-${item.href}`} item={item} />
              ))
            : (
                <>
                  {github ? (
                    <a
                      href={github.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-[13px] text-muted transition-colors hover:text-accent"
                      dir="ltr"
                    >
                      <GithubLogo className="h-4 w-4" weight="fill" />
                      {github.label}
                    </a>
                  ) : null}
                  {telegram ? (
                    <a
                      href={telegram.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-[13px] text-muted transition-colors hover:text-accent"
                      dir="ltr"
                    >
                      <TelegramLogo className="h-4 w-4" weight="fill" />
                      {telegram.label}
                    </a>
                  ) : null}
                  {email ? (
                    <a
                      href={email.href}
                      className="text-[13px] text-muted transition-colors hover:text-accent"
                      dir="ltr"
                    >
                      {email.label}
                    </a>
                  ) : null}
                  <Link
                    href="/#contact"
                    className="text-[13px] text-muted transition-colors hover:text-accent"
                  >
                    ارتباط
                  </Link>
                </>
              )}
        </div>
      </div>
    </footer>
  );
}
