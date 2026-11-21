export function AuthFormFallback() {
  return (
    <div className="space-y-5" aria-hidden="true">
      <div className="space-y-2">
        <div className="h-3 w-24 animate-pulse bg-surface-accent" />
        <div className="h-8 w-3/4 animate-pulse bg-surface-accent" />
        <div className="h-4 w-2/3 animate-pulse bg-surface-accent" />
      </div>
      <div className="h-11 animate-pulse rounded-2xl border border-border/60 bg-surface-accent" />
      <div className="h-11 animate-pulse rounded-2xl border border-border/60 bg-surface-accent" />
      <div className="h-12 animate-pulse rounded-2xl border border-border/60 bg-surface-accent" />
    </div>
  );
}
