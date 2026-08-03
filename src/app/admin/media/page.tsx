"use client";

import { useCallback, useEffect, useState } from "react";
import { useToast } from "@/components/ui/Toast";
import {
  AdminButton,
  AdminCard,
  AdminEmpty,
  AdminErrorState,
  AdminFileButton,
  AdminPageHeader,
  useAdminConfirm,
} from "@/components/admin/ui";
import {
  AdminFetchError,
  adminFetch,
  adminFetchJson,
  errorMessage,
} from "@/lib/admin/fetchJson";

type MediaItem = {
  name: string;
  url: string;
  size: number;
  mtime: string;
};

type MediaPayload = { items: MediaItem[] };

function formatFaDate(iso: string) {
  try {
    return new Intl.DateTimeFormat("fa-IR", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export default function AdminMediaPage() {
  const { pushToast } = useToast();
  const { ask, dialog } = useAdminConfirm();
  const [items, setItems] = useState<MediaItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
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

  async function onUpload(file: File) {
    if (file.size > 5 * 1024 * 1024) {
      pushToast("حجم فایل بیش از ۵ مگابایت است.", "error");
      return;
    }
    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await adminFetch("/api/admin/upload", {
        method: "POST",
        body,
      });
      const json = (await res.json()) as { url?: string };
      let copied = false;
      if (json.url) {
        try {
          await navigator.clipboard.writeText(json.url);
          copied = true;
        } catch {
          /* ignore */
        }
      }
      pushToast(
        copied ? "آپلود شد و آدرس کپی شد." : "آپلود شد.",
        "success",
      );
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

  async function removeItem(item: MediaItem, force = false) {
    if (!force) {
      const ok = await ask({
        title: "حذف فایل",
        description: `«${item.name}» حذف شود؟`,
        confirmLabel: "حذف",
        tone: "danger",
      });
      if (!ok) return;
    }
    setDeleting(item.name);
    try {
      await adminFetch("/api/admin/media", {
        method: "DELETE",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify({ name: item.name, force }),
      });
      pushToast("حذف شد.", "success");
      await load();
    } catch (err) {
      if (err instanceof AdminFetchError && err.code === "in_use" && !force) {
        const forceOk = await ask({
          title: "فایل در محتوا استفاده شده",
          description: `${err.message} با این حال حذف شود؟`,
          confirmLabel: "حذف اجباری",
          tone: "danger",
        });
        if (forceOk) await removeItem(item, true);
        return;
      }
      pushToast(errorMessage(err, "حذف ناموفق بود."), "error");
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div>
      {dialog}
      <AdminPageHeader
        title="رسانه"
        description="تصاویر آپلودشده برای تیم و نمونه‌کارها."
        actions={
          <AdminFileButton
            label={uploading ? "در حال آپلود..." : "آپلود تصویر"}
            accept="image/png,image/jpeg,image/webp,image/gif"
            disabled={uploading}
            onFile={onUpload}
          />
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
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
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
                <p className="text-[10px] text-dim">
                  {(item.size / 1024).toFixed(1)} KB · {formatFaDate(item.mtime)}
                </p>
                <div className="flex gap-1.5">
                  <AdminButton
                    type="button"
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => copyUrl(item.url)}
                  >
                    کپی
                  </AdminButton>
                  <AdminButton
                    type="button"
                    variant="danger"
                    size="sm"
                    className="flex-1"
                    disabled={deleting === item.name}
                    onClick={() => removeItem(item)}
                  >
                    {deleting === item.name ? "..." : "حذف"}
                  </AdminButton>
                </div>
              </div>
            </AdminCard>
          ))}
        </div>
      ) : null}
    </div>
  );
}
