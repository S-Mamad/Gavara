import { NextResponse } from "next/server";
import {
  ensureCmsSeeded,
  getCopy,
  getLayout,
  getProjects,
  getSite,
  setCopy,
  setLayout,
  setProjects,
  setSite,
} from "@/lib/cms/store";
import {
  copySchema,
  layoutSchema,
  projectsSchema,
  siteSchema,
} from "@/lib/cms/schemas";
import {
  apiFail,
  apiOk,
  apiServerError,
  revalidateSite,
  validateOrFail,
} from "@/lib/admin/api";

export async function GET(request: Request) {
  await ensureCmsSeeded();
  const doc = new URL(request.url).searchParams.get("doc");
  switch (doc) {
    case "site":
      return NextResponse.json({ data: await getSite() });
    case "projects":
      return NextResponse.json({ data: await getProjects() });
    case "copy":
      return NextResponse.json({ data: await getCopy() });
    case "layout":
      return NextResponse.json({ data: await getLayout() });
    default:
      return apiFail("unknown_doc", "سند نامعتبر است.", 400);
  }
}

export async function PUT(request: Request) {
  try {
    await ensureCmsSeeded();
    const body = (await request.json()) as { doc?: string; data?: unknown };

    switch (body.doc) {
      case "site": {
        const v = validateOrFail(siteSchema, body.data);
        if (!v.ok) return v.response;
        await setSite(v.data);
        revalidateSite();
        return apiOk();
      }
      case "projects": {
        const v = validateOrFail(projectsSchema, body.data);
        if (!v.ok) return v.response;
        await setProjects(v.data);
        revalidateSite();
        return apiOk();
      }
      case "copy": {
        const v = validateOrFail(copySchema, body.data);
        if (!v.ok) return v.response;
        await setCopy(v.data);
        revalidateSite();
        return apiOk();
      }
      case "layout": {
        const v = validateOrFail(layoutSchema, body.data);
        if (!v.ok) return v.response;
        await setLayout(v.data);
        revalidateSite();
        return apiOk();
      }
      default:
        return apiFail("unknown_doc", "سند نامعتبر است.", 400);
    }
  } catch {
    return apiServerError();
  }
}
