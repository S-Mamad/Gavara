import Image from "next/image";
import site from "@/data/site.json";
import type { ServiceItem, SiteConfig } from "@/types";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/ui/Reveal";
import { ServiceIcon } from "@/components/ui/ServiceIcon";

const data = site as SiteConfig;

function ServiceCell({
  service,
  className,
}: {
  service: ServiceItem;
  className?: string;
}) {
  const hasVisual = Boolean(service.visual);
  const hasGradient = Boolean(service.gradient);

  return (
    <article
      className={cn(
        "group relative flex h-full min-h-[280px] flex-col overflow-hidden bg-surface/40 p-8 md:p-10",
        !hasVisual && !hasGradient && "border border-border",
        className,
      )}
    >
      {hasVisual ? (
        <>
          <Image
            src={service.visual!}
            alt=""
            fill
            className="object-cover opacity-30 transition-opacity duration-500 group-hover:opacity-40"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-void via-void/80 to-void/40" />
        </>
      ) : hasGradient ? (
        <div
          className="absolute inset-0 opacity-40"
          style={{
            background: `linear-gradient(135deg, ${service.gradient![0]}, ${service.gradient![1]})`,
          }}
        />
      ) : null}

      <div className="relative z-10 flex flex-1 flex-col">
        <span className="mb-6 flex h-11 w-11 items-center justify-center border border-border-bright bg-elevated/80 text-accent backdrop-blur-sm">
          <ServiceIcon name={service.icon} />
        </span>
        <h3 className="font-display text-xl text-foreground md:text-2xl">
          {service.title}
        </h3>
        <p className="mt-4 flex-1 text-sm leading-[1.9] text-muted md:text-[15px]">
          {service.description}
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-2">
          {service.proof ? (
            <span className="label-mono text-accent/80">نمونه · {service.proof}</span>
          ) : null}
          {service.tags?.slice(0, 2).map((tag) => (
            <span
              key={tag}
              dir="ltr"
              className="border border-border px-2 py-0.5 font-mono text-[10px] text-dim"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}

export function Expertise() {
  const [frontend, product, backend, brand] = data.services;

  return (
    <section id="expertise" className="py-32 md:py-40">
      <div className="mx-auto max-w-7xl px-5 md:px-10">
        <Reveal className="mb-16 max-w-2xl">
          <h2 className="font-display text-[2rem] text-foreground md:text-[2.75rem]">
            حوزه‌های کاری
          </h2>
          <p className="mt-5 max-w-xl text-[15px] leading-[1.85] text-muted md:text-base">
            چهار محور اصلی. هر کدام با استاندارد تولید و نمونه واقعی.
          </p>
        </Reveal>

        <div className="grid gap-4 md:grid-cols-2">
          {frontend ? (
            <Reveal className="md:col-span-2">
              <ServiceCell service={frontend} className="md:min-h-[320px]" />
            </Reveal>
          ) : null}
          {product ? (
            <Reveal delay={0.04}>
              <ServiceCell service={product} />
            </Reveal>
          ) : null}
          {backend ? (
            <Reveal delay={0.08}>
              <ServiceCell service={backend} />
            </Reveal>
          ) : null}
          {brand ? (
            <Reveal delay={0.12} className="md:col-span-2 md:max-w-[calc(50%-0.5rem)]">
              <ServiceCell service={brand} />
            </Reveal>
          ) : null}
        </div>
      </div>
    </section>
  );
}
