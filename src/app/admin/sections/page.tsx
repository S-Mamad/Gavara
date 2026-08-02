"use client";

import { useCallback, useEffect, useState } from "react";
import type { LayoutConfig, LayoutSection } from "@/lib/cms/types";
import { useToast } from "@/components/ui/Toast";
import {
  AdminButton,
  AdminCard,
  AdminCheckbox,
  AdminErrorState,
  AdminPageHeader,
} from "@/components/admin/ui";
import { adminFetch, adminFetchJson, errorMessage } from "@/lib/admin/fetchJson";

type LayoutPayload = { data: LayoutConfig };

export default function AdminSectionsPage() {
  const { pushToast } = useToast();
  const [layout, setLayout] = useState<LayoutConfig | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const json = await adminFetchJson<LayoutPayload>(
        "/api/admin/content?doc=layout",
      );
      if (!json.data?.sections) {
        throw new Error("چیدمان ناقص است.");
      }
      setLayout(json.data);
    } catch (err) {
      setLayout(null);
      setError(errorMessage(err, "چیدمان بارگذاری نشد."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function move(index: number, dir: -1 | 1) {
    if (!layout) return;
    const next = [...layout.sections];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    const tmp = next[index]!;
    next[index] = next[target]!;
    next[target] = tmp;
    setLayout({ sections: next });
  }

  function toggle(index: number, enabled: boolean) {
    if (!layout) return;
    const next = layout.sections.map((s, i) =>
      i === index ? { ...s, enabled } : s,
    );
    setLayout({ sections: next });
  }

  async function save() {
    if (!layout) return;
    if (!layout.sections.some((s) => s.enabled)) {
      pushToast("حداقل یک سکشن باید فعال باشد.", "error");
      return;
    }
    setSaving(true);
    try {
      await adminFetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify({ doc: "layout", data: layout }),
      });
      pushToast("چیدمان ذخیره شد.", "success");
    } catch (err) {
      pushToast(errorMessage(err, "خطا در ذخیره."), "error");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-muted">در حال بارگذاری...</p>;
  }

  if (error || !layout) {
    return (
      <AdminErrorState
        message={error || "چیدمان در دسترس نیست."}
        onRetry={load}
      />
    );
  }

  return (
    <div>
      <AdminPageHeader
        title="چیدمان صفحه"
        description="سکشن‌های صفحه اصلی را روشن/خاموش کن یا ترتیب‌شان را عوض کن. لینک منوی سکشن‌های خاموش خودکار مخفی می‌شود."
        actions={
          <AdminButton type="button" onClick={save} disabled={saving}>
            {saving ? "در حال ذخیره..." : "ذخیره چیدمان"}
          </AdminButton>
        }
      />

      <ul className="max-w-xl space-y-2">
        {layout.sections.map((section: LayoutSection, index) => (
          <li key={section.id}>
            <AdminCard className="flex flex-wrap items-center gap-3 py-3">
              <div className="min-w-0 flex-1">
                <AdminCheckbox
                  label={section.label}
                  checked={section.enabled}
                  onChange={(checked) => toggle(index, checked)}
                />
                <p className="mt-1 ps-7 text-[11px] text-dim" dir="ltr">
                  {section.id}
                </p>
              </div>
              <div className="flex gap-1">
                <AdminButton
                  type="button"
                  variant="ghost"
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                >
                  بالا
                </AdminButton>
                <AdminButton
                  type="button"
                  variant="ghost"
                  onClick={() => move(index, 1)}
                  disabled={index === layout.sections.length - 1}
                >
                  پایین
                </AdminButton>
              </div>
            </AdminCard>
          </li>
        ))}
      </ul>
    </div>
  );
}
