"use client";

import type { SiteConfig } from "@/types";
import {
  AdminCard,
  AdminField,
  adminInputClass,
  adminTextareaClass,
} from "@/components/admin/ui";

type BrandTabProps = {
  site: SiteConfig;
  onChange: (site: SiteConfig) => void;
};

export function BrandTab({ site, onChange }: BrandTabProps) {
  return (
    <div className="grid max-w-2xl gap-4">
      <AdminCard className="grid gap-4">
        <AdminField label="نام برند">
          <input
            className={adminInputClass}
            value={site.brand.name}
            onChange={(e) =>
              onChange({
                ...site,
                brand: { ...site.brand, name: e.target.value },
              })
            }
          />
        </AdminField>
        <AdminField label="پسوند">
          <input
            className={adminInputClass}
            value={site.brand.suffix}
            onChange={(e) =>
              onChange({
                ...site,
                brand: { ...site.brand, suffix: e.target.value },
              })
            }
          />
        </AdminField>
        <AdminField label="اسلاگ" hint="برای مسیرها و نمایش فنی">
          <input
            className={adminInputClass}
            dir="ltr"
            value={site.brand.slug}
            onChange={(e) =>
              onChange({
                ...site,
                brand: { ...site.brand, slug: e.target.value },
              })
            }
          />
        </AdminField>
        <AdminField label="تگ‌لاین" hint="زیر نام برند در هیرو و فوتر">
          <input
            className={adminInputClass}
            value={site.brand.tagline}
            onChange={(e) =>
              onChange({
                ...site,
                brand: { ...site.brand, tagline: e.target.value },
              })
            }
          />
        </AdminField>
        <AdminField label="توضیح سایت" hint="برای JSON-LD و معرفی کوتاه برند">
          <textarea
            className={adminTextareaClass}
            rows={3}
            value={site.brand.description}
            onChange={(e) =>
              onChange({
                ...site,
                brand: { ...site.brand, description: e.target.value },
              })
            }
          />
        </AdminField>
      </AdminCard>

      {site.links.map((link, i) => (
        <AdminCard key={link.id} className="grid gap-3 sm:grid-cols-2">
          <AdminField label={`برچسب (${link.id})`}>
            <input
              className={adminInputClass}
              value={link.label}
              onChange={(e) => {
                const links = [...site.links];
                links[i] = { ...link, label: e.target.value };
                onChange({ ...site, links });
              }}
            />
          </AdminField>
          <AdminField label="لینک">
            <input
              className={adminInputClass}
              dir="ltr"
              value={link.href}
              onChange={(e) => {
                const links = [...site.links];
                links[i] = { ...link, href: e.target.value };
                onChange({ ...site, links });
              }}
            />
          </AdminField>
        </AdminCard>
      ))}
    </div>
  );
}
