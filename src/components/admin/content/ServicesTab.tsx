"use client";

import type { ServiceItem, SiteConfig } from "@/types";
import {
  AdminButton,
  AdminCard,
  AdminField,
  adminInputClass,
  adminSelectClass,
  adminTextareaClass,
  useAdminConfirm,
} from "@/components/admin/ui";
import { SERVICE_ICONS } from "./types";

type ServicesTabProps = {
  site: SiteConfig;
  onChange: (site: SiteConfig) => void;
};

const SPAN_OPTIONS = [
  { value: "default", label: "پیش‌فرض" },
  { value: "wide", label: "عریض" },
  { value: "tall", label: "بلند" },
] as const;

export function ServicesTab({ site, onChange }: ServicesTabProps) {
  const { ask, dialog } = useAdminConfirm();

  function updateService(index: number, patch: Partial<ServiceItem>) {
    const services = [...site.services];
    services[index] = { ...services[index]!, ...patch };
    onChange({ ...site, services });
  }

  function moveService(index: number, dir: -1 | 1) {
    const next = [...site.services];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    const tmp = next[index]!;
    next[index] = next[target]!;
    next[target] = tmp;
    onChange({ ...site, services: next });
  }

  return (
    <>
      {dialog}
      <div className="space-y-3">
        {site.services.map((service, i) => (
          <AdminCard key={service.id} className="grid gap-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <AdminField label="عنوان">
                <input
                  className={adminInputClass}
                  value={service.title}
                  onChange={(e) => updateService(i, { title: e.target.value })}
                />
              </AdminField>
              <AdminField label="ایندکس" hint="مثل ۰۱">
                <input
                  className={adminInputClass}
                  dir="ltr"
                  value={service.index ?? ""}
                  onChange={(e) =>
                    updateService(i, {
                      index: e.target.value || undefined,
                    })
                  }
                />
              </AdminField>
            </div>
            <AdminField label="توضیح">
              <textarea
                className={adminTextareaClass}
                rows={2}
                value={service.description}
                onChange={(e) =>
                  updateService(i, { description: e.target.value })
                }
              />
            </AdminField>
            <div className="grid gap-3 sm:grid-cols-2">
              <AdminField label="آیکون">
                <select
                  className={adminSelectClass}
                  value={service.icon}
                  onChange={(e) => updateService(i, { icon: e.target.value })}
                >
                  {SERVICE_ICONS.map((icon) => (
                    <option key={icon.value} value={icon.value}>
                      {icon.label} ({icon.value})
                    </option>
                  ))}
                  {!SERVICE_ICONS.some((x) => x.value === service.icon) ? (
                    <option value={service.icon}>{service.icon}</option>
                  ) : null}
                </select>
              </AdminField>
              <AdminField label="اسپن کارت">
                <select
                  className={adminSelectClass}
                  value={service.span ?? "default"}
                  onChange={(e) =>
                    updateService(i, {
                      span: e.target.value as ServiceItem["span"],
                    })
                  }
                >
                  {SPAN_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </AdminField>
            </div>
            <AdminField label="تگ‌ها" hint="با ویرگول جدا کن">
              <input
                className={adminInputClass}
                value={(service.tags ?? []).join(", ")}
                onChange={(e) =>
                  updateService(i, {
                    tags: e.target.value
                      .split(",")
                      .map((t) => t.trim())
                      .filter(Boolean),
                  })
                }
              />
            </AdminField>
            <div className="grid gap-3 sm:grid-cols-2">
              <AdminField label="پروف" hint="یک جمله اثبات کوتاه">
                <input
                  className={adminInputClass}
                  value={service.proof ?? ""}
                  onChange={(e) =>
                    updateService(i, {
                      proof: e.target.value || undefined,
                    })
                  }
                />
              </AdminField>
              <AdminField label="ویژوال" hint="مسیر یا کلید ویژوال">
                <input
                  className={adminInputClass}
                  dir="ltr"
                  value={service.visual ?? ""}
                  onChange={(e) =>
                    updateService(i, {
                      visual: e.target.value || undefined,
                    })
                  }
                />
              </AdminField>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <AdminField label="گرادیان ۱">
                <input
                  className={adminInputClass}
                  dir="ltr"
                  value={service.gradient?.[0] ?? "#0e0e14"}
                  onChange={(e) => {
                    const g1 = service.gradient?.[1] ?? "#1e1e24";
                    updateService(i, { gradient: [e.target.value, g1] });
                  }}
                />
              </AdminField>
              <AdminField label="گرادیان ۲">
                <input
                  className={adminInputClass}
                  dir="ltr"
                  value={service.gradient?.[1] ?? "#1e1e24"}
                  onChange={(e) => {
                    const g0 = service.gradient?.[0] ?? "#0e0e14";
                    updateService(i, { gradient: [g0, e.target.value] });
                  }}
                />
              </AdminField>
            </div>
            <div className="flex flex-wrap gap-2 border-t border-white/8 pt-3">
              <AdminButton
                type="button"
                variant="ghost"
                onClick={() => moveService(i, -1)}
              >
                بالا
              </AdminButton>
              <AdminButton
                type="button"
                variant="ghost"
                onClick={() => moveService(i, 1)}
              >
                پایین
              </AdminButton>
              <AdminButton
                type="button"
                variant="danger"
                onClick={async () => {
                  const ok = await ask({
                    title: "حذف خدمت",
                    description: `خدمت «${service.title || "بدون عنوان"}» حذف شود؟`,
                    confirmLabel: "حذف",
                    tone: "danger",
                  });
                  if (!ok) return;
                  onChange({
                    ...site,
                    services: site.services.filter((_, idx) => idx !== i),
                  });
                }}
              >
                حذف خدمت
              </AdminButton>
            </div>
          </AdminCard>
        ))}
        <AdminButton
          type="button"
          variant="outline"
          onClick={() => {
            const item: ServiceItem = {
              id: `svc_${Date.now()}`,
              title: "خدمت جدید",
              description: "توضیح را اینجا بنویس.",
              icon: "design",
              span: "default",
            };
            onChange({ ...site, services: [...site.services, item] });
          }}
        >
          + افزودن خدمت
        </AdminButton>
      </div>
    </>
  );
}
