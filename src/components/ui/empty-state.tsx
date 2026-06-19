import { cn } from "@/lib/utils";
import { Button } from "./button";
import Link from "next/link";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  className?: string;
}

/**
 * Empty state component per DESIGN.md Section 6.3.
 * Centered icon + text + optional CTA button.
 */
export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 text-center",
        className
      )}
    >
      {icon && (
        <div className="w-16 h-16 rounded-full bg-surface-hover flex items-center justify-center mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-slate-100 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm">{description}</p>
      {actionLabel && actionHref && (
        <Link href={actionHref} className="mt-4">
          <Button size="md">{actionLabel}</Button>
        </Link>
      )}
    </div>
  );
}
