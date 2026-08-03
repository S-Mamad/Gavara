import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import type { ZodType } from "zod";
import { zodErrorMessage } from "@/lib/cms/schemas";

export function revalidateSite() {
  revalidatePath("/");
  revalidatePath("/work");
}

export function apiOk<T extends Record<string, unknown>>(data?: T, status = 200) {
  return NextResponse.json({ ok: true, ...(data ?? {}) }, { status });
}

export function apiFail(
  error: string,
  message: string,
  status = 400,
  extra?: Record<string, unknown>,
) {
  return NextResponse.json({ error, message, ...(extra ?? {}) }, { status });
}

export function validateOrFail<T>(
  schema: ZodType<T>,
  data: unknown,
): { ok: true; data: T } | { ok: false; response: NextResponse } {
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    return {
      ok: false,
      response: apiFail("validation", zodErrorMessage(parsed.error), 400),
    };
  }
  return { ok: true, data: parsed.data };
}

export function apiServerError(message = "خطای سرور.") {
  return apiFail("error", message, 500);
}
