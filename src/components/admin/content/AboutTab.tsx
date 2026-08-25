"use client";

import { useState } from "react";
import type { SiteConfig, TeamMember } from "@/types";
import { useToast } from "@/components/ui/Toast";
import {
  AdminButton,
  AdminCard,
  AdminCheckbox,
  AdminField,
  adminInputClass,
  adminTextareaClass,
  useAdminConfirm,
} from "@/components/admin/ui";
import { AdminImageUpload } from "@/components/admin/AdminImageUpload";
import { cn } from "@/lib/utils";

type AboutTabProps = {
  site: SiteConfig;
  onChange: (site: SiteConfig) => void;
  onUpload: (file: File) => Promise<string | null>;
};

export function AboutTab({ site, onChange, onUpload }: AboutTabProps) {
  const { pushToast } = useToast();
  const { ask, dialog } = useAdminConfirm();
  const team = site.team.length
    ? site.team
    : [
        {
          id: "mohammad",
          name: "",
          role: "",
          bio: "",
          image: "",
        } satisfies TeamMember,
      ];
  const [editingId, setEditingId] = useState<string>(
    () => team[0]?.id ?? "mohammad",
  );

  const editingIndex = team.findIndex((m) => m.id === editingId);
  const member =
    editingIndex >= 0 ? team[editingIndex]! : (team[0] as TeamMember);
  const activeIndex = editingIndex >= 0 ? editingIndex : 0;

  function updateMember(patch: Partial<TeamMember>) {
    const next = [...team];
    next[activeIndex] = { ...member, ...patch };
    onChange({ ...site, team: next });
  }

  function moveMember(dir: -1 | 1) {
    const target = activeIndex + dir;
    if (target < 0 || target >= team.length) return;
    const next = [...team];
    const tmp = next[activeIndex]!;
    next[activeIndex] = next[target]!;
    next[target] = tmp;
    onChange({ ...site, team: next });
    setEditingId(tmp.id);
  }

  return (
    <>
      {dialog}
      <div className="grid max-w-2xl gap-4">
        <div className="flex flex-wrap gap-2">
          {team.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setEditingId(item.id)}
              className={cn(
                "rounded-lg border px-3 py-1.5 text-xs transition-colors",
                item.id === member.id
                  ? "border-accent/40 bg-accent/10 text-accent-bright"
                  : "border-white/10 text-muted hover:text-foreground",
              )}
            >
              {item.name || item.id}
            </button>
          ))}
          <AdminButton
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const item: TeamMember = {
                id: `member_${Date.now()}`,
                name: "عضو جدید",
                role: "",
                bio: "",
                image: "",
              };
              onChange({ ...site, team: [...team, item] });
              setEditingId(item.id);
            }}
          >
            + عضو
          </AdminButton>
        </div>

        <AdminCard className="grid gap-4">
          <p className="text-xs leading-6 text-dim">
            عضو اول در سکشن «درباره» سایت نمایش داده می‌شود. برای عوض‌کردن، با
            دکمه‌های بالا/پایین جابه‌جا کن.
          </p>
          <AdminField label="نام">
            <input
              className={adminInputClass}
              value={member.name}
              onChange={(e) => updateMember({ name: e.target.value })}
            />
          </AdminField>
          <AdminField label="نقش">
            <input
              className={adminInputClass}
              value={member.role}
              onChange={(e) => updateMember({ role: e.target.value })}
            />
          </AdminField>
          <div className="grid gap-3 sm:grid-cols-2">
            <AdminField label="حروف اول" hint="برای آواتار بدون عکس">
              <input
                className={adminInputClass}
                dir="ltr"
                value={member.initials ?? ""}
                onChange={(e) =>
                  updateMember({
                    initials: e.target.value || undefined,
                  })
                }
              />
            </AdminField>
            <div className="flex items-end pb-1">
              <AdminCheckbox
                label="اولویت تصویر (featured)"
                checked={!!member.featured}
                onChange={(checked) =>
                  updateMember({ featured: checked || undefined })
                }
              />
            </div>
          </div>
          <AdminField label="بیو">
            <textarea
              className={adminTextareaClass}
              rows={4}
              value={member.bio}
              onChange={(e) => updateMember({ bio: e.target.value })}
            />
          </AdminField>
          <AdminImageUpload
            value={member.image || undefined}
            label="عکس پروفایل"
            hint="بعد از آپلود، نقطهٔ فوکوس را بکش تا کادر درست شود"
            aspectClass="aspect-[4/5]"
            objectPosition={member.imagePosition ?? "50% 18%"}
            onObjectPositionChange={(position) =>
              updateMember({ imagePosition: position })
            }
            onUpload={onUpload}
            onChange={(url) => updateMember({ image: url ?? "" })}
            onUploaded={() => pushToast("تصویر آماده است؛ ذخیره را بزن.")}
          />
          <AdminField label="موقعیت دقیق (اختیاری)" hint="با درگ بالا هم تنظیم می‌شود">
            <input
              className={adminInputClass}
              dir="ltr"
              placeholder="50% 18%"
              value={member.imagePosition ?? ""}
              onChange={(e) =>
                updateMember({
                  imagePosition: e.target.value || undefined,
                })
              }
            />
          </AdminField>
          <AdminField label="آدرس تصویر (دستی)">
            <input
              className={adminInputClass}
              dir="ltr"
              value={member.image}
              onChange={(e) => updateMember({ image: e.target.value })}
            />
          </AdminField>
          <div className="grid gap-3 sm:grid-cols-3">
            <AdminField label="تلگرام">
              <input
                className={adminInputClass}
                dir="ltr"
                value={member.links?.telegram ?? ""}
                onChange={(e) =>
                  updateMember({
                    links: { ...member.links, telegram: e.target.value },
                  })
                }
              />
            </AdminField>
            <AdminField label="گیت‌هاب">
              <input
                className={adminInputClass}
                dir="ltr"
                value={member.links?.github ?? ""}
                onChange={(e) =>
                  updateMember({
                    links: { ...member.links, github: e.target.value },
                  })
                }
              />
            </AdminField>
            <AdminField label="لینکدین">
              <input
                className={adminInputClass}
                dir="ltr"
                value={member.links?.linkedin ?? ""}
                onChange={(e) =>
                  updateMember({
                    links: { ...member.links, linkedin: e.target.value },
                  })
                }
              />
            </AdminField>
          </div>
          <div className="flex flex-wrap gap-2 border-t border-white/8 pt-3">
            <AdminButton
              type="button"
              variant="ghost"
              onClick={() => moveMember(-1)}
              disabled={activeIndex === 0}
            >
              بالا (نمایش اول)
            </AdminButton>
            <AdminButton
              type="button"
              variant="ghost"
              onClick={() => moveMember(1)}
              disabled={activeIndex >= team.length - 1}
            >
              پایین
            </AdminButton>
            <AdminButton
              type="button"
              variant="danger"
              onClick={async () => {
                if (team.length <= 1) {
                  pushToast("حداقل یک عضو تیم لازم است.", "error");
                  return;
                }
                const ok = await ask({
                  title: "حذف عضو",
                  description: `عضو «${member.name || member.id}» حذف شود؟`,
                  confirmLabel: "حذف",
                  tone: "danger",
                });
                if (!ok) return;
                const next = team.filter((_, idx) => idx !== activeIndex);
                onChange({ ...site, team: next });
                setEditingId(next[0]!.id);
              }}
            >
              حذف این عضو
            </AdminButton>
          </div>
        </AdminCard>
      </div>
    </>
  );
}
