"use client";

import type { EditableCopy } from "@/lib/cms/types";
import {
  AdminCard,
  AdminField,
  adminInputClass,
  adminTextareaClass,
} from "@/components/admin/ui";

type CopyTabProps = {
  copy: EditableCopy;
  onChange: (copy: EditableCopy) => void;
};

const SECTIONS = [
  ["hero", "هیرو"],
  ["bento", "خدمات"],
  ["work", "نمونه‌کارها"],
  ["about", "درباره"],
  ["contact", "تماس"],
] as const;

export function CopyTab({ copy, onChange }: CopyTabProps) {
  return (
    <div className="grid max-w-2xl gap-4">
      {SECTIONS.map(([key, title]) => (
        <AdminCard key={key} className="grid gap-3">
          <p className="text-sm text-accent">{title}</p>
          {key === "hero" ? (
            <>
              <AdminField label="عنوان زیربرند">
                <input
                  className={adminInputClass}
                  value={copy.hero.title}
                  onChange={(e) =>
                    onChange({
                      ...copy,
                      hero: { ...copy.hero, title: e.target.value },
                    })
                  }
                />
              </AdminField>
              <AdminField label="هایلایت">
                <input
                  className={adminInputClass}
                  value={copy.hero.highlight}
                  onChange={(e) =>
                    onChange({
                      ...copy,
                      hero: { ...copy.hero, highlight: e.target.value },
                    })
                  }
                />
              </AdminField>
              <AdminField
                label="خطوط تایپ‌رایتر"
                hint="چند عبارت را با | جدا کن تا یکی‌یکی تایپ شوند"
              >
                <textarea
                  className={adminTextareaClass}
                  rows={3}
                  value={copy.hero.description}
                  onChange={(e) =>
                    onChange({
                      ...copy,
                      hero: { ...copy.hero, description: e.target.value },
                    })
                  }
                />
              </AdminField>
              <div className="grid gap-3 sm:grid-cols-2">
                <AdminField label="CTA اصلی" hint="دکمه هیرو و هدر">
                  <input
                    className={adminInputClass}
                    value={copy.hero.primaryCta}
                    onChange={(e) =>
                      onChange({
                        ...copy,
                        hero: { ...copy.hero, primaryCta: e.target.value },
                      })
                    }
                  />
                </AdminField>
                <AdminField label="CTA ثانویه">
                  <input
                    className={adminInputClass}
                    value={copy.hero.secondaryCta}
                    onChange={(e) =>
                      onChange({
                        ...copy,
                        hero: {
                          ...copy.hero,
                          secondaryCta: e.target.value,
                        },
                      })
                    }
                  />
                </AdminField>
              </div>
            </>
          ) : (
            <>
              <AdminField label="برچسب بالا">
                <input
                  className={adminInputClass}
                  value={copy[key].eyebrow}
                  onChange={(e) =>
                    onChange({
                      ...copy,
                      [key]: { ...copy[key], eyebrow: e.target.value },
                    })
                  }
                />
              </AdminField>
              <AdminField
                label={
                  key === "about"
                    ? "عنوان سکشن (خالی = نام شخص)"
                    : "عنوان"
                }
              >
                <input
                  className={adminInputClass}
                  value={copy[key].title}
                  onChange={(e) =>
                    onChange({
                      ...copy,
                      [key]: { ...copy[key], title: e.target.value },
                    })
                  }
                />
              </AdminField>
              <AdminField label="توضیح">
                <textarea
                  className={adminTextareaClass}
                  rows={2}
                  value={copy[key].description}
                  onChange={(e) =>
                    onChange({
                      ...copy,
                      [key]: {
                        ...copy[key],
                        description: e.target.value,
                      },
                    })
                  }
                />
              </AdminField>
            </>
          )}
        </AdminCard>
      ))}
    </div>
  );
}
