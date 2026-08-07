"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";
import {
  AdminButton,
  AdminCard,
  AdminCheckbox,
  AdminFileButton,
  AdminLinkButton,
  AdminPageHeader,
  useAdminConfirm,
} from "@/components/admin/ui";
import { adminFetch, errorMessage } from "@/lib/admin/fetchJson";

export default function AdminSettingsPage() {
  const { pushToast } = useToast();
  const { ask, dialog } = useAdminConfirm();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [includeLeads, setIncludeLeads] = useState(true);

  async function downloadBackup() {
    setBusy(true);
    try {
      const res = await adminFetch("/api/admin/backup");
      const json = await res.json();
      const blob = new Blob([JSON.stringify(json, null, 2)], {
        type: "application/json;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `raxinshop-cms-backup-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      pushToast("بکاپ دانلود شد.", "success");
    } catch (err) {
      pushToast(errorMessage(err, "بکاپ ناموفق بود."), "error");
    } finally {
      setBusy(false);
    }
  }

  async function restoreFromFile(file: File | undefined) {
    if (!file) return;
    const ok = await ask({
      title: "بازیابی بکاپ",
      description:
        "محتوای فعلی با فایل انتخاب‌شده جایگزین می‌شود. این عمل برگشت‌پذیر نیست.",
      confirmLabel: "بازیابی",
      tone: "danger",
      requireText: "RESTORE",
    });
    if (!ok) return;
    setBusy(true);
    try {
      const data = JSON.parse(await file.text()) as unknown;
      await adminFetch("/api/admin/backup", {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify({ action: "restore", includeLeads, data }),
      });
      pushToast("بکاپ بازیابی شد.", "success");
      router.refresh();
      router.push("/admin/content");
    } catch (err) {
      pushToast(errorMessage(err, "بازیابی ناموفق بود."), "error");
    } finally {
      setBusy(false);
    }
  }

  async function resetContent() {
    const ok = await ask({
      title: "ریست محتوا",
      description: "محتوا (بدون پیام‌ها) به نسخه اولیه برگردد؟",
      confirmLabel: "ریست",
      tone: "danger",
      requireText: "RESET",
    });
    if (!ok) return;
    setBusy(true);
    try {
      await adminFetch("/api/admin/backup", {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify({
          action: "reset",
          docs: ["site", "projects", "copy", "layout"],
        }),
      });
      pushToast("محتوا ریست شد.", "success");
      router.refresh();
      router.push("/admin/content");
    } catch (err) {
      pushToast(errorMessage(err, "ریست ناموفق بود."), "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      {dialog}
      <AdminPageHeader
        title="تنظیمات"
        description="امنیت، بکاپ و عملیات خطرناک."
      />

      <div className="grid max-w-xl gap-3">
        <AdminCard className="space-y-2 text-sm leading-6 text-muted">
          <p className="text-sm font-medium text-foreground">امنیت ورود</p>
          <p>
            رمز از{" "}
            <code className="text-accent" dir="ltr">
              .env
            </code>{" "}
            خوانده می‌شود. در پروداکشن هر دو الزامی‌اند:
          </p>
          <ul className="list-disc pe-5 text-xs">
            <li dir="ltr">ADMIN_PASSWORD</li>
            <li dir="ltr">ADMIN_SESSION_SECRET</li>
          </ul>
        </AdminCard>

        <AdminCard className="space-y-3">
          <p className="text-sm font-medium text-foreground">بکاپ</p>
          <p className="text-xs text-muted">
            دانلود JSON کامل یا بازیابی از همان فایل.
          </p>
          <AdminCheckbox
            label="در بازیابی، پیام‌ها هم جایگزین شوند"
            checked={includeLeads}
            onChange={setIncludeLeads}
          />
          <div className="flex flex-wrap gap-2">
            <AdminButton type="button" onClick={downloadBackup} disabled={busy}>
              دانلود بکاپ
            </AdminButton>
            <AdminFileButton
              label="بازیابی از فایل"
              accept="application/json,.json"
              variant="outline"
              disabled={busy}
              onFile={(file) => restoreFromFile(file)}
            />
          </div>
        </AdminCard>

        <AdminCard className="space-y-3 border-signal/25">
          <p className="text-sm font-medium text-signal">منطقه خطر</p>
          <p className="text-xs text-muted">
            ریست محتوا به seed اولیه. پیام‌ها پاک نمی‌شوند.
          </p>
          <AdminButton
            type="button"
            variant="danger"
            onClick={resetContent}
            disabled={busy}
          >
            ریست محتوا
          </AdminButton>
        </AdminCard>

        <AdminCard className="space-y-1 text-xs text-muted">
          <p className="text-sm font-medium text-foreground">مسیرها</p>
          <p dir="ltr">data/cms/*.json</p>
          <p dir="ltr">public/uploads/</p>
          <AdminLinkButton href="/" variant="ghost" size="sm" className="mt-2 px-0">
            مشاهده سایت
          </AdminLinkButton>
        </AdminCard>
      </div>
    </div>
  );
}
