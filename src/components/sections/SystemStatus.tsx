"use client";

import { useEffect, useState } from "react";
import { useCopy } from "@/hooks/useCopy";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { cn } from "@/lib/utils";

interface ServiceRow {
  name: string;
  region: string;
  latency: number;
  uptime: string;
  status: "operational" | "degraded";
}

const BASE: ServiceRow[] = [
  {
    name: "edge-cdn",
    region: "fra",
    latency: 18,
    uptime: "99.98%",
    status: "operational",
  },
  {
    name: "api-primary",
    region: "ams",
    latency: 42,
    uptime: "99.95%",
    status: "operational",
  },
  {
    name: "db-replica",
    region: "ams",
    latency: 6,
    uptime: "99.99%",
    status: "operational",
  },
  {
    name: "auth-gateway",
    region: "fra",
    latency: 31,
    uptime: "99.92%",
    status: "operational",
  },
];

const LOGS = [
  "healthcheck ok · api-primary · 200",
  "ip-range migration window closed · zero incidents",
  "cache hit ratio 94.2% · catalog",
  "deploy raxinshop@sha-8f3a · ready",
];

export function SystemStatus() {
  const copy = useCopy();
  const [rows, setRows] = useState(BASE);
  const [logIndex, setLogIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setRows((prev) =>
        prev.map((row) => ({
          ...row,
          latency: Math.max(
            4,
            Math.round(row.latency + (Math.random() * 8 - 4)),
          ),
        })),
      );
      setLogIndex((i) => (i + 1) % LOGS.length);
    }, 2400);
    return () => window.clearInterval(id);
  }, []);

  return (
    <section id="status" className="border-b border-border py-28 md:py-36">
      <div className="mx-auto max-w-7xl px-5 md:px-10">
        <Reveal className="mb-12">
          <SectionHeading
            eyebrow={copy.systemStatus.eyebrow}
            title={copy.systemStatus.title}
            description={copy.systemStatus.description}
          />
        </Reveal>

        <div className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
          <Reveal>
            <SpotlightCard className="rounded-2xl p-5 md:p-6">
              <div className="mb-4 flex items-center justify-between">
                <p className="font-mono text-[11px] text-dim">live telemetry</p>
                <span className="inline-flex items-center gap-2 font-mono text-[11px] text-accent">
                  <span className="status-pulse inline-block h-2 w-2 rounded-full bg-accent" />
                  all systems nominal
                </span>
              </div>
              <ul className="divide-y divide-border">
                {rows.map((row) => (
                  <li
                    key={row.name}
                    className="grid grid-cols-[1.2fr_0.6fr_0.6fr_0.7fr] items-center gap-2 py-3 font-mono text-[12px]"
                    dir="ltr"
                  >
                    <span className="text-foreground">{row.name}</span>
                    <span className="text-dim">{row.region}</span>
                    <span className="text-cyber">{row.latency}ms</span>
                    <span
                      className={cn(
                        row.status === "operational"
                          ? "text-accent"
                          : "text-signal",
                      )}
                    >
                      {row.uptime}
                    </span>
                  </li>
                ))}
              </ul>
              <MiniChart />
            </SpotlightCard>
          </Reveal>

          <Reveal delay={0.06}>
            <SpotlightCard className="flex h-full flex-col rounded-2xl p-5 md:p-6">
              <p className="font-mono text-[11px] text-dim">event log</p>
              <div className="mt-4 flex-1 space-y-2 font-mono text-[11px] leading-relaxed text-muted">
                {LOGS.map((line, i) => (
                  <p
                    key={line}
                    dir="ltr"
                    className={cn(
                      "border-s-2 ps-3 transition-opacity",
                      i === logIndex
                        ? "border-accent text-accent opacity-100"
                        : "border-border opacity-50",
                    )}
                  >
                    {line}
                  </p>
                ))}
              </div>
            </SpotlightCard>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function MiniChart() {
  const points = [12, 18, 14, 22, 16, 20, 15, 19, 13, 17, 21, 16];
  const max = Math.max(...points);
  const w = 280;
  const h = 56;
  const path = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * w;
      const y = h - (p / max) * (h - 8) - 4;
      return `${i === 0 ? "M" : "L"}${x},${y}`;
    })
    .join(" ");

  return (
    <div className="mt-6">
      <p className="mb-2 font-mono text-[10px] text-dim">ping · last 12 samples</p>
      <svg viewBox={`0 0 ${w} ${h}`} className="h-14 w-full" aria-hidden>
        <path d={path} fill="none" stroke="#3dffa8" strokeWidth="1.5" />
      </svg>
    </div>
  );
}
