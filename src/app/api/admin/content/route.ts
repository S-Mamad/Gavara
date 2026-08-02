import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
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
import type { EditableCopy, LayoutConfig } from "@/lib/cms/types";
import type { ProjectItem, SiteConfig } from "@/types";

function revalidateSite() {
  revalidatePath("/");
  revalidatePath("/work");
}

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
      return NextResponse.json({ error: "unknown_doc" }, { status: 400 });
  }
}

export async function PUT(request: Request) {
  try {
    await ensureCmsSeeded();
    const body = (await request.json()) as {
      doc?: string;
      data?: unknown;
    };

    switch (body.doc) {
      case "site":
        await setSite(body.data as SiteConfig);
        revalidateSite();
        return NextResponse.json({ ok: true });
      case "projects":
        await setProjects(body.data as ProjectItem[]);
        revalidateSite();
        return NextResponse.json({ ok: true });
      case "copy":
        await setCopy(body.data as EditableCopy);
        revalidateSite();
        return NextResponse.json({ ok: true });
      case "layout": {
        const layout = body.data as LayoutConfig;
        if (!layout?.sections?.some((s) => s.enabled)) {
          return NextResponse.json(
            {
              error: "layout_empty",
              message: "حداقل یک سکشن باید فعال باشد.",
            },
            { status: 400 },
          );
        }
        await setLayout(layout);
        revalidateSite();
        return NextResponse.json({ ok: true });
      }
      default:
        return NextResponse.json({ error: "unknown_doc" }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "error" }, { status: 500 });
  }
}
