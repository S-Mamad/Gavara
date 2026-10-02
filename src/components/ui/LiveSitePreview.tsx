"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { CmsImage } from "@/components/ui/CmsImage";

/** Desktop viewport used for scaled iframe previews */
const VIEWPORT_W = 1280;
/** Many sites block framing; fall back quickly to cover image. */
const LOAD_TIMEOUT_MS = 5000;

type LiveSitePreviewProps = {
  src: string;
  title: string;
  className?: string;
  fallbackGradient?: [string, string];
  /** Shown when the iframe is blocked, times out, or errors. */
  fallbackImage?: string;
  objectPosition?: string;
};

/**
 * Scales the live site to the card width and pins to top-left
 * so above-the-fold content sits correctly inside the frame.
 *
 * Only mounts the iframe once the shell is near the viewport (avoids
 * lazy-load + timeout races). Cross-origin frame blockers often still
 * fire onLoad with a blank document — when a cover image exists we lock
 * to that after timeout and ignore late onLoad recoveries.
 */
export function LiveSitePreview({
  src,
  title,
  className,
  fallbackGradient,
  fallbackImage,
  objectPosition = "center",
}: LiveSitePreviewProps) {
  const shellRef = useRef<HTMLDivElement>(null);
  const loadedRef = useRef(false);
  const failedRef = useRef(false);
  const [scale, setScale] = useState(0.2);
  const [frameH, setFrameH] = useState(800);
  const [inView, setInView] = useState(false);
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
    const el = shellRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin: "200px 0px", threshold: 0.01 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!inView) return;
    loadedRef.current = false;
    failedRef.current = false;
    setReady(false);
    setFailed(false);
    const timer = window.setTimeout(() => {
      if (!loadedRef.current) {
        failedRef.current = true;
        setFailed(true);
      }
    }, LOAD_TIMEOUT_MS);
    return () => window.clearTimeout(timer);
  }, [src, inView]);

  const host = src.replace(/^https?:\/\//, "").replace(/\/$/, "") || src;
  const showCover = Boolean(fallbackImage) && (failed || !ready);
  const showGradient =
    !fallbackImage && (failed || !ready) && Boolean(fallbackGradient);

  return (
    <div
      ref={shellRef}
      className={cn("absolute inset-0 overflow-hidden bg-[#0a0a0e]", className)}
      aria-hidden
    >
      {showCover && fallbackImage ? (
        <CmsImage
          src={fallbackImage}
          alt=""
          fill
          className="object-cover"
          style={{ objectPosition }}
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
      ) : null}

      {showGradient && fallbackGradient ? (
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(145deg, ${fallbackGradient[0]}, ${fallbackGradient[1]})`,
          }}
        />
      ) : null}

      {!ready && !failed ? (
        <div className="absolute inset-x-0 bottom-0 z-[2] flex items-center justify-between gap-2 bg-gradient-to-t from-black/70 to-transparent p-3 sm:p-4">
          <span
            dir="ltr"
            className="truncate rounded-md border border-white/10 bg-black/40 px-2 py-1 font-mono text-[10px] text-foreground/75"
          >
            {host}
          </span>
          <span className="label-mono shrink-0 text-[9px] text-dim">
            loading
          </span>
        </div>
      ) : null}

      {inView && !failed ? (
        <iframe
          src={src}
          title={`پیش‌نمایش زنده ${title}`}
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
            if (failedRef.current && fallbackImage) return;
            loadedRef.current = true;
            window.setTimeout(() => {
              if (failedRef.current && fallbackImage) return;
              setReady(true);
              setFailed(false);
            }, 350);
          }}
          onError={() => {
            loadedRef.current = false;
            failedRef.current = true;
            setFailed(true);
          }}
          tabIndex={-1}
        />
      ) : null}
    </div>
  );
}
