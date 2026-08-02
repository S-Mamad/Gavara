"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import site from "@/data/site.json";
import type { SiteConfig } from "@/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";

const data = site as SiteConfig;

const schema = z
  .object({
    name: z.string().min(2, "نام الزامی است"),
    contact: z.string().min(3, "تلگرام یا موبایل الزامی است"),
    projectType: z.string().min(1, "نوع پروژه را انتخاب کنید"),
    message: z.string().min(10, "توضیح باید حداقل ۱۰ کاراکتر باشد"),
    website: z.string().max(0).optional(),
  })
  .refine((form) => form.projectType !== "", {
    message: "نوع پروژه را انتخاب کنید",
    path: ["projectType"],
  });

type FormData = z.infer<typeof schema>;

const projectTypes = [
  { value: "", label: "انتخاب کنید" },
  { value: "mvp", label: "محصول جدید" },
  { value: "frontend", label: "فرانت‌اند" },
  { value: "backend", label: "بک‌اند" },
  { value: "ecommerce", label: "فروشگاه آنلاین" },
  { value: "brand", label: "برند دیجیتال" },
  { value: "other", label: "سایر" },
];

function buildMailtoUrl(form: FormData) {
  const email = data.links.find((l) => l.id === "email");
  const to = email?.label ?? "hello@raxinshop.ir";
  const subject = encodeURIComponent(`[راکسین‌شاپ] ${form.projectType}`);
  const body = encodeURIComponent(
    `نام: ${form.name}\nتماس: ${form.contact}\nنوع پروژه: ${form.projectType}\n\n${form.message}`,
  );
  return `mailto:${to}?subject=${subject}&body=${body}`;
}

function openMailto(form: FormData) {
  const url = buildMailtoUrl(form);
  const link = document.createElement("a");
  link.href = url;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "mailto" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      contact: "",
      projectType: "",
      message: "",
      website: "",
    },
  });

  async function onSubmit(form: FormData) {
    if (form.website) return;
    setStatus("idle");
    setStatusMessage("");

    try {
      await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          contact: form.contact,
          message: `${form.projectType}\n\n${form.message}`,
        }),
      });
    } catch {
      /* lead is best-effort; mailto is the real delivery */
    }

    openMailto(form);
    setStatus("mailto");
    setStatusMessage(
      "ایمیل شما باز شد. اگر باز نشد، به hello@raxinshop.ir پیام بدهید.",
    );
    reset();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
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
          label="تلگرام / موبایل"
          placeholder="@username یا 09..."
          dir="ltr"
          className="text-start"
          error={errors.contact?.message}
          {...register("contact")}
        />
      </div>
      <Select
        label="نوع پروژه"
        options={projectTypes}
        error={errors.projectType?.message}
        {...register("projectType")}
      />
      <Textarea
        label="توضیح کوتاه"
        placeholder="پروژه‌ات چیست؟ چه زمانی نیاز داری؟"
        rows={4}
        error={errors.message?.message}
        {...register("message")}
      />

      <Button
        type="submit"
        size="lg"
        className="mt-1 w-full rounded-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? "در حال ارسال..." : "ارسال درخواست"}
      </Button>

      <p className="text-xs leading-relaxed text-dim">
        اطلاعات شما فقط برای پاسخ‌گویی استفاده می‌شود.{" "}
        <Link
          href="/hajiasal/privacy"
          className="text-muted underline hover:text-accent"
        >
          حریم خصوصی
        </Link>
      </p>

      {status !== "idle" ? (
        <p
          className={`text-sm ${status === "mailto" ? "text-muted" : "text-signal"}`}
          role="status"
        >
          {statusMessage}
        </p>
      ) : null}
    </form>
  );
}
