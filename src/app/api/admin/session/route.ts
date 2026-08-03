import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, verifySessionToken } from "@/lib/admin/auth";
import { countNewLeads, ensureCmsSeeded } from "@/lib/cms/store";

export async function GET() {
  const jar = await cookies();
  const token = jar.get(ADMIN_COOKIE)?.value;
  const ok = await verifySessionToken(token);
  if (!ok) {
    return NextResponse.json({ authenticated: false, newLeads: 0 });
  }
  await ensureCmsSeeded();
  return NextResponse.json({
    authenticated: true,
    newLeads: await countNewLeads(),
  });
}
