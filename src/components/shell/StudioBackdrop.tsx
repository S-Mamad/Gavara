"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useReducedMotion } from "motion/react";
import { usePrefs } from "@/context/PrefsContext";
import { useContextAware } from "@/context/ContextAwareContext";

type Particle = {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  base: number;
  phase: number;
  speed: number;
  spark: number;
};

/**
 * Premium particle field: soft bloom, reactive links, cursor gravity.
 */
export function StudioBackdrop() {
  const pathname = usePathname();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduceMotion = useReducedMotion();
  const { forceReducedMotion } = usePrefs();
  const { heavyEffectsOff } = useContextAware();

  const onStudioRoute =
    !pathname?.startsWith("/hajiasal") && !pathname?.startsWith("/api");
  const quiet =
    !onStudioRoute ||
    reduceMotion === true ||
    forceReducedMotion ||
    heavyEffectsOff;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !onStudioRoute) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let width = 0;
    let height = 0;
    let particles: Particle[] = [];
    let t = 0;
    let mx = 0.5;
    let my = 0.35;
    let tx = 0.5;
    let ty = 0.35;

    let isMobile = false;

    const syncMobile = () => {
      isMobile = window.matchMedia(
        "(max-width: 767px), (hover: none) and (pointer: coarse)",
      ).matches;
    };

    const seed = () => {
      const count = Math.min(95, Math.max(40, Math.floor((width * height) / 16000)));
      particles = Array.from({ length: count }, (_, i) => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: 0.8 + Math.random() * 1.8,
        vx: (Math.random() - 0.5) * 0.14,
        vy: (Math.random() - 0.5) * 0.14,
        base: 0.16 + Math.random() * 0.28,
        phase: Math.random() * Math.PI * 2,
        speed: 0.008 + Math.random() * 0.014,
        spark: i % 11 === 0 ? 1 : 0,
      }));
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      syncMobile();
      seed();
      if (isMobile) {
        mx = 0.5;
        my = 0.35;
        tx = 0.5;
        ty = 0.35;
      }
    };

    const onMove = (e: PointerEvent) => {
      if (isMobile) return;
      if (e.pointerType === "touch") return;
      tx = e.clientX / width;
      ty = e.clientY / height;
    };

    const paint = () => {
      t += 1;
      mx += (tx - mx) * 0.06;
      my += (ty - my) * 0.06;

      const cx = mx * width;
      const cy = my * height;

      ctx.clearRect(0, 0, width, height);

      // Cursor aura (desktop only)
      if (!quiet && !isMobile) {
        const aura = ctx.createRadialGradient(cx, cy, 0, cx, cy, 280);
        aura.addColorStop(0, "rgba(143,164,196,0.14)");
        aura.addColorStop(0.45, "rgba(143,164,196,0.04)");
        aura.addColorStop(1, "rgba(143,164,196,0)");
        ctx.fillStyle = aura;
        ctx.fillRect(0, 0, width, height);
      }

      // Links
      for (let i = 0; i < particles.length; i += 1) {
        for (let j = i + 1; j < particles.length; j += 1) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist > 150) continue;

          const midX = (a.x + b.x) / 2;
          const midY = (a.y + b.y) / 2;
          const toCursor = Math.hypot(midX - cx, midY - cy);
          const boost =
            quiet || isMobile
              ? 0
              : Math.max(0, 1 - toCursor / 260) * 0.1;
          const alpha = (1 - dist / 150) * 0.07 + boost;

          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(176, 194, 219, ${alpha})`;
          ctx.lineWidth = boost > 0.04 ? 1.25 : 1;
          ctx.stroke();
        }
      }

      for (const p of particles) {
        if (!quiet) {
          if (!isMobile) {
            const dx = cx - p.x;
            const dy = cy - p.y;
            const d = Math.hypot(dx, dy) || 1;
            if (d < 220) {
              p.vx += (dx / d) * 0.004;
              p.vy += (dy / d) * 0.004;
            }
          }

          p.vx *= 0.992;
          p.vy *= 0.992;
          p.x += p.vx;
          p.y += p.vy;

          if (p.x < -12) p.x = width + 12;
          if (p.x > width + 12) p.x = -12;
          if (p.y < -12) p.y = height + 12;
          if (p.y > height + 12) p.y = -12;
        }

        const breathe = 0.55 + 0.45 * Math.sin(t * p.speed + p.phase);
        const near =
          quiet || isMobile
            ? 0
            : Math.max(0, 1 - Math.hypot(p.x - cx, p.y - cy) / 200);
        const alpha = Math.min(0.95, p.base * breathe + near * 0.45);
        const radius = p.r * (1 + near * 0.7 + p.spark * 0.35);

        // Outer bloom
        const bloom = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius * 6);
        bloom.addColorStop(0, `rgba(176, 194, 219, ${alpha * 0.28})`);
        bloom.addColorStop(0.4, `rgba(143, 164, 196, ${alpha * 0.1})`);
        bloom.addColorStop(1, "rgba(143, 164, 196, 0)");
        ctx.fillStyle = bloom;
        ctx.beginPath();
        ctx.arc(p.x, p.y, radius * 6, 0, Math.PI * 2);
        ctx.fill();

        // Core
        ctx.beginPath();
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(230, 238, 248, ${0.35 + alpha * 0.55})`;
        ctx.fill();

        // Spark nodes
        if (p.spark && !quiet) {
          const flash = 0.35 + 0.65 * Math.sin(t * 0.04 + p.phase);
          ctx.beginPath();
          ctx.arc(p.x, p.y, radius * 0.45, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${flash * 0.7})`;
          ctx.fill();
        }
      }

      if (!quiet) raf = window.requestAnimationFrame(paint);
    };

    resize();
    mx = width * 0.5;
    my = height * 0.35;
    tx = mx / width;
    ty = my / height;
    paint();

    window.addEventListener("pointermove", onMove, { passive: true });
    const onResize = () => {
      resize();
      if (quiet) paint();
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("resize", onResize);
    };
  }, [onStudioRoute, quiet]);

  if (!onStudioRoute) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
      <div className="absolute inset-0 bg-[#09090b]" />

      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 90% 60% at 75% -12%, rgba(143,164,196,0.2), transparent 55%),
            radial-gradient(ellipse 50% 40% at 5% 100%, rgba(143,164,196,0.09), transparent 50%),
            radial-gradient(ellipse 35% 28% at 45% 40%, rgba(255,255,255,0.02), transparent 70%)
          `,
        }}
      />

      <div
        className="absolute inset-0 opacity-[0.22]"
        style={{
          backgroundImage:
            "radial-gradient(rgba(176,194,219,0.5) 0.6px, transparent 0.6px)",
          backgroundSize: "40px 40px",
        }}
      />

      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
}
