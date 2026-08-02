"use client";

import { useEffect, useRef } from "react";
import { usePrefs } from "@/context/PrefsContext";
import { useContextAware } from "@/context/ContextAwareContext";

export function HeroGrid() {
  const ref = useRef<HTMLDivElement>(null);
  const { forceReducedMotion } = usePrefs();
  const { heavyEffectsOff } = useContextAware();

  useEffect(() => {
    if (forceReducedMotion || heavyEffectsOff) return;
    const el = ref.current;
    if (!el) return;

    const onMove = (event: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;
      el.style.setProperty("--gx", `${x}%`);
      el.style.setProperty("--gy", `${y}%`);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [forceReducedMotion, heavyEffectsOff]);

  return (
    <div ref={ref} className="pointer-events-none absolute inset-0" aria-hidden>
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(61,255,168,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(61,255,168,0.06) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
          maskImage:
            "radial-gradient(ellipse 70% 60% at 50% 40%, black 20%, transparent 75%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(520px circle at var(--gx, 70%) var(--gy, 30%), rgba(61,255,168,0.1), transparent 55%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 50% 40% at 20% 80%, rgba(77,184,255,0.06), transparent 60%)",
        }}
      />
    </div>
  );
}
