"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { usePrefs } from "@/context/PrefsContext";
import { useContextAware } from "@/context/ContextAwareContext";
import { useCopy } from "@/hooks/useCopy";
import { useToast } from "@/components/ui/Toast";
import { installConsoleArt, installKonami } from "@/lib/easter-eggs";

const WELCOME_KEY = "raxinshop.welcome.session";

export function BootstrapEffects() {
  const pathname = usePathname();
  const onAdmin = pathname?.startsWith("/admin") ?? false;
  const { hydrated, returningVisitor } = usePrefs();
  const { lowBattery, slowNetwork } = useContextAware();
  const copy = useCopy();
  const { pushToast } = useToast();
  const batteryTold = useRef(false);
  const networkTold = useRef(false);

  useEffect(() => {
    if (onAdmin) return;
    installConsoleArt();
    return installKonami();
  }, [onAdmin]);

  useEffect(() => {
    if (onAdmin || !hydrated || !returningVisitor) return;
    try {
      if (sessionStorage.getItem(WELCOME_KEY)) return;
      sessionStorage.setItem(WELCOME_KEY, "1");
      pushToast(copy.welcomeBack);
    } catch {
      /* ignore */
    }
  }, [onAdmin, hydrated, returningVisitor, copy.welcomeBack, pushToast]);

  useEffect(() => {
    if (onAdmin || !hydrated) return;
    if (lowBattery && !batteryTold.current) {
      batteryTold.current = true;
      pushToast(copy.lowBattery);
    }
  }, [onAdmin, hydrated, lowBattery, copy.lowBattery, pushToast]);

  useEffect(() => {
    if (onAdmin || !hydrated) return;
    if (slowNetwork && !networkTold.current) {
      networkTold.current = true;
      pushToast(copy.slowNetwork);
    }
  }, [onAdmin, hydrated, slowNetwork, copy.slowNetwork, pushToast]);

  return null;
}
