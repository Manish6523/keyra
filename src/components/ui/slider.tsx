"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SliderProps {
  min: number;
  max: number;
  step?: number;
  value: number[];
  onValueChange: (value: number[]) => void;
  className?: string;
}

export function Slider({
  min,
  max,
  step = 1,
  value,
  onValueChange,
  className,
}: SliderProps) {
  const val = value[0];

  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={val}
      onChange={(e) => onValueChange([parseInt(e.target.value, 10)])}
      className={cn(
        "w-full h-1.5 rounded-lg appearance-none bg-slate-200 dark:bg-white/10 accent-indigo-600 dark:accent-keyra-violet cursor-pointer outline-none focus:outline-none",
        className
      )}
    />
  );
}
