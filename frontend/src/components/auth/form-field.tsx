import type { InputHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

type FormFieldProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "id" | "name"
> & {
  name: string;
  label: string;
  error?: string;
  hint?: ReactNode;
  id?: string;
};

export function FormField({
  name,
  label,
  error,
  hint,
  id,
  className,
  ...props
}: FormFieldProps) {
  const inputId = id ?? `field-${name}`;
  const errorId = `${inputId}-error`;

  return (
    <div className="space-y-2">
      <label
        htmlFor={inputId}
        className="block font-mono text-eyebrow font-bold uppercase tracking-label"
      >
        {label}
      </label>
      <input
        id={inputId}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={cn(
          "h-12 w-full rounded-2xl border border-border/60 bg-card px-4 font-mono text-sm outline-none transition-colors placeholder:text-subtle focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-ring/30",
          error && "border-destructive focus-visible:border-destructive",
          className,
        )}
        {...props}
      />
      {error ? (
        <p id={errorId} className="pl-2 text-xs text-destructive">
          {error}
        </p>
      ) : (
        hint
      )}
    </div>
  );
}
