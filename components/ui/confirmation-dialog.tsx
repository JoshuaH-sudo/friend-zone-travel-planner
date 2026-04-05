"use client";

import { useState } from "react";
import type { ReactElement, ReactNode } from "react";
import type { VariantProps } from "class-variance-authority";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { buttonVariants } from "@/components/ui/button";

type ConfirmationDialogProps = {
  trigger: ReactElement;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  confirmLabel?: ReactNode;
  cancelLabel?: ReactNode;
  onConfirm: () => void | Promise<void>;
  size?: "default" | "sm";
  confirmVariant?: VariantProps<typeof buttonVariants>["variant"];
  cancelVariant?: VariantProps<typeof buttonVariants>["variant"];
  disabled?: boolean;
};

export function ConfirmationDialog({
  trigger,
  title,
  description,
  children,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  size = "default",
  confirmVariant = "destructive",
  cancelVariant = "outline",
  disabled = false,
}: ConfirmationDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    try {
      setIsSubmitting(true);
      await onConfirm();
      setOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger render={trigger} disabled={disabled} />
      <AlertDialogContent size={size}>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description ? (
            <AlertDialogDescription>{description}</AlertDialogDescription>
          ) : null}
        </AlertDialogHeader>
        {children}
        <AlertDialogFooter>
          <AlertDialogCancel
            variant={cancelVariant}
            disabled={isSubmitting}
          >
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            variant={confirmVariant}
            onClick={handleConfirm}
            disabled={isSubmitting || disabled}
          >
            {isSubmitting ? "Working..." : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}