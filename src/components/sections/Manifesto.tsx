import site from "@/data/site.json";
import type { SiteConfig } from "@/types";
import { Reveal } from "@/components/ui/Reveal";

const data = site as SiteConfig;

export function Manifesto() {
  if (!data.whyPoints?.length) return null;

  return (
    <section id="why" className="border-b border-border py-32 md:py-40">
      <div className="mx-auto max-w-7xl px-5 md:px-10">
        <Reveal>
          <p className="max-w-3xl font-display text-[clamp(1.75rem,4vw,2.75rem)] leading-[1.25] text-foreground">
            برای بنیان‌گذارانی که به‌جای اسکریپت موقت، محصول واقعی می‌خواهند.
            <span className="mt-4 block text-muted">
              فرانت، بک‌اند و برند در یک تیم؛ از نسخه اول تا لانچ.
            </span>
          </p>
        </Reveal>

        {data.heroStats?.length ? (
          <Reveal delay={0.06} className="mt-16 flex flex-wrap gap-10 border-t border-border pt-10">
            {data.heroStats.map((stat) => (
              <div key={stat.label}>
                <p className="font-display text-3xl text-foreground md:text-4xl">
                  {stat.value}
                </p>
                <p className="mt-1 text-sm text-muted">{stat.label}</p>
              </div>
            ))}
          </Reveal>
        ) : null}

        <Reveal delay={0.1} className="mt-20 grid gap-12 md:grid-cols-3 md:gap-8">
          {data.whyPoints.map((point) => (
            <div key={point.pain} className="max-w-sm">
              <h3 className="font-display text-lg text-foreground md:text-xl">
                {point.pain}
              </h3>
              <p className="mt-3 text-sm leading-[1.9] text-muted md:text-[15px]">
                {point.answer}
              </p>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
