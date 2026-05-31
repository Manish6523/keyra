"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

function AnimatedCounter({
  target,
  suffix = "",
}: {
  target: number;
  suffix?: string;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!ref.current) return;

    const trigger = ScrollTrigger.create({
      trigger: ref.current,
      start: "top 85%",
      once: true,
      onEnter: () => {
        if (hasAnimated.current) return;
        hasAnimated.current = true;
        const obj = { val: 0 };
        gsap.to(obj, {
          val: target,
          duration: 2,
          ease: "power2.out",
          onUpdate: () => setCount(Math.floor(obj.val)),
        });
      },
    });

    return () => trigger.kill();
  }, [target]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

export function CtaSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from(".cta-content > *", {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 75%",
          once: true,
        },
        opacity: 0,
        y: 30,
        duration: 0.7,
        stagger: 0.15,
        ease: "power3.out",
      });
    }, sectionRef);

    // Magnetic button effect
    const btn = buttonRef.current;
    if (btn) {
      const handleMouseMove = (e: MouseEvent) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        gsap.to(btn, {
          x: x * 0.15,
          y: y * 0.15,
          duration: 0.4,
          ease: "power2.out",
        });
      };
      const handleMouseLeave = () => {
        gsap.to(btn, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.3)" });
      };
      btn.addEventListener("mousemove", handleMouseMove);
      btn.addEventListener("mouseleave", handleMouseLeave);
      return () => {
        ctx.revert();
        btn.removeEventListener("mousemove", handleMouseMove);
        btn.removeEventListener("mouseleave", handleMouseLeave);
      };
    }

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative py-24 sm:py-32 overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-indigo-400/10 dark:bg-keyra-violet/5 blur-[120px]" />
        <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 h-[300px] w-[300px] rounded-full bg-cyan-400/10 dark:bg-keyra-cyan/5 blur-[100px]" />
      </div>

      <div className="mx-auto max-w-4xl px-6 text-center cta-content">
        <div className="mb-6 flex items-center justify-center gap-8 text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white">
          <div className="flex flex-col items-center">
            <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent dark:from-[#7C5CFC] dark:to-[#9D7AFF]">
              <AnimatedCounter target={10000} suffix="+" />
            </span>
            <span className="text-sm font-semibold text-slate-500 dark:text-keyra-text/40 mt-1">
              Keys Stored
            </span>
          </div>
          <div className="h-12 w-px bg-slate-200 dark:bg-white/10" />
          <div className="flex flex-col items-center">
            <span className="bg-gradient-to-r from-cyan-500 to-emerald-500 bg-clip-text text-transparent dark:from-[#00D4FF] dark:to-[#00E5A0]">
              <AnimatedCounter target={2500} suffix="+" />
            </span>
            <span className="text-sm font-semibold text-slate-500 dark:text-keyra-text/40 mt-1">
              Developers
            </span>
          </div>
          <div className="h-12 w-px bg-slate-200 dark:bg-white/10" />
          <div className="flex flex-col items-center">
            <span className="text-emerald-600 dark:text-keyra-mint">
              0
            </span>
            <span className="text-sm font-semibold text-slate-500 dark:text-keyra-text/40 mt-1">
              Data Breaches
            </span>
          </div>
        </div>

        <h2 className="mt-10 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Ready to take control of your keys?
        </h2>

        <p className="mt-5 text-lg text-slate-500 dark:text-keyra-text/50 max-w-2xl mx-auto leading-relaxed">
          Stop storing API keys in plain text. Join thousands of developers who trust Keyra
          with their most sensitive credentials.
        </p>

        <div ref={buttonRef} className="mt-10 inline-block">
          <Link href="/signup">
            <Button
              size="lg"
              className="shadow-lg hover:shadow-glow-violet text-base px-8 py-3 h-auto group"
            >
              Get Started Free
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>

        <p className="mt-5 text-xs text-slate-400 dark:text-keyra-text/30">
          No credit card required · Free forever for personal use
        </p>
      </div>
    </section>
  );
}
