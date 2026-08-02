"use client";

import { useCallback, useEffect, useRef } from "react";
import { usePrefs } from "@/context/PrefsContext";

function createCtx(): AudioContext | null {
  try {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    return new Ctx();
  } catch {
    return null;
  }
}

export function useSonic() {
  const { muted } = usePrefs();
  const ctxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    return () => {
      void ctxRef.current?.close();
    };
  }, []);

  const ensure = useCallback(() => {
    if (muted) return null;
    if (!ctxRef.current) ctxRef.current = createCtx();
    const ctx = ctxRef.current;
    if (ctx?.state === "suspended") void ctx.resume();
    return ctx;
  }, [muted]);

  const playTone = useCallback(
    (freq: number, duration = 0.06, type: OscillatorType = "sine", gain = 0.03) => {
      const ctx = ensure();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      g.gain.value = gain;
      osc.connect(g);
      g.connect(ctx.destination);
      const now = ctx.currentTime;
      g.gain.setValueAtTime(gain, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + duration);
      osc.start(now);
      osc.stop(now + duration);
    },
    [ensure],
  );

  const playClick = useCallback(() => {
    playTone(720, 0.04, "triangle", 0.025);
  }, [playTone]);

  const playSwoosh = useCallback(() => {
    const ctx = ensure();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(220, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(90, ctx.currentTime + 0.18);
    g.gain.value = 0.04;
    osc.connect(g);
    g.connect(ctx.destination);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    osc.start();
    osc.stop(ctx.currentTime + 0.22);
  }, [ensure]);

  const playType = useCallback(() => {
    playTone(480 + Math.random() * 80, 0.025, "square", 0.012);
  }, [playTone]);

  return { playClick, playSwoosh, playType };
}
