"use client";

import { useState, useEffect, useCallback, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

const typeStyles: Record<ToastType, string> = {
  success: "border-l-emerald-500",
  error: "border-l-rose-500",
  warning: "border-l-amber-500",
  info: "border-l-sky-400",
};

const typeIcons: Record<ToastType, ReactNode> = {
  success: (
    <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  ),
  error: (
    <svg className="w-5 h-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  warning: (
    <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
    </svg>
  ),
  info: (
    <svg className="w-5 h-5 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

// Global toast state with subscriber pattern
let toasts: Toast[] = [];
let listeners: Array<() => void> = [];

function emitChange() {
  listeners.forEach((listener) => listener());
}

/**
 * Show a toast notification.
 * Can be called from anywhere (not just React components).
 */
export function showToast(type: ToastType, title: string, message?: string) {
  const id = Math.random().toString(36).substring(2, 9);
  toasts = [...toasts, { id, type, title, message }];
  emitChange();

  // Auto-dismiss after 4 seconds
  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id);
    emitChange();
  }, 4000);
}

/**
 * Toast container component — renders in top-right corner.
 * Place this once in the root layout.
 * Follows DESIGN.md Section 5.7 specs.
 */
export function ToastContainer() {
  const [currentToasts, setCurrentToasts] = useState<Toast[]>([]);

  const handleChange = useCallback(() => {
    setCurrentToasts([...toasts]);
  }, []);

  useEffect(() => {
    listeners.push(handleChange);
    return () => {
      listeners = listeners.filter((l) => l !== handleChange);
    };
  }, [handleChange]);

  if (currentToasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-[380px]">
      {currentToasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "bg-surface-card border border-outline rounded-md border-l-[3px] px-4 py-3",
            "animate-slide-in-right shadow-lg",
            typeStyles[toast.type]
          )}
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">{typeIcons[toast.type]}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-100">{toast.title}</p>
              {toast.message && (
                <p className="text-xs text-slate-400 mt-0.5">{toast.message}</p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
