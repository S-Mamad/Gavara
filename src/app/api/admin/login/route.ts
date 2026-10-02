import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  assertAdminEnvConfigured,
  checkLoginRateLimit,
  clientIp,
  createSessionToken,
  verifyPassword,
} from "@/lib/admin/auth";

export async function POST(request: Request) {
  const env = assertAdminEnvConfigured();
  if (!env.ok) {
    return NextResponse.json(
      { error: env.code, message: env.message },
      { status: 503 },
    );
  }

  const ip = clientIp(request);

  if (!checkLoginRateLimit(ip)) {
    return NextResponse.json(
      { error: "too_many_attempts" },
      { status: 429 },
    );
  }

  try {
    const body = (await request.json()) as { password?: string };
    if (!body.password || !verifyPassword(body.password)) {
      return NextResponse.json({ error: "invalid" }, { status: 401 });
    }

    const token = await createSessionToken();
    const res = NextResponse.json({ ok: true });
    res.cookies.set(ADMIN_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "خطای سرور.";
    return NextResponse.json(
      { error: "error", message },
      { status: 500 },
    );
  }
}
