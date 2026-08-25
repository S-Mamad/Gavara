"use client";

import { motion, useInView } from "motion/react";
import { useRef, type CSSProperties, type ElementType } from "react";

interface WordsPullUpProps {
  text: string;
  className?: string;
  showAsterisk?: boolean;
  style?: CSSProperties;
  as?: ElementType;
}

export function WordsPullUp({
  text,
  className = "",
  showAsterisk = false,
  style,
  as: Tag = "h1",
}: WordsPullUpProps) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });
  const words = text.split(/\s+/).filter(Boolean);

  return (
    <Tag ref={ref} className={className} style={style}>
      {words.map((word, i) => {
        const isLast = i === words.length - 1;
        return (
          <span
            key={`${word}-${i}`}
            className="relative inline-block overflow-hidden align-bottom"
            style={{ marginInlineEnd: isLast ? 0 : "0.08em" }}
          >
            <motion.span
              className="relative inline-block"
              initial={{ y: 20, opacity: 0 }}
              animate={isInView ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
              transition={{
                delay: i * 0.08,
                duration: 0.55,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              {word}
              {showAsterisk && isLast ? (
                <span className="absolute top-[0.65em] -left-[0.3em] text-[0.31em] leading-none">
                  *
                </span>
              ) : null}
            </motion.span>
          </span>
        );
      })}
    </Tag>
  );
}
