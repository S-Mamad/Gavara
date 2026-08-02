import { forwardRef, type SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className, id, ...props }, ref) => {
    const selectId = id ?? props.name;

    return (
      <div className="flex flex-col gap-2">
        <label htmlFor={selectId} className="text-[13px] text-muted">
          {label}
        </label>
        <select
          ref={ref}
          id={selectId}
          className={cn(
            "h-12 rounded-xl border border-border/80 bg-void/60 px-4 text-sm text-foreground transition-colors focus:border-accent/45 focus:outline-none focus:ring-2 focus:ring-accent/15",
            error && "border-signal/50",
            className,
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value || "empty"} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error ? <p className="text-xs text-signal">{error}</p> : null}
      </div>
    );
  },
);

Select.displayName = "Select";
