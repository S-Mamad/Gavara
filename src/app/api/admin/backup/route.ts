import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  ensureCmsSeeded,
  getAllCms,
  resetCmsFromSeed,
} from "@/lib/cms/store";
import type { CmsDocument } from "@/lib/cms/types";

function revalidateSite() {
  revalidatePath("/");
  revalidatePath("/work");
}

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
    };
    if (body.action === "reset") {
      await resetCmsFromSeed(body.docs);
      revalidateSite();
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json(
      { error: "unknown_action", message: "عملیات نامعتبر است." },
      { status: 400 },
    );
  } catch {
    return NextResponse.json(
      { error: "error", message: "خطای سرور." },
      { status: 500 },
    );
  }
}
