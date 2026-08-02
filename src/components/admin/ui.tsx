"use client";

import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

export function AdminPageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-[clamp(1.6rem,3vw,2.25rem)] text-foreground">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-xl text-sm leading-7 text-muted">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

export function AdminCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:rounded-[1.35rem] sm:p-5",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function AdminField({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <div className="block">
      <span className="mb-0 block text-[12px] text-dim">{label}</span>
      <div className="mt-1.5">{children}</div>
      {hint ? <span className="mt-1 block text-[11px] text-dim">{hint}</span> : null}
    </div>
  );
}

export const adminInputClass =
  "w-full rounded-xl border border-white/10 bg-void/80 px-3 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-dim/70 focus:border-accent/45 focus:ring-2 focus:ring-accent/20";

export const adminTextareaClass = `${adminInputClass} leading-7`;

export const adminSelectClass = `${adminInputClass} appearance-none`;

type ButtonVariant = "primary" | "ghost" | "danger" | "outline";

function buttonClass(variant: ButtonVariant, className?: string) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-colors duration-300 active:scale-[0.98] disabled:opacity-55",
    variant === "primary" &&
      "border border-accent/35 bg-accent text-void hover:bg-accent-bright",
    variant === "outline" &&
      "border border-border-bright text-foreground hover:border-accent/40 hover:text-accent",
    variant === "ghost" &&
      "border border-transparent text-muted hover:bg-white/5 hover:text-foreground",
    variant === "danger" &&
      "border border-signal/35 text-signal hover:bg-signal/10",
    className,
  );
}

export function AdminButton({
  children,
  variant = "primary",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
}) {
  return (
    <button className={buttonClass(variant, className)} {...props}>
      {children}
    </button>
  );
}

export function AdminLinkButton({
  children,
  variant = "primary",
  className,
  ...props
}: ComponentProps<typeof Link> & {
  variant?: ButtonVariant;
}) {
  return (
    <Link className={buttonClass(variant, className)} {...props}>
      {children}
    </Link>
  );
}

export function AdminCheckbox({
  label,
  checked,
  onChange,
  className,
}: {
  label?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}) {
  return (
    <label
      className={cn(
        "inline-flex cursor-pointer items-center gap-2.5 text-sm text-muted",
        className,
      )}
    >
      <span
        className={cn(
          "relative flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors",
          checked
            ? "border-accent bg-accent text-void"
            : "border-white/20 bg-void/60",
        )}
      >
        <input
          type="checkbox"
          className="absolute inset-0 cursor-pointer opacity-0"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          aria-label={label || undefined}
        />
        {checked ? (
          <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" aria-hidden>
            <path
              d="M2 6.2 4.6 9 10 3"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : null}
      </span>
      {label ? <span>{label}</span> : null}
    </label>
  );
}

export function AdminBadge({
  children,
  tone = "muted",
}: {
  children: ReactNode;
  tone?: "accent" | "muted" | "gold" | "signal";
}) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-[11px]",
        tone === "accent" && "bg-accent/15 text-accent-bright",
        tone === "muted" && "bg-white/8 text-muted",
        tone === "gold" && "bg-gold/15 text-gold",
        tone === "signal" && "bg-signal/15 text-signal",
      )}
    >
      {children}
    </span>
  );
}

export function AdminEmpty({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-border px-4 py-10 text-center text-sm text-dim">
      {children}
    </div>
  );
}

export function AdminErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <AdminCard className="space-y-3 text-center">
      <p className="text-sm text-signal">{message}</p>
      {onRetry ? (
        <AdminButton variant="outline" onClick={onRetry}>
          تلاش دوباره
        </AdminButton>
      ) : null}
    </AdminCard>
  );
}
