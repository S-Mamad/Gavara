import { NextResponse } from "next/server";

export class AdminFetchError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status = 0, code?: string) {
    super(message);
    this.name = "AdminFetchError";
    this.status = status;
    this.code = code;
  }
}

const ERROR_FA: Record<string, string> = {
  unauthorized: "نشست منقضی شده؛ دوباره وارد شو.",
  no_file: "فایلی انتخاب نشده.",
  invalid_type: "فرمت تصویر مجاز نیست (png، jpg، webp، gif).",
  too_large: "حجم فایل بیش از ۵ مگابایت است.",
  layout_empty: "حداقل یک سکشن باید فعال باشد.",
  unknown_doc: "سند نامعتبر است.",
  unknown_action: "عملیات نامعتبر است.",
  error: "خطای سرور. دوباره امتحان کن.",
};

function defaultErrorMessage(status: number) {
  if (status === 401) return ERROR_FA.unauthorized!;
  if (status === 403) return "دسترسی مجاز نیست.";
  if (status === 404) return "مورد پیدا نشد.";
  if (status === 429) return "درخواست زیاد است؛ کمی بعد دوباره امتحان کن.";
  if (status >= 500) return "خطای سرور. دوباره امتحان کن.";
  return "درخواست ناموفق بود.";
}

function redirectToLogin() {
  if (typeof window === "undefined") return;
  if (!window.location.pathname.startsWith("/admin")) return;
  if (window.location.pathname === "/admin/login") return;
  const next = encodeURIComponent(
    window.location.pathname + window.location.search,
  );
  window.location.href = `/admin/login?next=${next}`;
}

export async function adminFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  let res: Response;
  try {
    res = await fetch(input, init);
  } catch {
    throw new AdminFetchError("ارتباط با سرور برقرار نشد.");
  }
  if (!res.ok) {
    if (res.status === 401) redirectToLogin();

    let message = defaultErrorMessage(res.status);
    let code: string | undefined;
    try {
      const json = (await res.clone().json()) as {
        error?: string;
        message?: string;
      };
      code = json.error;
      if (json.message) message = json.message;
      else if (json.error && ERROR_FA[json.error]) message = ERROR_FA[json.error]!;
    } catch {
      /* ignore */
    }
    throw new AdminFetchError(message, res.status, code);
  }
  return res;
}

export async function adminFetchJson<T>(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<T> {
  const res = await adminFetch(input, init);
  try {
    return (await res.json()) as T;
  } catch {
    throw new AdminFetchError("پاسخ سرور قابل خواندن نیست.");
  }
}

export function errorMessage(err: unknown, fallback = "خطای ناشناخته.") {
  if (err instanceof AdminFetchError) return err.message;
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}

export function jsonError(message: string, status = 400, error = "error") {
  return NextResponse.json({ error, message }, { status });
}
