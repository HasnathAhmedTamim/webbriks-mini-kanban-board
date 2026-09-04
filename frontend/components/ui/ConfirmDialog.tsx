"use client";

import { Modal } from "./Modal";
import { Button } from "./Button";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  loadingText?: string;
  confirmVariant?: "primary" | "danger";
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Delete",
  loadingText = "Deleting…",
  confirmVariant = "danger",
  loading,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      title={title}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" type="button" className="w-full sm:w-auto" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant={confirmVariant}
            type="button"
            className="w-full sm:w-auto"
            loading={loading}
            loadingText={loadingText}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-sm text-[var(--muted)]">{description}</p>
    </Modal>
  );
}
