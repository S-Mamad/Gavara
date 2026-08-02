"use client";

import Image from "next/image";
import type { TeamMember } from "@/types";

export function TeamImage({ member }: { member: TeamMember }) {
  if (!member.image) {
    return (
      <div
        className="flex h-full w-full items-center justify-center bg-elevated font-display text-4xl text-accent/40"
        aria-hidden
      >
        {member.initials ?? member.name.slice(0, 1)}
      </div>
    );
  }

  return (
    <Image
      src={member.image}
      alt={member.name}
      fill
      className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-[1.04]"
      style={{ objectPosition: member.imagePosition ?? "center center" }}
      sizes="(max-width: 640px) 100vw, 420px"
      priority={member.featured}
    />
  );
}
