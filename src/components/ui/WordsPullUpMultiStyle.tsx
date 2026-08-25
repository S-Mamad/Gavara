"use client";

import { motion, useInView } from "motion/react";
import { useRef, type CSSProperties, type ElementType } from "react";

export interface TextSegment {
  text: string;
  className?: string;
}

interface WordsPullUpMultiStyleProps {
  segments: TextSegment[];
  className?: string;
  style?: CSSProperties;
  as?: ElementType;
}

export function WordsPullUpMultiStyle({
  segments,
  className = "",
  style,
  as: Tag = "h2",
}: WordsPullUpMultiStyleProps) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  const words = segments.flatMap((segment) =>
    segment.text
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => ({ word, className: segment.className ?? "" })),
  );

  return (
    <Tag
      ref={ref}
      className={`inline-flex flex-wrap justify-center ${className}`}
      style={style}
    >
      {words.map(({ word, className: wordClass }, i) => (
        <span
          key={`${word}-${i}`}
          className="inline-block overflow-hidden"
          style={{ marginInlineEnd: i === words.length - 1 ? 0 : "0.28em" }}
        >
          <motion.span
            className={`inline-block ${wordClass}`}
            initial={{ y: 20, opacity: 0 }}
            animate={isInView ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
            transition={{
              delay: i * 0.08,
              duration: 0.55,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}
