"use client";

import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useActionState, useState } from "react";

import { registerAction } from "@/app/actions/auth.actions";
import { FormField } from "@/components/auth/form-field";
import { PasswordChecklist } from "@/components/auth/password-checklist";
import { SubmitButton } from "@/components/auth/submit-button";
import { initialAuthState } from "@/lib/auth-state";

export function RegisterForm({ next }: { next: string }) {
  const [state, formAction] = useActionState(registerAction, initialAuthState);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const loginHref = `/login?next=${encodeURIComponent(next)}`;

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="next" value={next} />

      <div className="space-y-1.5">
        <p className="text-eyebrow font-medium uppercase text-brand">
          Join Best Shop
        </p>
        <h1 className="font-heading text-section tracking-display">
          Create your account
        </h1>
        <p className="text-sm text-muted-foreground">
          A few details and you are ready to browse.
        </p>
      </div>

      {state.message ? (
        <p
          role="alert"
          className="rounded-lg border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          {state.message}
        </p>
      ) : null}

      <FormField
        name="name"
        label="Full name"
        type="text"
        autoComplete="name"
        placeholder="Ada Lovelace"
        required
        minLength={2}
        maxLength={50}
        defaultValue={state.values.name ?? ""}
        error={state.fieldErrors.name}
      />

      <FormField
        name="email"
        label="Email address"
        type="email"
        autoComplete="email"
        inputMode="email"
        placeholder="you@example.com"
        required
        maxLength={254}
        defaultValue={state.values.email ?? ""}
        error={state.fieldErrors.email}
      />

      <div className="relative space-y-2">
        <FormField
          name="password"
          label="Password"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          placeholder="Create a strong password"
          required
          maxLength={72}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={state.fieldErrors.password}
          className="pr-12"
        />
        <button
          type="button"
          onClick={() => setShowPassword((shown) => !shown)}
          aria-label={showPassword ? "Hide password" : "Show password"}
          className="absolute top-[2.25rem] right-1 rounded-pill p-1.5 text-subtle transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {showPassword ? (
            <EyeOff className="size-4 stroke-[1.5]" aria-hidden="true" />
          ) : (
            <Eye className="size-4 stroke-[1.5]" aria-hidden="true" />
          )}
        </button>
        <PasswordChecklist value={password} />
      </div>

      <FormField
        name="confirmPassword"
        label="Confirm password"
        type={showPassword ? "text" : "password"}
        autoComplete="new-password"
        placeholder="Repeat your password"
        required
        maxLength={72}
        error={state.fieldErrors.confirmPassword}
      />

      <SubmitButton
        label="Create account"
        pendingLabel="Creating account…"
        className="w-full"
      />

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href={loginHref}
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
