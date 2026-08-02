"use client";

import Image from "next/image";
import Link from "next/link";
import site from "@/data/site.json";
import type { SiteConfig } from "@/types";
import { Reveal } from "@/components/ui/Reveal";

const data = site as SiteConfig;

export function ClientLogos() {
  if (!data.clients?.length) return null;

  return (
    <section
      aria-label="مشتریان و پروژه‌ها"
      className="relative z-[var(--z-content)] border-y border-border/70 py-10 sm:py-12 md:py-14"
    >
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-4 sm:gap-8 sm:px-6 md:flex-row md:justify-between md:px-10">
        <Reveal className="text-center md:text-start">
          <p className="text-[12px] tracking-wide text-dim sm:text-[13px]">
            روی محصول‌های زنده کار کرده‌ایم
          </p>
        </Reveal>

        <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-5 sm:gap-x-12 md:gap-x-14">
          {data.clients.map((client, index) => {
            const logo = client.logo ? (
              <Image
                src={client.logo}
                alt=""
                width={140}
                height={44}
                className="h-7 w-auto opacity-50 transition-opacity duration-300 group-hover:opacity-95 sm:h-8"
              />
            ) : (
              <span className="font-display text-sm text-muted">{client.name}</span>
            );

            return (
              <li key={client.name}>
                <Reveal delay={index * 0.04}>
                  {client.href ? (
                    <Link
                      href={client.href}
                      className="group block"
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
                </Reveal>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
