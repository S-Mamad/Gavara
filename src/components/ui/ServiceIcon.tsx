"use client";

import {
  Monitor,
  Stack,
  HardDrives,
  PuzzlePiece,
  GitBranch,
  Code,
  PaintBrush,
  Plugs,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

const iconMap = {
  Monitor,
  Server: HardDrives,
  server: HardDrives,
  Layers: Stack,
  architecture: Stack,
  Component: PuzzlePiece,
  api: Plugs,
  git: GitBranch,
  code: Code,
  design: PaintBrush,
} as const;

export function ServiceIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const Icon = iconMap[name as keyof typeof iconMap] ?? Stack;
  return (
    <Icon
      className={cn("h-5 w-5 text-current", className)}
      weight="duotone"
    />
  );
}
