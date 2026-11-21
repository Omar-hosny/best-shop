"use client";

import { Moon, Sun } from "lucide-react";

const STORAGE_KEY = "best-shop-theme";

export function ThemeToggle() {
  function handleClick() {
    const root = document.documentElement;
    const next = root.classList.contains("dark") ? "light" : "dark";

    root.classList.add("theme-transition");
    root.classList.toggle("dark", next === "dark");
    root.style.colorScheme = next;

    try {
      localStorage.setItem(STORAGE_KEY, next);
      document.cookie = `${STORAGE_KEY}=${next}; path=/; max-age=31536000; samesite=lax`;
    } catch {
      // Storage can be unavailable (private mode); the class toggle still works.
    }

    window.setTimeout(() => root.classList.remove("theme-transition"), 220);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Toggle color theme"
      title="Toggle color theme"
      className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-sign-foreground/10 transition-colors hover:bg-sign-foreground/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bulb"
    >
      <Moon className="size-4.5 stroke-[1.5] dark:hidden" aria-hidden="true" />
      <Sun
        className="hidden size-4.5 stroke-[1.5] dark:block"
        aria-hidden="true"
      />
    </button>
  );
}
