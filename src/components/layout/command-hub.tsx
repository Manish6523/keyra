"use client";

import { useEffect, useRef } from "react";
import { Search, Command } from "lucide-react";
import { useVaultStore } from "@/store/vault";
import { ThemeToggle } from "@/contexts/theme-context";
import gsap from "gsap";

interface CommandHubProps {
  onOpenCmdPalette: () => void;
}

export function CommandHub({ onOpenCmdPalette }: CommandHubProps) {
  const searchQuery = useVaultStore((s) => s.searchQuery);
  const setSearchQuery = useVaultStore((s) => s.setSearchQuery);
  const inputRef = useRef<HTMLInputElement>(null);
  const hubRef = useRef<HTMLDivElement>(null);

  // Focus input when CommandPalette or custom keys are pressed
  useEffect(() => {
    const handleFocusSearch = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleFocusSearch);
    return () => window.removeEventListener("keydown", handleFocusSearch);
  }, []);

  // GSAP entrance
  useEffect(() => {
    if (!hubRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(hubRef.current, {
        y: -30,
        opacity: 0,
        duration: 0.6,
        ease: "power3.out",
        delay: 0.4,
      });
    }, hubRef);
    return () => ctx.revert();
  }, []);

  // Focus glow effect
  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;

    const handleFocus = () => {
      gsap.to(".cmd-hub-bar", {
        borderColor: "rgba(124, 92, 252, 0.4)",
        boxShadow: "0 0 20px rgba(124, 92, 252, 0.1), 0 4px 20px rgba(0,0,0,0.08)",
        duration: 0.3,
        ease: "power2.out",
      });
    };

    const handleBlur = () => {
      gsap.to(".cmd-hub-bar", {
        borderColor: "",
        boxShadow: "",
        duration: 0.4,
        ease: "power2.out",
      });
    };

    input.addEventListener("focus", handleFocus);
    input.addEventListener("blur", handleBlur);
    return () => {
      input.removeEventListener("focus", handleFocus);
      input.removeEventListener("blur", handleBlur);
    };
  }, []);

  return (
    <div ref={hubRef} className="fixed top-4 left-1/2 -translate-x-1/2 z-40 w-[90%] max-w-xl">
      <div className="cmd-hub-bar flex items-center gap-3 bg-white/70 dark:bg-keyra-navy/70 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 rounded-full px-4 py-2 shadow-lg shadow-slate-900/5 dark:shadow-black/40 transition-all duration-300">
        <Search className="h-4 w-4 text-slate-400 dark:text-keyra-text/40 shrink-0" />

        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search vault... ('/' to focus)"
          className="flex-1 bg-transparent border-0 p-0 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-keyra-text/30 focus:ring-0 focus:outline-none min-w-0"
        />

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenCmdPalette}
            className="hidden sm:flex items-center gap-1 rounded-full border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-keyra-charcoal/60 hover:bg-slate-200 dark:hover:bg-keyra-charcoal px-2.5 py-1 text-[10px] text-slate-500 dark:text-keyra-text/50 font-sans transition-all duration-200 active:scale-95 hover:border-indigo-300 dark:hover:border-keyra-violet/30"
            title="Open command palette"
          >
            <Command className="h-3 w-3" />
            <span>K</span>
          </button>

          <div className="h-4 w-px bg-slate-200 dark:bg-white/10" />

          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}
