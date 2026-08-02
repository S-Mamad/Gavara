"use client";

import { useEffect, useState } from "react";
import { useCopy } from "@/hooks/useCopy";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SpotlightCard } from "@/components/ui/SpotlightCard";

interface GhPayload {
  source: "live" | "mock";
  profile: { login: string; publicRepos: number; followers: number };
  events: { type: string; repo: string; createdAt: string }[];
}

export function GitHubActivity() {
  const copy = useCopy();
  const [data, setData] = useState<GhPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch("/api/github")
      .then(async (res) => {
        if (!res.ok) throw new Error("failed");
        return res.json() as Promise<GhPayload>;
      })
      .then((json) => {
        if (!cancelled) {
          setData(json);
          setError(null);
        }
      })
      .catch(() => {
        if (!cancelled) setError("نتوانستیم فعالیت را بارگذاری کنیم.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section id="github" className="border-b border-border py-28 md:py-36">
      <div className="mx-auto max-w-7xl px-5 md:px-10">
        <Reveal className="mb-12">
          <SectionHeading
            eyebrow={copy.github.eyebrow}
            title={copy.github.title}
            description={copy.github.description}
          />
        </Reveal>

        <Reveal>
          <SpotlightCard className="rounded-2xl p-5 md:p-6">
            {loading ? (
              <p className="font-mono text-sm text-dim">loading activity…</p>
            ) : null}
            {error ? (
              <p className="text-sm text-signal" role="alert">
                {error}
              </p>
            ) : null}
            {data ? (
              <div className="grid gap-6 md:grid-cols-[0.8fr_1.2fr]">
                <div>
                  <p className="label-mono text-accent">
                    source · {data.source}
                  </p>
                  <p className="mt-3 font-display text-2xl" dir="ltr">
                    @{data.profile.login}
                  </p>
                  <dl className="mt-4 grid grid-cols-2 gap-3 font-mono text-sm">
                    <div>
                      <dt className="text-dim">repos</dt>
                      <dd className="text-foreground">
                        {data.profile.publicRepos}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-dim">followers</dt>
                      <dd className="text-foreground">
                        {data.profile.followers}
                      </dd>
                    </div>
                  </dl>
                </div>
                <ul className="space-y-2 font-mono text-[12px]" dir="ltr">
                  {data.events.map((event) => (
                    <li
                      key={`${event.repo}-${event.createdAt}`}
                      className="border-s border-border ps-3 text-muted"
                    >
                      <span className="text-accent">{event.type}</span> ·{" "}
                      {event.repo}
                      <span className="ms-2 text-dim">{event.createdAt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </SpotlightCard>
        </Reveal>
      </div>
    </section>
  );
}
