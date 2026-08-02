"use client";

import { useState } from "react";
import { useCopy } from "@/hooks/useCopy";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { cn } from "@/lib/utils";
import { useSonic } from "@/hooks/useSonic";

const ENDPOINTS = [
  { method: "GET", path: "/api/v1/skills", label: "skills" },
  { method: "GET", path: "/api/v1/projects", label: "projects" },
  { method: "GET", path: "/api/v1/resume", label: "resume" },
] as const;

export function ApiPlayground() {
  const copy = useCopy();
  const { playClick } = useSonic();
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string>(
    '// click Send to fetch mock JSON',
  );

  const send = async (index: number) => {
    playClick();
    setActive(index);
    setLoading(true);
    setResponse("{\n  \"status\": \"pending\"\n}");
    try {
      const res = await fetch(
        `/api/playground?resource=${ENDPOINTS[index].label}`,
      );
      const json = await res.json();
      setResponse(JSON.stringify(json, null, 2));
    } catch {
      setResponse('{\n  "error": "request_failed"\n}');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="api" className="border-b border-border py-28 md:py-36">
      <div className="mx-auto max-w-7xl px-5 md:px-10">
        <Reveal className="mb-12">
          <SectionHeading
            eyebrow={copy.apiPlayground.eyebrow}
            title={copy.apiPlayground.title}
            description={copy.apiPlayground.description}
          />
        </Reveal>

        <Reveal>
          <SpotlightCard className="rounded-2xl p-4 md:p-6">
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-2">
                {ENDPOINTS.map((ep, index) => (
                  <button
                    key={ep.path}
                    type="button"
                    onClick={() => void send(index)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-lg border px-3 py-3 text-start font-mono text-[12px] transition-colors",
                      active === index
                        ? "border-accent/40 bg-accent/10 text-accent"
                        : "border-border text-muted hover:border-border-bright",
                    )}
                    dir="ltr"
                  >
                    <span>
                      <span className="text-cyber">{ep.method}</span> {ep.path}
                    </span>
                    <span className="text-[10px] text-dim">
                      {loading && active === index ? "…" : "Send"}
                    </span>
                  </button>
                ))}
              </div>
              <pre
                dir="ltr"
                className="max-h-[280px] overflow-auto rounded-xl border border-border bg-void/70 p-4 font-mono text-[11px] leading-relaxed text-accent/90"
              >
                {response}
              </pre>
            </div>
          </SpotlightCard>
        </Reveal>
      </div>
    </section>
  );
}
