"use client";

import { useRouter } from "next/navigation";

interface RetryButtonProps {
  label?: string;
}

export function RetryButton({ label = "Retry live read" }: RetryButtonProps) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.refresh()}
      className="inline-flex min-h-11 items-center rounded-full border border-border px-5 font-mono text-eyebrow uppercase tracking-label transition-colors hover:border-foreground hover:bg-foreground hover:text-background"
    >
      {label}
    </button>
  );
}
