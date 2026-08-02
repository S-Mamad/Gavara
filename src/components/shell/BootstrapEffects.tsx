"use client";

import { useEffect, useRef } from "react";
import { usePrefs } from "@/context/PrefsContext";
import { useContextAware } from "@/context/ContextAwareContext";
import { useCopy } from "@/hooks/useCopy";
import { useToast } from "@/components/ui/Toast";
import { installConsoleArt, installKonami } from "@/lib/easter-eggs";

const WELCOME_KEY = "raxinshop.welcome.session";

export function BootstrapEffects() {
  const { hydrated, returningVisitor } = usePrefs();
  const { lowBattery, slowNetwork } = useContextAware();
  const copy = useCopy();
  const { pushToast } = useToast();
  const batteryTold = useRef(false);
  const networkTold = useRef(false);

  useEffect(() => {
    installConsoleArt();
    return installKonami();
  }, []);

  useEffect(() => {
    if (!hydrated || !returningVisitor) return;
    try {
      if (sessionStorage.getItem(WELCOME_KEY)) return;
      sessionStorage.setItem(WELCOME_KEY, "1");
      pushToast(copy.welcomeBack);
    } catch {
      /* ignore */
    }
  }, [hydrated, returningVisitor, copy.welcomeBack, pushToast]);

  useEffect(() => {
    if (!hydrated) return;
    if (lowBattery && !batteryTold.current) {
      batteryTold.current = true;
      pushToast(copy.lowBattery);
    }
  }, [hydrated, lowBattery, copy.lowBattery, pushToast]);

  useEffect(() => {
    if (!hydrated) return;
    if (slowNetwork && !networkTold.current) {
      networkTold.current = true;
      pushToast(copy.slowNetwork);
    }
  }, [hydrated, slowNetwork, copy.slowNetwork, pushToast]);

  return null;
}
