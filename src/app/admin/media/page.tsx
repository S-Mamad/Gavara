"use client";

import { useCallback, useEffect, useState } from "react";
import { useToast } from "@/components/ui/Toast";
import {
  AdminButton,
  AdminCard,
  AdminEmpty,
  AdminErrorState,
  AdminPageHeader,
} from "@/components/admin/ui";
import { adminFetch, adminFetchJson, errorMessage } from "@/lib/admin/fetchJson";

type MediaItem = {
  name: string;
  url: string;
  size: number;
  mtime: string;
};

type MediaPayload = { items: MediaItem[] };

export default function AdminMediaPage() {
  const { pushToast } = useToast();
  const [items, setItems] = useState<MediaItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const json = await adminFetchJson<MediaPayload>("/api/admin/media");
      setItems(json.items ?? []);
    } catch (err) {
      setItems([]);
      setError(errorMessage(err, "رسانه بارگذاری نشد."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function onUpload(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await adminFetch("/api/admin/upload", {
        method: "POST",
        body,
      });
      const json = (await res.json()) as { url?: string };
      pushToast("آپلود شد.", "success");
      if (json.url) {
        try {
          await navigator.clipboard.writeText(json.url);
        } catch {
          /* ignore */
        }
      }
      await load();
    } catch (err) {
      pushToast(errorMessage(err, "آپلود ناموفق بود."), "error");
    } finally {
      setUploading(false);
    }
  }

  async function copyUrl(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      pushToast("آدرس کپی شد.", "success");
    } catch {
      pushToast("کپی نشد.", "error");
    }
  }

  return (
    <div>
      <AdminPageHeader
        title="رسانه"
        description="تصاویر آپلودشده برای تیم و نمونه‌کارها. بعد از آپلود، آدرس کپی می‌شود."
        actions={
          <label className="inline-flex cursor-pointer">
            <span
              className={`inline-flex items-center justify-center gap-2 rounded-full border border-accent/35 bg-accent px-4 py-2.5 text-sm font-medium text-void ${
                uploading ? "opacity-55" : ""
              }`}
            >
              {uploading ? "در حال آپلود..." : "آپلود تصویر"}
            </span>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              className="hidden"
              disabled={uploading}
              onChange={(e) => {
                onUpload(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
          </label>
        }
      />

      {error ? <AdminErrorState message={error} onRetry={load} /> : null}

      {!error && loading ? (
        <p className="text-sm text-muted">در حال بارگذاری...</p>
      ) : null}

      {!error && !loading && items.length === 0 ? (
        <AdminEmpty>هنوز فایلی آپلود نشده.</AdminEmpty>
      ) : null}

      {!error && !loading && items.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <AdminCard key={item.name} className="overflow-hidden p-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.url}
                alt={item.name}
                className="aspect-video w-full object-cover"
              />
              <div className="space-y-2 p-3">
                <p className="truncate text-xs text-muted" dir="ltr">
                  {item.url}
                </p>
                <p className="text-[11px] text-dim">
                  {(item.size / 1024).toFixed(1)} KB
                </p>
                <AdminButton
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => copyUrl(item.url)}
                >
                  کپی آدرس
                </AdminButton>
              </div>
            </AdminCard>
          ))}
        </div>
      ) : null}
    </div>
  );
}
