"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { CmsImage } from "@/components/ui/CmsImage";

/** Desktop viewport used for scaled iframe previews */
const VIEWPORT_W = 1280;
/** Many sites block framing; fall back quickly to cover image. */
const LOAD_TIMEOUT_MS = 4500;

type LiveSitePreviewProps = {
  src: string;
  title: string;
  className?: string;
  fallbackGradient?: [string, string];
  /** Shown when the iframe is blocked, times out, or errors. */
  fallbackImage?: string;
};

/**
 * Scales the live site to the card width and pins to top-left
 * so above-the-fold content sits correctly inside the frame.
 * Cross-origin frame blockers often still fire onLoad with a blank
 * document — we treat a short timeout without a reliable paint as failure
 * and prefer the cover image when provided.
 */
export function LiveSitePreview({
  src,
  title,
  className,
  fallbackGradient,
  fallbackImage,
}: LiveSitePreviewProps) {
  const shellRef = useRef<HTMLDivElement>(null);
  const loadedRef = useRef(false);
  const [scale, setScale] = useState(0.2);
  const [frameH, setFrameH] = useState(800);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const el = shellRef.current;
    if (!el) return;

    const update = () => {
      const { width, height } = el.getBoundingClientRect();
      if (width <= 0 || height <= 0) return;
      const nextScale = width / VIEWPORT_W;
      setScale(nextScale);
      setFrameH(Math.ceil(height / nextScale));
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    loadedRef.current = false;
    setReady(false);
    setFailed(false);
    const timer = window.setTimeout(() => {
      if (!loadedRef.current) setFailed(true);
    }, LOAD_TIMEOUT_MS);
    return () => window.clearTimeout(timer);
  }, [src]);

  const host = src.replace(/^https?:\/\//, "").replace(/\/$/, "") || src;
  const showFallbackVisual = failed || !ready;

  return (
    <div
      ref={shellRef}
      className={cn("absolute inset-0 overflow-hidden bg-[#0a0a0e]", className)}
      aria-hidden
    >
      {failed && fallbackImage ? (
        <CmsImage
          src={fallbackImage}
          alt=""
          fill
          className="object-cover object-center"
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
      ) : (
        <div
          className={cn(
            "absolute inset-0 z-[1] transition-opacity duration-500",
            ready && !failed ? "pointer-events-none opacity-0" : "opacity-100",
          )}
          style={{
            background:
              fallbackImage && showFallbackVisual
                ? undefined
                : fallbackGradient
                  ? `linear-gradient(145deg, ${fallbackGradient[0]}, ${fallbackGradient[1]})`
                  : "var(--elevated)",
          }}
        >
          {fallbackImage && showFallbackVisual ? (
            <CmsImage
              src={fallbackImage}
              alt=""
              fill
              className="object-cover object-center"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          ) : null}
          <div className="absolute inset-x-0 bottom-0 z-[1] flex items-center justify-between gap-2 bg-gradient-to-t from-black/70 to-transparent p-3 sm:p-4">
            <span
              dir="ltr"
              className="truncate rounded-md border border-white/10 bg-black/40 px-2 py-1 font-mono text-[10px] text-foreground/75"
            >
              {host}
            </span>
            {!failed ? (
              <span className="label-mono shrink-0 text-[9px] text-dim">
                loading
              </span>
            ) : null}
          </div>
        </div>
      )}

      {!failed ? (
        <iframe
          src={src}
          title={`پیش‌نمایش زنده ${title}`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="pointer-events-none absolute left-0 top-0 border-0 bg-white"
          style={{
            width: VIEWPORT_W,
            height: frameH,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            opacity: ready ? 1 : 0,
            transition: "opacity 0.45s ease",
          }}
          onLoad={() => {
            loadedRef.current = true;
            // Cross-origin blank frames still fire onLoad. Give the cover
            // a short window, then assume success only if still mounted.
            window.setTimeout(() => {
              if (!loadedRef.current) return;
              setReady(true);
              setFailed(false);
            }, 350);
          }}
          onError={() => {
            loadedRef.current = false;
            setFailed(true);
          }}
          tabIndex={-1}
        />
      ) : null}
    </div>
  );
}
