import Link from "next/link";
import { Button } from "@/components/ui/Button";

type StatusPageProps = {
  code?: string;
  title: string;
  description: string;
  primaryHref?: string;
  primaryLabel?: string;
  onPrimary?: () => void;
  secondaryHref?: string;
  secondaryLabel?: string;
};

export function StatusPage({
  code,
  title,
  description,
  primaryHref = "/boards",
  primaryLabel = "Back to boards",
  onPrimary,
  secondaryHref,
  secondaryLabel,
}: StatusPageProps) {
  return (
    <main className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-md text-center">
        {code ? (
          <p className="text-sm font-medium tracking-wide text-[var(--accent)]">{code}</p>
        ) : null}
        <h1 className="mt-2 text-2xl font-semibold text-[var(--ink)]">{title}</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">{description}</p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {onPrimary ? (
            <Button type="button" onClick={onPrimary}>
              {primaryLabel}
            </Button>
          ) : (
            <Link
              href={primaryHref}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-[var(--accent)] px-3.5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-[var(--accent-hover)]"
            >
              {primaryLabel}
            </Link>
          )}
          {secondaryHref && secondaryLabel ? (
            <Link
              href={secondaryHref}
              className="text-sm text-[var(--accent)] hover:underline"
            >
              {secondaryLabel}
            </Link>
          ) : null}
        </div>
      </div>
    </main>
  );
}
