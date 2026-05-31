"use client";

import { useEffect, useRef } from "react";

export function AuroraBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Subtle parallax on mouse move for depth
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const { clientX, clientY } = e;
      const x = (clientX / window.innerWidth - 0.5) * 20;
      const y = (clientY / window.innerHeight - 0.5) * 20;
      containerRef.current.style.setProperty("--mouse-x", `${x}px`);
      containerRef.current.style.setProperty("--mouse-y", `${y}px`);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 -z-10 overflow-hidden"
      style={
        {
          "--mouse-x": "0px",
          "--mouse-y": "0px",
        } as React.CSSProperties
      }
    >
      {/* Base dark gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#F0F4FF] via-[#F8FAFC] to-white dark:from-[#030303] dark:via-[#050510] dark:to-[#030303]" />

      {/* Aurora orb 1 - violet/indigo */}
      <div
        className="aurora-orb absolute -top-[20%] -left-[10%] h-[60vw] w-[60vw] rounded-full opacity-30 dark:opacity-20"
        style={{
          background:
            "radial-gradient(circle, rgba(124,92,252,0.4) 0%, rgba(124,92,252,0.1) 40%, transparent 70%)",
          animation: "aurora-float-1 15s ease-in-out infinite",
          transform: "translate(var(--mouse-x), var(--mouse-y))",
          filter: "blur(80px)",
          willChange: "transform",
        }}
      />

      {/* Aurora orb 2 - cyan */}
      <div
        className="aurora-orb absolute top-[20%] -right-[15%] h-[50vw] w-[50vw] rounded-full opacity-25 dark:opacity-15"
        style={{
          background:
            "radial-gradient(circle, rgba(0,212,255,0.35) 0%, rgba(0,212,255,0.1) 40%, transparent 70%)",
          animation: "aurora-float-2 18s ease-in-out infinite",
          transform:
            "translate(calc(var(--mouse-x) * -0.5), calc(var(--mouse-y) * -0.5))",
          filter: "blur(100px)",
          willChange: "transform",
        }}
      />

      {/* Aurora orb 3 - mint/green */}
      <div
        className="aurora-orb absolute bottom-[5%] left-[20%] h-[40vw] w-[40vw] rounded-full opacity-20 dark:opacity-10"
        style={{
          background:
            "radial-gradient(circle, rgba(0,229,160,0.3) 0%, rgba(0,229,160,0.08) 40%, transparent 70%)",
          animation: "aurora-float-3 20s ease-in-out infinite",
          transform:
            "translate(calc(var(--mouse-x) * 0.3), calc(var(--mouse-y) * 0.3))",
          filter: "blur(90px)",
          willChange: "transform",
        }}
      />

      {/* Aurora orb 4 - purple accent */}
      <div
        className="aurora-orb absolute top-[50%] left-[50%] h-[30vw] w-[30vw] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-15 dark:opacity-10"
        style={{
          background:
            "radial-gradient(circle, rgba(157,122,255,0.25) 0%, transparent 60%)",
          animation: "aurora-float-4 12s ease-in-out infinite",
          filter: "blur(60px)",
          willChange: "transform",
        }}
      />

      {/* Noise texture overlay for depth */}
      <div
        className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Radial vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(248,250,252,0.8)_100%)] dark:bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(3,3,3,0.9)_100%)]" />
    </div>
  );
}
