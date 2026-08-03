import { NextResponse } from "next/server";
import { z } from "zod";
import { appendLead, ensureCmsSeeded } from "@/lib/cms/store";
import { checkIpRateLimit } from "@/lib/admin/auth";

const schema = z.object({
  name: z.string().trim().min(2).max(120),
  contact: z.string().trim().min(3).max(200),
  message: z.string().trim().min(10).max(4000),
  projectType: z.string().trim().max(120).optional(),
  website: z.string().max(0).optional(),
});

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "local";

  if (!checkIpRateLimit(`lead:${ip}`, 8, 15 * 60 * 1000)) {
    return NextResponse.json(
      { success: false, message: "too_many" },
      { status: 429 },
    );
  }

  try {
    await ensureCmsSeeded();
    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "invalid" },
        { status: 400 },
      );
    }

    if (parsed.data.website) {
      return NextResponse.json({ success: true });
    }

    const message = parsed.data.message;
    let projectType = parsed.data.projectType;
    let cleanMessage = message;

    if (!projectType && message.includes("\n\n")) {
      const [maybeType, ...rest] = message.split("\n\n");
      if (maybeType && rest.length) {
        projectType = maybeType.trim().slice(0, 120);
        cleanMessage = rest.join("\n\n");
      }
    }

    const lead = await appendLead({
      name: parsed.data.name,
      contact: parsed.data.contact,
      message: cleanMessage,
      projectType,
    });

    return NextResponse.json({
      success: true,
      message: "saved",
      id: lead.id,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "error" },
      { status: 500 },
    );
  }
}
