"use client";

import { cn } from "@/lib/utils";

export function AmbientField({
  className,
  tone = "steel",
}: {
  className?: string;
  tone?: "steel" | "gold" | "mixed";
}) {
  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)} aria-hidden>
      <div
        className={cn(
          "ambient-orb absolute -top-16 start-[-20%] h-[16rem] w-[16rem] rounded-full blur-[70px] sm:-top-24 sm:start-[-10%] sm:h-[28rem] sm:w-[28rem] sm:blur-[100px]",
          tone === "gold" ? "bg-gold/15" : "bg-accent/18",
        )}
      />
      <div
        className={cn(
          "ambient-orb ambient-orb-delay absolute top-[45%] end-[-25%] h-[14rem] w-[14rem] rounded-full blur-[80px] sm:top-[40%] sm:end-[-12%] sm:h-[24rem] sm:w-[24rem] sm:blur-[110px]",
          tone === "steel" ? "bg-accent/10" : "bg-gold/12",
        )}
      />
      {tone === "mixed" ? (
        <div className="ambient-orb ambient-orb-slow absolute bottom-[-25%] start-[20%] h-[12rem] w-[12rem] rounded-full bg-accent/8 blur-[90px] sm:bottom-[-20%] sm:start-[30%] sm:h-[22rem] sm:w-[22rem] sm:blur-[120px]" />
      ) : null}
    </div>
  );
}
