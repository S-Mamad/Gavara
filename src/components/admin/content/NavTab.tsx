"use client";

import type { LayoutConfig } from "@/lib/cms/types";
import type { NavItem, SiteConfig } from "@/types";
import { useToast } from "@/components/ui/Toast";
import {
  AdminButton,
  AdminCard,
  AdminField,
  adminInputClass,
  adminSelectClass,
  useAdminConfirm,
} from "@/components/admin/ui";
import { cn } from "@/lib/utils";
import {
  firstUnusedNavId,
  getNavIdOptions,
  navHrefForId,
  navIdLabel,
} from "./types";

type NavTabProps = {
  site: SiteConfig;
  layout: LayoutConfig | null;
  onChange: (site: SiteConfig) => void;
  onMove: (index: number, dir: -1 | 1) => void;
};

export function NavTab({ site, layout, onChange, onMove }: NavTabProps) {
  const { pushToast } = useToast();
  const { ask, dialog } = useAdminConfirm();
  const navIdOptions = getNavIdOptions(layout);

  return (
    <>
      {dialog}
      <div className="max-w-2xl space-y-3">
        <p className="text-xs leading-6 text-dim">
          شناسه منو: <span dir="ltr">home → سکشن hero</span>، و{" "}
          <span dir="ltr">work, expertise, about, contact</span>. اگر سکشن در
          «چیدمان» خاموش شود، لینک منو هم مخفی می‌شود.
        </p>
        {site.nav.map((item: NavItem, i) => (
          <AdminCard
            key={`${item.id}-${i}`}
            className="grid gap-3 sm:grid-cols-2"
          >
            <AdminField label="برچسب">
              <input
                className={adminInputClass}
                value={item.label}
                onChange={(e) => {
                  const nav = [...site.nav];
                  nav[i] = { ...item, label: e.target.value };
                  onChange({ ...site, nav });
                }}
              />
            </AdminField>
            <AdminField
              label="شناسه سکشن"
              hint="home برای hero، یا سکشن‌های چیدمان"
            >
              {(() => {
                const isKnown = navIdOptions.includes(item.id);
                const usedIds = new Set(
                  site.nav.filter((_, idx) => idx !== i).map((n) => n.id),
                );
                const selectValue = isKnown ? item.id : "custom";

                return (
                  <>
                    <select
                      className={adminSelectClass}
                      dir="ltr"
                      value={selectValue}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === "custom") {
                          if (isKnown) {
                            const nav = [...site.nav];
                            nav[i] = {
                              ...item,
                              id: `section_${Date.now()}`,
                            };
                            onChange({ ...site, nav });
                          }
                          return;
                        }
                        if (usedIds.has(value)) {
                          pushToast(
                            "این شناسه قبلاً در منو استفاده شده.",
                            "error",
                          );
                          return;
                        }
                        const nav = [...site.nav];
                        nav[i] = {
                          ...item,
                          id: value,
                          href: navHrefForId(value),
                        };
                        onChange({ ...site, nav });
                      }}
                    >
                      {navIdOptions
                        .filter((id) => id === item.id || !usedIds.has(id))
                        .map((id) => (
                          <option key={id} value={id}>
                            {navIdLabel(id)} ({id})
                          </option>
                        ))}
                      <option value="custom">سفارشی…</option>
                    </select>
                    {!isKnown ? (
                      <input
                        className={cn(adminInputClass, "mt-2")}
                        dir="ltr"
                        value={item.id}
                        placeholder="شناسه سفارشی"
                        onChange={(e) => {
                          const newId = e.target.value.trim();
                          if (
                            newId &&
                            site.nav.some(
                              (n, idx) => idx !== i && n.id === newId,
                            )
                          ) {
                            pushToast(
                              "این شناسه قبلاً در منو استفاده شده.",
                              "error",
                            );
                            return;
                          }
                          const nav = [...site.nav];
                          nav[i] = { ...item, id: newId };
                          onChange({ ...site, nav });
                        }}
                      />
                    ) : null}
                  </>
                );
              })()}
            </AdminField>
            <AdminField label="آدرس">
              <input
                className={adminInputClass}
                dir="ltr"
                value={item.href}
                onChange={(e) => {
                  const nav = [...site.nav];
                  nav[i] = { ...item, href: e.target.value };
                  onChange({ ...site, nav });
                }}
              />
            </AdminField>
            <div className="flex flex-wrap items-end gap-1">
              <AdminButton
                type="button"
                variant="ghost"
                onClick={() => onMove(i, -1)}
              >
                بالا
              </AdminButton>
              <AdminButton
                type="button"
                variant="ghost"
                onClick={() => onMove(i, 1)}
              >
                پایین
              </AdminButton>
              <AdminButton
                type="button"
                variant="danger"
                onClick={async () => {
                  const ok = await ask({
                    title: "حذف آیتم منو",
                    description: `آیتم منو «${item.label || item.id}» حذف شود؟`,
                    confirmLabel: "حذف",
                    tone: "danger",
                  });
                  if (!ok) return;
                  onChange({
                    ...site,
                    nav: site.nav.filter((_, idx) => idx !== i),
                  });
                }}
              >
                حذف
              </AdminButton>
            </div>
          </AdminCard>
        ))}
        <AdminButton
          type="button"
          variant="outline"
          onClick={() => {
            const newId = firstUnusedNavId(layout, site.nav);
            onChange({
              ...site,
              nav: [
                ...site.nav,
                {
                  id: newId,
                  label: navIdLabel(newId),
                  href: navHrefForId(newId),
                },
              ],
            });
          }}
        >
          + آیتم منو
        </AdminButton>
      </div>
    </>
  );
}
