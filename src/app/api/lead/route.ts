import { NextResponse } from "next/server";
import { z } from "zod";
import { appendLead, ensureCmsSeeded } from "@/lib/cms/store";

const schema = z.object({
  name: z.string().min(2),
  contact: z.string().min(3),
  message: z.string().min(10),
  projectType: z.string().optional(),
  website: z.string().max(0).optional(),
});

export async function POST(request: Request) {
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
        projectType = maybeType.trim();
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
