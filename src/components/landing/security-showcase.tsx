"use client";

import { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Shield, Lock, Eye, Server, FileKey, CheckCircle2 } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const codeLines = [
  { text: "// Encrypting your API key...", delay: 0 },
  { text: 'const key = "sk-proj-9x8f...";', delay: 0.8 },
  { text: "const salt = crypto.getRandomValues(new Uint8Array(16));", delay: 1.6 },
  { text: "const derived = await crypto.subtle.deriveKey(", delay: 2.4 },
  { text: '  { name: "PBKDF2", salt, iterations: 600000,', delay: 3.0 },
  { text: '    hash: "SHA-256" },', delay: 3.4 },
  { text: '  masterKey, { name: "AES-GCM", length: 256 }, false,', delay: 3.8 },
  { text: '  ["encrypt"]', delay: 4.2 },
  { text: ");", delay: 4.4 },
  { text: "const encrypted = await crypto.subtle.encrypt(", delay: 5.0 },
  { text: '  { name: "AES-GCM", iv },', delay: 5.4 },
  { text: "  derived, plaintext", delay: 5.8 },
  { text: ");", delay: 6.0 },
  { text: "// ✓ Zero-knowledge. Client-side only.", delay: 6.8 },
];

const badges = [
  { label: "AES-256-GCM", icon: Lock, color: "text-violet-600 dark:text-keyra-violet", bg: "bg-violet-50 dark:bg-keyra-violet/10", border: "border-violet-200 dark:border-keyra-violet/20" },
  { label: "PBKDF2", icon: FileKey, color: "text-cyan-600 dark:text-keyra-cyan", bg: "bg-cyan-50 dark:bg-keyra-cyan/10", border: "border-cyan-200 dark:border-keyra-cyan/20" },
  { label: "Zero-Knowledge", icon: Eye, color: "text-emerald-600 dark:text-keyra-mint", bg: "bg-emerald-50 dark:bg-keyra-mint/10", border: "border-emerald-200 dark:border-keyra-mint/20" },
  { label: "Client-Side", icon: Server, color: "text-amber-600 dark:text-yellow-400", bg: "bg-amber-50 dark:bg-yellow-500/10", border: "border-amber-200 dark:border-yellow-500/20" },
  { label: "600k Iterations", icon: Shield, color: "text-pink-600 dark:text-pink-400", bg: "bg-pink-50 dark:bg-pink-500/10", border: "border-pink-200 dark:border-pink-500/20" },
  { label: "Open Source", icon: CheckCircle2, color: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-50 dark:bg-indigo-500/10", border: "border-indigo-200 dark:border-indigo-500/20" },
];

function TypewriterLine({ text, delay }: { text: string; delay: number }) {
  const [displayed, setDisplayed] = useState("");
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const startTimeout = setTimeout(() => setStarted(true), delay * 1000);
    return () => clearTimeout(startTimeout);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    let i = 0;
    const interval = setInterval(() => {
      if (i <= text.length) {
        setDisplayed(text.slice(0, i));
        i++;
      } else {
        clearInterval(interval);
      }
    }, 20);
    return () => clearInterval(interval);
  }, [started, text]);

  if (!started) return <div className="h-5" />;

  const isComment = text.trimStart().startsWith("//");

  return (
    <div className={`font-mono text-xs sm:text-sm leading-6 ${isComment ? "text-emerald-500 dark:text-keyra-mint/80" : "text-slate-700 dark:text-slate-300"}`}>
      {displayed}
      {displayed.length < text.length && (
        <span className="typewriter-cursor">|</span>
      )}
    </div>
  );
}

export function SecurityShowcase() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const badgesRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      // Terminal reveal
      gsap.from(".security-terminal", {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 75%",
          once: true,
          onEnter: () => setIsVisible(true),
        },
        opacity: 0,
        x: -50,
        duration: 0.8,
        ease: "power3.out",
      });

      // Badge reveals
      if (badgesRef.current) {
        const badgeEls = badgesRef.current.querySelectorAll(".security-badge");
        gsap.from(badgeEls, {
          scrollTrigger: {
            trigger: badgesRef.current,
            start: "top 80%",
            once: true,
          },
          opacity: 0,
          y: 20,
          scale: 0.8,
          duration: 0.5,
          stagger: 0.1,
          ease: "back.out(1.7)",
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="mx-auto max-w-7xl px-6 py-24 sm:py-32">
      <div className="text-center mb-16">
        <span className="inline-block text-xs font-bold uppercase tracking-[0.2em] text-indigo-600 dark:text-keyra-violet mb-4">
          Security
        </span>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          One Vault.{" "}
          <span className="bg-gradient-to-r from-indigo-500 to-cyan-500 bg-clip-text text-transparent dark:from-[#7C5CFC] dark:to-[#00D4FF]">
            Zero Leaks.
          </span>
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-center">
        {/* Terminal mockup */}
        <div className="security-terminal lg:col-span-3 relative">
          <div className="moving-border-container rounded-2xl">
            <div className="moving-border-bg" />
            <div className="moving-border-content !rounded-[15px] !bg-slate-50 dark:!bg-[#0a0b10] p-0">
              <div className="w-full rounded-2xl overflow-hidden">
                {/* Terminal header */}
                <div className="flex items-center gap-2 px-4 py-3 bg-slate-100 dark:bg-[#111318] border-b border-slate-200 dark:border-white/5">
                  <div className="flex gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-red-400/80" />
                    <div className="h-3 w-3 rounded-full bg-yellow-400/80" />
                    <div className="h-3 w-3 rounded-full bg-green-400/80" />
                  </div>
                  <span className="ml-2 text-xs text-slate-400 dark:text-keyra-text/30 font-mono">
                    keyra-encryption.ts
                  </span>
                </div>

                {/* Terminal content */}
                <div className="p-5 min-h-[300px] sm:min-h-[360px] overflow-hidden">
                  {isVisible &&
                    codeLines.map((line, i) => (
                      <TypewriterLine
                        key={i}
                        text={line.text}
                        delay={line.delay}
                      />
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Badges */}
        <div ref={badgesRef} className="lg:col-span-2 space-y-4">
          <p className="text-sm text-slate-500 dark:text-keyra-text/50 mb-6 leading-relaxed">
            Industry-grade cryptography protects every key you store. Encryption happens exclusively in your browser — your master password never leaves your device.
          </p>
          <div className="grid grid-cols-2 gap-3">
            {badges.map((badge) => {
              const Icon = badge.icon;
              return (
                <div
                  key={badge.label}
                  className={`security-badge flex items-center gap-2.5 rounded-xl border ${badge.border} ${badge.bg} px-3.5 py-3 transition-all duration-300 hover:scale-105 cursor-default`}
                >
                  <Icon className={`h-4 w-4 shrink-0 ${badge.color}`} />
                  <span className={`text-xs font-bold ${badge.color}`}>
                    {badge.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
