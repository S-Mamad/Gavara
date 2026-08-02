"use client";

import { useState } from "react";
import { useCopy } from "@/hooks/useCopy";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { useSonic } from "@/hooks/useSonic";

const FLOW = [
  "client → hash(password) with salt",
  "POST /auth/login { hash, deviceId }",
  "server → verify · issue JWT (15m) + refresh",
  "set httpOnly cookie · rotate refresh",
  "authorize resource with scoped claims",
];

export function SecurityPlayground() {
  const copy = useCopy();
  const { playClick } = useSonic();
  const [step, setStep] = useState(0);
  const [running, setRunning] = useState(false);

  const run = () => {
    if (running) return;
    playClick();
    setRunning(true);
    setStep(0);
    FLOW.forEach((_, i) => {
      window.setTimeout(() => setStep(i + 1), (i + 1) * 500);
    });
    window.setTimeout(() => setRunning(false), FLOW.length * 500 + 200);
  };

  return (
    <section id="security" className="border-b border-border py-28 md:py-36">
      <div className="mx-auto max-w-7xl px-5 md:px-10">
        <Reveal className="mb-12">
          <SectionHeading
            eyebrow={copy.security.eyebrow}
            title={copy.security.title}
            description={copy.security.description}
          />
        </Reveal>

        <Reveal>
          <SpotlightCard className="rounded-2xl p-5 md:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="font-mono text-[11px] text-dim">mock auth flow</p>
              <button
                type="button"
                onClick={run}
                disabled={running}
                className="border border-cyber/40 bg-cyber/10 px-3 py-1.5 font-mono text-[11px] text-cyber disabled:opacity-50"
              >
                simulate login
              </button>
            </div>
            <ol className="space-y-2 font-mono text-[12px]" dir="ltr">
              {FLOW.map((line, i) => (
                <li
                  key={line}
                  className={
                    i < step ? "text-accent" : "text-dim opacity-40"
                  }
                >
                  [{String(i + 1).padStart(2, "0")}] {line}
                </li>
              ))}
            </ol>
          </SpotlightCard>
        </Reveal>
      </div>
    </section>
  );
}
