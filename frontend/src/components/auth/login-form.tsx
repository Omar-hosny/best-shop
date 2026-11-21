"use client";

import Link from "next/link";
import { useActionState } from "react";

import { loginAction } from "@/app/actions/auth.actions";
import { FormField } from "@/components/auth/form-field";
import { SubmitButton } from "@/components/auth/submit-button";
import { initialAuthState } from "@/lib/auth-state";

export function LoginForm({ next }: { next: string }) {
  const [state, formAction] = useActionState(loginAction, initialAuthState);
  const registerHref = `/register?next=${encodeURIComponent(next)}`;

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="next" value={next} />

      <div className="space-y-2 border-b-2 border-sign pb-5">
        <h1 className="font-display text-[clamp(1.75rem,3vw,2.25rem)] uppercase leading-[1.08] tracking-display">
          Sign in
        </h1>
        <p className="text-sm text-muted-foreground">
          Sign in to view your account details.
        </p>
      </div>

      {state.message ? (
        <p
          role="alert"
          className="rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {state.message}
        </p>
      ) : null}

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

      <FormField
        name="password"
        label="Password"
        type="password"
        autoComplete="current-password"
        placeholder="Your password"
        required
        error={state.fieldErrors.password}
      />

      <SubmitButton
        label="Sign in"
        pendingLabel="Signing in…"
        className="w-full"
      />

      <p className="text-center text-sm text-muted-foreground">
        New to Best Shop?{" "}
        <Link
          href={registerHref}
          className="font-bold text-brand underline-offset-4 hover:underline"
        >
          Create an account
        </Link>
      </p>
    </form>
  );
}
