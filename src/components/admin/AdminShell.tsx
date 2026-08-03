"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import {
  SquaresFour,
  EnvelopeSimple,
  TextT,
  Stack,
  GearSix,
  SignOut,
  House,
  Images,
  DotsThreeOutline,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { BrandLockup } from "@/components/ui/BrandLockup";

const DESKTOP_NAV = [
  { href: "/admin", label: "داشبورد", icon: SquaresFour, exact: true },
  { href: "/admin/leads", label: "پیام‌ها", icon: EnvelopeSimple },
  { href: "/admin/content", label: "محتوا", icon: TextT },
  { href: "/admin/sections", label: "چیدمان", icon: Stack },
  { href: "/admin/media", label: "رسانه", icon: Images },
  { href: "/admin/settings", label: "تنظیمات", icon: GearSix },
];

const MOBILE_PRIMARY = [
  { href: "/admin", label: "داشبورد", icon: SquaresFour, exact: true },
  { href: "/admin/leads", label: "پیام‌ها", icon: EnvelopeSimple },
  { href: "/admin/content", label: "محتوا", icon: TextT },
  { href: "/admin/media", label: "رسانه", icon: Images },
];

const MOBILE_MORE = [
  { href: "/admin/sections", label: "چیدمان", icon: Stack },
  { href: "/admin/settings", label: "تنظیمات", icon: GearSix },
];

