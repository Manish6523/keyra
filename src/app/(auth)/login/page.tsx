"use client";

import { Suspense, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "@/lib/db";
import { ThemeToggle } from "@/contexts/theme-context";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { Key } from "lucide-react";
import { AuroraBackground } from "@/components/landing/aurora-background";
import { FloatingParticles } from "@/components/landing/floating-particles";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";
  const formRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Logo entrance
    gsap.from(".login-logo", {
      opacity: 0,
      scale: 0.5,
      y: -20,
      duration: 0.7,
      ease: "back.out(1.7)",
      delay: 0.2,
    });
    // Subtitle
    gsap.from(".login-subtitle", {
      opacity: 0,
      y: 10,
      filter: "blur(8px)",
      duration: 0.6,
      ease: "power3.out",
      delay: 0.5,
    });
    // Card
    gsap.from(".login-card", {
      opacity: 0,
      y: 30,
      scale: 0.97,
      duration: 0.7,
      ease: "power3.out",
      delay: 0.7,
    });
    // Form fields stagger
    gsap.from(".login-field", {
      opacity: 0,
      x: -15,
      duration: 0.5,
      stagger: 0.12,
      ease: "power2.out",
      delay: 1.0,
    });
    // Submit button
    gsap.from(".login-submit", {
      opacity: 0,
      y: 10,
      duration: 0.5,
      ease: "power2.out",
      delay: 1.4,
    });
  }, { scope: formRef });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await signIn(email, password);
    if (error) {
      setError(error.message);
      setLoading(false);
      // Shake animation on error
      gsap.fromTo(
        ".login-card",
        { x: -8 },
        { x: 0, duration: 0.5, ease: "elastic.out(1, 0.3)" }
      );
      return;
    }

    // Success animation before redirect
    gsap.to(".login-card", {
      scale: 0.95,
      opacity: 0,
      y: -20,
      duration: 0.4,
      ease: "power2.in",
      onComplete: () => router.push(redirect),
    });
  };

  return (
    <div
      ref={formRef}
      className="relative flex min-h-screen items-center justify-center bg-[#F8FAFC] dark:bg-[#030303] text-slate-800 dark:text-keyra-text px-6 transition-colors duration-300 overflow-hidden"
    >
      <AuroraBackground />
      <FloatingParticles />

      {/* Theme Toggle Top Right */}
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="login-logo inline-flex items-center gap-2 mb-3 hover:opacity-85 transition-opacity"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 dark:bg-keyra-violet text-white shadow-md shadow-indigo-500/20 dark:shadow-keyra-violet/20">
              <Key className="h-5 w-5" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Keyra
            </span>
          </Link>
          <p className="login-subtitle text-sm text-slate-500 dark:text-keyra-text/50">
            Sign in to access your secure developer vault.
          </p>
        </div>

        <SpotlightCard className="login-card p-6 sm:p-8 bg-white/70 dark:bg-white/[0.02] border-slate-200/60 dark:border-white/[0.06] shadow-xl backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="login-field">
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
            <div className="login-field">
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
                placeholder="Enter your password"
                required
                className="auth-input-glow"
              />
            </div>

            {error && (
              <p className="text-sm font-medium text-rose-600 dark:text-keyra-red mt-1 animate-shake">
                {error}
              </p>
            )}

            <div className="login-submit">
              <Button
                type="submit"
                className="w-full bg-keyra-violet text-white hover:bg-keyra-violet/90 mt-2 relative overflow-hidden"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  "Sign in"
                )}
              </Button>
            </div>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500 dark:text-keyra-text/50">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="text-indigo-600 dark:text-keyra-violet hover:underline font-semibold"
            >
              Sign up
            </Link>
          </p>
        </SpotlightCard>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] dark:bg-[#030303]">
          <p className="text-slate-400 dark:text-keyra-text/40">Loading...</p>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
