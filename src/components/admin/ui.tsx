"use client";

import Link from "next/link";
import {
  useCallback,
  useId,
  useRef,
  useState,
  type ComponentProps,
  type ReactNode,
} from "react";
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
    <div className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="font-display text-[clamp(1.35rem,2.5vw,1.85rem)] text-foreground">
          {title}
        </h1>
        {description ? (
          <p className="mt-1 max-w-xl text-[13px] leading-6 text-muted">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      ) : null}
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
        "rounded-xl border border-white/10 bg-white/[0.025] p-3.5 sm:p-4",
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
  htmlFor,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
  htmlFor?: string;
}) {
  return (
    <div className="block">
      <label htmlFor={htmlFor} className="mb-0 block text-[11px] text-dim">
        {label}
      </label>
      <div className="mt-1">{children}</div>
      {hint ? (
        <span className="mt-1 block text-[10px] text-dim">{hint}</span>
      ) : null}
    </div>
  );
}

export const adminInputClass =
  "w-full rounded-lg border border-white/10 bg-void/80 px-2.5 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-dim/70 focus:border-accent/45 focus:ring-2 focus:ring-accent/15";

export const adminTextareaClass = `${adminInputClass} leading-6`;

export const adminSelectClass = `${adminInputClass} appearance-none`;

type ButtonVariant = "primary" | "ghost" | "danger" | "outline";
type ButtonSize = "sm" | "md";

function buttonClass(
  variant: ButtonVariant,
  size: ButtonSize = "md",
  className?: string,
) {
  return cn(
    "inline-flex items-center justify-center gap-1.5 rounded-lg text-sm font-medium transition-colors duration-200 active:scale-[0.98] disabled:opacity-55",
    size === "sm" && "px-2.5 py-1.5 text-xs",
    size === "md" && "px-3 py-2",
    variant === "primary" &&
      "border border-accent/35 bg-accent text-void hover:bg-accent-bright",
    variant === "outline" &&
      "border border-white/15 text-foreground hover:border-accent/40 hover:text-accent",
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
  size = "md",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
}) {
  return (
    <button className={buttonClass(variant, size, className)} {...props}>
      {children}
    </button>
  );
}

export function AdminLinkButton({
  children,
  variant = "primary",
  size = "md",
  className,
  ...props
}: ComponentProps<typeof Link> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
}) {
  return (
    <Link className={buttonClass(variant, size, className)} {...props}>
      {children}
    </Link>
  );
}

