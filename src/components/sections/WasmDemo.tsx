"use client";

import { useMemo, useState, useTransition } from "react";
import { useCopy } from "@/hooks/useCopy";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SpotlightCard } from "@/components/ui/SpotlightCard";

function buildRecords(count: number) {
  const out: { id: number; sku: string; score: number }[] = [];
  for (let i = 0; i < count; i += 1) {
    out.push({
      id: i,
      sku: `SKU-${(i * 37) % 9973}`,
      score: (i * 13) % 100,
    });
  }
  return out;
}

export function WasmDemo() {
  const copy = useCopy();
  const records = useMemo(() => buildRecords(50_000), []);
  const [query, setQuery] = useState("80");
  const [ms, setMs] = useState<number | null>(null);
  const [hits, setHits] = useState(0);
  const [pending, startTransition] = useTransition();

  const run = () => {
    const threshold = Number(query) || 0;
    const start = performance.now();
    startTransition(() => {
      let count = 0;
      for (let i = 0; i < records.length; i += 1) {
        if (records[i].score >= threshold) count += 1;
      }
      const elapsed = performance.now() - start;
      setHits(count);
      setMs(Number(elapsed.toFixed(3)));
    });
  };

  return (
    <section id="compute" className="border-b border-border py-28 md:py-36">
      <div className="mx-auto max-w-7xl px-5 md:px-10">
        <Reveal className="mb-12">
          <SectionHeading
            eyebrow={copy.wasmDemo.eyebrow}
            title={copy.wasmDemo.title}
            description={copy.wasmDemo.description}
          />
        </Reveal>

        <Reveal>
          <SpotlightCard className="rounded-2xl p-5 md:p-6">
            <div className="flex flex-wrap items-end gap-3">
              <label className="block font-mono text-[12px] text-dim">
                min score
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="mt-1 block w-28 border border-border bg-void px-3 py-2 text-foreground outline-none focus:border-accent"
                  dir="ltr"
                />
              </label>
              <button
                type="button"
                onClick={run}
                className="border border-accent/40 bg-accent px-4 py-2 font-mono text-[12px] font-semibold text-void"
              >
                {pending ? "filtering…" : "filter 50k rows"}
              </button>
            </div>
            <p className="mt-5 font-mono text-sm text-muted" dir="ltr">
              {ms === null
                ? "ready · 50,000 in-memory records"
                : `hits ${hits} · ${ms}ms on your browser (JS hot path · Wasm-ready seam)`}
            </p>
          </SpotlightCard>
        </Reveal>
      </div>
    </section>
  );
}
