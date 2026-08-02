"use client";

import Link from "next/link";
import { GithubLogo, LinkedinLogo, TelegramLogo } from "@phosphor-icons/react";
import type { TeamMember } from "@/types";

export function TeamLinks({ member }: { member: TeamMember }) {
  const links = member.links;
  if (!links) return null;

  const items = [
    links.telegram
      ? { href: links.telegram, icon: TelegramLogo, label: "تلگرام" }
      : null,
    links.github
      ? { href: links.github, icon: GithubLogo, label: "گیت‌هاب" }
      : null,
    links.linkedin
      ? { href: links.linkedin, icon: LinkedinLogo, label: "لینکدین" }
      : null,
  ].filter(Boolean) as {
    href: string;
    icon: typeof TelegramLogo;
    label: string;
  }[];

  if (!items.length) return null;

  return (
    <div className="mt-auto flex gap-3 pt-2">
      {items.map(({ href, icon: Icon, label }) => (
        <Link
          key={href}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted transition-colors hover:border-accent/40 hover:text-accent"
        >
          <Icon className="h-4 w-4" weight="bold" />
        </Link>
      ))}
    </div>
  );
}
