"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type MediaItem = {
  name: string;
  url: string;
};

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
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [library, setLibrary] = useState<MediaItem[] | null>(null);
  const [libraryError, setLibraryError] = useState("");

  useEffect(() => {
    if (!libraryOpen || library) return;
    let alive = true;
    fetch("/api/admin/media")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("fail"))))
      .then((json: { items?: MediaItem[] }) => {
        if (!alive) return;
        setLibrary(json.items ?? []);
        setLibraryError("");
      })
      .catch(() => {
        if (!alive) return;
        setLibrary([]);
        setLibraryError("رسانه بارگذاری نشد.");
      });
    return () => {
      alive = false;
    };
  }, [libraryOpen, library]);

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
            className="aspect-video w-full object-cover object-top"
          />
          <p
            className="truncate border-t border-white/8 px-3 py-1.5 font-mono text-[10px] text-dim"
            dir="ltr"
          >
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
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            className="rounded-full bg-accent px-3.5 py-1.5 text-xs font-medium text-void disabled:opacity-50"
            disabled={disabled || busy}
            onClick={() => inputRef.current?.click()}
          >
            {busy ? "صبر کن..." : "انتخاب فایل"}
          </button>
          <button
            type="button"
            className="rounded-full border border-white/15 px-3.5 py-1.5 text-xs text-muted hover:text-foreground disabled:opacity-50"
            disabled={disabled || busy}
            onClick={() => setLibraryOpen((v) => !v)}
          >
            از رسانه
          </button>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          className="hidden"
          disabled={disabled || busy}
          onChange={(e) => void handleFile(e.target.files?.[0])}
        />
      </div>

      {libraryOpen ? (
        <div className="rounded-xl border border-white/10 bg-black/20 p-2">
          {libraryError ? (
            <p className="px-2 py-3 text-center text-xs text-signal">
              {libraryError}
            </p>
          ) : library === null ? (
            <p className="px-2 py-3 text-center text-xs text-dim">
              در حال بارگذاری رسانه...
            </p>
          ) : library.length === 0 ? (
            <p className="px-2 py-3 text-center text-xs text-dim">
              هنوز فایلی در رسانه نیست. اول آپلود کن.
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-1.5">
              {library.map((item) => (
                <button
                  key={item.url}
                  type="button"
                  className={cn(
                    "overflow-hidden rounded-lg border border-white/10 bg-black/30",
                    value === item.url && "ring-2 ring-accent",
                  )}
                  onClick={() => {
                    onChange(item.url);
                    setLibraryOpen(false);
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.url}
                    alt=""
                    className="aspect-square w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
