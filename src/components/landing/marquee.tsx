"use client";

import { cn } from "@/lib/utils";

interface MarqueeProps {
  items: string[];
  direction?: "left" | "right";
  speed?: number;
  className?: string;
}

function MarqueeRow({ items, direction = "left", speed = 40, className }: MarqueeProps) {
  const animationDuration = `${items.length * (100 / speed)}s`;

  return (
    <div className={cn("group flex overflow-hidden", className)}>
      {[0, 1].map((copy) => (
        <div
          key={copy}
          className={cn(
            "flex shrink-0 items-center gap-4 py-2",
            direction === "left" ? "marquee-scroll-left" : "marquee-scroll-right",
            "group-hover:[animation-play-state:paused]"
          )}
          style={{ animationDuration }}
          aria-hidden={copy === 1}
        >
          {items.map((item, i) => (
            <span
              key={`${copy}-${i}`}
              className="inline-flex items-center whitespace-nowrap rounded-full border border-slate-200/60 dark:border-white/[0.06] bg-white/60 dark:bg-white/[0.02] px-4 py-2 text-sm font-semibold text-slate-600 dark:text-keyra-text/60 backdrop-blur-sm transition-colors hover:border-indigo-300 dark:hover:border-keyra-violet/30 hover:text-indigo-600 dark:hover:text-keyra-violet"
            >
              {item}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}

const row1 = [
  "AES-256-GCM",
  "PBKDF2",
  "WebCrypto API",
  "Zero-Knowledge",
  "Next.js 14",
  "React 18",
  "TypeScript",
  "Supabase",
  "PostgreSQL",
  "Row Level Security",
];

const row2 = [
  "Client-Side Encryption",
  "Zustand",
  "Framer Motion",
  "GSAP",
  "Tailwind CSS",
  "Radix UI",
  "Lucide Icons",
  "Open Source",
  "SHA-256",
  "600k Iterations",
];

export function TechMarquee() {
  return (
    <section className="py-16 sm:py-24 overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 mb-12 text-center">
        <span className="inline-block text-xs font-bold uppercase tracking-[0.2em] text-indigo-600 dark:text-keyra-violet mb-4">
          Built With
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Modern Stack. Battle-Tested.
        </h2>
      </div>
      <div className="space-y-4 relative">
        {/* Fade edges */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-32 z-10 bg-gradient-to-r from-[#F8FAFC] dark:from-[#030303] to-transparent" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-32 z-10 bg-gradient-to-l from-[#F8FAFC] dark:from-[#030303] to-transparent" />
        <MarqueeRow items={row1} direction="left" speed={30} />
        <MarqueeRow items={row2} direction="right" speed={25} />
      </div>
    </section>
  );
}
