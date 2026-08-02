import { NextResponse } from "next/server";
import { getLeads, getAllCms, ensureCmsSeeded } from "@/lib/cms/store";

export async function GET() {
  await ensureCmsSeeded();
  const cms = await getAllCms();
  const leads = await getLeads();
  const newCount = leads.filter((l) => l.status === "new").length;
  return NextResponse.json({
    newLeads: newCount,
    totalLeads: leads.length,
    recentLeads: leads.slice(0, 5),
    projectCount: cms.projects.length,
    enabledSections: cms.layout.sections.filter((s) => s.enabled).length,
  });
}
