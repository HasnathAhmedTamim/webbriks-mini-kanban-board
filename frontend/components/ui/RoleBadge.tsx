import { cn } from "@/lib/utils";

type RoleBadgeProps = {
  role: "OWNER" | "MEMBER" | "SHARED";
  className?: string;
};

const LABELS = {
  OWNER: "Owner",
  MEMBER: "Member",
  SHARED: "Shared with you",
} as const;

export function RoleBadge({ role, className }: RoleBadgeProps) {
  const isOwner = role === "OWNER";
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-md px-2 py-0.5 text-xs font-medium",
        isOwner
          ? "bg-[var(--accent-soft)] text-[var(--accent)]"
          : "bg-[var(--canvas)] text-[var(--muted)] ring-1 ring-[var(--line)]",
        className
      )}
    >
      {LABELS[role]}
    </span>
  );
}
