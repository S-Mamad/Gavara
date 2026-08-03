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

export function ServicesTab({ site, onChange }: ServicesTabProps) {
  const { ask, dialog } = useAdminConfirm();

  return (
    <>
      {dialog}
      <div className="space-y-3">
        {site.services.map((service, i) => (
          <AdminCard key={service.id} className="grid gap-3">
            <AdminField label="عنوان">
              <input
                className={adminInputClass}
                value={service.title}
                onChange={(e) => {
                  const services = [...site.services];
                  services[i] = { ...service, title: e.target.value };
                  onChange({ ...site, services });
                }}
              />
            </AdminField>
            <AdminField label="توضیح">
              <textarea
                className={adminTextareaClass}
                rows={2}
                value={service.description}
                onChange={(e) => {
                  const services = [...site.services];
                  services[i] = {
                    ...service,
                    description: e.target.value,
                  };
                  onChange({ ...site, services });
                }}
              />
            </AdminField>
            <AdminField label="آیکون">
              <select
                className={adminSelectClass}
                value={service.icon}
                onChange={(e) => {
                  const services = [...site.services];
                  services[i] = { ...service, icon: e.target.value };
                  onChange({ ...site, services });
                }}
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
