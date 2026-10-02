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
      <div className="group/field flex flex-col gap-2">
        <label
          htmlFor={inputId}
          className="text-[12px] text-dim transition-colors group-focus-within/field:text-accent sm:text-[13px]"
        >
          {label}
        </label>
        <input
          ref={ref}
          className={cn(
            "h-12 rounded-2xl border border-accent/12 bg-gradient-to-b from-white/[0.04] to-transparent px-4 text-sm text-foreground shadow-[inset_0_1px_0_rgba(225,224,204,0.04)] outline-none transition-all duration-300",
            "placeholder:text-dim/55",
            "hover:border-accent/22",
            "focus:border-accent/45 focus:from-accent/[0.06] focus:shadow-[0_0_0_3px_rgba(222,219,200,0.08),inset_0_1px_0_rgba(225,224,204,0.06)]",
            error &&
              "border-signal/45 focus:border-signal/60 focus:shadow-[0_0_0_3px_rgba(232,93,93,0.12)]",
            className,
          )}
          {...props}
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${inputId}-error` : undefined}
        />
        {error ? (
          <p id={`${inputId}-error`} className="text-xs text-signal" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    );
  },
);

Input.displayName = "Input";
