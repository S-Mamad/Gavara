import { NextResponse } from "next/server";
import {
  getLeads,
  getPublicCms,
  ensureCmsSeeded,
  countNewLeads,
} from "@/lib/cms/store";

export async function GET() {
  await ensureCmsSeeded();
  const [cms, leads, newCount] = await Promise.all([
    getPublicCms(),
    getLeads(),
    countNewLeads(),
  ]);
  return NextResponse.json({
    newLeads: newCount,
    totalLeads: leads.length,
    recentLeads: leads.slice(0, 5),
    projectCount: cms.projects.length,
    enabledSections: cms.layout.sections.filter((s) => s.enabled).length,
  });
}
