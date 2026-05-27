"use client";

import { useEffect, useRef } from "react";
import { animate, useInView } from "framer-motion";

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  className?: string;
}

export function AnimatedCounter({
  value,
  duration = 1.2,
  className,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!isInView || hasAnimated.current) return;

    const node = ref.current;
    if (!node) return;

    hasAnimated.current = true;

    const controls = animate(0, value, {
      duration,
      ease: "easeOut",
      onUpdate(latest) {
        node.textContent = Math.floor(latest).toLocaleString();
      },
    });

    return () => controls.stop();
  }, [value, duration, isInView]);

  return (
    <span ref={ref} className={className}>
      {hasAnimated.current ? value.toLocaleString() : "0"}
    </span>
  );
}
