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
      className="inline-flex min-h-11 items-center bg-surface px-5 font-mono text-eyebrow font-bold uppercase tracking-label transition-colors hover:bg-surface-accent hover:text-brand"
    >
      {label}
    </button>
  );
}
