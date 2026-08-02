import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "start" | "center";
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "start",
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      {eyebrow ? (
        <p className="label-mono mb-5 text-muted">{eyebrow}</p>
      ) : null}
      <h2 className="font-display text-[2rem] text-foreground md:text-[2.75rem]">
        {title}
      </h2>
      {description ? (
        <p className="mt-5 max-w-xl text-[15px] leading-[1.85] text-muted md:text-base">
          {description}
        </p>
      ) : null}
    </div>
  );
}
