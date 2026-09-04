import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  loading?: boolean;
};

const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] disabled:opacity-50",
  secondary:
    "bg-[var(--surface)] text-[var(--ink)] border border-[var(--line)] hover:bg-[var(--canvas)]",
  danger: "bg-[var(--danger)] text-white hover:opacity-90",
  ghost: "bg-transparent text-[var(--muted)] hover:bg-[var(--canvas)] hover:text-[var(--ink)]",
};

export function Button({
  className,
  variant = "primary",
  loading,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-lg px-3.5 py-2 text-sm font-medium transition disabled:cursor-not-allowed",
        variants[variant],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? "Just a moment…" : children}
    </button>
  );
}
