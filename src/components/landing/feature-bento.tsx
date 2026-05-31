"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import {
  Shield,
  Zap,
  Sparkles,
  Search,
  Users,
  Lock,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    title: "Zero-Knowledge Encryption",
    desc: "Your keys are encrypted in your browser with AES-256-GCM before ever leaving the device. We never see your plaintext data.",
    icon: Shield,
    gradient: "from-violet-500/20 to-indigo-500/20 dark:from-violet-500/10 dark:to-indigo-500/10",
    iconColor: "text-indigo-600 dark:text-keyra-violet",
    span: "col-span-1 sm:col-span-2 lg:col-span-2",
  },
  {
    title: "Instant Search & Copy",
    desc: "Find any key in milliseconds. One-click copy with automatic 30s clipboard clearing.",
    icon: Search,
    gradient: "from-cyan-500/20 to-blue-500/20 dark:from-cyan-500/10 dark:to-blue-500/10",
    iconColor: "text-cyan-600 dark:text-keyra-cyan",
    span: "col-span-1",
  },
  {
    title: "Auto-Detect Service",
    desc: "Paste any key and we detect the service — OpenAI, Stripe, AWS, and 50+ more.",
    icon: Sparkles,
    gradient: "from-emerald-500/20 to-green-500/20 dark:from-emerald-500/10 dark:to-green-500/10",
    iconColor: "text-emerald-600 dark:text-keyra-mint",
    span: "col-span-1",
  },
  {
    title: "Lightning Fast",
    desc: "Built with performance in mind. Instant vault access, sub-second operations, zero lag.",
    icon: Zap,
    gradient: "from-amber-500/20 to-orange-500/20 dark:from-amber-500/10 dark:to-orange-500/10",
    iconColor: "text-amber-600 dark:text-yellow-400",
    span: "col-span-1",
  },
  {
    title: "Team Sharing",
    desc: "Share project vaults with your team. Role-based access control keeps things secure.",
    icon: Users,
    gradient: "from-pink-500/20 to-rose-500/20 dark:from-pink-500/10 dark:to-rose-500/10",
    iconColor: "text-pink-600 dark:text-pink-400",
    span: "col-span-1 sm:col-span-2 lg:col-span-1",
  },
  {
    title: "Client-Side Only",
    desc: "Decryption happens exclusively in your browser. Your master password never touches our servers.",
    icon: Lock,
    gradient: "from-violet-500/20 to-purple-500/20 dark:from-violet-500/10 dark:to-purple-500/10",
    iconColor: "text-purple-600 dark:text-purple-400",
    span: "col-span-1 sm:col-span-2 lg:col-span-2",
  },
];

export function FeatureBento() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      // Title animation
      gsap.from(".feature-title", {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
          once: true,
        },
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: "power3.out",
      });

      // Staggered card reveals
      cardsRef.current.forEach((card, i) => {
        if (!card) return;
        gsap.from(card, {
          scrollTrigger: {
            trigger: card,
            start: "top 85%",
            once: true,
          },
          opacity: 0,
          y: 40,
          scale: 0.95,
          duration: 0.7,
          delay: i * 0.1,
          ease: "power3.out",
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="mx-auto max-w-7xl px-6 py-24 sm:py-32">
      <div className="text-center mb-16">
        <span className="feature-title inline-block text-xs font-bold uppercase tracking-[0.2em] text-indigo-600 dark:text-keyra-violet mb-4">
          Features
        </span>
        <h2 className="feature-title text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Everything you need.{" "}
          <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent dark:from-[#7C5CFC] dark:via-[#00D4FF] dark:to-[#00E5A0]">
            Nothing you don&apos;t.
          </span>
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {features.map((feature, i) => {
          const Icon = feature.icon;
          return (
            <div
              key={feature.title}
              ref={(el) => {
                if (el) cardsRef.current[i] = el;
              }}
              className={feature.span}
            >
              <SpotlightCard className="p-6 sm:p-8 h-full bg-white/60 dark:bg-white/[0.02] border-slate-200/50 dark:border-white/[0.06] hover:border-indigo-300/50 dark:hover:border-keyra-violet/20 transition-all duration-500 group">
                <div className="flex flex-col h-full gap-4">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} ${feature.iconColor} transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-keyra-text/50 leading-relaxed">
                      {feature.desc}
                    </p>
                  </div>
                </div>
              </SpotlightCard>
            </div>
          );
        })}
      </div>
    </section>
  );
}
