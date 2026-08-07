import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import {
  ensureCmsSeeded,
  findUploadReferences,
  getPublicCms,
  stripUploadReferences,
} from "@/lib/cms/store";
import { revalidateSite } from "@/lib/admin/api";

function uploadsDir() {
  return path.join(process.cwd(), "public", "uploads");
}

function safeUploadName(name: string): string | null {
  if (!name || name !== path.basename(name)) return null;
  if (name.startsWith(".") || name.includes("..")) return null;
  if (/[\\/]/.test(name)) return null;
  return name;
}

export async function GET(request: Request) {
  const dir = uploadsDir();
  const checkUrl = new URL(request.url).searchParams.get("refs");
  try {
    if (checkUrl) {
      await ensureCmsSeeded();
      const cms = await getPublicCms();
      const refs = findUploadReferences(checkUrl, cms);
      return NextResponse.json({ url: checkUrl, refs });
    }

    const files = await fs.readdir(dir);
    const items = [];
    for (const name of files) {
      if (name.startsWith(".")) continue;
      const st = await fs.stat(path.join(dir, name));
      if (!st.isFile()) continue;
      items.push({
        name,
        url: `/uploads/${name}`,
        size: st.size,
        mtime: st.mtime.toISOString(),
      });
    }
    items.sort((a, b) => b.mtime.localeCompare(a.mtime));
    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ items: [] });
  }
}

export async function DELETE(request: Request) {
  try {
    const body = (await request.json()) as { name?: string; force?: boolean };
    const name = body.name ? safeUploadName(body.name) : null;
    if (!name) {
      return NextResponse.json(
        { error: "invalid", message: "نام فایل نامعتبر است." },
        { status: 400 },
      );
    }

    const url = `/uploads/${name}`;
    await ensureCmsSeeded();
    const cms = await getPublicCms();
    const refs = findUploadReferences(url, cms);
    if (refs.length && !body.force) {
      return NextResponse.json(
        {
          error: "in_use",
          message: `این فایل در محتوا استفاده شده (${refs.join("، ")}). برای حذف، تأیید اجباری لازم است.`,
          refs,
        },
        { status: 409 },
      );
    }

    let stripped: string[] = [];
    if (refs.length && body.force) {
      stripped = await stripUploadReferences(url);
      revalidateSite();
    }

    const target = path.join(uploadsDir(), name);
    await fs.unlink(target);
    return NextResponse.json({
      ok: true,
      removed: name,
      refs,
      stripped,
    });
  } catch (err) {
    const code = (err as NodeJS.ErrnoException)?.code;
    if (code === "ENOENT") {
      return NextResponse.json(
        { error: "not_found", message: "فایل پیدا نشد." },
        { status: 404 },
      );
    }
    return NextResponse.json({ error: "error" }, { status: 500 });
  }
}
