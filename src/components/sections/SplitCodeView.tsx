"use client";

import { useCallback, useRef, useState } from "react";
import { useCopy } from "@/hooks/useCopy";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

const SAMPLE_CODE = `export function SpotlightCard({ children, className }: Props) {
  const onMove = (event: React.PointerEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    event.currentTarget.style.setProperty("--mouse-x", \`\${x}%\`);
    event.currentTarget.style.setProperty("--mouse-y", \`\${y}%\`);
  };
  return (
    <div onPointerMove={onMove} className={cn("spotlight-card", className)}>
      {children}
    </div>
  );
}`;

export function SplitCodeView() {
  const copy = useCopy();
  const containerRef = useRef<HTMLDivElement>(null);
  const [ratio, setRatio] = useState(55);
  const dragging = useRef(false);

  const onPointerMove = useCallback((event: React.PointerEvent) => {
    if (!dragging.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const next = ((event.clientX - rect.left) / rect.width) * 100;
    setRatio(Math.min(82, Math.max(18, next)));
  }, []);

  return (
    <section id="source" className="border-b border-border py-28 md:py-36">
      <div className="mx-auto max-w-7xl px-5 md:px-10">
        <Reveal className="mb-12">
          <SectionHeading
            eyebrow={copy.splitCode.eyebrow}
            title={copy.splitCode.title}
            description={copy.splitCode.description}
          />
        </Reveal>

        <Reveal>
          <div
            ref={containerRef}
            className="relative h-[360px] overflow-hidden rounded-2xl border border-border md:h-[420px]"
            onPointerMove={onPointerMove}
            onPointerUp={() => {
              dragging.current = false;
            }}
            onPointerLeave={() => {
              dragging.current = false;
            }}
          >
            <div
              className="absolute inset-0 bg-gradient-to-br from-elevated via-surface to-void p-8"
              style={{ clipPath: `inset(0 ${100 - ratio}% 0 0)` }}
            >
              <p className="label-mono text-accent">rendered UI</p>
              <div className="mt-8 max-w-sm rounded-xl border border-border bg-panel/80 p-5 backdrop-blur">
                <p className="font-display text-xl">SpotlightCard</p>
                <p className="mt-2 text-sm text-muted">
                  کارت با نور محیطی که موس را دنبال می‌کند.
                </p>
              </div>
            </div>

            <div
              className="absolute inset-0 bg-void p-4"
              style={{ clipPath: `inset(0 0 0 ${ratio}%)` }}
              dir="ltr"
            >
              <p className="label-mono mb-3 text-cyber">source · TypeScript</p>
              <pre className="h-[calc(100%-2rem)] overflow-auto font-mono text-[11px] leading-relaxed text-accent/85">
                {SAMPLE_CODE}
              </pre>
            </div>

            <button
              type="button"
              aria-label="جابه‌جایی اسلایدر مقایسه"
              className="absolute inset-y-0 z-10 w-1 -translate-x-1/2 cursor-col-resize bg-accent/70"
              style={{ left: `${ratio}%` }}
              onPointerDown={(e) => {
                dragging.current = true;
                e.currentTarget.setPointerCapture(e.pointerId);
              }}
            >
              <span className="absolute top-1/2 left-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent bg-void" />
            </button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
