"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
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
      setStats(await adminFetchJson<Stats>("/api/admin/stats"));
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
        description="وضعیت سریع پیام‌ها و محتوا."
        actions={
          <>
            <AdminLinkButton href="/" variant="outline" size="sm">
              پیش‌نمایش سایت
            </AdminLinkButton>
            <AdminLinkButton href="/admin/content" variant="outline" size="sm">
              ویرایش محتوا
            </AdminLinkButton>
          </>
        }
      />

      {error ? <AdminErrorState message={error} onRetry={load} /> : null}

      {!error ? (
        <div className="grid gap-2.5 sm:grid-cols-3">
          <Link href="/admin/leads?status=new" className="block">
            <AdminCard className="hover:border-accent/30">
              <p className="text-[11px] text-dim">پیام جدید</p>
              <p className="mt-2 font-display text-2xl text-foreground">
                {loading ? "…" : (stats?.newLeads ?? "—")}
              </p>
            </AdminCard>
          </Link>
          <Link href="/admin/leads" className="block">
            <AdminCard className="hover:border-accent/30">
              <p className="text-[11px] text-dim">کل پیام‌ها</p>
              <p className="mt-2 font-display text-2xl text-foreground">
                {loading ? "…" : (stats?.totalLeads ?? "—")}
              </p>
            </AdminCard>
          </Link>
          <Link href="/admin/content" className="block">
            <AdminCard className="hover:border-accent/30">
              <p className="text-[11px] text-dim">نمونه‌کار / سکشن</p>
              <p className="mt-2 font-display text-2xl text-foreground">
                {loading
                  ? "…"
                  : `${stats?.projectCount ?? "—"} / ${stats?.enabledSections ?? "—"}`}
              </p>
            </AdminCard>
          </Link>
        </div>
      ) : null}

      <div className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-medium text-foreground">آخرین پیام‌ها</h2>
          <AdminLinkButton href="/admin/leads" variant="ghost" size="sm">
            همه
          </AdminLinkButton>
        </div>
        {!loading && !error && (stats?.recentLeads ?? []).length === 0 ? (
          <AdminEmpty>هنوز پیامی نیست.</AdminEmpty>
        ) : loading && !error ? (
          <p className="text-sm text-muted">در حال بارگذاری...</p>
        ) : error ? null : (
          <ul className="space-y-2">
            {(stats?.recentLeads ?? []).map((lead) => (
              <li key={lead.id}>
                <Link href={`/admin/leads?id=${encodeURIComponent(lead.id)}`}>
                  <AdminCard className="py-2.5 hover:border-accent/30">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm text-foreground">{lead.name}</p>
                      <AdminBadge
                        tone={lead.status === "new" ? "accent" : "muted"}
                      >
                        {STATUS_FA[lead.status]}
                      </AdminBadge>
                    </div>
                    <p className="mt-1 line-clamp-1 text-xs text-dim">
                      {lead.message}
                    </p>
                  </AdminCard>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
