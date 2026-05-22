"use client";

import * as React from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "./button";
import { AlertCircle } from "lucide-react";

interface ConfirmationDialogProps {
  title: string;
  description: string;
  onConfirm: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
}

export function ConfirmationDialog({
  title,
  description,
  onConfirm,
  open,
  onOpenChange,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default",
}: ConfirmationDialogProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm data-[open]:animate-in data-[open]:fade-in-0 data-[closed]:animate-out data-[closed]:fade-out-0" />
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <DialogPrimitive.Popup className="w-full max-w-md card-rounded bg-card p-6 shadow-2xl border border-border animate-in fade-in zoom-in-95 duration-200 outline-none">
            <div className="flex items-start gap-4">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                variant === "destructive" ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"
              )}>
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <DialogPrimitive.Title className="text-lg font-black tracking-tight">{title}</DialogPrimitive.Title>
                <DialogPrimitive.Description className="text-sm text-muted-foreground font-medium">
                  {description}
                </DialogPrimitive.Description>
              </div>
            </div>
            
            <div className="mt-8 flex justify-end gap-3">
              <DialogPrimitive.Close className={cn(buttonVariants({ variant: "outline" }), "font-bold rounded-xl cursor-pointer")}>
                {cancelText}
              </DialogPrimitive.Close>
              <Button 
                variant={variant === "destructive" ? "destructive" : "default"} 
                className="font-bold rounded-xl px-6"
                onClick={() => {
                  onConfirm();
                  onOpenChange(false);
                }}
              >
                {confirmText}
              </Button>
            </div>
          </DialogPrimitive.Popup>
        </div>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
