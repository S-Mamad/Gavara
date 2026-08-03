"use client";

import { useEffect, useCallback } from "react";

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
