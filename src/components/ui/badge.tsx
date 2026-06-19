import { cn } from "@/lib/utils";

type BadgeVariant = "success" | "warning" | "info" | "danger" | "default";

const variantStyles: Record<BadgeVariant, string> = {
  success: "bg-emerald-500/10 text-emerald-500",
  warning: "bg-amber-500/10 text-amber-500",
  info: "bg-sky-400/10 text-sky-400",
  danger: "bg-rose-500/10 text-rose-500",
  default: "bg-slate-500/10 text-slate-400",
};

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

/**
 * Status Badge component per DESIGN.md Section 5.5.
 * Pill shape with subtle background tint.
 */
export function Badge({
  variant = "default",
  children,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
