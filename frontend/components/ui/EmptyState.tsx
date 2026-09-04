import { Button } from "./Button";

type EmptyStateProps = {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({ title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="rounded-lg border border-dashed border-[var(--line)] bg-[var(--surface)] px-4 py-10 text-center sm:px-6 sm:py-12">
      <p className="font-medium text-[var(--ink)]">{title}</p>
      {description ? (
        <p className="mx-auto mt-1 max-w-md text-sm text-[var(--muted)]">{description}</p>
      ) : null}
      {actionLabel && onAction ? (
        <Button type="button" className="mt-4" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
