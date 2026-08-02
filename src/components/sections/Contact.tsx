"use client";

import { useState } from "react";
import { ArrowLeft, GithubLogo, TelegramLogo } from "@phosphor-icons/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import site from "@/data/site.json";
import type { SiteConfig } from "@/types";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Reveal } from "@/components/ui/Reveal";
import { useCopy } from "@/hooks/useCopy";

const data = site as SiteConfig;
const telegram = data.links.find((l) => l.id === "telegram");
const github = data.links.find((l) => l.id === "github");
const email = data.links.find((l) => l.id === "email");

const schema = z.object({
  name: z.string().min(2, "نام الزامی است"),
  contact: z.string().min(3, "تلگرام یا موبایل الزامی است"),
  message: z.string().min(10, "توضیح باید حداقل ۱۰ کاراکتر باشد"),
  website: z.string().max(0).optional(),
});

type FormData = z.infer<typeof schema>;

const chips = [
  { value: "mvp", label: "محصول جدید" },
  { value: "frontend", label: "فرانت" },
  { value: "infra", label: "زیرساخت" },
  { value: "shop", label: "فروشگاه" },
];

function openMailto(form: FormData, projectType: string) {
  const to = email?.label ?? "hello@raxinshop.ir";
  const subject = encodeURIComponent(
    `[راکسین‌شاپ] ${projectType || "گفتگو"}`,
  );
  const body = encodeURIComponent(
    `نام: ${form.name}\nتماس: ${form.contact}\nنوع: ${projectType || "-"}\n\n${form.message}`,
  );
  const url = `mailto:${to}?subject=${subject}&body=${body}`;
  const link = document.createElement("a");
  link.href = url;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function Contact() {
  const copy = useCopy();
  const [projectType, setProjectType] = useState("mvp");
  const [status, setStatus] = useState<"idle" | "ok">("idle");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", contact: "", message: "", website: "" },
  });

  async function onSubmit(form: FormData) {
    if (form.website) return;

    try {
      await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          contact: form.contact,
          message: `${projectType}\n\n${form.message}`,
        }),
      });
    } catch {
      /* best-effort */
    }

    openMailto(form, projectType);
    setStatus("ok");
    reset();
  }

  return (
    <section id="contact" className="relative overflow-hidden py-20 sm:py-28 md:py-36">
      <div className="relative mx-auto max-w-3xl px-4 sm:px-6 md:px-10">
        <Reveal className="text-center">
          <h2 className="font-display text-[clamp(1.65rem,5vw,2.75rem)] leading-[1.15] text-foreground">
            {copy.contact.title}
          </h2>
          <p className="mx-auto mt-3 max-w-md text-[14px] leading-[1.85] text-muted sm:mt-4 sm:text-[15px]">
            {copy.contact.description}
          </p>
        </Reveal>

        <Reveal delay={0.06} className="mt-8 sm:mt-10 md:mt-12">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-1 shadow-[0_40px_100px_-60px_rgba(0,0,0,0.8)] sm:rounded-[1.75rem] sm:p-1.5">
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="rounded-[calc(1rem-2px)] border border-white/6 bg-void/70 p-4 sm:rounded-[calc(1.75rem-0.375rem)] sm:p-5 md:p-8"
            >
              <input
                type="text"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden
                className="sr-only"
                {...register("website")}
              />

              <div className="mb-4 flex flex-wrap justify-center gap-1.5 sm:mb-5 sm:gap-2">
                {chips.map((chip) => (
                  <button
                    key={chip.value}
                    type="button"
                    onClick={() => setProjectType(chip.value)}
                    className={cn(
                      "rounded-full px-3 py-1.5 text-[12px] transition-colors duration-300 sm:px-3.5 sm:text-[13px]",
                      projectType === chip.value
                        ? "bg-accent text-void"
                        : "border border-border text-muted hover:text-foreground",
                    )}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="نام"
                  placeholder="نام شما"
                  error={errors.name?.message}
                  {...register("name")}
                />
                <Input
                  label="تلگرام یا موبایل"
                  placeholder="@username"
                  dir="ltr"
                  className="text-start"
                  error={errors.contact?.message}
                  {...register("contact")}
                />
              </div>

              <div className="mt-4">
                <Textarea
                  label="پیام"
                  placeholder="کوتاه بگو چه می‌خواهی بسازی"
                  rows={4}
                  error={errors.message?.message}
                  {...register("message")}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="group mt-6 inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-accent px-6 py-3.5 text-sm font-medium text-void transition-colors hover:bg-accent-bright disabled:opacity-60"
              >
                {isSubmitting ? "در حال ارسال..." : "ارسال"}
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-void/10 transition-transform duration-300 group-hover:-translate-x-0.5">
                  <ArrowLeft className="h-3.5 w-3.5" weight="bold" />
                </span>
              </button>

              {status === "ok" ? (
                <p className="mt-4 text-center text-sm text-muted" role="status">
                  ایمیل باز شد. اگر نه، مستقیم پیام بده.
                </p>
              ) : null}
            </form>
          </div>
        </Reveal>

        <Reveal delay={0.1} className="mt-8 flex flex-wrap items-center justify-center gap-5 text-sm">
          {github ? (
            <a
              href={github.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-muted transition-colors hover:text-accent"
              dir="ltr"
            >
              <GithubLogo className="h-4 w-4" weight="fill" />
              {github.label}
            </a>
          ) : null}
          {telegram ? (
            <a
              href={telegram.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-muted transition-colors hover:text-accent"
            >
              <TelegramLogo className="h-4 w-4" weight="fill" />
              {telegram.label}
            </a>
          ) : null}
          {email ? (
            <a
              href={email.href}
              className="text-muted transition-colors hover:text-accent"
              dir="ltr"
            >
              {email.label}
            </a>
          ) : null}
        </Reveal>
      </div>
    </section>
  );
}
