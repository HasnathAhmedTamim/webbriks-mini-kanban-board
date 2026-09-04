import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "dangerOutline";
  loading?: boolean;
  loadingText?: string;
};

const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] disabled:opacity-50 shadow-sm",
  secondary:
    "bg-[var(--surface)] text-[var(--ink)] border border-[var(--line)] hover:bg-[var(--canvas)] disabled:opacity-50",
  danger: "bg-[var(--danger)] text-white hover:opacity-90 disabled:opacity-50",
  dangerOutline:
    "bg-transparent text-[var(--danger)] border border-[var(--line)] hover:bg-[var(--danger-soft)] disabled:opacity-50",
  ghost: "bg-transparent text-[var(--muted)] hover:bg-[var(--canvas)] hover:text-[var(--ink)] disabled:opacity-50",
};

export function Button({
  className,
  variant = "primary",
  loading,
  loadingText = "Please wait…",
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md px-3.5 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/40 disabled:cursor-not-allowed",
        variants[variant],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? loadingText : children}
    </button>
  );
}
