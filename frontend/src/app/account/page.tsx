import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { LogoutForm } from "@/components/auth/logout-form";
import { getCurrentUser } from "@/lib/session";

export const metadata: Metadata = { title: "Your account" };

export default function AccountPage() {
  return (
    <main id="main" className="mx-auto w-full max-w-3xl px-4 py-14 sm:px-8 lg:py-20">
      <Suspense
        fallback={
          <p className="text-sm text-muted-foreground">
            Loading your account…
          </p>
        }
      >
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
      <div className="space-y-2 border-b-2 border-sign pb-6">
        <h1 className="font-display text-[clamp(2rem,4vw,3rem)] uppercase leading-[1.05] tracking-display">
          Hello, {user.name.split(" ")[0]}
        </h1>
        <p className="text-sm text-muted-foreground">
          Your account details live here.
        </p>
      </div>

      <section className="rounded-4xl bg-card p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-5">
          <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-bulb font-display text-2xl tracking-display text-bulb-foreground">
            {initial}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="truncate font-mono text-product font-bold">{user.name}</h2>
            <p className="truncate text-sm text-muted-foreground">
              {user.email}
            </p>
          </div>
          <span className="bg-surface px-3 py-1.5 font-mono text-eyebrow font-bold uppercase tracking-label">
            {user.role}
          </span>
        </div>

        <dl className="mt-8 grid gap-6 pt-6 sm:grid-cols-2">
          <div>
            <dt className="font-mono text-eyebrow font-medium uppercase tracking-label text-muted-foreground">
              Member since
            </dt>
            <dd className="mt-1 font-mono text-sm font-bold">
              {user.createdAt?.slice(0, 10) ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="font-mono text-eyebrow font-medium uppercase tracking-label text-muted-foreground">
              Account status
            </dt>
            <dd className="mt-1 font-mono text-sm font-bold">
              {user.isActive ? "Active" : "Inactive"}
            </dd>
          </div>
        </dl>

        <div className="mt-8 flex flex-wrap gap-3">
          <LogoutForm />
          <Link
            href="/orders"
            className="inline-flex min-h-12 items-center justify-center border-2 border-sign px-6 font-mono text-eyebrow font-bold uppercase tracking-label transition-colors hover:bg-sign hover:text-sign-foreground"
          >
            View your orders
          </Link>
          {user.role === "admin" ? (
            <Link
              href="/admin"
              className="inline-flex min-h-12 items-center justify-center border-2 border-sign px-6 font-mono text-eyebrow font-bold uppercase tracking-label transition-colors hover:bg-sign hover:text-sign-foreground"
            >
              Admin dashboard
            </Link>
          ) : null}
        </div>
      </section>
    </div>
  );
}