function isActive(pathname: string, href: string, exact?: boolean) {
  return exact ? pathname === href : pathname.startsWith(href);
}

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLogin = pathname === "/admin/login";
  const [newLeads, setNewLeads] = useState(0);
  const [moreOpen, setMoreOpen] = useState(false);

  const moreActive = MOBILE_MORE.some((item) => isActive(pathname, item.href));

  useEffect(() => {
    setMoreOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (isLogin) return;
    let alive = true;
    const load = () => {
      fetch("/api/admin/session")
        .then((r) => (r.ok ? r.json() : null))
        .then((json) => {
          if (!alive) return;
          setNewLeads(json?.authenticated ? (json.newLeads ?? 0) : 0);
        })
        .catch(() => undefined);
    };
    load();
    const id = window.setInterval(load, 30000);
    return () => {
      alive = false;
      window.clearInterval(id);
    };
  }, [isLogin]);

  async function logout() {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } catch {
      /* still leave */
    }
    router.push("/admin/login");
    router.refresh();
  }

  if (isLogin) {
    return (
      <div className="admin-surface relative min-h-[100dvh] overflow-hidden bg-void text-foreground">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(143,164,196,0.12),transparent_55%)]"
          aria-hidden
        />
        {children}
      </div>
    );
  }

  return (
    <div className="admin-surface relative min-h-[100dvh] overflow-hidden bg-void text-foreground">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_35%_at_0%_0%,rgba(143,164,196,0.08),transparent_50%)]"
        aria-hidden
      />
      <div className="relative z-[1] mx-auto flex min-h-[100dvh] max-w-7xl md:gap-4 md:px-4 md:py-4">
        <aside className="hidden w-52 shrink-0 flex-col border-e border-white/8 pe-3 md:flex">
          <div className="px-1 pb-3">
            <BrandLockup variant="panel" className="mx-auto" href="/admin" />
            <p className="mt-2 text-center text-[11px] text-dim">ادمین</p>
          </div>
          <nav className="flex flex-1 flex-col gap-0.5" aria-label="منوی ادمین">
            {DESKTOP_NAV.map((item) => {
              const active = isActive(pathname, item.href, item.exact);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-2.5 py-2 text-[13px] transition-colors",
                    active
                      ? "bg-accent/12 text-accent-bright"
                      : "text-muted hover:bg-white/5 hover:text-foreground",
                  )}
                >
                  <Icon
                    className="h-4 w-4"
                    weight={active ? "fill" : "regular"}
                    aria-hidden
                  />
                  <span className="flex-1">{item.label}</span>
                  {item.href === "/admin/leads" && newLeads > 0 ? (
                    <span className="rounded-md bg-accent px-1.5 py-0.5 text-[10px] font-medium text-void">
                      {newLeads}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </nav>
          <div className="mt-3 space-y-0.5 border-t border-white/8 pt-3">
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-[13px] text-muted hover:bg-white/5 hover:text-foreground"
            >
              <House className="h-4 w-4" aria-hidden />
              سایت
            </Link>
            <button
              type="button"
              onClick={logout}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-[13px] text-muted hover:bg-white/5 hover:text-signal"
            >
              <SignOut className="h-4 w-4" aria-hidden />
              خروج
            </button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col pb-20 md:pb-0">
          <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-white/8 bg-void/90 px-3 py-2.5 backdrop-blur-xl md:hidden">
            <BrandLockup
              variant="nav"
              href="/admin"
              className="shrink-0 rounded-lg"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                ادمین
              </p>
            </div>
            <button
              type="button"
              onClick={logout}
              className="shrink-0 rounded-lg border border-white/10 px-2.5 py-1 text-xs text-muted"
            >
              خروج
            </button>
          </header>

          <main id="main" className="flex-1 p-3 sm:p-5 md:p-6">
            {children}
          </main>
        </div>
      </div>

      {moreOpen ? (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setMoreOpen(false)}
          aria-hidden
        />
      ) : null}

      {moreOpen ? (
        <div className="fixed inset-x-0 bottom-[4.1rem] z-40 mx-auto max-w-lg px-3 md:hidden">
          <div className="rounded-xl border border-white/10 bg-void/95 p-1.5 shadow-xl backdrop-blur-xl">
            {MOBILE_MORE.map((item) => {
              const active = isActive(pathname, item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm",
                    active
                      ? "bg-accent/12 text-accent-bright"
                      : "text-muted hover:bg-white/5 hover:text-foreground",
                  )}
                >
                  <Icon className="h-5 w-5" aria-hidden />
                  {item.label}
                </Link>
              );
            })}
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted hover:bg-white/5 hover:text-foreground"
            >
              <House className="h-5 w-5" aria-hidden />
              سایت
            </Link>
          </div>
        </div>
      ) : null}

      <nav
        className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-void/95 px-1 pb-[max(0.35rem,env(safe-area-inset-bottom))] pt-1 backdrop-blur-xl md:hidden"
        aria-label="منوی موبایل ادمین"
      >
        <ul className="mx-auto flex max-w-lg items-stretch justify-between gap-0.5">
          {MOBILE_PRIMARY.map((item) => {
            const active = isActive(pathname, item.href, item.exact);
            const Icon = item.icon;
            return (
              <li key={item.href} className="min-w-0 flex-1">
                <Link
                  href={item.href}
                  className={cn(
                    "relative flex flex-col items-center gap-0.5 rounded-lg px-1 py-2 text-[10px]",
                    active ? "text-accent-bright" : "text-dim",
                  )}
                >
                  <Icon
                    className="h-5 w-5"
                    weight={active ? "fill" : "regular"}
                    aria-hidden
                  />
                  <span className="truncate">{item.label}</span>
                  {item.href === "/admin/leads" && newLeads > 0 ? (
                    <span className="absolute end-1 top-1 h-1.5 w-1.5 rounded-full bg-accent" />
                  ) : null}
                </Link>
              </li>
            );
          })}
          <li className="min-w-0 flex-1">
            <button
              type="button"
              onClick={() => setMoreOpen((v) => !v)}
              className={cn(
                "relative flex w-full flex-col items-center gap-0.5 rounded-lg px-1 py-2 text-[10px]",
                moreActive || moreOpen ? "text-accent-bright" : "text-dim",
              )}
              aria-expanded={moreOpen}
              aria-label="بیشتر"
            >
              <DotsThreeOutline
                className="h-5 w-5"
                weight={moreActive || moreOpen ? "fill" : "regular"}
                aria-hidden
              />
              <span className="truncate">بیشتر</span>
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}
