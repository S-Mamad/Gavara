"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";
import {
  AdminButton,
  AdminCard,
  AdminLinkButton,
  AdminPageHeader,
} from "@/components/admin/ui";
import { adminFetch, errorMessage } from "@/lib/admin/fetchJson";

export default function AdminSettingsPage() {
  const { pushToast } = useToast();
  const router = useRouter();
  const [busy, setBusy] = useState(false);

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

  async function resetContent() {
    if (
      !confirm(
        "محتوای سایت (به‌جز پیام‌ها) به نسخه اولیه برگردد؟ این عمل برگشت‌پذیر نیست.",
      )
    ) {
      return;
    }
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
      <AdminPageHeader
        title="تنظیمات"
        description="امنیت، بکاپ و بازیابی محتوای CMS."
      />

      <div className="grid max-w-2xl gap-4">
        <AdminCard className="space-y-3 text-sm leading-7 text-muted">
          <p className="font-display text-lg text-foreground">امنیت ورود</p>
          <p>
            رمز از{" "}
            <code className="text-accent" dir="ltr">
              .env.local
            </code>{" "}
            خوانده می‌شود:
          </p>
          <ul className="list-disc pe-5">
            <li dir="ltr">ADMIN_PASSWORD</li>
            <li dir="ltr">ADMIN_SESSION_SECRET</li>
          </ul>
          <p>بعد از تغییر env، سرور را ری‌استارت کن.</p>
        </AdminCard>

        <AdminCard className="space-y-3">
          <p className="font-display text-lg text-foreground">بکاپ و بازیابی</p>
          <p className="text-sm text-muted">
            خروجی کامل JSON از محتوا و پیام‌ها، یا برگشت محتوا به seed اولیه.
          </p>
          <div className="flex flex-wrap gap-2">
            <AdminButton
              type="button"
              onClick={downloadBackup}
              disabled={busy}
            >
              دانلود بکاپ
            </AdminButton>
            <AdminButton
              type="button"
              variant="danger"
              onClick={resetContent}
              disabled={busy}
            >
              ریست محتوا
            </AdminButton>
          </div>
        </AdminCard>

        <AdminCard className="space-y-2 text-sm text-muted">
          <p className="font-display text-lg text-foreground">مسیرها</p>
          <p dir="ltr">data/cms/*.json</p>
          <p dir="ltr">public/uploads/</p>
          <AdminLinkButton href="/" variant="ghost" className="px-0">
            مشاهده سایت
          </AdminLinkButton>
        </AdminCard>
      </div>
    </div>
  );
}
