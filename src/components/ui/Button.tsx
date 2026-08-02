import Link from "next/link";
import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps {
  href?: string;
  external?: boolean;
  variant?: "primary" | "ghost" | "outline";
  size?: "default" | "lg" | "sm";
  trailingIcon?: ReactNode;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
}

export function Button({
  href,
  external,
  variant = "primary",
  size = "default",
  trailingIcon,
  children,
  className,
  onClick,
  type = "button",
  disabled,
}: ButtonProps) {
  const styles = cn(
    "group motion-safe:inline-flex items-center justify-center gap-2.5 font-medium transition-colors duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] motion-safe:active:scale-[0.98]",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-void",
    variant === "primary" &&
      "border border-accent/40 bg-accent text-void hover:bg-accent-bright",
    variant === "ghost" && "text-muted hover:text-foreground",
    variant === "outline" &&
      "border border-border-bright bg-transparent text-foreground hover:border-accent/40 hover:text-accent",
    size === "sm" && "h-9 px-4 text-xs",
    size === "default" && "h-11 px-5 text-sm",
    size === "lg" && "h-12 px-6 text-sm",
    className,
  );

  const iconWrap = trailingIcon ? (
    <span className="flex h-6 w-6 shrink-0 items-center justify-center border border-void/20 bg-void/10 transition-transform duration-500 group-hover:-translate-x-0.5">
      {trailingIcon}
    </span>
  ) : null;

  const content = (
    <>
      {iconWrap}
      <span>{children}</span>
    </>
  );

  if (href) {
    if (external) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={styles}
          onClick={onClick}
        >
          {content}
        </a>
      );
    }
    return (
      <Link href={href} className={styles} onClick={onClick}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      disabled={disabled}
      className={cn(styles, disabled && "pointer-events-none opacity-60")}
      onClick={onClick}
    >
      {content}
    </button>
  );
}
