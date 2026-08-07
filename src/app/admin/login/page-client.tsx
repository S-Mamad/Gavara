"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AdminButton, AdminCard, adminInputClass } from "@/components/admin/ui";
import { useToast } from "@/components/ui/Toast";
import { BrandLockup } from "@/components/ui/BrandLockup";

function safeAdminNext(raw: string | null): string {
  if (!raw) return "/admin";
  if (!raw.startsWith("/admin")) return "/admin";
  if (raw.startsWith("//")) return "/admin";
  if (raw.includes("://")) return "/admin";
  return raw;
}

export default function AdminLoginPage() {
  const router = useRouter();
  const search = useSearchParams();
  const { pushToast } = useToast();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const nextPath = useMemo(
    () => safeAdminNext(search.get("next")),
    [search],
  );

  useEffect(() => {
    fetch("/api/admin/session")
      .then((r) => r.json())
      .then((json) => {
        if (json?.authenticated) {
          router.replace(nextPath);
          return;
        }
        setChecking(false);
      })
      .catch(() => setChecking(false));
  }, [router, nextPath]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        let serverMessage = "";
        try {
          const json = (await res.json()) as {
            message?: string;
            error?: string;
          };
          serverMessage = json.message?.trim() || "";
        } catch {
          /* ignore */
        }
        if (res.status === 429) {
          setError("تلاش زیاد. کمی بعد دوباره امتحان کن.");
        } else if (serverMessage) {
          setError(serverMessage);
        } else {
          setError("رمز اشتباه است.");
        }
        return;
      }
      pushToast("وارد شدید.", "success");
      router.push(nextPath);
      router.refresh();
    } catch {
      setError("خطا در ارتباط با سرور.");
    } finally {
      setLoading(false);
    }
  }

  if (checking) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center text-sm text-muted">
        در حال بررسی نشست...
      </div>
    );
  }

  return (
    <div className="flex min-h-[100dvh] items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <BrandLockup variant="hero" />
        </div>
        <AdminCard className="w-full p-6 sm:p-8">
          <p className="text-center text-[11px] text-dim">دسترسی ادمین</p>
          <h1 className="mt-2 text-center font-display text-2xl text-foreground">
            ورود ادمین
          </h1>
          <p className="mt-2 text-center text-sm leading-7 text-muted">
            برای مدیریت محتوا، پیام‌ها و چیدمان وارد شو.
          </p>
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <label className="block text-xs text-dim">
              رمز عبور
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${adminInputClass} mt-1.5`}
                dir="ltr"
                autoComplete="current-password"
                autoFocus
                required
              />
            </label>
            {error ? (
              <p className="text-sm text-signal" role="alert">
                {error}
              </p>
            ) : null}
            <AdminButton type="submit" disabled={loading} className="w-full">
              {loading ? "در حال ورود..." : "ورود به پنل"}
            </AdminButton>
          </form>
        </AdminCard>
      </div>
    </div>
  );
}
