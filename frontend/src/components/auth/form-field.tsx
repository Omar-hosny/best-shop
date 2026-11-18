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
        className="block text-sm font-medium tracking-[-0.01em]"
      >
        {label}
      </label>
      <input
        id={inputId}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={cn(
          "h-11 w-full rounded-pill border border-input bg-background px-5 text-sm outline-none transition-colors placeholder:text-subtle focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/20",
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
