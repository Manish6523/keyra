"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";

export default function DashboardTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ref.current,
        {
          opacity: 0,
          y: 16,
          filter: "blur(6px)",
        },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.45,
          ease: "power3.out",
        }
      );
    }, ref);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={ref} className="w-full h-full">
      {children}
    </div>
  );
}
