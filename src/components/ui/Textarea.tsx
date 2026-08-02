import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const inputId = id ?? props.name;

    return (
      <div className="flex flex-col gap-2">
        <label htmlFor={inputId} className="text-[13px] text-muted">
          {label}
        </label>
        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            "min-h-[132px] resize-y rounded-xl border border-border/80 bg-void/60 px-4 py-3 text-sm leading-relaxed text-foreground transition-colors placeholder:text-dim/80 focus:border-accent/45 focus:outline-none focus:ring-2 focus:ring-accent/15",
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

Textarea.displayName = "Textarea";
