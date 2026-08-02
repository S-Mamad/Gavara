import { NextResponse } from "next/server";
import { getLeads, setLeads, ensureCmsSeeded } from "@/lib/cms/store";
import type { LeadStatus } from "@/lib/cms/types";

export async function GET(request: Request) {
  await ensureCmsSeeded();
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") as LeadStatus | "all" | null;
  const q = (searchParams.get("q") || "").trim().toLowerCase();
  let leads = await getLeads();
  if (status && status !== "all") {
    leads = leads.filter((l) => l.status === status);
  }
  if (q) {
    leads = leads.filter((l) => {
      const hay = `${l.name} ${l.contact} ${l.message} ${l.projectType ?? ""}`.toLowerCase();
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
    if (!body.status) {
      return NextResponse.json({ error: "invalid" }, { status: 400 });
    }
    const ids = body.ids?.length ? body.ids : body.id ? [body.id] : [];
    if (!ids.length) {
      return NextResponse.json({ error: "invalid" }, { status: 400 });
    }
    const leads = await getLeads();
    const idSet = new Set(ids);
    let changed = 0;
    const next = leads.map((l) => {
      if (!idSet.has(l.id)) return l;
      changed += 1;
      return { ...l, status: body.status! };
    });
    if (!changed) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    await setLeads(next);
    return NextResponse.json({
      ok: true,
      leads: next.filter((l) => idSet.has(l.id)),
    });
  } catch {
    return NextResponse.json({ error: "error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const body = (await request.json()) as { id?: string; ids?: string[] };
    const ids = body.ids?.length ? body.ids : body.id ? [body.id] : [];
    if (!ids.length) {
      return NextResponse.json({ error: "invalid" }, { status: 400 });
    }
    const idSet = new Set(ids);
    const leads = await getLeads();
    const next = leads.filter((l) => !idSet.has(l.id));
    await setLeads(next);
    return NextResponse.json({ ok: true, removed: leads.length - next.length });
  } catch {
    return NextResponse.json({ error: "error" }, { status: 500 });
  }
}
