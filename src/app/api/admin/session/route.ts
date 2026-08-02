import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, verifySessionToken } from "@/lib/admin/auth";
import { getLeads, ensureCmsSeeded } from "@/lib/cms/store";

export async function GET() {
  const jar = await cookies();
  const token = jar.get(ADMIN_COOKIE)?.value;
  const ok = await verifySessionToken(token);
  if (!ok) {
    return NextResponse.json({ authenticated: false, newLeads: 0 });
  }
  await ensureCmsSeeded();
  const leads = await getLeads();
  return NextResponse.json({
    authenticated: true,
    newLeads: leads.filter((l) => l.status === "new").length,
  });
}
