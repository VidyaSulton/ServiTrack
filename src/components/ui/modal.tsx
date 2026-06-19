"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  maxWidth?: "sm" | "md" | "lg";
}

const maxWidthStyles = {
  sm: "max-w-[480px]",
  md: "max-w-[640px]",
  lg: "max-w-[800px]",
};

/**
 * Modal / Dialog component following DESIGN.md Section 5.6.
 * Features: overlay blur, scale animation, click-outside-to-close, escape key.
 */
export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = "sm",
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div
        ref={modalRef}
        className={cn(
          "relative w-full bg-surface-card border border-outline rounded-lg p-6",
          "animate-modal-in",
          maxWidthStyles[maxWidth]
        )}
      >
        <h3 className="text-[1.125rem] font-semibold text-slate-100">
          {title}
        </h3>
        {description && (
          <p className="text-sm text-slate-400 mt-1">{description}</p>
        )}
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}

/**
 * Confirm Delete Modal — pre-styled danger modal per DESIGN.md.
 */
interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  isLoading?: boolean;
}

export function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  isLoading = false,
}: ConfirmDeleteModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" maxWidth="sm">
      <div className="text-center">
        {/* Danger Icon */}
        <div className="mx-auto w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center mb-4">
          <svg
            className="w-6 h-6 text-rose-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <h3 className="text-[1.125rem] font-bold text-slate-100">{title}</h3>
        <p className="text-sm text-slate-400 mt-2">{description}</p>

        {/* Actions */}
        <div className="flex items-center justify-center gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-5 h-10 text-sm font-medium text-slate-400 border border-outline rounded-sm hover:bg-surface-hover hover:text-slate-100 transition-all duration-150 cursor-pointer disabled:opacity-50"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-5 h-10 text-sm font-medium text-surface bg-rose-500 rounded-sm hover:bg-rose-600 transition-all duration-150 cursor-pointer disabled:opacity-50 inline-flex items-center gap-2"
          >
            {isLoading && (
              <svg
                className="animate-spin h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            Hapus
          </button>
        </div>
      </div>
    </Modal>
  );
}
