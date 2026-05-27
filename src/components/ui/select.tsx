"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: { value: string; label: string }[]
  placeholder?: string
}

function Select({ className, options, placeholder, ...props }: SelectProps) {
  return (
    <select
      className={cn(
        "flex h-10 w-full rounded-lg border border-slate-200 dark:border-white/5 bg-white dark:bg-keyra-navy px-3 py-2 text-sm text-slate-900 dark:text-white focus:border-keyra-violet/60 focus:ring-2 focus:ring-keyra-violet/20 focus:outline-none transition-all duration-200",
        className
      )}
      {...props}
    >
      {placeholder && (
        <option value="" className="bg-white dark:bg-keyra-navy text-slate-900 dark:text-white">
          {placeholder}
        </option>
      )}
      {options.map((opt) => (
        <option
          key={opt.value}
          value={opt.value}
          className="bg-white dark:bg-keyra-navy text-slate-900 dark:text-white"
        >
          {opt.label}
        </option>
      ))}
    </select>
  );
}

export { Select };
