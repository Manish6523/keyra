"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Shield } from "lucide-react";
import gsap from "gsap";

export default function SetupPage() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // Shield icon entrance with bounce
      gsap.from(".setup-icon", {
        scale: 0,
        rotation: -90,
        duration: 0.8,
        ease: "back.out(1.7)",
        delay: 0.2,
      });

      // Pulsing glow on icon
      gsap.to(".setup-icon", {
        boxShadow: "0 0 30px rgba(124, 92, 252, 0.3), 0 0 60px rgba(124, 92, 252, 0.1)",
        duration: 1.5,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        delay: 1,
      });

      // Text entrance
      gsap.from(".setup-title", {
        opacity: 0,
        y: 10,
        duration: 0.5,
        ease: "power3.out",
        delay: 0.6,
      });

      gsap.from(".setup-desc", {
        opacity: 0,
        y: 8,
        duration: 0.5,
        ease: "power3.out",
        delay: 0.8,
      });

      // Loading dots
      gsap.from(".setup-dots span", {
        opacity: 0,
        scale: 0,
        duration: 0.3,
        stagger: 0.15,
        ease: "back.out(1.7)",
        delay: 1.2,
      });
    }, containerRef);

    // Redirect after brief animation
    const timer = setTimeout(() => {
      gsap.to(".setup-content", {
        opacity: 0,
        y: -20,
        scale: 0.95,
        duration: 0.4,
        ease: "power2.in",
        onComplete: () => router.push("/dashboard"),
      });
    }, 2000);

    return () => {
      ctx.revert();
      clearTimeout(timer);
    };
  }, [router]);

  return (
    <div
      ref={containerRef}
      className="flex min-h-screen items-center justify-center bg-[#F8FAFC] dark:bg-[#030303] text-slate-800 dark:text-keyra-text px-6 transition-colors duration-300"
    >
      <div className="setup-content text-center">
        <div className="setup-icon mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-indigo-50 dark:bg-keyra-violet/10 text-indigo-600 dark:text-keyra-violet shadow-sm">
          <Shield className="h-7 w-7" />
        </div>
        <h1 className="setup-title text-2xl font-bold text-slate-900 dark:text-white">
          Ready
        </h1>
        <p className="setup-desc mt-2 text-sm text-slate-500 dark:text-keyra-text/50">
          Taking you to your vault...
        </p>
        <div className="setup-dots flex items-center justify-center gap-1.5 mt-4">
          <span className="h-2 w-2 rounded-full bg-indigo-500 dark:bg-keyra-violet animate-bounce [animation-delay:0ms]" />
          <span className="h-2 w-2 rounded-full bg-indigo-500 dark:bg-keyra-violet animate-bounce [animation-delay:150ms]" />
          <span className="h-2 w-2 rounded-full bg-indigo-500 dark:bg-keyra-violet animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}
