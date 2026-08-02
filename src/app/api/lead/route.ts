import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2),
  contact: z.string().min(3),
  message: z.string().min(10),
  website: z.string().max(0).optional(),
});

export async function POST(request: Request) {
  try {
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

    return NextResponse.json({
      success: true,
      message: "queued",
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "error" },
      { status: 500 },
    );
  }
}
