"use client";

import Image from "next/image";
import Link from "next/link";
import site from "@/data/site.json";
import type { SiteConfig } from "@/types";

const data = site as SiteConfig;

export function ClientLogos() {
  if (!data.clients?.length) return null;

  const row = [...data.clients, ...data.clients, ...data.clients];

  return (
    <section
      aria-label="مشتریان"
      className="relative z-[var(--z-content)] overflow-hidden border-y border-border/80 py-12 md:py-14"
    >
      <div
        className="pointer-events-none absolute inset-y-0 start-0 z-[1] w-24 bg-gradient-to-l from-transparent to-void md:w-40"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-y-0 end-0 z-[1] w-24 bg-gradient-to-r from-transparent to-void md:w-40"
        aria-hidden
      />

      <div className="marquee-track flex w-max items-center gap-14 md:gap-20">
        {row.map((client, index) => {
          const logo = client.logo ? (
            <Image
              src={client.logo}
              alt=""
              width={140}
              height={44}
              className="h-8 w-auto opacity-45 transition-opacity duration-300 hover:opacity-90 md:h-9"
            />
          ) : (
            <span className="font-display text-sm text-muted">{client.name}</span>
          );

          return (
            <div key={`${client.name}-${index}`} className="shrink-0">
              {client.href ? (
                <Link
                  href={client.href}
                  className="block"
                  aria-label={client.name}
                  {...(client.href.startsWith("http")
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                >
                  {logo}
                </Link>
              ) : (
                logo
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
