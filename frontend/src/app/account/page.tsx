import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { LogoutForm } from "@/components/auth/logout-form";
import { getCurrentUser } from "@/lib/session";

export const metadata: Metadata = { title: "Your account" };

export default function AccountPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-16 sm:px-10">
      <Suspense fallback={<p className="text-sm text-muted-foreground">Loading your account…</p>}>
        <AccountContent />
      </Suspense>
    </main>
  );
}

async function AccountContent() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/account");

  const initial = user.name.trim().charAt(0).toUpperCase() || "B";

  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <p className="text-eyebrow font-medium uppercase text-brand">
          Your space
        </p>
        <h1 className="font-heading text-display tracking-display">
          Hello, {user.name.split(" ")[0]}
        </h1>
        <p className="text-sm text-muted-foreground">
          Your details and order activity live here.
        </p>
      </div>

      <section className="rounded-2xl border border-border bg-card p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-5">
          <div className="flex size-16 shrink-0 items-center justify-center rounded-pill bg-surface font-heading text-2xl text-foreground">
            {initial}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-lg font-medium">{user.name}</h2>
            <p className="truncate text-sm text-muted-foreground">{user.email}</p>
          </div>
          <span className="rounded-pill bg-surface px-3 py-1.5 text-eyebrow font-medium uppercase tracking-label text-muted-foreground">
            {user.role}
          </span>
        </div>

        <dl className="mt-8 grid gap-6 border-t border-border pt-6 sm:grid-cols-2">
          <div>
            <dt className="text-eyebrow uppercase tracking-label text-subtle">
              Member since
            </dt>
            <dd className="mt-1 font-mono text-sm">
              {user.createdAt?.slice(0, 10) ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-eyebrow uppercase tracking-label text-subtle">
              Account status
            </dt>
            <dd className="mt-1 font-mono text-sm">
              {user.isActive ? "Active" : "Inactive"}
            </dd>
          </div>
        </dl>

        <div className="mt-8 flex flex-wrap gap-3">
          <LogoutForm />
        </div>
      </section>
    </div>
  );
}
