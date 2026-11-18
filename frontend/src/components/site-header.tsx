import { ShoppingBag, UserRound } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/session";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-heading text-xl tracking-display">
            Best<span className="text-brand">Shop</span>
          </Link>
          <nav aria-label="Main" className="hidden items-center gap-1 sm:flex">
            <Button asChild variant="ghost" size="sm">
              <Link href="/products">Products</Link>
            </Button>
          </nav>
        </div>

        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Button asChild variant="ghost" size="sm">
            <Link href="/cart" className="gap-1.5">
              <ShoppingBag className="size-4 stroke-[1.5]" />
              <span className="hidden sm:inline">Cart</span>
            </Link>
          </Button>
          <Suspense fallback={<AuthLinks />}>
            <SessionLinks />
          </Suspense>
        </div>
      </div>
    </header>
  );
}

function AuthLinks() {
  return (
    <>
      <Button asChild variant="ghost" size="sm">
        <Link href="/login">Login</Link>
      </Button>
      <Button asChild size="sm">
        <Link href="/register">Register</Link>
      </Button>
    </>
  );
}

async function SessionLinks() {
  const user = await getCurrentUser();
  if (!user) return <AuthLinks />;

  return (
    <Button asChild variant="ghost" size="sm">
      <Link href="/account" className="gap-1.5">
        <UserRound className="size-4 stroke-[1.5]" />
        <span className="hidden max-w-24 truncate sm:inline">
          {user.name.split(" ")[0]}
        </span>
      </Link>
    </Button>
  );
}
