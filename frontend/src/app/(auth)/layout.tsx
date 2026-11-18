import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="mx-auto grid w-full max-w-[1280px] items-center gap-10 px-6 py-12 sm:px-10 lg:min-h-[calc(100vh-9rem)] lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:py-16">
      <section className="relative hidden min-h-[540px] overflow-hidden rounded-2xl bg-surface p-12 lg:flex lg:flex-col lg:justify-between">
        <div
          className="concentric-rings pointer-events-none absolute inset-0 opacity-50"
          aria-hidden="true"
        />
        <div className="pointer-events-none absolute -right-24 -bottom-24 size-96 rounded-full bg-brand/10 blur-3xl" aria-hidden="true" />

        <div className="relative">
          <span className="font-heading text-2xl tracking-display">
            Best<span className="text-brand">Shop</span>
          </span>
        </div>

        <div className="relative max-w-md">
          <p className="text-eyebrow font-medium uppercase text-subtle">
            Considered goods, everyday
          </p>
          <h2 className="mt-4 font-heading text-display leading-[1.05] text-balance">
            Good things, thoughtfully chosen.
          </h2>
          <p className="mt-6 max-w-sm text-sm leading-relaxed text-muted-foreground">
            A quieter kind of storefront. Browse the collection, keep what you
            love close, and check out whenever you are ready.
          </p>
        </div>

        <p className="relative text-eyebrow uppercase tracking-label text-subtle">
          Free shipping over $100
        </p>
      </section>

      <section className="w-full">
        <div className="mx-auto w-full max-w-[420px]">{children}</div>
      </section>
    </main>
  );
}
