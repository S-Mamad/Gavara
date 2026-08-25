"use client";

import { useState } from "react";
import type { ProjectItem } from "@/types";
import { useToast } from "@/components/ui/Toast";
import {
  AdminBadge,
  AdminButton,
  AdminCheckbox,
  AdminDrawer,
  AdminEmpty,
  AdminField,
  adminInputClass,
  adminSelectClass,
  adminTextareaClass,
  useAdminConfirm,
} from "@/components/admin/ui";
import { AdminImageUpload } from "@/components/admin/AdminImageUpload";
import { cn, previewHost } from "@/lib/utils";
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
            {projects.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setEditingId(item.id)}
                className={cn(
                  "flex w-full items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.025] px-3.5 py-3 text-start transition-colors hover:border-accent/30 hover:bg-white/[0.04]",
                  editingId === item.id && "border-accent/40 bg-accent/5",
                )}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-black/40">
                    {item.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.image}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div
                        className="h-full w-full"
                        style={{
                          background: `linear-gradient(135deg, ${item.gradient[0]}, ${item.gradient[1]})`,
                        }}
                      />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm text-foreground">
                      {item.title || "بدون عنوان"}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-dim">
                      {item.tag || "بدون تگ"}
                      {!item.image ? " · بدون کاور" : ""}
                    </p>
                  </div>
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
            <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-white/10 bg-[#0a0a0e]">
              {project.preferLivePreview === true && project.previewUrl ? (
                <iframe
                  title={`پیش‌نمایش زنده ${project.title}`}
                  src={project.previewUrl}
                  className="absolute inset-0 h-[250%] w-[250%] origin-top-left scale-[0.4] border-0 bg-white"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              ) : project.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={project.image}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                  style={{
                    objectPosition: project.imagePosition ?? "50% 0%",
                  }}
                />
              ) : (
                <div
                  className="absolute inset-0 flex items-end p-3"
                  style={{
                    background: `linear-gradient(145deg, ${project.gradient[0]}, ${project.gradient[1]})`,
                  }}
                >
                  <p className="relative z-[1] text-[11px] text-foreground/70">
                    آدرس سایت زنده یا کاور را تنظیم کن تا پیش‌نمایش اینجا بیاید.
                  </p>
                </div>
              )}
              {previewHost(project.previewUrl || project.href) ? (
                <span
                  dir="ltr"
                  className="pointer-events-none absolute bottom-2 start-2 z-[2] max-w-[80%] truncate rounded-md border border-white/10 bg-black/55 px-2 py-0.5 font-mono text-[9px] text-foreground/80"
                >
                  {previewHost(project.previewUrl || project.href)}
                </span>
              ) : null}
            </div>

            <AdminCheckbox
              label="پیش‌نمایش زنده سایت (iframe)"
              checked={project.preferLivePreview === true && !!project.previewUrl}
              onChange={(checked) =>
                updateProject(editingIndex, {
                  preferLivePreview: checked,
                  ...(checked && !project.previewUrl && project.href.startsWith("http")
                    ? { previewUrl: project.href }
                    : {}),
                })
              }
            />

            <AdminImageUpload
              value={project.image}
              label="تصویر کاور (فالبک و حالت بدون زنده)"
              hint="اگر سایت iframe را بلاک کند، همین کاور نشان داده می‌شود. نقطهٔ فوکوس را بکش."
              objectPosition={project.imagePosition ?? "50% 0%"}
              onObjectPositionChange={(position) =>
                updateProject(editingIndex, { imagePosition: position })
              }
              onUpload={onUpload}
              onChange={(url) =>
                updateProject(editingIndex, { image: url })
              }
              onUploaded={() =>
                pushToast("کاور آماده است؛ ذخیره را بزن تا روی سایت بیاید.")
              }
            />

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
              <AdminField label="لینک پروژه">
                <input
                  className={adminInputClass}
                  dir="ltr"
                  value={project.href}
                  onChange={(e) =>
                    updateProject(editingIndex, { href: e.target.value })
                  }
                />
              </AdminField>
              <AdminField
                label="آدرس سایت زنده"
                hint="برای iframe پیش‌نمایش روی کارت نمونه‌کار"
              >
                <input
                  className={adminInputClass}
                  dir="ltr"
                  placeholder="https://..."
                  value={project.previewUrl ?? ""}
                  onChange={(e) =>
                    updateProject(editingIndex, {
                      previewUrl: e.target.value || undefined,
                      ...(e.target.value
                        ? {
                            preferLivePreview:
                              project.preferLivePreview ?? false,
                          }
                        : {}),
                    })
                  }
                />
              </AdminField>
            </div>
            <AdminField label="آدرس تصویر (دستی)" hint="یا از آپلود بالا استفاده کن">
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
            <AdminField
              label="متریک‌ها"
              hint="با ویرگول جدا کن؛ آمار کوتاه پروژه"
            >
              <input
                className={adminInputClass}
                value={(project.metrics ?? []).join("، ")}
                onChange={(e) =>
                  updateProject(editingIndex, {
                    metrics: e.target.value
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
