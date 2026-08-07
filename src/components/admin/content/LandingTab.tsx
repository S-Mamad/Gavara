"use client";

import type { ClientItem, SiteConfig, WhyPoint } from "@/types";
import { useToast } from "@/components/ui/Toast";
import {
  AdminButton,
  AdminCard,
  AdminField,
  adminInputClass,
  adminTextareaClass,
  useAdminConfirm,
} from "@/components/admin/ui";
import { AdminImageUpload } from "@/components/admin/AdminImageUpload";

type LandingTabProps = {
  site: SiteConfig;
  onChange: (site: SiteConfig) => void;
  onUpload: (file: File) => Promise<string | null>;
};

export function LandingTab({ site, onChange, onUpload }: LandingTabProps) {
  const { pushToast } = useToast();
  const { ask, dialog } = useAdminConfirm();
  const clients = site.clients ?? [];
  const whyPoints = site.whyPoints ?? [];

  return (
    <>
      {dialog}
      <div className="grid max-w-2xl gap-4">
        <AdminCard className="grid gap-3">
          <p className="text-sm text-accent">مشتریان</p>
          {clients.map((client, i) => (
            <div
              key={`client-${i}`}
              className="grid gap-3 border-t border-white/8 pt-3 first:border-0 first:pt-0"
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <AdminField label="نام">
                  <input
                    className={adminInputClass}
                    value={client.name}
                    onChange={(e) => {
                      const next = [...clients];
                      next[i] = { ...client, name: e.target.value };
                      onChange({ ...site, clients: next });
                    }}
                  />
                </AdminField>
                <AdminField label="لینک">
                  <input
                    className={adminInputClass}
                    dir="ltr"
                    value={client.href ?? ""}
                    onChange={(e) => {
                      const next = [...clients];
                      next[i] = {
                        ...client,
                        href: e.target.value || undefined,
                      };
                      onChange({ ...site, clients: next });
                    }}
                  />
                </AdminField>
              </div>
              <AdminImageUpload
                value={client.logo}
                label="لوگوی مشتری"
                onUpload={onUpload}
                onChange={(url) => {
                  const next = [...clients];
                  next[i] = { ...client, logo: url };
                  onChange({ ...site, clients: next });
                }}
                onUploaded={() =>
                  pushToast("لوگو آماده است؛ ذخیره را بزن.")
                }
              />
              <AdminField label="آدرس لوگو (دستی)">
                <input
                  className={adminInputClass}
                  dir="ltr"
                  value={client.logo ?? ""}
                  onChange={(e) => {
                    const next = [...clients];
                    next[i] = {
                      ...client,
                      logo: e.target.value || undefined,
                    };
                    onChange({ ...site, clients: next });
                  }}
                />
              </AdminField>
              <AdminButton
                type="button"
                variant="danger"
                onClick={async () => {
                  const ok = await ask({
                    title: "حذف مشتری",
                    description: `مشتری «${client.name || "بدون نام"}» حذف شود؟`,
                    confirmLabel: "حذف",
                    tone: "danger",
                  });
                  if (!ok) return;
                  onChange({
                    ...site,
                    clients: clients.filter((_, idx) => idx !== i),
                  });
                }}
              >
                حذف مشتری
              </AdminButton>
            </div>
          ))}
          <AdminButton
            type="button"
            variant="outline"
            onClick={() => {
              const item: ClientItem = { name: "مشتری جدید" };
              onChange({ ...site, clients: [...clients, item] });
            }}
          >
            + افزودن مشتری
          </AdminButton>
        </AdminCard>

        <AdminCard className="grid gap-3">
          <p className="text-sm text-accent">نقاط چرا ما</p>
          {whyPoints.map((point, i) => (
            <div
              key={`why-${i}`}
              className="grid gap-3 border-t border-white/8 pt-3 first:border-0 first:pt-0"
            >
              <AdminField label="درد / مشکل">
                <input
                  className={adminInputClass}
                  value={point.pain}
                  onChange={(e) => {
                    const next = [...whyPoints];
                    next[i] = { ...point, pain: e.target.value };
                    onChange({ ...site, whyPoints: next });
                  }}
                />
              </AdminField>
              <AdminField label="پاسخ">
                <textarea
                  className={adminTextareaClass}
                  rows={2}
                  value={point.answer}
                  onChange={(e) => {
                    const next = [...whyPoints];
                    next[i] = { ...point, answer: e.target.value };
                    onChange({ ...site, whyPoints: next });
                  }}
                />
              </AdminField>
              <AdminButton
                type="button"
                variant="danger"
                onClick={async () => {
                  const ok = await ask({
                    title: "حذف نقطه",
                    description: `نقطه «${point.pain || "بدون عنوان"}» حذف شود؟`,
                    confirmLabel: "حذف",
                    tone: "danger",
                  });
                  if (!ok) return;
                  onChange({
                    ...site,
                    whyPoints: whyPoints.filter((_, idx) => idx !== i),
                  });
                }}
              >
                حذف نقطه
              </AdminButton>
            </div>
          ))}
          <AdminButton
            type="button"
            variant="outline"
            onClick={() => {
              const item: WhyPoint = {
                pain: "مشکل جدید",
                answer: "پاسخ را اینجا بنویس.",
              };
              onChange({ ...site, whyPoints: [...whyPoints, item] });
            }}
          >
            + افزودن نقطه
          </AdminButton>
        </AdminCard>
      </div>
    </>
  );
}
