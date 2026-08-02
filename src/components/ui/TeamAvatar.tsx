import type { TeamMember } from "@/types";
import { cn } from "@/lib/utils";

export function TeamAvatar({
  member,
  className,
}: {
  member: TeamMember;
  className?: string;
}) {
  const initials = member.initials ?? member.name.slice(0, 2);

  return (
    <div
      className={cn(
        "flex h-14 w-14 shrink-0 items-center justify-center border border-border-bright bg-elevated font-mono text-sm text-accent",
        className,
      )}
      aria-hidden
    >
      {initials}
    </div>
  );
}
