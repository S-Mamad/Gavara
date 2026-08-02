"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { AudienceMode } from "@/content/copy";

const STORAGE_KEY = "raxinshop.prefs.v1";

export interface PrefsState {
  mode: AudienceMode;
  highContrast: boolean;
  forceReducedMotion: boolean;
  muted: boolean;
  terminalHistory: string[];
  returningVisitor: boolean;
  hydrated: boolean;
}

interface PrefsContextValue extends PrefsState {
  setMode: (mode: AudienceMode) => void;
  toggleMode: () => void;
  setHighContrast: (value: boolean) => void;
  setForceReducedMotion: (value: boolean) => void;
  setMuted: (value: boolean) => void;
  pushTerminalHistory: (command: string) => void;
  markWelcomeSeen: () => void;
}

const defaultState: PrefsState = {
  mode: "dev",
  highContrast: false,
  forceReducedMotion: false,
  muted: true,
  terminalHistory: [],
  returningVisitor: false,
  hydrated: false,
};

const PrefsContext = createContext<PrefsContextValue | null>(null);

function readStored(): Partial<PrefsState> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Partial<PrefsState>;
  } catch {
    return null;
  }
}

function writeStored(state: PrefsState) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        mode: state.mode,
        highContrast: state.highContrast,
        forceReducedMotion: state.forceReducedMotion,
        muted: state.muted,
        terminalHistory: state.terminalHistory.slice(-40),
        returningVisitor: true,
      }),
    );
  } catch {
    /* ignore quota */
  }
}

export function PrefsProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PrefsState>(defaultState);

  useEffect(() => {
    const stored = readStored();
    setState((prev) => ({
      ...prev,
      mode: stored?.mode === "executive" ? "executive" : "dev",
      highContrast: Boolean(stored?.highContrast),
      forceReducedMotion: Boolean(stored?.forceReducedMotion),
      muted: stored?.muted ?? true,
      terminalHistory: Array.isArray(stored?.terminalHistory)
        ? stored.terminalHistory
        : [],
      returningVisitor: Boolean(stored),
      hydrated: true,
    }));
  }, []);

  useEffect(() => {
    if (!state.hydrated) return;
    writeStored(state);
    document.documentElement.dataset.highContrast = String(state.highContrast);
    document.documentElement.dataset.reduceMotion = String(
      state.forceReducedMotion,
    );
  }, [state]);

  const setMode = useCallback((mode: AudienceMode) => {
    setState((prev) => ({ ...prev, mode }));
  }, []);

  const toggleMode = useCallback(() => {
    setState((prev) => ({
      ...prev,
      mode: prev.mode === "dev" ? "executive" : "dev",
    }));
  }, []);

  const setHighContrast = useCallback((value: boolean) => {
    setState((prev) => ({ ...prev, highContrast: value }));
  }, []);

  const setForceReducedMotion = useCallback((value: boolean) => {
    setState((prev) => ({ ...prev, forceReducedMotion: value }));
  }, []);

  const setMuted = useCallback((value: boolean) => {
    setState((prev) => ({ ...prev, muted: value }));
  }, []);

  const pushTerminalHistory = useCallback((command: string) => {
    const trimmed = command.trim();
    if (!trimmed) return;
    setState((prev) => ({
      ...prev,
      terminalHistory: [...prev.terminalHistory, trimmed].slice(-40),
    }));
  }, []);

  const markWelcomeSeen = useCallback(() => {
    setState((prev) => ({ ...prev, returningVisitor: true }));
  }, []);

  const value = useMemo<PrefsContextValue>(
    () => ({
      ...state,
      setMode,
      toggleMode,
      setHighContrast,
      setForceReducedMotion,
      setMuted,
      pushTerminalHistory,
      markWelcomeSeen,
    }),
    [
      state,
      setMode,
      toggleMode,
      setHighContrast,
      setForceReducedMotion,
      setMuted,
      pushTerminalHistory,
      markWelcomeSeen,
    ],
  );

  return (
    <PrefsContext.Provider value={value}>{children}</PrefsContext.Provider>
  );
}

export function usePrefs() {
  const ctx = useContext(PrefsContext);
  if (!ctx) {
    throw new Error("usePrefs must be used within PrefsProvider");
  }
  return ctx;
}
