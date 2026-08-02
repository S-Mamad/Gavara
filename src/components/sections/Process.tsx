import processData from "@/data/process.json";
import type { ProcessStep } from "@/types";
import { Reveal } from "@/components/ui/Reveal";

const steps = processData as ProcessStep[];

export function Process() {
  return (
    <section id="process" className="border-b border-border py-32 md:py-40">
      <div className="mx-auto max-w-7xl px-5 md:px-10">
        <Reveal className="mb-16 max-w-2xl">
          <h2 className="font-display text-[2rem] text-foreground md:text-[2.75rem]">
            چطور همکاری می‌کنیم
          </h2>
          <p className="mt-5 max-w-xl text-[15px] leading-[1.85] text-muted md:text-base">
            از جلسه اول تا لانچ. شفاف و مرحله‌به‌مرحله.
          </p>
        </Reveal>

        <Reveal delay={0.06}>
          <div className="relative">
            <div
              className="pointer-events-none absolute top-8 hidden h-px bg-border md:block md:w-[calc(100%-8rem)] md:start-16"
              aria-hidden
            />
            <ol className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 [-ms-overflow-style:none] [scrollbar-width:none] md:gap-6 [&::-webkit-scrollbar]:hidden">
              {steps.map((step, index) => (
                <li
                  key={step.id}
                  className="w-[min(80vw,260px)] shrink-0 snap-start md:w-[220px]"
                >
                  <div className="flex h-full flex-col border-t-2 border-accent/40 pt-6">
                    <span className="font-mono text-xs text-accent">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <h3 className="mt-3 font-display text-lg text-foreground">
                      {step.title}
                    </h3>
                    <p className="mt-3 flex-1 text-sm leading-[1.85] text-muted">
                      {step.description}
                    </p>
                    {step.duration ? (
                      <p className="label-mono mt-4 text-dim">{step.duration}</p>
                    ) : null}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
