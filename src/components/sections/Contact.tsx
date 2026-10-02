"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Broadcast,
  EnvelopeSimple,
  GithubLogo,
  TelegramLogo,
} from "@phosphor-icons/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Reveal } from "@/components/ui/Reveal";
import { useCopy } from "@/hooks/useCopy";
import { useSite } from "@/context/CmsContext";
import {
  isIranMobile,
  PROJECT_TYPES,
  projectTypeLabel,
  resolveProjectType,
} from "@/lib/contact";
import { publicHref } from "@/lib/links";

const schema = z.object({
  name: z.string().min(2, "نام الزامی است"),
  contact: z
    .string()
    .trim()
    .min(1, "شماره موبایل الزامی است")
    .refine((value) => isIranMobile(value), "شماره موبایل معتبر نیست"),
  message: z.string().min(10, "پیام باید حداقل ۱۰ کاراکتر باشد"),
  website: z.string().max(0).optional(),
});

type FormData = z.infer<typeof schema>;

export function Contact({
  initialService = null,
}: {
  initialService?: string | null;
}) {
  return (
    <Suspense fallback={<ContactSection serviceQuery={initialService} />}>
      <ContactFromUrl initialService={initialService} />
    </Suspense>
  );
}

function ContactFromUrl({
  initialService,
}: {
  initialService: string | null;
}) {
  const fromUrl = useSearchParams().get("service");
  return (
    <ContactSection serviceQuery={fromUrl ?? initialService} />
  );
}

