"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import site from "@/data/site.json";
import type { SiteConfig } from "@/types";
import { useCopy } from "@/hooks/useCopy";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useSonic } from "@/hooks/useSonic";
import { cn } from "@/lib/utils";

const data = site as SiteConfig;

const schema = z.object({
  name: z.string().min(2, "نام الزامی است"),
  contact: z.string().min(3, "راه ارتباطی الزامی است"),
  message: z.string().min(10, "پیام کوتاه است"),
  website: z.string().max(0).optional(),
});

type FormData = z.infer<typeof schema>;

function buildMailto(form: FormData) {
  const email = data.links.find((l) => l.id === "email");
  const to = email?.label ?? "hello@raxinshop.ir";
  const subject = encodeURIComponent(`[راکسین‌شاپ] پیام از ${form.name}`);
  const body = encodeURIComponent(
    `نام: ${form.name}\nتماس: ${form.contact}\n\n${form.message}`,
  );
  return `mailto:${to}?subject=${subject}&body=${body}`;
}

const files = [
  { name: "message.ts", active: true },
  { name: "brief.md", active: false },
  { name: "stack.json", active: false },
];

export function ContactIDE() {
  const copy = useCopy();
  const { playClick } = useSonic();
  const [status, setStatus] = useState<"idle" | "sent" | "error">("idle");

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", contact: "", message: "", website: "" },
  });

  const values = watch();

  const onSubmit = handleSubmit(async (form) => {
    if (form.website) return;
    playClick();
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("fail");
      const link = document.createElement("a");
      link.href = buildMailto(form);
      link.click();
      setStatus("sent");
      reset();
    } catch {
      const link = document.createElement("a");
      link.href = buildMailto(form);
      link.click();
      setStatus("sent");
      reset();
    }
  });

  const lineCount = Math.max(
    8,
    (values.message || "").split("\n").length + 6,
  );

  return (
    <section id="contact" className="py-28 md:py-36">
      <div className="mx-auto max-w-7xl px-5 md:px-10">
        <Reveal className="mb-12">
          <SectionHeading
            eyebrow={copy.contact.eyebrow}
            title={copy.contact.title}
            description={copy.contact.description}
          />
        </Reveal>

        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <Reveal>
            <div className="space-y-3">
              {data.links.map((link) => (
                <a
                  key={link.id}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass flex items-center justify-between rounded-xl px-5 py-4 transition-colors hover:border-accent/30"
                >
                  <span dir="ltr" className="font-mono text-sm text-foreground">
                    {link.label}
                  </span>
                  <span className="label-mono text-dim">{link.id}</span>
                </a>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.05}>
            <form
              onSubmit={onSubmit}
              className="glass-panel overflow-hidden rounded-2xl"
              noValidate
            >
              <div className="flex border-b border-border">
                <aside
                  className="hidden w-40 shrink-0 border-e border-border bg-void/40 p-3 md:block"
                  aria-hidden
                >
                  <p className="mb-2 font-mono text-[10px] text-dim">EXPLORER</p>
                  {files.map((file) => (
                    <div
                      key={file.name}
                      className={cn(
                        "rounded px-2 py-1 font-mono text-[11px]",
                        file.active
                          ? "bg-accent/10 text-accent"
                          : "text-muted",
                      )}
                      dir="ltr"
                    >
                      {file.name}
                    </div>
                  ))}
                </aside>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between border-b border-border px-4 py-2">
                    <span className="font-mono text-[11px] text-dim" dir="ltr">
                      message.ts
                    </span>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="border border-accent/40 bg-accent px-3 py-1 font-mono text-[11px] font-semibold text-void transition-opacity hover:opacity-90 disabled:opacity-50"
                    >
                      {isSubmitting ? "Running…" : "Run ▶"}
                    </button>
                  </div>

                  <div className="flex" dir="ltr">
                    <div
                      className="select-none border-e border-border bg-void/30 px-2 py-4 text-end font-mono text-[11px] leading-6 text-dim"
                      aria-hidden
                    >
                      {Array.from({ length: lineCount }, (_, i) => (
                        <div key={i}>{i + 1}</div>
                      ))}
                    </div>

                    <div className="flex-1 space-y-3 p-4 font-mono text-[12px] leading-6">
                      <p className="text-dim">
                        <span className="text-cyber">const</span> payload = {"{"}
                      </p>

                      <label className="block">
                        <span className="text-dim">{"  "}name: </span>
                        <input
                          {...register("name")}
                          aria-label="نام"
                          placeholder='"Your name"'
                          className="w-[min(100%,220px)] border-b border-border bg-transparent text-accent outline-none placeholder:text-dim/50"
                        />
                        {errors.name ? (
                          <span className="ms-2 text-signal">
                            {errors.name.message}
                          </span>
                        ) : null}
                      </label>

                      <label className="block">
                        <span className="text-dim">{"  "}contact: </span>
                        <input
                          {...register("contact")}
                          aria-label="راه ارتباطی"
                          placeholder='"@telegram or phone"'
                          className="w-[min(100%,240px)] border-b border-border bg-transparent text-accent outline-none placeholder:text-dim/50"
                        />
                        {errors.contact ? (
                          <span className="ms-2 text-signal">
                            {errors.contact.message}
                          </span>
                        ) : null}
                      </label>

                      <label className="block">
                        <span className="text-dim">{"  "}message: </span>
                        <textarea
                          {...register("message")}
                          aria-label="پیام"
                          rows={4}
                          placeholder="`Tell us about the project`"
                          className="mt-1 w-full resize-y border border-border bg-void/40 p-2 text-accent outline-none placeholder:text-dim/50"
                        />
                        {errors.message ? (
                          <span className="text-signal">
                            {errors.message.message}
                          </span>
                        ) : null}
                      </label>

                      <p className="text-dim">{"};"}</p>
                      <p className="text-dim">
                        <span className="text-cyber">export</span> default
                        payload;
                      </p>

                      <input
                        type="text"
                        tabIndex={-1}
                        autoComplete="off"
                        className="sr-only"
                        aria-hidden
                        {...register("website")}
                      />

                      {status === "sent" ? (
                        <p className="text-accent" role="status">
                          // deploy queued — we will reply soon
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
