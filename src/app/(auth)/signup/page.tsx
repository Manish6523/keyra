"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signUp } from "@/lib/db";
import { ThemeToggle } from "@/contexts/theme-context";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { Key, MailCheck } from "lucide-react";
import { motion } from "framer-motion";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await signUp(email, password);
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <div className="relative flex min-h-screen items-center justify-center bg-[#F8FAFC] dark:bg-[#030303] text-slate-800 dark:text-keyra-text px-6 transition-colors duration-300">
        <div className="absolute inset-0 bg-dot-slate-300/[0.4] dark:bg-dot-white/[0.04] [mask-image:radial-gradient(ellipse_at_center,black_70%,transparent_100%)]" />

        <div className="absolute top-4 right-4 z-50">
          <ThemeToggle />
        </div>

        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-md relative z-10 text-center"
        >
          <SpotlightCard className="p-8 bg-white/70 dark:bg-white/[0.02] border-slate-200/60 dark:border-white/[0.06] shadow-xl flex flex-col items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 dark:bg-keyra-mint/10 text-emerald-600 dark:text-keyra-mint mb-4 shadow-sm">
              <MailCheck className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Check your email
            </h1>
            <p className="mt-3 text-sm text-slate-500 dark:text-keyra-text/50 leading-relaxed">
              We&apos;ve sent a verification link to{" "}
              <strong className="text-slate-800 dark:text-white font-semibold">
                {email}
              </strong>
              . Please verify your email to unlock your vault.
            </p>
            <Button
              className="mt-6 w-full"
              onClick={() => router.push("/login")}
            >
              Go to login
            </Button>
          </SpotlightCard>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#F8FAFC] dark:bg-[#030303] text-slate-800 dark:text-keyra-text px-6 transition-colors duration-300">
      {/* Background dots */}
      <div className="absolute inset-0 bg-dot-slate-300/[0.4] dark:bg-dot-white/[0.04] [mask-image:radial-gradient(ellipse_at_center,black_70%,transparent_100%)]" />

      {/* Theme Toggle Top Right */}
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-3 hover:opacity-85 transition-opacity">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 dark:bg-keyra-violet text-white shadow-md">
              <Key className="h-5 w-5" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Keyra
            </span>
          </Link>
          <p className="text-sm text-slate-500 dark:text-keyra-text/50">
            Create your account to start secure developer vault.
          </p>
        </div>

        <SpotlightCard className="p-6 sm:p-8 bg-white/70 dark:bg-white/[0.02] border-slate-200/60 dark:border-white/[0.06] shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
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
              />
            </div>
            <div>
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
              />
            </div>

            {error && (
              <p className="text-sm font-medium text-rose-600 dark:text-keyra-red mt-1">
                {error}
              </p>
            )}

            <Button
              type="submit"
              className="w-full bg-keyra-violet text-white hover:bg-keyra-violet/90 mt-2"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Create account"}
            </Button>
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
