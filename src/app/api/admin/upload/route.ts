import { NextResponse } from "next/server";
import { constants as fsConstants, promises as fs } from "fs";
import path from "path";
import { randomBytes } from "crypto";

const MAX_BYTES = 8 * 1024 * 1024;
const MAX_FILES = 200;

function detectImageMime(
  buf: Buffer,
): "image/jpeg" | "image/png" | "image/webp" | "image/gif" | null {
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    buf.length >= 8 &&
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47
  ) {
    return "image/png";
  }
  if (
    buf.length >= 12 &&
    buf.toString("ascii", 0, 4) === "RIFF" &&
    buf.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "image/webp";
  }
  if (
    buf.length >= 6 &&
    (buf.toString("ascii", 0, 6) === "GIF87a" ||
      buf.toString("ascii", 0, 6) === "GIF89a")
  ) {
    return "image/gif";
  }
  return null;
}

function extForMime(mime: string) {
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  return "gif";
}

function writeErrorMessage(err: unknown): { error: string; message: string } {
  const code =
    err && typeof err === "object" && "code" in err
      ? String((err as { code?: string }).code)
      : "";
  if (code === "EACCES" || code === "EPERM") {
    return {
      error: "not_writable",
      message:
        "پوشهٔ آپلود قابل نوشتن نیست. روی هاست دسترسی public/uploads را بررسی کن.",
    };
  }
  if (code === "ENOSPC") {
    return {
      error: "disk_full",
      message: "فضای دیسک هاست پر است؛ چند فایل را حذف کن.",
    };
  }
  return {
    error: "error",
    message: "آپلود روی سرور انجام نشد. دوباره امتحان کن.",
  };
}

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "no_file", message: "فایلی انتخاب نشده." },
        { status: 400 },
      );
    }
    if (file.size <= 0) {
      return NextResponse.json(
        { error: "no_file", message: "فایل خالی است." },
        { status: 400 },
      );
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        {
          error: "too_large",
          message: "حجم فایل بیش از ۸ مگابایت است.",
        },
        { status: 400 },
      );
    }

    const dir = path.join(process.cwd(), "public", "uploads");
    try {
      await fs.mkdir(dir, { recursive: true });
      await fs.access(dir, fsConstants.W_OK);
    } catch (err) {
      const mapped = writeErrorMessage(err);
      return NextResponse.json(mapped, { status: 500 });
    }

    const existing = (await fs.readdir(dir)).filter((n) => !n.startsWith("."));
    if (existing.length >= MAX_FILES) {
      return NextResponse.json(
        {
          error: "quota",
          message: "سقف تعداد فایل‌های آپلود پر شده است. چند مورد را حذف کن.",
        },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const mime = detectImageMime(buffer);
    if (!mime) {
      return NextResponse.json(
        {
          error: "invalid_type",
          message: "فرمت تصویر مجاز نیست (png، jpg، webp، gif).",
        },
        { status: 400 },
      );
    }

    const name = `${Date.now()}_${randomBytes(4).toString("hex")}.${extForMime(mime)}`;
    const dest = path.join(dir, name);
    try {
      await fs.writeFile(dest, buffer);
      const stat = await fs.stat(dest);
      if (stat.size !== buffer.length) {
        await fs.unlink(dest).catch(() => undefined);
        return NextResponse.json(
          {
            error: "error",
            message: "نوشتن فایل ناقص بود؛ دوباره آپلود کن.",
          },
          { status: 500 },
        );
      }
    } catch (err) {
      const mapped = writeErrorMessage(err);
      return NextResponse.json(mapped, { status: 500 });
    }

    return NextResponse.json({
      url: `/uploads/${name}`,
      name,
      size: buffer.length,
      mime,
    });
  } catch (err) {
    const mapped = writeErrorMessage(err);
    return NextResponse.json(mapped, { status: 500 });
  }
}
