"use client";

import { useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";

/** Warn on tab close / refresh when form is dirty. */
export function useBeforeUnloadGuard(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);
}

/** Confirm leaving when dirty; returns true if OK to proceed. */
export function useConfirmLeave(dirty: boolean) {
  return useCallback(
    (message = "تغییرات ذخیره‌نشده از بین می‌رود. ادامه می‌دهی؟") => {
      if (!dirty) return true;
      return window.confirm(message);
    },
    [dirty],
  );
}

/**
 * Intercept in-app admin link clicks while dirty.
 * Leaves same-path hash/query-only navigations alone.
 */
export function useRouteLeaveGuard(
  dirty: boolean,
  message = "تغییرات ذخیره‌نشده از بین می‌رود. ادامه می‌دهی؟",
) {
  const pathname = usePathname();

  useEffect(() => {
    if (!dirty) return;

    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented) return;
      if (e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const target = e.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest("a");
      if (!anchor) return;
      if (anchor.target === "_blank" || anchor.hasAttribute("download")) return;

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
        return;
      }

      let url: URL;
      try {
        url = new URL(href, window.location.origin);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return;
      if (!url.pathname.startsWith("/admin")) return;
      if (url.pathname === pathname) return;

      if (!window.confirm(message)) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [dirty, pathname, message]);
}
