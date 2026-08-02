"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Lead, LeadStatus } from "@/lib/cms/types";
import { useToast } from "@/components/ui/Toast";
import {
  AdminBadge,
  AdminButton,
  AdminCard,
  AdminCheckbox,
  AdminEmpty,
  AdminErrorState,
  AdminPageHeader,
  adminInputClass,
} from "@/components/admin/ui";
import { adminFetch, adminFetchJson, errorMessage } from "@/lib/admin/fetchJson";
import { cn } from "@/lib/utils";

const FILTERS: Array<{ id: "all" | LeadStatus; label: string }> = [
  { id: "all", label: "همه" },
  { id: "new", label: "جدید" },
  { id: "read", label: "خوانده‌شده" },
  { id: "archived", label: "آرشیو" },
];

const STATUS_FA: Record<LeadStatus, string> = {
  new: "جدید",
  read: "خوانده‌شده",
  archived: "آرشیو",
};

type LeadsPayload = { leads: Lead[] };

export default function AdminLeadsPage() {
  const { pushToast } = useToast();
  const [filter, setFilter] = useState<"all" | LeadStatus>("all");
  const [q, setQ] = useState("");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ status: filter });
      if (q.trim()) params.set("q", q.trim());
      const json = await adminFetchJson<LeadsPayload>(
        `/api/admin/leads?${params}`,
      );
      setLeads(json.leads ?? []);
      setSelected([]);
    } catch (err) {
      setLeads([]);
      setError(errorMessage(err, "پیام‌ها بارگذاری نشدند."));
    } finally {
      setLoading(false);
    }
  }, [filter, q]);

  useEffect(() => {
    const t = window.setTimeout(() => {
      load();
    }, q ? 250 : 0);
    return () => window.clearTimeout(t);
  }, [load, q]);

  const allSelected = useMemo(
    () => leads.length > 0 && selected.length === leads.length,
    [leads, selected],
  );

  async function patchStatus(ids: string[], status: LeadStatus) {
    if (!ids.length) return;
    setBusy(true);
    try {
      await adminFetch("/api/admin/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify({ ids, status }),
      });
      await load();
      pushToast("وضعیت به‌روز شد.", "success");
    } catch (err) {
      pushToast(errorMessage(err, "به‌روزرسانی ناموفق بود."), "error");
    } finally {
      setBusy(false);
    }
  }

  async function remove(ids: string[]) {
    if (!ids.length) return;
    if (!confirm(`${ids.length} پیام حذف شود؟`)) return;
    setBusy(true);
    try {
      await adminFetch("/api/admin/leads", {
        method: "DELETE",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify({ ids }),
      });
      await load();
      pushToast("حذف شد.", "success");
    } catch (err) {
      pushToast(errorMessage(err, "حذف ناموفق بود."), "error");
    } finally {
      setBusy(false);
    }
  }

  async function copyContact(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      pushToast("کپی شد.", "success");
    } catch {
      pushToast("کپی نشد.", "error");
    }
  }

  function exportCsv() {
    const rows = [
      ["id", "name", "contact", "projectType", "status", "createdAt", "message"],
      ...leads.map((l) => [
        l.id,
        l.name,
        l.contact,
        l.projectType ?? "",
        l.status,
        l.createdAt,
        l.message.replace(/\n/g, " "),
      ]),
    ];
    const csv = rows
      .map((r) =>
        r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
      )
      .join("\n");
    const blob = new Blob(["\ufeff" + csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <AdminPageHeader
        title="پیام‌ها"
        description="همه پیام‌های فرم تماس اینجا ذخیره می‌شوند؛ جستجو، آرشیو و خروجی بگیر."
        actions={
          <>
            <AdminButton
              type="button"
              variant="outline"
              onClick={exportCsv}
              disabled={!leads.length}
            >
              خروجی CSV
            </AdminButton>
            <AdminButton
              type="button"
              variant="ghost"
              onClick={() => load()}
              disabled={busy}
            >
              تازه‌سازی
            </AdminButton>
          </>
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="جستجو در نام، تماس یا متن..."
          className={cn(adminInputClass, "sm:max-w-sm")}
        />
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs transition-colors",
                filter === f.id
                  ? "bg-accent text-void"
                  : "border border-white/10 text-muted hover:text-foreground",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {selected.length > 0 ? (
        <AdminCard className="mb-4 flex flex-wrap items-center gap-2 py-3">
          <span className="text-sm text-muted">{selected.length} انتخاب‌شده</span>
          <AdminButton
            type="button"
            variant="outline"
            disabled={busy}
            onClick={() => patchStatus(selected, "read")}
          >
            خوانده شد
          </AdminButton>
          <AdminButton
            type="button"
            variant="outline"
            disabled={busy}
            onClick={() => patchStatus(selected, "archived")}
          >
            آرشیو
          </AdminButton>
          <AdminButton
            type="button"
            variant="outline"
            disabled={busy}
            onClick={() => patchStatus(selected, "new")}
          >
            علامت جدید
          </AdminButton>
          <AdminButton
            type="button"
            variant="danger"
            disabled={busy}
            onClick={() => remove(selected)}
          >
            حذف
          </AdminButton>
        </AdminCard>
      ) : null}

      {error ? <AdminErrorState message={error} onRetry={load} /> : null}

      {!error && loading ? (
        <p className="text-sm text-muted">در حال بارگذاری...</p>
      ) : null}

      {!error && !loading && leads.length === 0 ? (
        <AdminEmpty>پیامی با این فیلتر پیدا نشد.</AdminEmpty>
      ) : null}

      {!error && !loading && leads.length > 0 ? (
        <div className="space-y-3">
          <AdminCheckbox
            label="انتخاب همه"
            checked={allSelected}
            onChange={(checked) =>
              setSelected(checked ? leads.map((l) => l.id) : [])
            }
            className="text-xs text-dim"
          />
          {leads.map((lead) => (
            <AdminCard key={lead.id} className="space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <AdminCheckbox
                    checked={selected.includes(lead.id)}
                    onChange={(checked) => {
                      setSelected((prev) =>
                        checked
                          ? [...prev, lead.id]
                          : prev.filter((id) => id !== lead.id),
                      );
                    }}
                    className="mt-1"
                  />
                  <div>
                    <p className="font-display text-lg text-foreground">
                      {lead.name}
                    </p>
                    <button
                      type="button"
                      onClick={() => copyContact(lead.contact)}
                      className="mt-1 text-sm text-accent hover:underline"
                      dir="ltr"
                    >
                      {lead.contact}
                    </button>
                    {lead.projectType ? (
                      <p className="mt-1 text-xs text-dim">
                        نوع: {lead.projectType}
                      </p>
                    ) : null}
                  </div>
                </div>
                <div className="text-end">
                  <AdminBadge
                    tone={
                      lead.status === "new"
                        ? "accent"
                        : lead.status === "archived"
                          ? "gold"
                          : "muted"
                    }
                  >
                    {STATUS_FA[lead.status]}
                  </AdminBadge>
                  <p className="mt-2 text-[11px] text-dim">
                    {new Date(lead.createdAt).toLocaleString("fa-IR")}
                  </p>
                </div>
              </div>
              <p className="whitespace-pre-wrap text-sm leading-7 text-muted">
                {lead.message}
              </p>
              <div className="flex flex-wrap gap-2">
                {lead.status !== "read" ? (
                  <AdminButton
                    type="button"
                    variant="outline"
                    disabled={busy}
                    onClick={() => patchStatus([lead.id], "read")}
                  >
                    خوانده شد
                  </AdminButton>
                ) : null}
                {lead.status !== "archived" ? (
                  <AdminButton
                    type="button"
                    variant="outline"
                    disabled={busy}
                    onClick={() => patchStatus([lead.id], "archived")}
                  >
                    آرشیو
                  </AdminButton>
                ) : null}
                <AdminButton
                  type="button"
                  variant="danger"
                  disabled={busy}
                  onClick={() => remove([lead.id])}
                >
                  حذف
                </AdminButton>
              </div>
            </AdminCard>
          ))}
        </div>
      ) : null}
    </div>
  );
}
