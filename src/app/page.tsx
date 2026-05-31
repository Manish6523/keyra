"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/contexts/theme-context";
import { Key, ArrowRight, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";

import { AuroraBackground } from "@/components/landing/aurora-background";
import { FloatingParticles } from "@/components/landing/floating-particles";
import { AnimatedTextReveal } from "@/components/landing/animated-text-reveal";
import { FeatureBento } from "@/components/landing/feature-bento";
import { SecurityShowcase } from "@/components/landing/security-showcase";
import { TechMarquee } from "@/components/landing/marquee";
import { CtaSection } from "@/components/landing/cta-section";

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!heroRef.current) return;

    const ctx = gsap.context(() => {
      // Badge animation
      gsap.from(".hero-badge", {
        opacity: 0,
        y: -20,
        scale: 0.9,
        duration: 0.6,
        ease: "back.out(1.7)",
        delay: 0.2,
      });

      // Subtitle
      gsap.from(".hero-subtitle", {
        opacity: 0,
        y: 20,
        filter: "blur(10px)",
        duration: 0.8,
        ease: "power3.out",
        delay: 1.2,
      });

      // CTA buttons
      gsap.from(".hero-cta", {
        opacity: 0,
        y: 20,
        duration: 0.6,
        ease: "power3.out",
        delay: 1.6,
      });

      // Scroll indicator
      gsap.from(".scroll-indicator", {
        opacity: 0,
        y: -10,
        duration: 0.6,
        delay: 2.2,
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#F8FAFC] dark:bg-[#030303] text-slate-800 dark:text-keyra-text transition-colors duration-300">
      <AuroraBackground />
      <FloatingParticles />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex h-16 items-center justify-between rounded-b-2xl sm:rounded-b-2xl bg-white/50 dark:bg-black/20 backdrop-blur-xl border-b border-x border-slate-200/50 dark:border-white/[0.06] px-6 shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 dark:bg-keyra-violet text-white shadow-md shadow-indigo-500/20 dark:shadow-keyra-violet/20">
                <Key className="h-4 w-4" />
              </div>
              <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                Keyra
              </span>
            </div>
            <nav className="flex items-center gap-3 sm:gap-5">
              <Link
                href="/login"
                className="text-sm font-medium text-slate-600 dark:text-keyra-text/60 transition-colors hover:text-slate-900 dark:hover:text-white"
              >
                Sign in
              </Link>
              <Link href="/signup">
                <Button size="sm">Get Started</Button>
              </Link>
              <ThemeToggle />
            </nav>
          </div>
        </div>
      </header>

      <main>
        {/* ═══════════════════ HERO SECTION ═══════════════════ */}
        <section
          ref={heroRef}
          className="relative flex flex-col items-center justify-center min-h-screen px-6 text-center pt-16"
        >
          {/* Badge */}
          <motion.div
            className="hero-badge mx-auto inline-flex items-center gap-2 rounded-full border border-indigo-200/80 dark:border-keyra-violet/20 bg-white/60 dark:bg-keyra-violet/5 backdrop-blur-sm px-4 py-1.5 text-xs sm:text-sm text-indigo-600 dark:text-keyra-violet font-medium shadow-sm"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 dark:bg-keyra-violet opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-500 dark:bg-keyra-violet" />
            </span>
            Zero-knowledge client-side encryption
          </motion.div>

          {/* Headline */}
          <div className="mt-8">
            <AnimatedTextReveal
              text="Your Keys."
              className="text-5xl sm:text-7xl lg:text-8xl xl:text-9xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1]"
              delay={0.4}
            />
            <AnimatedTextReveal
              text="Your Control."
              className="text-5xl sm:text-7xl lg:text-8xl xl:text-9xl font-extrabold tracking-tight leading-[1.1] bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent dark:from-[#7C5CFC] dark:via-[#00D4FF] dark:to-[#00E5A0]"
              delay={0.8}
            />
          </div>

          {/* Subtitle */}
          <p className="hero-subtitle mx-auto mt-8 max-w-2xl text-base sm:text-lg lg:text-xl text-slate-500 dark:text-keyra-text/50 leading-relaxed">
            Store, organize, and access all your developer API keys in one encrypted vault.
            Zero-knowledge. Client-side only. Built for developers who value{" "}
            <span className="text-slate-700 dark:text-keyra-text/80 font-medium">
              absolute privacy
            </span>
            .
          </p>

          {/* CTA Buttons */}
          <div className="hero-cta mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup">
              <Button
                size="lg"
                className="shadow-lg hover:shadow-glow-violet text-base px-8 group"
              >
                Start For Free
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/login">
              <Button
                size="lg"
                variant="outline"
                className="border-slate-200 dark:border-white/10 text-slate-700 dark:text-keyra-text/70 hover:bg-slate-50 dark:hover:bg-white/5 shadow-md backdrop-blur-sm"
              >
                Launch App
              </Button>
            </Link>
          </div>

          {/* Scroll indicator */}
          <div className="scroll-indicator absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-400 dark:text-keyra-text/30">
            <span className="text-xs font-medium tracking-wide uppercase">Scroll</span>
            <ChevronDown className="h-4 w-4 animate-bounce" />
          </div>
        </section>

        {/* ═══════════════════ FEATURES BENTO ═══════════════════ */}
        <FeatureBento />

        {/* ═══════════════════ SECURITY SHOWCASE ═══════════════════ */}
        <SecurityShowcase />

        {/* ═══════════════════ TECH MARQUEE ═══════════════════ */}
        <TechMarquee />

        {/* ═══════════════════ CTA SECTION ═══════════════════ */}
        <CtaSection />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/60 dark:border-white/5 py-10 bg-white/20 dark:bg-transparent">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-600 dark:bg-keyra-violet text-white">
                <Key className="h-3 w-3" />
              </div>
              <span className="text-sm font-bold text-slate-700 dark:text-keyra-text/60">
                Keyra
              </span>
            </div>
            <p className="text-xs text-slate-400 dark:text-keyra-text/30 font-medium">
              &copy; {new Date().getFullYear()} Keyra &mdash; Your keys. Your control. All
              rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
