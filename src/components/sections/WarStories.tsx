"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { useCopy } from "@/hooks/useCopy";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/utils";

const stories = [
  {
    id: "ip-shift",
    title: "مهاجرت زیرساخت بدون قطعی",
    context: "مرهم · سامانه سلامت",
    body: "انتقال سرور و رنج IP با هماهنگی DNS و health-check، بدون downtime برای کاربران.",
  },
  {
    id: "gov",
    title: "مستندسازی و تایید نهاد رسمی",
    context: "الزامات زیرساخت · نهاد دولتی",
    body: "پاسخ به نیازمندی‌های امنیتی و پیگیری تایید زیرساخت برای پلتفرم خدماتی حساس.",
  },
  {
    id: "catalog",
    title: "کاتالوگ واقعی، تجربهٔ روان",
    context: "حاجی‌عسل · فروشگاه",
    body: "محصولات با دیتای واقعی و تصاویر بهینه، بدون قربانی کردن حس لوکس فروشگاه.",
  },
];

export function WarStories() {
  const copy = useCopy();
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState(0);

  return (
    <section id="war-stories" className="border-b border-border py-28 md:py-40">
      <div className="mx-auto max-w-7xl px-5 md:px-10">
        <Reveal className="mb-14 max-w-2xl">
          <h2 className="font-display text-[2rem] text-foreground md:text-[2.75rem]">
            {copy.warStories.title}
          </h2>
          <p className="mt-5 max-w-xl text-[15px] leading-[1.85] text-muted md:text-base">
            {copy.warStories.description}
          </p>
        </Reveal>

        <div className="hidden gap-3 md:flex md:min-h-[340px]">
          {stories.map((story, index) => {
            const isOpen = active === index;
            return (
              <motion.button
                key={story.id}
                type="button"
                onMouseEnter={() => setActive(index)}
                onFocus={() => setActive(index)}
                onClick={() => setActive(index)}
                layout
                className={cn(
                  "group relative overflow-hidden rounded-[1.5rem] border text-start transition-colors duration-500",
                  isOpen
                    ? "flex-[2.4] border-accent/30 bg-elevated"
                    : "flex-[0.85] border-border bg-surface/40 hover:border-border-bright",
                )}
                transition={{ duration: 0.55, ease: [0.32, 0.72, 0, 1] }}
              >
                <div
                  className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(143,164,196,0.14),transparent_50%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  aria-hidden
                />
                <div className="relative flex h-full flex-col justify-between p-6 md:p-7">
                  <p className="label-mono text-dim">{story.context}</p>
                  <div>
                    <h3
                      className={cn(
                        "font-display text-foreground transition-all duration-500",
                        isOpen ? "text-2xl md:text-3xl" : "text-base leading-snug",
                      )}
                    >
                      {story.title}
                    </h3>
                    <AnimatePresence mode="wait">
                      {isOpen ? (
                        <motion.p
                          key="body"
                          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={reduceMotion ? undefined : { opacity: 0, y: 8 }}
                          transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
                          className="mt-4 max-w-md text-sm leading-[1.9] text-muted md:text-[15px]"
                        >
                          {story.body}
                        </motion.p>
                      ) : null}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>

        <ol className="space-y-4 md:hidden">
          {stories.map((story) => (
            <li
              key={story.id}
              className="rounded-2xl border border-border bg-surface/30 p-5"
            >
              <p className="label-mono text-dim">{story.context}</p>
              <h3 className="mt-2 font-display text-xl text-foreground">
                {story.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">{story.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
