"use client";

import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import * as React from "react";
import { cn } from "@/lib/utils";

interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  radius?: number;
  color?: string;
  children: React.ReactNode;
}

export function SpotlightCard({
  radius = 300,
  color = "rgba(124, 92, 252, 0.12)",
  children,
  className,
  ...props
}: SpotlightCardProps) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  const background = useMotionTemplate`
    radial-gradient(
      ${radius}px circle at ${mouseX}px ${mouseY}px,
      ${color},
      transparent 80%
    )
  `;

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border border-slate-200/60 dark:border-white/[0.06] bg-white/70 dark:bg-white/[0.02] backdrop-blur-xl backdrop-saturate-150 shadow-md transition-all duration-300",
        className
      )}
      onMouseMove={handleMouseMove}
      {...props}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition duration-300 group-hover:opacity-100"
        style={{ background }}
      />
      <div className="relative z-10 w-full h-full">{children}</div>
    </div>
  );
}
