"use client";

import { useCopy } from "@/hooks/useCopy";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useContextAware } from "@/context/ContextAwareContext";
import { usePrefs } from "@/context/PrefsContext";
import { cn } from "@/lib/utils";

const nodes = [
  { id: "edge", label: "Edge / CDN", x: 40, y: 40 },
  { id: "lb", label: "Load Balancer", x: 200, y: 40 },
  { id: "api", label: "API Cluster", x: 200, y: 140 },
  { id: "auth", label: "Auth", x: 40, y: 140 },
  { id: "db", label: "PostgreSQL", x: 360, y: 140 },
  { id: "cache", label: "Cache", x: 360, y: 40 },
];

const links = [
  ["edge", "lb"],
  ["lb", "api"],
  ["api", "auth"],
  ["api", "db"],
  ["api", "cache"],
  ["lb", "cache"],
] as const;

export function ArchitectureDiagram() {
  const copy = useCopy();
  const { heavyEffectsOff } = useContextAware();
  const { forceReducedMotion } = usePrefs();
  const animate = !heavyEffectsOff && !forceReducedMotion;

  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));

  return (
    <section id="architecture" className="border-b border-border py-28 md:py-36">
      <div className="mx-auto max-w-7xl px-5 md:px-10">
        <Reveal className="mb-12">
          <SectionHeading
            eyebrow={copy.architecture.eyebrow}
            title={copy.architecture.title}
            description={copy.architecture.description}
          />
        </Reveal>

        <Reveal>
          <div className="glass-panel overflow-hidden rounded-2xl p-4 md:p-8">
            <svg
              viewBox="0 0 440 200"
              className="mx-auto h-auto w-full max-w-3xl"
              role="img"
              aria-label="دیاگرام معماری سیستم"
            >
              {links.map(([from, to], i) => {
                const a = byId[from];
                const b = byId[to];
                return (
                  <g key={`${from}-${to}`}>
                    <line
                      x1={a.x + 48}
                      y1={a.y + 16}
                      x2={b.x + 48}
                      y2={b.y + 16}
                      stroke="rgba(61,255,168,0.25)"
                      strokeWidth="1.5"
                    />
                    <circle
                      r="3"
                      fill="#3dffa8"
                      className={cn(animate && "arch-pulse")}
                      style={animate ? { animationDelay: `${i * 0.25}s` } : undefined}
                    >
                      <animateMotion
                        dur={animate ? "2.8s" : "0s"}
                        repeatCount="indefinite"
                        path={`M${a.x + 48},${a.y + 16} L${b.x + 48},${b.y + 16}`}
                      />
                    </circle>
                  </g>
                );
              })}

              {nodes.map((node) => (
                <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
                  <rect
                    width="96"
                    height="32"
                    rx="6"
                    fill="rgba(14,14,18,0.9)"
                    stroke="rgba(61,255,168,0.35)"
                  />
                  <text
                    x="48"
                    y="20"
                    textAnchor="middle"
                    fill="#ececf1"
                    fontSize="9"
                    fontFamily="var(--font-jetbrains), monospace"
                  >
                    {node.label}
                  </text>
                </g>
              ))}
            </svg>
            <p className="mt-4 text-center font-mono text-[11px] text-dim">
              request path · health-checked · typed contracts
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
