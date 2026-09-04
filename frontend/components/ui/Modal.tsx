"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

type ModalProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export function Modal({ open, title, onClose, children, footer }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button
        type="button"
        aria-label="Close dialog backdrop"
        className="absolute inset-0 bg-slate-900/40"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative z-10 flex max-h-[min(92dvh,100%)] w-full max-w-md flex-col rounded-t-2xl border border-[var(--line)] bg-[var(--surface)] shadow-sm sm:rounded-xl"
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-[var(--line)] px-4 py-4 sm:border-0 sm:px-5 sm:pb-0">
          <h2 className="text-lg font-semibold text-[var(--ink)]">{title}</h2>
          <button
            type="button"
            aria-label="Close"
            className="rounded-md p-1 text-[var(--muted)] hover:bg-[var(--canvas)] hover:text-[var(--ink)]"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5">{children}</div>
        {footer ? (
          <div className="flex shrink-0 flex-col gap-2 border-t border-[var(--line)] px-4 py-4 sm:flex-row sm:justify-end sm:px-5">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
