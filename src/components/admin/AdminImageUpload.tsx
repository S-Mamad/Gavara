"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

type AdminImageUploadProps = {
  value?: string;
  label?: string;
  hint?: string;
  disabled?: boolean;
  onUpload: (file: File) => Promise<string | null>;
  onChange: (url: string | undefined) => void;
  onUploaded?: (url: string) => void;
};

export function AdminImageUpload({
  value,
  label = "آپلود تصویر",
  hint = "png، jpg، webp یا gif · حداکثر ۸ مگابایت",
  disabled,
  onUpload,
  onChange,
  onUploaded,
}: AdminImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  async function handleFile(file: File | undefined | null) {
    if (!file || disabled || busy) return;
    setBusy(true);
    try {
      const url = await onUpload(file);
      if (!url) return;
      onChange(url);
      onUploaded?.(url);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-muted">{label}</p>
        {value ? (
          <button
            type="button"
            className="text-[11px] text-dim transition-colors hover:text-accent"
            onClick={() => onChange(undefined)}
            disabled={disabled || busy}
          >
            حذف تصویر
          </button>
        ) : null}
      </div>

      {value ? (
        <div className="relative overflow-hidden rounded-xl border border-white/10 bg-black/30">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt=""
            className="aspect-video w-full object-cover"
          />
          <p className="truncate border-t border-white/8 px-3 py-1.5 font-mono text-[10px] text-dim" dir="ltr">
            {value}
          </p>
        </div>
      ) : null}

      <div
        className={cn(
          "rounded-xl border border-dashed border-white/15 bg-white/[0.02] px-4 py-5 text-center transition-colors",
          dragOver && "border-accent/50 bg-accent/5",
          (disabled || busy) && "opacity-60",
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          void handleFile(e.dataTransfer.files?.[0]);
        }}
      >
        <p className="text-sm text-foreground">
          {busy ? "در حال آپلود..." : "فایل را اینجا رها کن یا انتخاب کن"}
        </p>
        <p className="mt-1 text-[11px] text-dim">{hint}</p>
        <button
          type="button"
          className="mt-3 rounded-full bg-accent px-3.5 py-1.5 text-xs font-medium text-void disabled:opacity-50"
          disabled={disabled || busy}
          onClick={() => inputRef.current?.click()}
        >
          {busy ? "صبر کن..." : "انتخاب فایل"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          className="hidden"
          disabled={disabled || busy}
          onChange={(e) => void handleFile(e.target.files?.[0])}
        />
      </div>
    </div>
  );
}
