"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { motion, type HTMLMotionProps } from "framer-motion";

const variants = {
  default:
    "bg-keyra-violet/10 dark:bg-keyra-violet/10 text-indigo-600 dark:text-keyra-violet border-indigo-200 dark:border-keyra-violet/20",
  success:
    "bg-emerald-50 dark:bg-keyra-mint/10 text-emerald-600 dark:text-keyra-mint border-emerald-200 dark:border-keyra-mint/20",
  warning:
    "bg-amber-50 dark:bg-yellow-500/10 text-amber-600 dark:text-yellow-400 border-amber-200 dark:border-yellow-500/20",
  danger:
    "bg-rose-50 dark:bg-keyra-red/10 text-rose-600 dark:text-keyra-red border-rose-200 dark:border-keyra-red/20",
  cyan:
    "bg-cyan-50 dark:bg-keyra-cyan/10 text-cyan-600 dark:text-keyra-cyan border-cyan-200 dark:border-keyra-cyan/20",
  slate:
    "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-keyra-text/60 border-slate-200 dark:border-white/10",
};

interface BadgeProps extends HTMLMotionProps<"span"> {
  variant?: keyof typeof variants;
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <motion.span
      whileHover={{ scale: 1.05 }}
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors cursor-default",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
