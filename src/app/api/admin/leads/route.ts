import {
  ensureCmsSeeded,
  getLeads,
  updateLeads,
} from "@/lib/cms/store";
import { leadStatusSchema } from "@/lib/cms/schemas";
import type { LeadStatus } from "@/lib/cms/types";
import {
  apiFail,
  apiOk,
  apiServerError,
  validateOrFail,
} from "@/lib/admin/api";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  await ensureCmsSeeded();
  const { searchParams } = new URL(request.url);
  const statusRaw = searchParams.get("status");
  const statusParsed =
    statusRaw && statusRaw !== "all"
      ? leadStatusSchema.safeParse(statusRaw)
      : null;
  const status =
    statusRaw === "all" || !statusRaw
      ? "all"
      : statusParsed?.success
        ? statusParsed.data
        : null;
  if (statusRaw && statusRaw !== "all" && status === null) {
    return apiFail("validation", "وضعیت نامعتبر است.", 400);
  }
  const q = (searchParams.get("q") || "").trim().toLowerCase().slice(0, 200);
  let leads = await getLeads();
  if (status && status !== "all") {
    leads = leads.filter((l) => l.status === status);
  }
  if (q) {
    leads = leads.filter((l) => {
      const hay =
        `${l.name} ${l.contact} ${l.message} ${l.projectType ?? ""}`.toLowerCase();
      return hay.includes(q);
    });
  }
  return NextResponse.json({ leads });
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as {
      id?: string;
      ids?: string[];
      status?: LeadStatus;
    };
    const v = validateOrFail(leadStatusSchema, body.status);
    if (!v.ok) return v.response;
    const ids = body.ids?.length ? body.ids : body.id ? [body.id] : [];
    if (!ids.length) return apiFail("invalid", "شناسه لازم است.", 400);
    const idSet = new Set(ids);
    let changed = 0;
    const next = await updateLeads((leads) =>
      leads.map((l) => {
        if (!idSet.has(l.id)) return l;
        changed += 1;
        return { ...l, status: v.data };
      }),
    );
    if (!changed) return apiFail("not_found", "پیام پیدا نشد.", 404);
    return apiOk({ leads: next.filter((l) => idSet.has(l.id)) });
  } catch {
    return apiServerError();
  }
}

export async function DELETE(request: Request) {
  try {
    const body = (await request.json()) as { id?: string; ids?: string[] };
    const ids = body.ids?.length ? body.ids : body.id ? [body.id] : [];
    if (!ids.length) return apiFail("invalid", "شناسه لازم است.", 400);
    const idSet = new Set(ids);
    let removed = 0;
    await updateLeads((leads) => {
      const next = leads.filter((l) => !idSet.has(l.id));
      removed = leads.length - next.length;
      return next;
    });
    return apiOk({ removed });
  } catch {
    return apiServerError();
  }
}
