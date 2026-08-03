"use client";

import { useState } from "react";
import type { ProjectItem } from "@/types";
import { useToast } from "@/components/ui/Toast";
import {
  AdminBadge,
  AdminButton,
  AdminCard,
  AdminCheckbox,
  AdminDrawer,
  AdminEmpty,
  AdminField,
  adminInputClass,
  adminSelectClass,
  adminTextareaClass,
  useAdminConfirm,
} from "@/components/admin/ui";
import { cn } from "@/lib/utils";
import { CASE_STYLES, PROJECT_CATEGORIES } from "./types";

type ProjectsTabProps = {
  projects: ProjectItem[];
  onChange: (projects: ProjectItem[]) => void;
  onUpload: (file: File) => Promise<string | null>;
};

export function ProjectsTab({
  projects,
  onChange,
  onUpload,
}: ProjectsTabProps) {
  const { pushToast } = useToast();
  const { ask, dialog } = useAdminConfirm();
  const [editingId, setEditingId] = useState<string | null>(null);

  const editingIndex = editingId
    ? projects.findIndex((p) => p.id === editingId)
    : -1;
  const project = editingIndex >= 0 ? projects[editingIndex] : null;

  function updateProject(index: number, patch: Partial<ProjectItem>) {
    const next = [...projects];
    next[index] = { ...next[index]!, ...patch };
    onChange(next);
  }

  function moveProject(index: number, dir: -1 | 1) {
    const next = [...projects];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    const tmp = next[index]!;
    next[index] = next[target]!;
    next[target] = tmp;
    onChange(next);
  }

  return (
    <>
      {dialog}
      <div className="space-y-3">
        {projects.length === 0 ? (
          <AdminEmpty>هنوز نمونه‌کاری ثبت نشده.</AdminEmpty>
        ) : (
          <div className="space-y-2">
            {projects.map((item, i) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setEditingId(item.id)}
                className={cn(
                  "flex w-full items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.025] px-3.5 py-3 text-start transition-colors hover:border-accent/30 hover:bg-white/[0.04]",
                  editingId === item.id && "border-accent/40 bg-accent/5",
                )}
              >
                <div className="min-w-0">
                  <p className="truncate text-sm text-foreground">
                    {item.title || "بدون عنوان"}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-dim">
                    {item.tag || "بدون تگ"}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  {item.featured ? (
                    <AdminBadge tone="gold">صفحه اصلی</AdminBadge>
                  ) : null}
                  {item.comingSoon ? (
                    <AdminBadge tone="muted">به‌زودی</AdminBadge>
                  ) : null}
                  <span className="text-xs text-dim">ویرایش ←</span>
                </div>
              </button>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <AdminButton
            type="button"
            variant="outline"
            onClick={() => {
              const item: ProjectItem = {
                id: `project_${Date.now()}`,
                title: "پروژه جدید",
                description: "توضیح پروژه را بنویس.",
                tag: "Web",
                href: "#",
                gradient: ["#0e0e14", "#1e1e24"],
                category: "web",
                tech: [],
                featured: true,
                caseStyle: "default",
              };
              onChange([...projects, item]);
              setEditingId(item.id);
            }}
          >
            + افزودن نمونه‌کار
          </AdminButton>
        </div>
      </div>

      <AdminDrawer
        open={!!project && editingIndex >= 0}
        title={project?.title || "ویرایش نمونه‌کار"}
        onClose={() => setEditingId(null)}
      >
        {project && editingIndex >= 0 ? (
          <div className="grid gap-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <AdminField label="عنوان">
                <input
                  className={adminInputClass}
                  value={project.title}
                  onChange={(e) =>
                    updateProject(editingIndex, { title: e.target.value })
                  }
                />
              </AdminField>
              <AdminField label="تگ">
                <input
                  className={adminInputClass}
                  value={project.tag}
                  onChange={(e) =>
                    updateProject(editingIndex, { tag: e.target.value })
                  }
                />
              </AdminField>
            </div>
            <AdminField label="توضیح">
              <textarea
                className={adminTextareaClass}
                rows={2}
                value={project.description}
                onChange={(e) =>
                  updateProject(editingIndex, {
                    description: e.target.value,
                  })
                }
              />
            </AdminField>
            <div className="grid gap-3 sm:grid-cols-2">
              <AdminField label="دسته‌بندی">
                <select
                  className={adminSelectClass}
                  value={project.category}
                  onChange={(e) =>
                    updateProject(editingIndex, {
                      category: e.target.value as ProjectItem["category"],
                    })
                  }
                >
                  {PROJECT_CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </AdminField>
              <AdminField label="استایل کیس">
                <select
                  className={adminSelectClass}
                  value={project.caseStyle ?? "default"}
                  onChange={(e) =>
                    updateProject(editingIndex, {
                      caseStyle: e.target.value as ProjectItem["caseStyle"],
                    })
                  }
                >
                  {CASE_STYLES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </AdminField>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <AdminField label="لینک">
                <input
                  className={adminInputClass}
                  dir="ltr"
                  value={project.href}
                  onChange={(e) =>
                    updateProject(editingIndex, { href: e.target.value })
                  }
                />
              </AdminField>
              <AdminField label="پیش‌نمایش زنده">
                <input
                  className={adminInputClass}
                  dir="ltr"
                  value={project.previewUrl ?? ""}
                  onChange={(e) =>
                    updateProject(editingIndex, {
                      previewUrl: e.target.value || undefined,
                    })
                  }
                />
              </AdminField>
            </div>
            <AdminField label="تصویر جایگزین">
              <input
                className={adminInputClass}
                dir="ltr"
                value={project.image ?? ""}
                onChange={(e) =>
                  updateProject(editingIndex, {
                    image: e.target.value || undefined,
                  })
                }
              />
            </AdminField>
            <AdminField label="آپلود تصویر">
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="block w-full text-sm text-muted file:me-3 file:rounded-full file:border-0 file:bg-accent file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-void"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const url = await onUpload(file);
                  if (!url) return;
                  updateProject(editingIndex, { image: url });
                  pushToast("تصویر آماده است؛ ذخیره را بزن.");
                  e.target.value = "";
                }}
              />
            </AdminField>
            <div className="grid gap-3 sm:grid-cols-2">
              <AdminField label="گرادیان ۱">
                <input
                  className={adminInputClass}
                  dir="ltr"
                  value={project.gradient?.[0] ?? "#0e0e14"}
                  onChange={(e) => {
                    const g1 = project.gradient?.[1] ?? "#1e1e24";
                    updateProject(editingIndex, {
                      gradient: [e.target.value, g1],
                    });
                  }}
                />
              </AdminField>
              <AdminField label="گرادیان ۲">
                <input
                  className={adminInputClass}
                  dir="ltr"
                  value={project.gradient?.[1] ?? "#1e1e24"}
                  onChange={(e) => {
                    const g0 = project.gradient?.[0] ?? "#0e0e14";
                    updateProject(editingIndex, {
                      gradient: [g0, e.target.value],
                    });
                  }}
                />
              </AdminField>
            </div>
            <AdminField label="تک‌ها" hint="با ویرگول جدا کن">
              <input
                className={adminInputClass}
                dir="ltr"
                value={(project.tech ?? []).join(", ")}
                onChange={(e) =>
                  updateProject(editingIndex, {
                    tech: e.target.value
                      .split(",")
                      .map((t) => t.trim())
                      .filter(Boolean),
                  })
                }
              />
            </AdminField>
            <AdminField
              label="ارزش کسب‌وکار"
              hint="با ویرگول جدا کن؛ در کارت کیس نمایش داده می‌شود"
            >
              <input
                className={adminInputClass}
                value={(project.businessValue ?? []).join("، ")}
                onChange={(e) =>
                  updateProject(editingIndex, {
                    businessValue: e.target.value
                      .split(/,|،/)
                      .map((t) => t.trim())
                      .filter(Boolean),
                  })
                }
              />
            </AdminField>
            <AdminField label="سال">
              <input
                className={adminInputClass}
                value={project.year ?? ""}
                onChange={(e) =>
                  updateProject(editingIndex, {
                    year: e.target.value || undefined,
                  })
                }
              />
            </AdminField>
            <div className="flex flex-wrap gap-4">
              <AdminCheckbox
                label="نمایش در صفحه اصلی"
                checked={!!project.featured}
                onChange={(checked) =>
                  updateProject(editingIndex, { featured: checked })
                }
              />
              <AdminCheckbox
                label="به‌زودی"
                checked={!!project.comingSoon}
                onChange={(checked) =>
                  updateProject(editingIndex, { comingSoon: checked })
                }
              />
            </div>
            <div className="flex flex-wrap gap-2 border-t border-white/8 pt-3">
              <AdminButton
                type="button"
                variant="ghost"
                onClick={() => moveProject(editingIndex, -1)}
              >
                بالا
              </AdminButton>
              <AdminButton
                type="button"
                variant="ghost"
                onClick={() => moveProject(editingIndex, 1)}
              >
                پایین
              </AdminButton>
              <AdminButton
                type="button"
                variant="outline"
                onClick={() => {
                  const clone: ProjectItem = {
                    ...project,
                    id: `project_${Date.now()}`,
                    title: `${project.title} (کپی)`,
                  };
                  onChange([...projects, clone]);
                  setEditingId(clone.id);
                }}
              >
                کپی
              </AdminButton>
              <AdminButton
                type="button"
                variant="danger"
                onClick={async () => {
                  const ok = await ask({
                    title: "حذف نمونه‌کار",
                    description: `نمونه‌کار «${project.title || "بدون عنوان"}» حذف شود؟`,
                    confirmLabel: "حذف",
                    tone: "danger",
                  });
                  if (!ok) return;
                  onChange(projects.filter((_, idx) => idx !== editingIndex));
                  setEditingId(null);
                }}
              >
                حذف
              </AdminButton>
            </div>
          </div>
        ) : null}
      </AdminDrawer>
    </>
  );
}
