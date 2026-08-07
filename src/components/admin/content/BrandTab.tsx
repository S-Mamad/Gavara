"use client";

import type { HeroStat, LinkItem, NavItem, SiteConfig } from "@/types";
import {
  AdminButton,
  AdminCard,
  AdminField,
  adminInputClass,
  adminTextareaClass,
  useAdminConfirm,
} from "@/components/admin/ui";

type BrandTabProps = {
  site: SiteConfig;
  onChange: (site: SiteConfig) => void;
};

export function BrandTab({ site, onChange }: BrandTabProps) {
  const { ask, dialog } = useAdminConfirm();
  const footerNav = site.footerNav ?? [];
  const heroStats = site.heroStats ?? [];

  function moveLink(index: number, dir: -1 | 1) {
    const next = [...site.links];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    const tmp = next[index]!;
    next[index] = next[target]!;
    next[target] = tmp;
    onChange({ ...site, links: next });
  }

  return (
    <>
      {dialog}
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
          <AdminField label="نسخه" hint="اختیاری؛ نمایش فنی">
            <input
              className={adminInputClass}
              dir="ltr"
              value={site.brand.version}
              onChange={(e) =>
                onChange({
                  ...site,
                  brand: { ...site.brand, version: e.target.value },
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
          <div className="grid gap-3 sm:grid-cols-2">
            <AdminField label="عنوان هیرو برند" hint="اختیاری؛ اگر کپی هیرو خالی باشد">
              <input
                className={adminInputClass}
                value={site.brand.heroTitle}
                onChange={(e) =>
                  onChange({
                    ...site,
                    brand: { ...site.brand, heroTitle: e.target.value },
                  })
                }
              />
            </AdminField>
            <AdminField label="هایلایت هیرو برند">
              <input
                className={adminInputClass}
                value={site.brand.heroHighlight}
                onChange={(e) =>
                  onChange({
                    ...site,
                    brand: { ...site.brand, heroHighlight: e.target.value },
                  })
                }
              />
            </AdminField>
          </div>
          <AdminField label="استک" hint="با ویرگول جدا کن">
            <input
              className={adminInputClass}
              dir="ltr"
              value={(site.stack ?? []).join(", ")}
              onChange={(e) =>
                onChange({
                  ...site,
                  stack: e.target.value
                    .split(",")
                    .map((t) => t.trim())
                    .filter(Boolean),
                })
              }
            />
          </AdminField>
          <div className="grid gap-3 sm:grid-cols-2">
            <AdminField label="CTA اصلی برند" hint="اختیاری؛ اگر خالی باشد از متن هیرو استفاده می‌شود">
              <input
                className={adminInputClass}
                value={site.heroCta?.primary ?? ""}
                onChange={(e) => {
                  const primary = e.target.value.trim();
                  const secondary = (site.heroCta?.secondary ?? "").trim();
                  if (!primary && !secondary) {
                    onChange({ ...site, heroCta: undefined });
                    return;
                  }
                  onChange({
                    ...site,
                    heroCta: {
                      primary: primary || "شروع پروژه",
                      secondary: secondary || "نمونه‌کارها",
                    },
                  });
                }}
              />
            </AdminField>
            <AdminField label="CTA ثانویه برند">
              <input
                className={adminInputClass}
                value={site.heroCta?.secondary ?? ""}
                onChange={(e) => {
                  const secondary = e.target.value.trim();
                  const primary = (site.heroCta?.primary ?? "").trim();
                  if (!primary && !secondary) {
                    onChange({ ...site, heroCta: undefined });
                    return;
                  }
                  onChange({
                    ...site,
                    heroCta: {
                      primary: primary || "شروع پروژه",
                      secondary: secondary || "نمونه‌کارها",
                    },
                  });
                }}
              />
            </AdminField>
          </div>
        </AdminCard>

        <AdminCard className="grid gap-3">
          <p className="text-sm text-accent">لینک‌ها</p>
          {site.links.map((link, i) => (
            <div
              key={link.id}
              className="grid gap-3 border-t border-white/8 pt-3 first:border-0 first:pt-0 sm:grid-cols-2"
            >
              <AdminField label="برچسب">
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
              <AdminField label="شناسه" hint="مثل telegram، github">
                <input
                  className={adminInputClass}
                  dir="ltr"
                  value={link.id}
                  onChange={(e) => {
                    const links = [...site.links];
                    links[i] = { ...link, id: e.target.value.trim() || link.id };
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
              <div className="flex flex-wrap items-end gap-1">
                <AdminButton
                  type="button"
                  variant="ghost"
                  onClick={() => moveLink(i, -1)}
                >
                  بالا
                </AdminButton>
                <AdminButton
                  type="button"
                  variant="ghost"
                  onClick={() => moveLink(i, 1)}
                >
                  پایین
                </AdminButton>
                <AdminButton
                  type="button"
                  variant="danger"
                  onClick={async () => {
                    const ok = await ask({
                      title: "حذف لینک",
                      description: `لینک «${link.label || link.id}» حذف شود؟`,
                      confirmLabel: "حذف",
                      tone: "danger",
                    });
                    if (!ok) return;
                    onChange({
                      ...site,
                      links: site.links.filter((_, idx) => idx !== i),
                    });
                  }}
                >
                  حذف
                </AdminButton>
              </div>
            </div>
          ))}
          <AdminButton
            type="button"
            variant="outline"
            onClick={() => {
              const item: LinkItem = {
                id: `link_${Date.now()}`,
                label: "لینک جدید",
                href: "#",
              };
              onChange({ ...site, links: [...site.links, item] });
            }}
          >
            + افزودن لینک
          </AdminButton>
        </AdminCard>

        <AdminCard className="grid gap-3">
          <p className="text-sm text-accent">منوی فوتر</p>
          {footerNav.map((item, i) => (
            <div
              key={`${item.id}-${i}`}
              className="grid gap-3 border-t border-white/8 pt-3 first:border-0 first:pt-0 sm:grid-cols-2"
            >
              <AdminField label="برچسب">
                <input
                  className={adminInputClass}
                  value={item.label}
                  onChange={(e) => {
                    const next = [...footerNav];
                    next[i] = { ...item, label: e.target.value };
                    onChange({ ...site, footerNav: next });
                  }}
                />
              </AdminField>
              <AdminField label="شناسه">
                <input
                  className={adminInputClass}
                  dir="ltr"
                  value={item.id}
                  onChange={(e) => {
                    const next = [...footerNav];
                    next[i] = {
                      ...item,
                      id: e.target.value.trim() || item.id,
                    };
                    onChange({ ...site, footerNav: next });
                  }}
                />
              </AdminField>
              <AdminField label="آدرس">
                <input
                  className={adminInputClass}
                  dir="ltr"
                  value={item.href}
                  onChange={(e) => {
                    const next = [...footerNav];
                    next[i] = { ...item, href: e.target.value };
                    onChange({ ...site, footerNav: next });
                  }}
                />
              </AdminField>
              <div className="flex items-end">
                <AdminButton
                  type="button"
                  variant="danger"
                  onClick={async () => {
                    const ok = await ask({
                      title: "حذف آیتم فوتر",
                      description: `آیتم «${item.label || item.id}» حذف شود؟`,
                      confirmLabel: "حذف",
                      tone: "danger",
                    });
                    if (!ok) return;
                    onChange({
                      ...site,
                      footerNav: footerNav.filter((_, idx) => idx !== i),
                    });
                  }}
                >
                  حذف
                </AdminButton>
              </div>
            </div>
          ))}
          <AdminButton
            type="button"
            variant="outline"
            onClick={() => {
              const item: NavItem = {
                id: `footer_${Date.now()}`,
                label: "آیتم فوتر",
                href: "/#",
              };
              onChange({ ...site, footerNav: [...footerNav, item] });
            }}
          >
            + افزودن آیتم فوتر
          </AdminButton>
        </AdminCard>

        <AdminCard className="grid gap-3">
          <p className="text-sm text-accent">آمار هیرو</p>
          {heroStats.map((stat, i) => (
            <div
              key={`stat-${i}`}
              className="grid gap-3 border-t border-white/8 pt-3 first:border-0 first:pt-0 sm:grid-cols-2"
            >
              <AdminField label="مقدار">
                <input
                  className={adminInputClass}
                  value={stat.value}
                  onChange={(e) => {
                    const next = [...heroStats];
                    next[i] = { ...stat, value: e.target.value };
                    onChange({ ...site, heroStats: next });
                  }}
                />
              </AdminField>
              <AdminField label="برچسب">
                <input
                  className={adminInputClass}
                  value={stat.label}
                  onChange={(e) => {
                    const next = [...heroStats];
                    next[i] = { ...stat, label: e.target.value };
                    onChange({ ...site, heroStats: next });
                  }}
                />
              </AdminField>
              <div className="sm:col-span-2">
                <AdminButton
                  type="button"
                  variant="danger"
                  onClick={async () => {
                    const ok = await ask({
                      title: "حذف آمار",
                      description: `آمار «${stat.label || stat.value}» حذف شود؟`,
                      confirmLabel: "حذف",
                      tone: "danger",
                    });
                    if (!ok) return;
                    onChange({
                      ...site,
                      heroStats: heroStats.filter((_, idx) => idx !== i),
                    });
                  }}
                >
                  حذف آمار
                </AdminButton>
              </div>
            </div>
          ))}
          <AdminButton
            type="button"
            variant="outline"
            onClick={() => {
              const item: HeroStat = { value: "۱۰+", label: "آمار جدید" };
              onChange({ ...site, heroStats: [...heroStats, item] });
            }}
          >
            + افزودن آمار
          </AdminButton>
        </AdminCard>
      </div>
    </>
  );
}
