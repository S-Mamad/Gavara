import { NextResponse } from "next/server";
import {
  ensureCmsSeeded,
  getAllCms,
  resetCmsFromSeed,
  restoreCmsFromBackup,
} from "@/lib/cms/store";
import type { CmsDocument } from "@/lib/cms/types";
import { backupRestoreSchema } from "@/lib/cms/schemas";
import {
  apiFail,
  apiOk,
  apiServerError,
  revalidateSite,
  validateOrFail,
} from "@/lib/admin/api";

export async function GET() {
  await ensureCmsSeeded();
  const cms = await getAllCms();
  return NextResponse.json({
    exportedAt: new Date().toISOString(),
    ...cms,
  });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      action?: string;
      docs?: CmsDocument[];
      data?: unknown;
      includeLeads?: boolean;
    };

    if (body.action === "reset") {
      const docs = (body.docs?.length
        ? body.docs
        : ["site", "projects", "copy", "layout"]) as CmsDocument[];
      const safeDocs = docs.filter((d) => d !== "leads" || body.includeLeads);
      await resetCmsFromSeed(safeDocs);
      revalidateSite();
      return apiOk({ reset: safeDocs });
    }

    if (body.action === "restore") {
      const v = validateOrFail(backupRestoreSchema, body.data);
      if (!v.ok) return v.response;
      const payload = v.data;
      if (
        !payload.site &&
        !payload.projects &&
        !payload.copy &&
        !payload.layout &&
        !payload.leads
      ) {
        return apiFail(
          "validation",
          "فایل بکاپ محتوای قابل بازیابی ندارد.",
          400,
        );
      }
      const restored = await restoreCmsFromBackup({
        site: payload.site,
        projects: payload.projects,
        copy: payload.copy,
        layout: payload.layout,
        leads: body.includeLeads === false ? undefined : payload.leads,
      });
      revalidateSite();
      return apiOk({ restored });
    }

    return apiFail("unknown_action", "عملیات نامعتبر است.", 400);
  } catch {
    return apiServerError();
  }
}