function ContactSection({ serviceQuery }: { serviceQuery: string | null }) {
  const copy = useCopy();
  const data = useSite();
  const telegram = data.links.find((l) => l.id === "telegram");
  const github = data.links.find((l) => l.id === "github");
  const githubHref = publicHref(github?.href);
  const email = data.links.find((l) => l.id === "email");
  const channel = data.links.find((l) => l.id === "channel");
  const fromQuery = resolveProjectType(serviceQuery);
  const [picked, setPicked] = useState<string | null>(null);
  const [seenQuery, setSeenQuery] = useState(serviceQuery);
  if (serviceQuery !== seenQuery) {
    setSeenQuery(serviceQuery);
    setPicked(null);
  }
  const projectType = picked ?? fromQuery;
  const knownType = PROJECT_TYPES.some(
    (chip) => chip.value === projectType || chip.label === projectType,
  );
  const [status, setStatus] = useState<"idle" | "ok" | "error">("idle");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: { name: "", contact: "", message: "", website: "" },
  });

  async function onSubmit(form: FormData) {
    if (form.website) {
      setStatus("ok");
      reset();
      return;
    }
    setStatus("idle");

    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          contact: form.contact,
          message: form.message,
          projectType: projectTypeLabel(projectType),
        }),
      });
      if (!res.ok) {
        setStatus("error");
        return;
      }
      setStatus("ok");
      reset();
    } catch {
      setStatus("error");
    }
  }

  return (
    <section
      id="contact"
      className="relative overflow-hidden bg-void px-4 py-16 sm:px-6 sm:py-20 md:px-8 md:py-28"
    >
      <div className="relative mx-auto grid max-w-6xl items-center gap-10 sm:gap-12 md:grid-cols-2 md:gap-12 lg:gap-16">
        <Reveal className="flex flex-col justify-center text-center md:pe-2 md:text-start">
          {copy.contact.eyebrow ? (
            <p className="mb-3 text-[12px] text-dim sm:text-[13px]">
              {copy.contact.eyebrow}
            </p>
          ) : null}
          <h2 className="font-display text-[clamp(1.85rem,4.5vw,3rem)] leading-[1.12] text-foreground">
            {copy.contact.title}
          </h2>
          {copy.contact.description ? (
            <p className="mx-auto mt-4 max-w-sm text-[15px] leading-[1.85] text-muted md:mx-0">
              {copy.contact.description}
            </p>
          ) : null}

          <div className="mt-8 flex flex-col items-center gap-4 md:items-start">
            {telegram ? (
              <a
                href={telegram.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 rounded-full bg-accent py-1.5 pe-1.5 ps-5 text-sm font-medium text-black transition-[gap] duration-300 hover:gap-3 hover:bg-accent-bright"
              >
                <TelegramLogo className="h-5 w-5" weight="fill" />
                گفتگو در تلگرام
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black transition-transform duration-300 group-hover:scale-105 sm:h-10 sm:w-10">
                  <ArrowLeft className="h-4 w-4 text-accent" weight="bold" />
                </span>
              </a>
            ) : null}

            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 md:justify-start">
              {email ? (
                <a
                  href={email.href}
                  className="inline-flex items-center gap-2 text-[13px] text-muted transition-colors hover:text-accent"
                  dir="ltr"
                >
                  <EnvelopeSimple className="h-4 w-4" weight="bold" />
                  {email.label}
                </a>
              ) : null}
              {githubHref ? (
                <a
                  href={githubHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[13px] text-muted transition-colors hover:text-accent"
                  dir="ltr"
                >
                  <GithubLogo className="h-4 w-4" weight="fill" />
                  {github?.label ?? "گیت‌هاب"}
                </a>
              ) : null}
              {channel ? (
                <a
                  href={channel.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[13px] text-muted transition-colors hover:text-accent"
                  dir="ltr"
                >
                  <Broadcast className="h-4 w-4" weight="fill" />
                  {channel.label}
                </a>
              ) : null}
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.05}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="rounded-2xl border border-accent/15 bg-[#171717] p-5 shadow-[0_28px_70px_-36px_rgba(0,0,0,1),inset_0_1px_0_rgba(225,224,204,0.06)] sm:p-6 md:rounded-[1.35rem] md:p-7"
          >
            <div className="mb-6">
              <p className="mb-2.5 text-[12px] text-dim">نوع پروژه</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {PROJECT_TYPES.map((chip) => {
                  const selected =
                    projectType === chip.value || projectType === chip.label;
                  return (
                    <button
                      key={chip.value}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => setPicked(chip.value)}
                      className={cn(
                        "rounded-full px-2.5 py-2 text-[12px] transition-colors duration-300 sm:text-[13px]",
                        selected
                          ? "bg-accent font-medium text-black"
                          : "border border-accent/15 text-muted hover:border-accent/30 hover:text-foreground",
                      )}
                    >
                      {chip.label}
                    </button>
                  );
                })}
              </div>
              {!knownType ? (
                <p className="mt-3 text-[13px] text-accent">
                  موضوع: {projectType}
                </p>
              ) : null}
            </div>

            <input
              type="text"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden
              className="sr-only"
              {...register("website")}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="نام"
                placeholder="نام شما"
                error={errors.name?.message}
                {...register("name")}
              />
              <Input
                id="lead-contact"
                label="شماره موبایل"
                placeholder="۰۹۱۲…"
                dir="ltr"
                className="text-start"
                inputMode="tel"
                autoComplete="tel"
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
              className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border border-accent/30 bg-transparent text-sm font-medium text-accent transition-colors hover:border-accent/50 hover:bg-accent/10 disabled:opacity-60"
            >
              {isSubmitting ? "در حال ارسال..." : "ارسال پیام"}
              <ArrowLeft className="h-4 w-4" weight="bold" />
            </button>

            {status === "ok" ? (
              <p
                className="mt-4 text-center text-sm text-accent"
                role="status"
              >
                پیام ثبت شد
              </p>
            ) : null}

            {status === "error" ? (
              <p className="mt-4 text-center text-sm text-signal" role="alert">
                ارسال نشد. از تلگرام پیام بده
                {email ? ` یا ایمیل بزن.` : "."}
              </p>
            ) : null}
          </form>
        </Reveal>
      </div>
    </section>
  );
}
