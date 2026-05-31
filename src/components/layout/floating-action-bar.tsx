"use client";

import { useEffect, useRef } from "react";
import { Plus, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PasswordGenerator } from "@/components/keys/password-generator";
import { useClipboard } from "@/hooks/use-clipboard";
import gsap from "gsap";

interface FloatingActionBarProps {
  onAddKey: () => void;
}

export function FloatingActionBar({ onAddKey }: FloatingActionBarProps) {
  const { copy } = useClipboard(3000);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!barRef.current) return;
    const ctx = gsap.context(() => {
      // Spring entrance from bottom
      gsap.from(barRef.current, {
        y: 60,
        opacity: 0,
        duration: 0.8,
        ease: "back.out(1.4)",
        delay: 0.6,
      });

      // Breathing glow on the add button
      gsap.to(".fab-add-btn", {
        boxShadow:
          "0 0 25px rgba(124, 92, 252, 0.3), 0 0 50px rgba(124, 92, 252, 0.1)",
        duration: 2,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        delay: 1.5,
      });
    }, barRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={barRef} className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
      <div className="flex items-center gap-3 bg-white/70 dark:bg-keyra-navy/70 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 rounded-full p-2 shadow-xl shadow-slate-900/10 dark:shadow-black/60 transition-all duration-300 hover:shadow-2xl">
        {/* Generate Password popover trigger */}
        <PasswordGenerator
          onUse={(pass) => {
            copy(pass);
          }}
          trigger={
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full h-10 px-4 text-slate-700 dark:text-keyra-text/80 hover:bg-slate-100 dark:hover:bg-white/5 gap-2 transition-transform hover:scale-105 active:scale-95"
            >
              <Wand2 className="h-4 w-4 text-indigo-500 dark:text-keyra-cyan animate-pulse" />
              <span className="hidden sm:inline text-xs font-semibold">
                Generate Password
              </span>
            </Button>
          }
        />

        <div className="h-5 w-px bg-slate-200 dark:bg-white/10" />

        {/* Add Key Primary Button */}
        <Button
          size="sm"
          onClick={onAddKey}
          className="fab-add-btn rounded-full h-10 px-5 bg-gradient-to-r from-indigo-600 to-keyra-violet hover:from-indigo-500 hover:to-keyra-violet/90 text-white shadow-glow-violet gap-2 font-semibold text-xs border-0 active:scale-95 transition-transform hover:scale-105"
        >
          <Plus className="h-4 w-4" />
          <span>Add Key</span>
        </Button>
      </div>
    </div>
  );
}