export function AdminTabs<T extends string>({
  items,
  value,
  onChange,
  ariaLabel = "تب‌ها",
}: {
  items: Array<{ id: T; label: string }>;
  value: T;
  onChange: (id: T) => void;
  ariaLabel?: string;
}) {
  return (
    <div
      className="flex flex-wrap gap-1.5"
      role="tablist"
      aria-label={ariaLabel}
    >
      {items.map((item) => {
        const active = item.id === value;
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(item.id)}
            className={cn(
              "rounded-lg px-2.5 py-1.5 text-xs transition-colors",
              active
                ? "bg-accent text-void"
                : "border border-white/10 text-muted hover:text-foreground",
            )}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

export function AdminToolbar({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-4 flex flex-wrap items-center gap-2 border-b border-white/8 pb-3",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function AdminStickySave({
  dirty,
  saving,
  onSave,
  label = "ذخیره",
}: {
  dirty: boolean;
  saving: boolean;
  onSave: () => void;
  label?: string;
}) {
  if (!dirty) return null;
  return (
    <div className="fixed inset-x-0 bottom-20 z-40 border-t border-white/10 bg-void/95 px-3 py-2.5 pb-[max(0.65rem,env(safe-area-inset-bottom))] backdrop-blur-xl md:bottom-0 md:border-white/8 md:pb-2.5">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 md:px-6">
        <p className="text-xs text-gold">تغییرات ذخیره‌نشده</p>
        <AdminButton type="button" size="sm" onClick={onSave} disabled={saving}>
          {saving ? "..." : label}
        </AdminButton>
      </div>
    </div>
  );
}

export function AdminConfirm({
  open,
  title,
  description,
  confirmLabel = "تأیید",
  cancelLabel = "انصراف",
  tone = "danger",
  requireText,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "primary";
  requireText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const [typed, setTyped] = useState("");
  const inputId = useId();
  if (!open) return null;
  const ok = !requireText || typed === requireText;
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/60"
        aria-label="بستن"
        onClick={onCancel}
      />
      <div
        role="dialog"
        aria-modal
        aria-labelledby={`${inputId}-title`}
        className="relative z-[1] w-full max-w-md rounded-xl border border-white/12 bg-elevated p-4 shadow-2xl"
      >
        <h2
          id={`${inputId}-title`}
          className="font-display text-lg text-foreground"
        >
          {title}
        </h2>
        {description ? (
          <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
        ) : null}
        {requireText ? (
          <div className="mt-3">
            <label
              htmlFor={inputId}
              className="mb-1 block text-[11px] text-dim"
            >
              برای تأیید بنویس: <span dir="ltr">{requireText}</span>
            </label>
            <input
              id={inputId}
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              className={adminInputClass}
              dir="ltr"
              autoFocus
            />
          </div>
        ) : null}
        <div className="mt-4 flex justify-end gap-2">
          <AdminButton type="button" variant="ghost" onClick={onCancel}>
            {cancelLabel}
          </AdminButton>
          <AdminButton
            type="button"
            variant={tone === "danger" ? "danger" : "primary"}
            disabled={!ok}
            onClick={() => {
              onConfirm();
              setTyped("");
            }}
          >
            {confirmLabel}
          </AdminButton>
        </div>
      </div>
    </div>
  );
}

export function AdminFileButton({
  label,
  accept,
  disabled,
  onFile,
  variant = "primary",
  size = "md",
}: {
  label: string;
  accept?: string;
  disabled?: boolean;
  onFile: (file: File) => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <>
      <AdminButton
        type="button"
        variant={variant}
        size={size}
        disabled={disabled}
        onClick={() => ref.current?.click()}
      >
        {label}
      </AdminButton>
      <input
        ref={ref}
        type="file"
        accept={accept}
        className="hidden"
        disabled={disabled}
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) onFile(file);
        }}
      />
    </>
  );
}

export function useAdminConfirm() {
  const [state, setState] = useState<{
    title: string;
    description?: string;
    confirmLabel?: string;
    tone?: "danger" | "primary";
    requireText?: string;
    resolve: (ok: boolean) => void;
  } | null>(null);

  const ask = useCallback(
    (opts: {
      title: string;
      description?: string;
      confirmLabel?: string;
      tone?: "danger" | "primary";
      requireText?: string;
    }) =>
      new Promise<boolean>((resolve) => {
        setState({ ...opts, resolve });
      }),
    [],
  );

  const dialog = (
    <AdminConfirm
      open={!!state}
      title={state?.title ?? ""}
      description={state?.description}
      confirmLabel={state?.confirmLabel}
      tone={state?.tone}
      requireText={state?.requireText}
      onCancel={() => {
        state?.resolve(false);
        setState(null);
      }}
      onConfirm={() => {
        state?.resolve(true);
        setState(null);
      }}
    />
  );

  return { ask, dialog };
}

export function AdminCheckbox({
  label,
  ariaLabel,
  checked,
  onChange,
  className,
}: {
  label?: string;
  ariaLabel?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}) {
  return (
    <label
      className={cn(
        "inline-flex cursor-pointer items-center gap-2 text-sm text-muted",
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
          aria-label={ariaLabel || label || "انتخاب"}
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
        "inline-flex rounded-md px-2 py-0.5 text-[11px]",
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
    <div className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-dim">
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

export function AdminDrawer({
  open,
  title,
  onClose,
  children,
  footer,
  size = "md",
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  size?: "md" | "xl";
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70] flex justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        aria-label="بستن"
        onClick={onClose}
      />
      <aside
        className={cn(
          "relative z-[1] flex h-full w-full flex-col border-s border-white/10 bg-void shadow-2xl",
          size === "xl" ? "max-w-4xl" : "max-w-md",
        )}
      >
        <div className="flex items-center justify-between gap-3 border-b border-white/8 px-4 py-3">
          <h2 className="font-display text-lg text-foreground">{title}</h2>
          <AdminButton type="button" variant="ghost" size="sm" onClick={onClose}>
            بستن
          </AdminButton>
        </div>
        <div className="flex-1 overflow-y-auto p-4">{children}</div>
        {footer ? (
          <div className="border-t border-white/8 p-3">{footer}</div>
        ) : null}
      </aside>
    </div>
  );
}
