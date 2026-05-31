"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signUp } from "@/lib/db";
import { ThemeToggle } from "@/contexts/theme-context";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { Key, MailCheck } from "lucide-react";
import { AuroraBackground } from "@/components/landing/aurora-background";
import { FloatingParticles } from "@/components/landing/floating-particles";
import gsap from "gsap";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const formRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!formRef.current || success) return;
    const ctx = gsap.context(() => {
      gsap.from(".signup-logo", {
        opacity: 0,
        scale: 0.5,
        y: -20,
        duration: 0.7,
        ease: "back.out(1.7)",
        delay: 0.2,
      });
      gsap.from(".signup-subtitle", {
        opacity: 0,
        y: 10,
        filter: "blur(8px)",
        duration: 0.6,
        ease: "power3.out",
        delay: 0.5,
      });
      gsap.from(".signup-card", {
        opacity: 0,
        y: 30,
        scale: 0.97,
        duration: 0.7,
        ease: "power3.out",
        delay: 0.7,
      });
      gsap.from(".signup-field", {
        opacity: 0,
        x: -15,
        duration: 0.5,
        stagger: 0.12,
        ease: "power2.out",
        delay: 1.0,
      });
      gsap.from(".signup-submit", {
        opacity: 0,
        y: 10,
        duration: 0.5,
        ease: "power2.out",
        delay: 1.4,
      });
    }, formRef);
    return () => ctx.revert();
  }, [success]);

  // Success state entrance
  useEffect(() => {
    if (!success || !successRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(".success-icon", {
        scale: 0,
        rotation: -180,
        duration: 0.8,
        ease: "back.out(1.7)",
        delay: 0.2,
      });
      gsap.from(".success-title", {
        opacity: 0,
        y: 15,
        duration: 0.6,
        ease: "power3.out",
        delay: 0.5,
      });
      gsap.from(".success-desc", {
        opacity: 0,
        y: 10,
        duration: 0.5,
        ease: "power3.out",
        delay: 0.7,
      });
      gsap.from(".success-btn", {
        opacity: 0,
        y: 10,
        duration: 0.5,
        ease: "power3.out",
        delay: 0.9,
      });
    }, successRef);
    return () => ctx.revert();
  }, [success]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await signUp(email, password);
    if (error) {
      setError(error.message);
      setLoading(false);
      gsap.fromTo(
        ".signup-card",
        { x: -8 },
        { x: 0, duration: 0.5, ease: "elastic.out(1, 0.3)" }
      );
      return;
    }

    // Animate card out, then show success
    gsap.to(".signup-card", {
      scale: 0.95,
      opacity: 0,
      duration: 0.3,
      ease: "power2.in",
      onComplete: () => {
        setSuccess(true);
        setLoading(false);
      },
    });
  };

  if (success) {
    return (
      <div
        ref={successRef}
        className="relative flex min-h-screen items-center justify-center bg-[#F8FAFC] dark:bg-[#030303] text-slate-800 dark:text-keyra-text px-6 transition-colors duration-300 overflow-hidden"
      >
        <AuroraBackground />
        <FloatingParticles />

        <div className="absolute top-4 right-4 z-50">
          <ThemeToggle />
        </div>

        <div className="w-full max-w-md relative z-10 text-center">
          <SpotlightCard className="p-8 bg-white/70 dark:bg-white/[0.02] border-slate-200/60 dark:border-white/[0.06] shadow-xl backdrop-blur-xl flex flex-col items-center">
            <div className="success-icon flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 dark:bg-keyra-mint/10 text-emerald-600 dark:text-keyra-mint mb-5 shadow-sm shadow-emerald-500/10">
              <MailCheck className="h-7 w-7" />
            </div>
            <h1 className="success-title text-2xl font-bold text-slate-900 dark:text-white">
              Check your email
            </h1>
            <p className="success-desc mt-3 text-sm text-slate-500 dark:text-keyra-text/50 leading-relaxed">
              We&apos;ve sent a verification link to{" "}
              <strong className="text-slate-800 dark:text-white font-semibold">
                {email}
              </strong>
              . Please verify your email to unlock your vault.
            </p>
            <div className="success-btn w-full mt-6">
              <Button
                className="w-full"
                onClick={() => router.push("/login")}
              >
                Go to login
              </Button>
            </div>
          </SpotlightCard>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={formRef}
      className="relative flex min-h-screen items-center justify-center bg-[#F8FAFC] dark:bg-[#030303] text-slate-800 dark:text-keyra-text px-6 transition-colors duration-300 overflow-hidden"
    >
      <AuroraBackground />
      <FloatingParticles />

      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="signup-logo inline-flex items-center gap-2 mb-3 hover:opacity-85 transition-opacity"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 dark:bg-keyra-violet text-white shadow-md shadow-indigo-500/20 dark:shadow-keyra-violet/20">
              <Key className="h-5 w-5" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Keyra
            </span>
          </Link>
          <p className="signup-subtitle text-sm text-slate-500 dark:text-keyra-text/50">
            Create your account to start your secure developer vault.
          </p>
        </div>

        <SpotlightCard className="signup-card p-6 sm:p-8 bg-white/70 dark:bg-white/[0.02] border-slate-200/60 dark:border-white/[0.06] shadow-xl backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="signup-field">
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-slate-700 dark:text-keyra-text/80 mb-1.5"
              >
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="auth-input-glow"
              />
            </div>
            <div className="signup-field">
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-slate-700 dark:text-keyra-text/80 mb-1.5"
              >
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password (min. 6 chars)"
                required
                minLength={6}
                className="auth-input-glow"
              />
            </div>

            {error && (
              <p className="text-sm font-medium text-rose-600 dark:text-keyra-red mt-1 animate-shake">
                {error}
              </p>
            )}

            <div className="signup-submit">
              <Button
                type="submit"
                className="w-full bg-keyra-violet text-white hover:bg-keyra-violet/90 mt-2"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating account...
                  </span>
                ) : (
                  "Create account"
                )}
              </Button>
            </div>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500 dark:text-keyra-text/50">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-indigo-600 dark:text-keyra-violet hover:underline font-semibold"
            >
              Sign in
            </Link>
          </p>
        </SpotlightCard>
      </div>
    </div>
  );
}
