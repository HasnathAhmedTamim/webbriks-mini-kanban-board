export function Loading({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex min-h-[40vh] items-center justify-center text-[var(--muted)]">
      <div className="flex items-center gap-3 rounded-lg border border-[var(--line)] bg-[var(--surface)] px-4 py-3 shadow-sm">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
        <span className="text-sm">{label}</span>
      </div>
    </div>
  );
}

export function BoardSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="h-36 animate-pulse rounded-lg border border-[var(--line)] bg-[var(--surface)] p-5"
        >
          <div className="h-4 w-2/3 rounded bg-[var(--line)]" />
          <div className="mt-4 h-3 w-1/2 rounded bg-[var(--line)]" />
          <div className="mt-2 h-3 w-1/3 rounded bg-[var(--line)]" />
        </div>
      ))}
    </div>
  );
}

export function KanbanSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-4 w-28 animate-pulse rounded bg-[var(--line)]" />
      <div className="h-8 w-48 animate-pulse rounded bg-[var(--line)]" />
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="w-full animate-pulse rounded-lg border border-[var(--line)] bg-[var(--surface)] lg:w-72"
          >
            <div className="h-12 rounded-t-lg bg-[var(--accent-soft)]" />
            <div className="space-y-2 p-3">
              <div className="h-16 rounded-lg bg-[var(--canvas)]" />
              <div className="h-16 rounded-lg bg-[var(--canvas)]" />
              <div className="h-10 rounded-lg bg-[var(--canvas)]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
