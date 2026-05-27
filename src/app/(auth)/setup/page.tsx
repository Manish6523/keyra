"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Shield } from "lucide-react";

export default function SetupPage() {
  const router = useRouter();

  useEffect(() => {
    router.push("/dashboard");
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] dark:bg-[#030303] text-slate-800 dark:text-keyra-text px-6 transition-colors duration-300">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 dark:bg-keyra-violet/10 text-indigo-600 dark:text-keyra-violet shadow-sm">
          <Shield className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Ready</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-keyra-text/50">
          Taking you to your vault...
        </p>
      </div>
    </div>
  );
}
