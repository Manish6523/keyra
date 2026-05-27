"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

function Dialog({ open, onClose, children, className }: DialogProps) {
  const dialogRef = React.useRef<HTMLDivElement>(null);
  const titleId = React.useId();

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "Tab" && dialogRef.current) {
        const focusableElements = dialogRef.current.querySelectorAll(
          'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[
          focusableElements.length - 1
        ] as HTMLElement;

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    if (open) {
      document.body.style.overflow = "hidden";
      document.addEventListener("keydown", handleKeyDown);
      // Small delay to allow render before focusing
      setTimeout(() => {
        if (dialogRef.current) {
          const focusable = dialogRef.current.querySelector(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          ) as HTMLElement;
          if (focusable) focusable.focus();
        }
      }, 50);
    } else {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop fade */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Dialog Panel Spring */}
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className={cn(
              "relative z-50 w-full max-w-lg rounded-xl border border-slate-200 dark:border-white/5 bg-white dark:bg-keyra-charcoal p-6 shadow-2xl text-slate-900 dark:text-keyra-text focus-visible:outline-none",
              className
            )}
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 text-slate-400 dark:text-keyra-text/40 hover:text-slate-900 dark:hover:text-white transition-colors"
              aria-label="Close dialog"
            >
              <X className="h-4 w-4" />
            </button>
            {React.Children.map(children, (child) => {
              if (React.isValidElement(child) && child.type === DialogHeader) {
                return React.cloneElement(
                  child as React.ReactElement<{ titleId?: string }>,
                  { titleId }
                );
              }
              return child;
            })}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function DialogHeader({
  children,
  className,
  titleId,
}: {
  children: React.ReactNode;
  className?: string;
  titleId?: string;
}) {
  return (
    <div className={cn("mb-6", className)}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child) && child.type === DialogTitle) {
          return React.cloneElement(
            child as React.ReactElement<{ id?: string }>,
            { id: titleId }
          );
        }
        return child;
      })}
    </div>
  );
}

function DialogTitle({
  children,
  className,
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <h2
      id={id}
      className={cn(
        "text-lg font-semibold text-slate-900 dark:text-white",
        className
      )}
    >
      {children}
    </h2>
  );
}

function DialogDescription({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p className={cn("mt-1 text-sm text-slate-500 dark:text-keyra-text/50", className)}>
      {children}
    </p>
  );
}

export { Dialog, DialogHeader, DialogTitle, DialogDescription };
