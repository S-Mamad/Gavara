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
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { BrandLockup } from "@/components/ui/BrandLockup";

const NAV = [
  { href: "/admin", label: "داشبورد", icon: SquaresFour, exact: true },
  { href: "/admin/leads", label: "پیام‌ها", icon: EnvelopeSimple },
  { href: "/admin/content", label: "محتوا", icon: TextT },
  { href: "/admin/sections", label: "چیدمان", icon: Stack },
  { href: "/admin/media", label: "رسانه", icon: Images },
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

  useEffect(() => {
    if (isLogin) return;
    let alive = true;
    const load = () => {
      fetch("/api/admin/session")
        .then((r) => (r.ok ? r.json() : null))
        .then((json) => {
          if (alive && json?.newLeads != null) setNewLeads(json.newLeads);
        })
        .catch(() => undefined);
    };
    load();
    const id = window.setInterval(load, 20000);
    return () => {
      alive = false;
      window.clearInterval(id);
    };
  }, [isLogin, pathname]);

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
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(143,164,196,0.14),transparent_55%)]"
          aria-hidden
        />
        {children}
      </div>
    );
  }

  return (
    <div className="admin-surface relative min-h-[100dvh] overflow-hidden bg-void text-foreground">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_10%_0%,rgba(143,164,196,0.1),transparent_50%)]"
        aria-hidden
      />
      <div className="relative z-[1] mx-auto flex min-h-[100dvh] max-w-7xl gap-0 md:gap-6 md:px-6 md:py-6">
        <aside className="hidden w-60 shrink-0 flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-md md:flex">
          <div className="px-1 pb-1">
            <BrandLockup variant="panel" className="mx-auto" href="/" />
            <p className="mt-3 text-center text-[11px] text-dim">پنل مدیریت</p>
            <p className="mt-1 text-center text-xs text-muted">
              محتوا، پیام‌ها و چیدمان
            </p>
          </div>
          <nav className="mt-6 flex flex-1 flex-col gap-1">
            {NAV.map((item) => {
              const active = isActive(pathname, item.href, item.exact);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition-colors duration-300",
                    active
                      ? "border border-accent/25 bg-accent/12 text-accent-bright"
                      : "border border-transparent text-muted hover:bg-white/5 hover:text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" weight={active ? "fill" : "regular"} />
                  <span className="flex-1">{item.label}</span>
                  {item.href === "/admin/leads" && newLeads > 0 ? (
                    <span className="rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-medium text-void">
                      {newLeads}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </nav>
          <div className="mt-4 space-y-1 border-t border-white/8 pt-4">
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-muted transition-colors hover:bg-white/5 hover:text-foreground"
            >
              <House className="h-4 w-4" />
              مشاهده سایت
            </Link>
            <button
              type="button"
              onClick={logout}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-muted transition-colors hover:bg-white/5 hover:text-signal"
            >
              <SignOut className="h-4 w-4" />
              خروج
            </button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col pb-20 md:pb-0">
          <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-white/8 bg-void/90 px-3 py-3 backdrop-blur-xl md:hidden">
            <BrandLockup variant="nav" href="/" className="shrink-0 rounded-xl" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                پنل مدیریت
              </p>
              <p className="truncate text-[11px] text-dim">راکسین‌شاپ</p>
            </div>
            <button
              type="button"
              onClick={logout}
              className="shrink-0 rounded-full border border-white/10 px-3 py-1.5 text-xs text-muted"
            >
              خروج
            </button>
          </header>

          <main
            id="main"
            className="flex-1 p-4 sm:p-6 md:rounded-2xl md:border md:border-white/10 md:bg-white/[0.03] md:p-8 md:backdrop-blur-sm"
          >
            {children}
          </main>
        </div>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-void/95 px-1 pb-[max(0.35rem,env(safe-area-inset-bottom))] pt-1 backdrop-blur-xl md:hidden">
        <ul className="mx-auto flex max-w-lg items-stretch justify-between gap-0.5">
          {NAV.map((item) => {
            const active = isActive(pathname, item.href, item.exact);
            const Icon = item.icon;
            return (
              <li key={item.href} className="min-w-0 flex-1">
                <Link
                  href={item.href}
                  className={cn(
                    "relative flex flex-col items-center gap-0.5 rounded-xl px-1 py-2 text-[10px] transition-colors",
                    active ? "text-accent-bright" : "text-dim",
                  )}
                >
                  <Icon
                    className="h-5 w-5"
                    weight={active ? "fill" : "regular"}
                  />
                  <span className="truncate">{item.label}</span>
                  {item.href === "/admin/leads" && newLeads > 0 ? (
                    <span className="absolute end-1 top-1 h-1.5 w-1.5 rounded-full bg-accent" />
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
