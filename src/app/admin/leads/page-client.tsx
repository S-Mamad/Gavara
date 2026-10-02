"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { Lead, LeadStatus } from "@/lib/cms/types";
import { useToast } from "@/components/ui/Toast";
import {
  AdminBadge,
  AdminButton,
  AdminCard,
  AdminCheckbox,
  AdminDrawer,
  AdminEmpty,
  AdminErrorState,
  AdminPageHeader,
  AdminTabs,
  AdminToolbar,
  adminInputClass,
  useAdminConfirm,
} from "@/components/admin/ui";
import { adminFetch, adminFetchJson, errorMessage } from "@/lib/admin/fetchJson";
import { cn } from "@/lib/utils";
import { projectTypeLabel } from "@/lib/contact";

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

function parseStatus(raw: string | null): "all" | LeadStatus {
  if (raw === "new" || raw === "read" || raw === "archived") return raw;
  return "all";
}

function mailtoHref(lead: Lead) {
  const contact = lead.contact.trim();
  if (
    contact.includes("@") &&
    !contact.startsWith("@") &&
    !contact.startsWith("http")
  ) {
    return `mailto:${contact}?subject=${encodeURIComponent(`پیگیری - ${lead.name}`)}&body=${encodeURIComponent(lead.message)}`;
  }
  return null;
}

