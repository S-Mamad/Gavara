"use client";

import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useRef, type CSSProperties } from "react";

interface AnimatedLetterProps {
  char: string;
  index: number;
  totalChars: number;
  scrollYProgress: MotionValue<number>;
}

function AnimatedLetter({
  char,
  index,
  totalChars,
  scrollYProgress,
}: AnimatedLetterProps) {
  const charProgress = index / Math.max(totalChars, 1);
  const opacity = useTransform(
    scrollYProgress,
    [charProgress - 0.1, charProgress + 0.05],
    [0.2, 1],
  );

  return (
    <motion.span style={{ opacity }} className="inline">
      {char === " " ? "\u00A0" : char}
    </motion.span>
  );
}

interface ScrollRevealTextProps {
  text: string;
  className?: string;
  style?: CSSProperties;
}

export function ScrollRevealText({
  text,
  className = "",
  style,
}: ScrollRevealTextProps) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.8", "end 0.2"],
  });

  const chars = Array.from(text);

  return (
    <p ref={ref} className={className} style={style}>
      {chars.map((char, index) => (
        <AnimatedLetter
          key={`${char}-${index}`}
          char={char}
          index={index}
          totalChars={chars.length}
          scrollYProgress={scrollYProgress}
        />
      ))}
    </p>
  );
}
