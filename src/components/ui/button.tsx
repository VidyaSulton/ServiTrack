"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/**
 * Button variant styles per DESIGN.md Section 5.1.
 */
const variantStyles = {
  primary:
    "bg-primary text-surface hover:bg-primary-hover focus:ring-2 focus:ring-primary/20",
  secondary:
    "bg-transparent text-slate-400 border border-outline hover:bg-surface-hover hover:text-slate-100",
  danger:
    "bg-transparent text-rose-500 border border-rose-500/20 hover:bg-rose-500 hover:text-surface",
  ghost:
    "bg-transparent text-slate-400 hover:bg-surface-hover hover:text-slate-100",
};

const sizeStyles = {
  sm: "h-9 px-3 text-xs",
  md: "h-10 px-5 text-sm",
  lg: "h-12 px-6 text-sm",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variantStyles;
  size?: keyof typeof sizeStyles;
  isLoading?: boolean;
}

/**
 * Reusable Button component with multiple variants and sizes.
 * Follows DESIGN.md button specifications exactly.
 */
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-sm font-medium transition-all duration-150 ease-in-out cursor-pointer",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
export type { ButtonProps };
