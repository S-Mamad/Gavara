"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

const SOURCE = `import { ship } from '@raxin/core'

type Product = {
  name: string
  stack: string[]
  status: 'draft' | 'live'
}

const studio: Product = {
  name: 'RaxinShop',
  stack: ['Next.js', 'TypeScript', 'Infra'],
  status: 'live',
}

await ship(studio, {
  zeroDowntime: true,
  region: 'tehran',
})`;

function tokenize(line: string) {
  const parts: { text: string; tone?: "kw" | "str" | "type" | "dim" }[] = [];
  const re =
    /(import|from|type|const|await)|('[^']*'|"[^"]*")|(\/\/.*$)|(:\s*)([A-Za-z][\w|]*)|(\s+|[{}\[\](),.<>]|\w+)/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(line))) {
    if (match[1]) parts.push({ text: match[1], tone: "kw" });
    else if (match[2]) parts.push({ text: match[2], tone: "str" });
    else if (match[3]) parts.push({ text: match[3], tone: "dim" });
    else if (match[4] !== undefined) {
      parts.push({ text: match[4] });
      if (match[5]) parts.push({ text: match[5], tone: "type" });
    } else parts.push({ text: match[0] });
  }
  return parts.length ? parts : [{ text: "\u00A0" }];
}

export function HeroCodeStage() {
  const reduceMotion = useReducedMotion();
  const [chars, setChars] = useState(reduceMotion ? SOURCE.length : 0);
  const [done, setDone] = useState(!!reduceMotion);

  useEffect(() => {
    if (reduceMotion) {
      setChars(SOURCE.length);
      setDone(true);
      return;
    }

    setChars(0);
    setDone(false);
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setChars(i);
      if (i >= SOURCE.length) {
        window.clearInterval(id);
        setDone(true);
      }
    }, 14);

    return () => window.clearInterval(id);
  }, [reduceMotion]);

  const lines = useMemo(() => SOURCE.slice(0, chars).split("\n"), [chars]);

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: 0.1, ease: [0.32, 0.72, 0, 1] }}
      className="relative mx-auto w-full max-w-lg md:max-w-none"
    >
      <div className="overflow-hidden rounded-xl border border-white/10 bg-[#0b0b0f]/92 shadow-[0_28px_70px_-42px_rgba(0,0,0,0.9)] backdrop-blur-sm md:rounded-2xl">
        <div className="flex items-center gap-2 border-b border-white/8 px-3 py-2.5 md:px-4">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]/75" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]/75" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]/75" />
          <div className="ms-2 flex min-w-0 flex-1 items-center gap-1.5 overflow-hidden">
            <span
              className="truncate rounded-md bg-white/[0.06] px-2 py-0.5 font-mono text-[10px] text-foreground/80 md:text-[11px]"
              dir="ltr"
            >
              ship.ts
            </span>
            <span
              className="hidden truncate rounded-md px-2 py-0.5 font-mono text-[10px] text-dim sm:inline"
              dir="ltr"
            >
              product.ts
            </span>
          </div>
          <span
            className="shrink-0 font-mono text-[10px] text-accent/80"
            dir="ltr"
          >
            {done ? "ready" : "typing"}
          </span>
        </div>

        <div className="relative">
          <div
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(143,164,196,0.05),transparent_28%)]"
            aria-hidden
          />
          <pre
            dir="ltr"
            className="relative max-h-[260px] overflow-auto p-3.5 font-mono text-[11.5px] leading-[1.8] sm:max-h-none sm:p-5 sm:text-[12.5px] sm:leading-[1.85] md:min-h-[300px] md:p-6 md:text-[13px]"
            aria-hidden
          >
            <code className="block min-w-max">
              {lines.map((line, index) => (
                <span
                  key={`line-${index}`}
                  className={`block rounded-sm px-1 -mx-1 ${
                    index === lines.length - 1 && !done ? "bg-accent/8" : ""
                  }`}
                >
                  <span className="me-3 inline-block w-5 select-none text-right text-dim/35 sm:me-4">
                    {index + 1}
                  </span>
                  {tokenize(line || " ").map((part, partIndex) => (
                    <span
                      key={`${index}-${partIndex}`}
                      className={
                        part.tone === "kw"
                          ? "text-accent-bright"
                          : part.tone === "str"
                            ? "text-[#c4a574]"
                            : part.tone === "type"
                              ? "text-[#7dd3c0]"
                              : part.tone === "dim"
                                ? "text-dim"
                                : "text-foreground/88"
                      }
                    >
                      {part.text}
                    </span>
                  ))}
                </span>
              ))}
              {!reduceMotion && !done ? (
                <span className="ms-0.5 inline-block h-3.5 w-[1.5px] translate-y-[2px] bg-accent animate-pulse" />
              ) : null}
            </code>
          </pre>
        </div>

        <div
          className="flex items-center gap-3 border-t border-white/8 bg-black/25 px-3 py-2 font-mono text-[9px] text-dim sm:px-4 sm:py-2.5 sm:text-[10px]"
          dir="ltr"
        >
          <span className="text-accent">›</span>
          <span className="truncate">
            {done
              ? "ship complete · zero downtime"
              : "compiling product pipeline…"}
          </span>
          <span
            className={`ms-auto h-1.5 w-1.5 shrink-0 rounded-full ${
              done ? "bg-accent" : "bg-[#c4a574] animate-pulse"
            }`}
          />
        </div>
      </div>
    </motion.div>
  );
}
