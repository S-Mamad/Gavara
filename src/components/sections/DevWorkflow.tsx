"use client";

import { useEffect, useState } from "react";
import { useCopy } from "@/hooks/useCopy";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { cn } from "@/lib/utils";

const STEPS = [
  { t: 0, line: "$ npm run deploy" },
  { t: 400, line: "Error: EPERM: operation not permitted, unlink '.git/index.lock'" },
  { t: 900, line: "→ cursor: diagnose permission race on shared runner" },
  { t: 1400, line: "→ fix: release lock · retry with flock · pin node 22" },
  { t: 1900, line: "✓ resolved in 47s · pipeline green" },
];

export function DevWorkflow() {
  const copy = useCopy();
  const [visible, setVisible] = useState(0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    setVisible(0);
    const timers = STEPS.map((step, index) =>
      window.setTimeout(() => setVisible(index + 1), step.t),
    );
    const done = window.setTimeout(() => setRunning(false), 2600);
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(done);
    };
  }, [running]);

  return (
    <section id="workflow" className="border-b border-border py-28 md:py-36">
      <div className="mx-auto max-w-7xl px-5 md:px-10">
        <Reveal className="mb-12">
          <SectionHeading
            eyebrow={copy.workflow.eyebrow}
            title={copy.workflow.title}
            description={copy.workflow.description}
          />
        </Reveal>

        <Reveal>
          <SpotlightCard className="rounded-2xl p-5 md:p-8">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <p className="font-mono text-[11px] text-dim">
                ai-assisted debug replay
              </p>
              <button
                type="button"
                onClick={() => setRunning(true)}
                disabled={running}
                className="border border-accent/40 bg-accent/10 px-3 py-1.5 font-mono text-[11px] text-accent transition-colors hover:bg-accent/20 disabled:opacity-50"
              >
                {running ? "running…" : "replay EPERM fix"}
              </button>
            </div>
            <div
              className="min-h-[180px] space-y-2 rounded-xl border border-border bg-void/70 p-4 font-mono text-[12px]"
              dir="ltr"
            >
              {STEPS.slice(0, visible).map((step) => (
                <p
                  key={step.line}
                  className={cn(
                    step.line.startsWith("✓")
                      ? "text-accent"
                      : step.line.startsWith("Error")
                        ? "text-signal"
                        : "text-muted",
                  )}
                >
                  {step.line}
                </p>
              ))}
              {!visible ? (
                <p className="text-dim">press replay to watch the debug loop</p>
              ) : null}
            </div>
          </SpotlightCard>
        </Reveal>
      </div>
    </section>
  );
}
