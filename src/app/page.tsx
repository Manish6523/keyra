"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { ThemeToggle } from "@/contexts/theme-context";
import { Shield, Sparkles, Zap, Key } from "lucide-react";
import { motion } from "framer-motion";

export default function LandingPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.215, 0.61, 0.355, 1] as [number, number, number, number],
      },
    },
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#F8FAFC] dark:bg-[#030303] text-slate-800 dark:text-keyra-text transition-colors duration-300">
      {/* Animated background dot grid with radial vignette */}
      <div className="absolute inset-0 -z-10 bg-dot-slate-300/[0.4] dark:bg-dot-white/[0.04] [mask-image:radial-gradient(ellipse_at_center,black_60%,transparent_100%)]" />

      {/* Decorative colored glow orbs */}
      <div className="absolute -top-[10%] -left-[10%] -z-10 h-[50vw] w-[50vw] rounded-full bg-indigo-400/10 dark:bg-indigo-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute top-[30%] -right-[10%] -z-10 h-[45vw] w-[45vw] rounded-full bg-cyan-400/10 dark:bg-cyan-500/5 blur-[120px] pointer-events-none" />

      <header className="border-b border-slate-200 dark:border-white/5 bg-white/40 dark:bg-black/10 backdrop-blur-md sticky top-0 z-50">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 dark:bg-keyra-violet text-white shadow-md">
              <Key className="h-4 w-4" />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
              Keyra
            </span>
          </div>
          <nav className="flex items-center gap-4 sm:gap-6">
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
      </header>

      <main>
        <section className="mx-auto max-w-7xl px-6 pt-24 pb-20 text-center sm:pt-32">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center"
          >
            <motion.div
              variants={itemVariants}
              className="mx-auto inline-flex items-center gap-2 rounded-full border border-indigo-200 dark:border-keyra-violet/20 bg-indigo-50 dark:bg-keyra-violet/5 px-4 py-1.5 text-xs sm:text-sm text-indigo-600 dark:text-keyra-violet font-medium shadow-sm"
            >
              <Shield className="h-3.5 w-3.5" />
              Zero-knowledge client-side encryption
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="mt-8 text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-8xl"
            >
              Your Keys.{" "}
              <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent dark:from-[#7C5CFC] dark:via-[#00D4FF] dark:to-[#00E5A0]">
                Your Control.
              </span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="mx-auto mt-6 max-w-2xl text-base sm:text-lg lg:text-xl text-slate-500 dark:text-keyra-text/60 leading-relaxed"
            >
              Store, organize, and access all your developer API keys in one encrypted vault. 
              Zero-knowledge. Client-side only. Built for developers who value absolute data privacy.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="mt-10 flex items-center justify-center gap-4"
            >
              <Link href="/signup">
                <Button size="lg" className="shadow-lg hover:shadow-glow-violet">
                  Get Started Free
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="border-slate-200 dark:border-white/10 text-slate-700 dark:text-keyra-text/80 hover:bg-slate-50 dark:hover:bg-white/5">
                  Launch App
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          <ScrollReveal delay={0.2} className="mt-20 sm:mt-24">
            <div className="grid gap-6 text-left sm:grid-cols-3">
              {[
                {
                  title: "Zero-Knowledge Encryption",
                  desc: "Your keys are encrypted in your browser using AES-256-GCM before ever leaving the device. We never see your plaintext.",
                  icon: Shield,
                  iconColor: "text-indigo-600 dark:text-keyra-violet",
                  bgColor: "bg-indigo-50/50 dark:bg-keyra-violet/5",
                },
                {
                  title: "Quick Search & Copy",
                  desc: "Find any key in seconds. One-click copy with automatic 30s clipboard clearing. Pure keyboard-first experience.",
                  icon: Zap,
                  iconColor: "text-cyan-600 dark:text-keyra-cyan",
                  bgColor: "bg-cyan-50/50 dark:bg-keyra-cyan/5",
                },
                {
                  title: "Auto-Detect Service",
                  desc: "Paste any key and we'll instantly detect the service — OpenAI, Stripe, AWS, GitHub, and 50+ integrations out of the box.",
                  icon: Sparkles,
                  iconColor: "text-emerald-600 dark:text-keyra-mint",
                  bgColor: "bg-emerald-50/50 dark:bg-keyra-mint/5",
                },
              ].map((feature) => (
                <SpotlightCard
                  key={feature.title}
                  className="p-6 bg-white/70 dark:bg-white/[0.02] border-slate-200/60 dark:border-white/[0.06] flex flex-col gap-4 shadow-sm"
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${feature.bgColor} ${feature.iconColor}`}>
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base text-slate-900 dark:text-white">
                      {feature.title}
                    </h3>
                    <p className="mt-2 text-sm text-slate-500 dark:text-keyra-text/50 leading-relaxed">
                      {feature.desc}
                    </p>
                  </div>
                </SpotlightCard>
              ))}
            </div>
          </ScrollReveal>
        </section>

        <section className="mx-auto max-w-7xl px-6 pb-24 sm:pb-32">
          <ScrollReveal>
            <div className="rounded-2xl border border-slate-200/60 dark:border-white/[0.06] bg-white/60 dark:bg-white/[0.01] backdrop-blur-xl p-8 sm:p-12 text-center shadow-lg dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
                One Vault. Zero Leaks.
              </h2>
              <p className="mt-4 text-sm sm:text-base text-slate-500 dark:text-keyra-text/60">
                AES-256-GCM encryption | PBKDF2 key derivation | Browser-only decrypt
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                {[
                  "AES-256-GCM",
                  "PBKDF2",
                  "Zero-Knowledge",
                  "Client-Side",
                  "Open Source",
                ].map((badge) => (
                  <span
                    key={badge}
                    className="rounded-full border border-indigo-200 dark:border-keyra-cyan/20 bg-indigo-50/50 dark:bg-keyra-cyan/5 px-3.5 py-1 text-xs font-semibold text-indigo-600 dark:text-keyra-cyan shadow-sm"
                  >
                    {badge}
                  </span>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </section>
      </main>

      <footer className="border-t border-slate-200 dark:border-white/5 py-8 bg-white/20 dark:bg-transparent">
        <div className="mx-auto max-w-7xl px-6 text-center text-xs text-slate-400 dark:text-keyra-text/40 font-medium">
          Keyra &mdash; Your keys. Your control. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
