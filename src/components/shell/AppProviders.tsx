"use client";

import type { ReactNode } from "react";
import { PrefsProvider } from "@/context/PrefsContext";
import { ContextAwareProvider } from "@/context/ContextAwareContext";
import { ToastProvider } from "@/components/ui/Toast";
import { BootstrapEffects } from "@/components/shell/BootstrapEffects";
import { StudioBackdrop } from "@/components/shell/StudioBackdrop";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <PrefsProvider>
      <ContextAwareProvider>
        <ToastProvider>
          <BootstrapEffects />
          <StudioBackdrop />
          <div className="relative z-[1]">{children}</div>
        </ToastProvider>
      </ContextAwareProvider>
    </PrefsProvider>
  );
}