export default function AdminLeadsClient() {
  const { pushToast } = useToast();
  const { ask, dialog } = useAdminConfirm();
  const searchParams = useSearchParams();
  const highlightId = searchParams.get("id");
  const [filter, setFilter] = useState<"all" | LeadStatus>(() =>
    parseStatus(searchParams.get("status")),
  );
  const [q, setQ] = useState("");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [active, setActive] = useState<Lead | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const markedRef = useRef<Set<string>>(new Set());
  const initialLoad = useRef(true);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setFilter(parseStatus(searchParams.get("status")));
  }, [searchParams]);

  useEffect(() => {
    if (!menuOpen) return;
    const onPointer = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointer);
    return () => document.removeEventListener("mousedown", onPointer);
  }, [menuOpen]);

  const load = useCallback(
    async (opts?: { silent?: boolean }) => {
      if (!opts?.silent) setLoading(true);
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
        initialLoad.current = false;
      }
    },
    [filter, q],
  );

  useEffect(() => {
    const silent = !initialLoad.current;
    const t = window.setTimeout(() => load({ silent }), q ? 250 : 0);
    return () => window.clearTimeout(t);
  }, [load, q]);

  useEffect(() => {
    if (!highlightId || !leads.length) return;
    const found = leads.find((l) => l.id === highlightId);
    if (found) void openLead(found);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [highlightId, leads]);

  const allSelected = useMemo(
    () => leads.length > 0 && selected.length === leads.length,
    [leads, selected],
  );

  async function patchStatus(
    ids: string[],
    status: LeadStatus,
    opts?: { silent?: boolean; skipReload?: boolean },
  ) {
    if (!ids.length) return;
    const silent = opts?.silent ?? false;
    const skipReload = opts?.skipReload ?? false;
    setBusy(true);
    try {
      await adminFetch("/api/admin/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify({ ids, status }),
      });
      if (!skipReload) {
        await load({ silent: true });
      } else {
        setLeads((prev) =>
          prev.map((l) => (ids.includes(l.id) ? { ...l, status } : l)),
        );
      }
      if (active && ids.includes(active.id)) {
        setActive((prev) => (prev ? { ...prev, status } : prev));
      }
      if (!silent) pushToast("وضعیت به‌روز شد.", "success");
    } catch (err) {
      pushToast(errorMessage(err, "به‌روزرسانی ناموفق بود."), "error");
    } finally {
      setBusy(false);
    }
  }

  async function openLead(lead: Lead) {
    setActive(lead);
    if (lead.status === "new" && !markedRef.current.has(lead.id)) {
      markedRef.current.add(lead.id);
      await patchStatus([lead.id], "read", {
        silent: true,
        skipReload: filter === "new",
      });
    }
  }

  function closeLead() {
    setActive(null);
    if (filter === "new") {
      void load({ silent: true });
    }
  }

  async function remove(ids: string[]) {
    if (!ids.length) return;
    const ok = await ask({
      title: "حذف پیام",
      description: `${ids.length} پیام حذف شود؟`,
      confirmLabel: "حذف",
      tone: "danger",
    });
    if (!ok) return;
    setBusy(true);
    try {
      await adminFetch("/api/admin/leads", {
        method: "DELETE",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify({ ids }),
      });
      if (active && ids.includes(active.id)) setActive(null);
      await load({ silent: true });
      pushToast("حذف شد.", "success");
    } catch (err) {
      pushToast(errorMessage(err, "حذف ناموفق بود."), "error");
    } finally {
      setBusy(false);
    }
  }

  async function copyText(value: string, ok = "کپی شد.") {
    try {
      await navigator.clipboard.writeText(value);
      pushToast(ok, "success");
    } catch {
      pushToast("کپی نشد.", "error");
    }
  }

  async function exportCsv(scope: "filtered" | "all") {
    try {
      let rowsData = leads;
      if (scope === "all") {
        const json = await adminFetchJson<LeadsPayload>(
          "/api/admin/leads?status=all",
        );
        rowsData = json.leads ?? [];
      }
      if (!rowsData.length) {
        pushToast("چیزی برای خروجی نیست.", "error");
        return;
      }
      const rows = [
        ["id", "name", "contact", "projectType", "status", "createdAt", "message"],
        ...rowsData.map((l) => [
          l.id,
          l.name,
          l.contact,
          projectTypeLabel(l.projectType),
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
      a.download = `leads-${scope}-${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      pushToast("خروجی آماده شد.", "success");
    } catch (err) {
      pushToast(errorMessage(err, "خروجی ناموفق بود."), "error");
    } finally {
      setMenuOpen(false);
    }
  }

  const mail = active ? mailtoHref(active) : null;

  return (
    <div>
      {dialog}
      <AdminPageHeader
        title="پیام‌ها"
        description="صندوق پیام‌های فرم تماس."
      />

      <AdminToolbar>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="جستجو..."
          className={cn(adminInputClass, "max-w-xs")}
          aria-label="جستجو"
        />
        <AdminTabs
          items={FILTERS}
          value={filter}
          onChange={setFilter}
          ariaLabel="فیلتر وضعیت"
        />
        <div className="ms-auto flex items-center gap-1.5">
          {selected.length > 0 ? (
            <>
              <AdminButton
                size="sm"
                variant="outline"
                disabled={busy}
                onClick={() => patchStatus(selected, "read")}
              >
                خوانده
              </AdminButton>
              <AdminButton
                size="sm"
                variant="outline"
                disabled={busy}
                onClick={() => patchStatus(selected, "archived")}
              >
                آرشیو
              </AdminButton>
              <AdminButton
                size="sm"
                variant="danger"
                disabled={busy}
                onClick={() => remove(selected)}
              >
                حذف
              </AdminButton>
            </>
          ) : null}
          <div className="relative" ref={menuRef}>
            <AdminButton
              size="sm"
              variant="ghost"
              onClick={() => setMenuOpen((v) => !v)}
            >
              بیشتر
            </AdminButton>
            {menuOpen ? (
              <div className="absolute end-0 top-full z-20 mt-1 min-w-[10rem] rounded-lg border border-white/10 bg-elevated p-1 shadow-xl">
                <button
                  type="button"
                  className="block w-full rounded-md px-2.5 py-2 text-start text-xs text-muted hover:bg-white/5 hover:text-foreground"
                  onClick={() => exportCsv("filtered")}
                >
                  CSV فیلتر
                </button>
                <button
                  type="button"
                  className="block w-full rounded-md px-2.5 py-2 text-start text-xs text-muted hover:bg-white/5 hover:text-foreground"
                  onClick={() => exportCsv("all")}
                >
                  CSV همه
                </button>
                <button
                  type="button"
                  className="block w-full rounded-md px-2.5 py-2 text-start text-xs text-muted hover:bg-white/5 hover:text-foreground"
                  onClick={() => {
                    setMenuOpen(false);
                    void load();
                  }}
                >
                  تازه‌سازی
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </AdminToolbar>

      {error ? <AdminErrorState message={error} onRetry={() => load()} /> : null}

      {!error && loading && initialLoad.current ? (
        <p className="text-sm text-muted">در حال بارگذاری...</p>
      ) : null}

      {!error && !loading && leads.length === 0 ? (
        <AdminEmpty>پیامی پیدا نشد.</AdminEmpty>
      ) : null}

      {!error && leads.length > 0 ? (
        <div className={cn("space-y-2", loading && "opacity-70")}>
          <AdminCheckbox
            label="انتخاب همه"
            checked={allSelected}
            onChange={(checked) =>
              setSelected(checked ? leads.map((l) => l.id) : [])
            }
            className="text-xs text-dim"
          />
          {leads.map((lead) => (
            <AdminCard
              key={lead.id}
              className={cn(
                "flex cursor-pointer items-start gap-3 py-2.5 transition-colors hover:border-accent/25",
                active?.id === lead.id && "border-accent/35",
              )}
            >
              <AdminCheckbox
                ariaLabel={`انتخاب ${lead.name}`}
                checked={selected.includes(lead.id)}
                onChange={(checked) => {
                  setSelected((prev) =>
                    checked
                      ? [...prev, lead.id]
                      : prev.filter((id) => id !== lead.id),
                  );
                }}
                className="mt-0.5"
              />
              <button
                type="button"
                className="min-w-0 flex-1 text-start"
                onClick={() => openLead(lead)}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm text-foreground">{lead.name}</p>
                  <AdminBadge
                    tone={lead.status === "new" ? "accent" : "muted"}
                  >
                    {STATUS_FA[lead.status]}
                  </AdminBadge>
                </div>
                <p className="mt-0.5 truncate text-xs text-dim" dir="ltr">
                  {lead.contact}
                </p>
                <p className="mt-1 line-clamp-1 text-xs text-muted">
                  {lead.message}
                </p>
              </button>
            </AdminCard>
          ))}
        </div>
      ) : null}

      <AdminDrawer
        open={!!active}
        title={active?.name ?? ""}
        onClose={closeLead}
        footer={
          active ? (
            <div className="flex flex-wrap gap-1.5">
              <AdminButton
                size="sm"
                variant="outline"
                onClick={() => copyText(active.message, "متن کپی شد.")}
              >
                کپی متن
              </AdminButton>
              {mail ? (
                <AdminButton
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    window.location.href = mail;
                  }}
                >
                  ایمیل
                </AdminButton>
              ) : null}
              {active.status !== "new" ? (
                <AdminButton
                  size="sm"
                  variant="outline"
                  disabled={busy}
                  onClick={() => {
                    markedRef.current.delete(active.id);
                    void patchStatus([active.id], "new");
                  }}
                >
                  علامت جدید
                </AdminButton>
              ) : null}
              {active.status !== "archived" ? (
                <AdminButton
                  size="sm"
                  variant="outline"
                  disabled={busy}
                  onClick={() => patchStatus([active.id], "archived")}
                >
                  آرشیو
                </AdminButton>
              ) : null}
              <AdminButton
                size="sm"
                variant="danger"
                disabled={busy}
                onClick={() => remove([active.id])}
              >
                حذف
              </AdminButton>
            </div>
          ) : null
        }
      >
        {active ? (
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-[11px] text-dim">تماس</p>
              <button
                type="button"
                className="text-accent hover:underline"
                dir="ltr"
                onClick={() => copyText(active.contact)}
              >
                {active.contact}
              </button>
            </div>
            {active.projectType ? (
              <div>
                <p className="text-[11px] text-dim">نوع</p>
                <p className="text-muted">{projectTypeLabel(active.projectType)}</p>
              </div>
            ) : null}
            <div>
              <p className="text-[11px] text-dim">زمان</p>
              <p className="text-muted">
                {new Date(active.createdAt).toLocaleString("fa-IR")}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-dim">پیام</p>
              <p className="whitespace-pre-wrap leading-7 text-foreground">
                {active.message}
              </p>
            </div>
          </div>
        ) : null}
      </AdminDrawer>
    </div>
  );
}
