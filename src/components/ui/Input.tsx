import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const inputId = id ?? props.name;

    return (
      <div className="flex flex-col gap-2">
        <label htmlFor={inputId} className="text-[13px] text-muted">
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "h-12 rounded-xl border border-border/80 bg-void/60 px-4 text-sm text-foreground transition-colors placeholder:text-dim/80 focus:border-accent/45 focus:outline-none focus:ring-2 focus:ring-accent/15",
            error && "border-signal/50",
            className,
          )}
          {...props}
        />
        {error ? <p className="text-xs text-signal">{error}</p> : null}
      </div>
    );
  },
);

Input.displayName = "Input";
