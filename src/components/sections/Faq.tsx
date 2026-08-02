import faqData from "@/data/faq.json";
import type { FaqItem } from "@/types";
import { Reveal } from "@/components/ui/Reveal";

const items = faqData as FaqItem[];

export function Faq() {
  return (
    <section id="faq" className="border-b border-border py-32 md:py-40">
      <div className="mx-auto max-w-7xl px-5 md:px-10">
        <Reveal className="mb-12 max-w-2xl">
          <h2 className="font-display text-[2rem] text-foreground md:text-[2.75rem]">
            پرسش‌های رایج
          </h2>
          <p className="mt-5 max-w-xl text-[15px] leading-[1.85] text-muted md:text-base">
            قبل از شروع پروژه، این‌ها را می‌پرسید.
          </p>
        </Reveal>

        <Reveal delay={0.06}>
          <dl className="grid gap-x-12 gap-y-10 md:grid-cols-2">
            {items.map((item) => (
              <div key={item.id}>
                <dt className="font-display text-lg text-foreground">{item.question}</dt>
                <dd className="mt-3 text-sm leading-[1.9] text-muted md:text-[15px]">
                  {item.answer}
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </section>
  );
}
