"use client";

import type { SiteConfig, TeamMember } from "@/types";
import { useToast } from "@/components/ui/Toast";
import {
  AdminCard,
  AdminField,
  adminInputClass,
  adminTextareaClass,
} from "@/components/admin/ui";

type AboutTabProps = {
  site: SiteConfig;
  onChange: (site: SiteConfig) => void;
  onUpload: (file: File) => Promise<string | null>;
};

export function AboutTab({ site, onChange, onUpload }: AboutTabProps) {
  const { pushToast } = useToast();

  const member: TeamMember = site.team[0] ?? {
    id: "mohammad",
    name: "",
    role: "",
    bio: "",
    image: "",
  };

  function updateMember(patch: Partial<TeamMember>) {
    onChange({
      ...site,
      team: [{ ...member, ...patch }],
    });
  }

  return (
    <div className="grid max-w-2xl gap-4">
      <AdminCard className="grid gap-4">
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
        <AdminField label="بیو">
          <textarea
            className={adminTextareaClass}
            rows={4}
            value={member.bio}
            onChange={(e) => updateMember({ bio: e.target.value })}
          />
        </AdminField>
        <AdminField label="موقعیت عکس" hint="مثال: 50% 16%">
          <input
            className={adminInputClass}
            dir="ltr"
            value={member.imagePosition ?? ""}
            onChange={(e) => updateMember({ imagePosition: e.target.value })}
          />
        </AdminField>
        <AdminField label="آدرس تصویر">
          <input
            className={adminInputClass}
            dir="ltr"
            value={member.image}
            onChange={(e) => updateMember({ image: e.target.value })}
          />
        </AdminField>
        <AdminField label="آپلود تصویر جدید">
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="block w-full text-sm text-muted file:me-3 file:rounded-full file:border-0 file:bg-accent file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-void"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const url = await onUpload(file);
              if (!url) return;
              updateMember({ image: url });
              pushToast("تصویر آماده است؛ ذخیره را بزن.");
              e.target.value = "";
            }}
          />
        </AdminField>
        <div className="grid gap-3 sm:grid-cols-2">
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
        </div>
      </AdminCard>
    </div>
  );
}
