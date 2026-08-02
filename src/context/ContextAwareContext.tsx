"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePrefs } from "@/context/PrefsContext";

interface BatteryManagerLike extends EventTarget {
  level: number;
  charging: boolean;
  addEventListener(
    type: "levelchange" | "chargingchange",
    listener: () => void,
  ): void;
  removeEventListener(
    type: "levelchange" | "chargingchange",
    listener: () => void,
  ): void;
}

interface NetworkInformationLike extends EventTarget {
  effectiveType?: string;
  saveData?: boolean;
  addEventListener(type: "change", listener: () => void): void;
  removeEventListener(type: "change", listener: () => void): void;
}

interface ContextAwareValue {
  lowBattery: boolean;
  slowNetwork: boolean;
  heavyEffectsOff: boolean;
  batteryLevel: number | null;
  effectiveType: string | null;
}

const ContextAwareContext = createContext<ContextAwareValue | null>(null);

export function ContextAwareProvider({ children }: { children: ReactNode }) {
  const { forceReducedMotion } = usePrefs();
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [charging, setCharging] = useState(true);
  const [effectiveType, setEffectiveType] = useState<string | null>(null);
  const [saveData, setSaveData] = useState(false);

  useEffect(() => {
    let battery: BatteryManagerLike | null = null;
    let cancelled = false;

    const nav = navigator as Navigator & {
      getBattery?: () => Promise<BatteryManagerLike>;
      connection?: NetworkInformationLike;
    };

    const syncBattery = () => {
      if (!battery || cancelled) return;
      setBatteryLevel(battery.level);
      setCharging(battery.charging);
    };

    if (typeof nav.getBattery === "function") {
      nav.getBattery().then((b) => {
        if (cancelled) return;
        battery = b;
        syncBattery();
        b.addEventListener("levelchange", syncBattery);
        b.addEventListener("chargingchange", syncBattery);
      });
    }

    const connection = nav.connection;
    const syncNetwork = () => {
      if (!connection || cancelled) return;
      setEffectiveType(connection.effectiveType ?? null);
      setSaveData(Boolean(connection.saveData));
    };

    if (connection) {
      syncNetwork();
      connection.addEventListener("change", syncNetwork);
    }

    return () => {
      cancelled = true;
      if (battery) {
        battery.removeEventListener("levelchange", syncBattery);
        battery.removeEventListener("chargingchange", syncBattery);
      }
      if (connection) {
        connection.removeEventListener("change", syncNetwork);
      }
    };
  }, []);

  const lowBattery =
    batteryLevel !== null && batteryLevel < 0.2 && !charging;
  const slowNetwork =
    saveData ||
    effectiveType === "slow-2g" ||
    effectiveType === "2g" ||
    effectiveType === "3g";

  const heavyEffectsOff = forceReducedMotion || lowBattery || slowNetwork;

  useEffect(() => {
    document.documentElement.dataset.heavyOff = String(heavyEffectsOff);
  }, [heavyEffectsOff]);

  const value = useMemo(
    () => ({
      lowBattery,
      slowNetwork,
      heavyEffectsOff,
      batteryLevel,
      effectiveType,
    }),
    [lowBattery, slowNetwork, heavyEffectsOff, batteryLevel, effectiveType],
  );

  return (
    <ContextAwareContext.Provider value={value}>
      {children}
    </ContextAwareContext.Provider>
  );
}

export function useContextAware() {
  const ctx = useContext(ContextAwareContext);
  if (!ctx) {
    throw new Error("useContextAware must be used within ContextAwareProvider");
  }
  return ctx;
}
