import Link from "next/link";
import { Suspense } from "react";

import { ThemeToggle } from "@/components/theme-toggle";
import { getCurrentUser } from "@/lib/session";

const sections = [
  { href: "#goods", label: "Goods" },
  { href: "#departments", label: "Departments" },
];

const navLinkClass =
  "inline-flex h-11 items-center px-2 font-mono text-eyebrow uppercase tracking-label transition-colors hover:text-brand sm:px-3";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-1 px-4 py-2 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="order-1 inline-flex h-11 shrink-0 items-center font-display text-lg uppercase leading-none tracking-display sm:text-xl"
        >
          Best<span className="text-brand">Shop</span>
        </Link>

        <nav
          aria-label="On this page"
          className="order-3 flex w-full items-center gap-1 border-t border-border pt-1 sm:order-2 sm:w-auto sm:border-t-0 sm:pt-0"
        >
          {sections.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className={navLinkClass}
            >
              {section.label}
            </Link>
          ))}
          <Link href="#delivery" className={`${navLinkClass} hidden lg:inline-flex`}>
            Delivery
          </Link>
        </nav>

        <nav
          aria-label="Account and cart"
          className="order-2 ml-auto flex items-center gap-1 sm:order-3"
        >
          <Suspense fallback={<AccountLinkFallback />}>
            <AccountLink />
          </Suspense>
          <Link href="/cart" className={navLinkClass}>
            Cart
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}

async function AccountLink() {
  const user = await getCurrentUser();

  return (
    <Link href={user ? "/account" : "/login"} className={navLinkClass}>
      {user ? "Account" : "Login"}
    </Link>
  );
}

function AccountLinkFallback() {
  return (
    <span
      role="status"
      aria-busy="true"
      className="inline-flex h-11 min-w-16 animate-pulse items-center justify-center bg-surface px-2"
    >
      <span className="sr-only">Loading account link</span>
    </span>
  );
}
