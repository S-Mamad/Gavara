"use client";

import { useCopy } from "@/hooks/useCopy";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SpotlightCard } from "@/components/ui/SpotlightCard";

const SERIES = [
  { label: "پایداری", values: [82, 86, 88, 91, 94, 96, 97] },
  { label: "پرفورمنس", values: [70, 74, 78, 81, 85, 89, 93] },
  { label: "زمان لود", values: [100, 92, 84, 76, 68, 60, 52] },
];

export function CeoDashboard() {
  const copy = useCopy();

  return (
    <section id="metrics" className="border-b border-border py-28 md:py-36">
      <div className="mx-auto max-w-7xl px-5 md:px-10">
        <Reveal className="mb-12">
          <SectionHeading
            eyebrow={copy.ceoDashboard.eyebrow}
            title={copy.ceoDashboard.title}
            description={copy.ceoDashboard.description}
          />
        </Reveal>

        <div className="grid gap-4 md:grid-cols-3">
          {SERIES.map((serie, index) => (
            <Reveal key={serie.label} delay={index * 0.04}>
              <SpotlightCard className="rounded-2xl p-5">
                <p className="label-mono text-dim">{serie.label}</p>
                <p className="mt-2 font-display text-3xl text-accent">
                  {serie.values[serie.values.length - 1]}
                  <span className="text-base text-muted">
                    {serie.label === "زمان لود" ? "↓" : "%"}
                  </span>
                </p>
                <NeonChart values={serie.values} />
              </SpotlightCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function NeonChart({ values }: { values: number[] }) {
  const w = 220;
  const h = 64;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const path = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * w;
      const y = h - ((v - min) / (max - min || 1)) * (h - 10) - 5;
      return `${i === 0 ? "M" : "L"}${x},${y}`;
    })
    .join(" ");

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="mt-4 h-16 w-full" aria-hidden>
      <path d={path} fill="none" stroke="#3dffa8" strokeWidth="2" />
      <path
        d={`${path} L${w},${h} L0,${h} Z`}
        fill="rgba(61,255,168,0.08)"
        stroke="none"
      />
    </svg>
  );
}
