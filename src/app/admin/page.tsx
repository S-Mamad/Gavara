"use client";

import { useCallback, useEffect, useState } from "react";
import type { Lead, LeadStatus } from "@/lib/cms/types";
import {
  AdminBadge,
  AdminCard,
  AdminEmpty,
  AdminErrorState,
  AdminLinkButton,
  AdminPageHeader,
} from "@/components/admin/ui";
import { adminFetchJson, errorMessage } from "@/lib/admin/fetchJson";

type Stats = {
  newLeads: number;
  totalLeads: number;
  recentLeads: Lead[];
  projectCount: number;
  enabledSections: number;
};

const STATUS_FA: Record<LeadStatus, string> = {
  new: "جدید",
  read: "خوانده‌شده",
  archived: "آرشیو",
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await adminFetchJson<Stats>("/api/admin/stats");
      setStats(data);
    } catch (err) {
      setStats(null);
      setError(errorMessage(err, "آمار بارگذاری نشد."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      <AdminPageHeader
        title="داشبورد"
        description="نمای سریع از پیام‌ها، محتوا و سکشن‌های فعال."
        actions={
          <>
            <AdminLinkButton href="/admin/leads">پیام‌ها</AdminLinkButton>
            <AdminLinkButton href="/admin/content" variant="outline">
              ویرایش محتوا
            </AdminLinkButton>
          </>
        }
      />

      {error ? <AdminErrorState message={error} onRetry={load} /> : null}

      {!error ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              label: "پیام جدید",
              value: loading ? "…" : (stats?.newLeads ?? "—"),
              badge: !!stats && stats.newLeads > 0,
            },
            {
              label: "کل پیام‌ها",
              value: loading ? "…" : (stats?.totalLeads ?? "—"),
            },
            {
              label: "نمونه‌کارها",
              value: loading ? "…" : (stats?.projectCount ?? "—"),
            },
            {
              label: "سکشن فعال",
              value: loading ? "…" : (stats?.enabledSections ?? "—"),
            },
          ].map((card) => (
            <AdminCard key={card.label}>
              <p className="text-xs text-dim">{card.label}</p>
              <p className="mt-3 font-display text-3xl text-foreground">
                {card.value}
              </p>
              {card.badge ? (
                <div className="mt-3">
                  <AdminBadge tone="accent">نیاز به بررسی</AdminBadge>
                </div>
              ) : null}
            </AdminCard>
          ))}
        </div>
      ) : null}

      <div className="mt-10">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="font-display text-xl text-foreground">آخرین پیام‌ها</h2>
          <AdminLinkButton href="/admin/leads" variant="ghost" className="px-2 py-1">
            همه پیام‌ها
          </AdminLinkButton>
        </div>
        {(stats?.recentLeads ?? []).length === 0 && !loading && !error ? (
          <AdminEmpty>هنوز پیامی ثبت نشده. از فرم سایت یکی بفرست.</AdminEmpty>
        ) : error ? null : loading ? (
          <p className="text-sm text-muted">در حال بارگذاری...</p>
        ) : (
          <ul className="space-y-2">
            {(stats?.recentLeads ?? []).map((lead) => (
              <li key={lead.id}>
                <AdminCard className="py-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm text-foreground">{lead.name}</p>
                    <AdminBadge
                      tone={lead.status === "new" ? "accent" : "muted"}
                    >
                      {STATUS_FA[lead.status] ?? lead.status}
                    </AdminBadge>
                  </div>
                  <p className="mt-1 text-xs text-muted" dir="ltr">
                    {lead.contact}
                  </p>
                  <p className="mt-2 line-clamp-2 text-sm text-dim">
                    {lead.message}
                  </p>
                </AdminCard>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
