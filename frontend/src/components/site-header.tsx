import Link from "next/link";
import { ShoppingBag } from "lucide-react";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

// Server Component shell. Step 4 adds the category nav here, Step 8 swaps the
// auth links for session state, and Step 9 adds the live cart badge.
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            Best<span className="text-muted-foreground">Shop</span>
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
              <ShoppingBag className="size-4" />
              <span className="hidden sm:inline">Cart</span>
            </Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/register">Register</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
