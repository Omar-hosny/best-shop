import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main
      id="main"
      className="mx-auto grid w-full max-w-[1280px] items-center gap-10 px-4 py-12 sm:px-8 lg:min-h-[calc(100vh-9rem)] lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:py-16"
    >
      <section className="relative hidden min-h-[540px] flex-col justify-between rounded-4xl bg-surface p-10 lg:flex lg:p-12">
        <div className="bulb-string" aria-hidden="true">
          {[0, 1, 2, 3, 4, 5].map((bulb) => (
            <span
              key={bulb}
              className="bulb"
              style={{ animationDelay: `${bulb * 110}ms` }}
            />
          ))}
        </div>

        <span className="font-display text-2xl uppercase leading-none tracking-display">
          Best Shop
        </span>

        <div className="max-w-md">
          <h2 className="font-display text-[clamp(2rem,3.4vw,3.25rem)] uppercase leading-[1.08] tracking-display text-balance">
            Good things,
            <br />
            paid on arrival.
          </h2>
          <p className="mt-6 max-w-sm text-sm leading-7 text-muted-foreground">
            Read the live catalog, check plain prices and stock, and pay cash
            when your order arrives.
          </p>
        </div>

        <p className="pt-4 font-mono text-eyebrow font-medium uppercase tracking-label">
          $7.99 standard delivery
        </p>
      </section>

      <section className="w-full">
        <div className="mx-auto w-full max-w-[420px]">{children}</div>
      </section>
    </main>
  );
}
