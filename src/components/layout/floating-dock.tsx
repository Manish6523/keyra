"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Key,
  FolderKanban,
  Archive,
  Settings,
  LogOut,
  ChevronRight,
  ChevronLeft,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/auth-context";
import gsap from "gsap";

const navLinks = [
  { href: "/dashboard", label: "All Keys", icon: Key },
  { href: "/dashboard/projects", label: "Projects", icon: FolderKanban },
  { href: "/dashboard/sandbox", label: "Sandbox", icon: Sparkles },
  { href: "/archive", label: "Archive", icon: Archive },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function FloatingDock() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const dockRef = useRef<HTMLDivElement>(null);

  // GSAP entrance animation
  useEffect(() => {
    if (!dockRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(dockRef.current, {
        x: -80,
        opacity: 0,
        duration: 0.7,
        ease: "back.out(1.4)",
        delay: 0.3,
      });
    }, dockRef);
    return () => ctx.revert();
  }, []);

  // macOS-style magnification: compute scale for each icon based on distance from hovered
  const getIconScale = (idx: number) => {
    if (hoveredIndex === null) return 1;
    const distance = Math.abs(idx - hoveredIndex);
    if (distance === 0) return 1.25;
    if (distance === 1) return 1.1;
    return 1;
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error("Sign out error", err);
    }
  };

  return (
    <motion.div
      ref={dockRef}
      animate={{ width: isCollapsed ? "64px" : "200px" }}
      transition={{ type: "spring", stiffness: 220, damping: 26 }}
      className="fixed left-4 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col h-[85vh] bg-white/70 dark:bg-keyra-navy/70 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 rounded-2xl shadow-xl shadow-slate-900/5 dark:shadow-black/40 py-4 px-3 overflow-hidden select-none transition-colors dock-gradient-border"
    >
      {/* Brand logo or icon */}
      <div className="flex items-center gap-3 px-1 mb-6 h-10">
        <div className="flex items-center justify-center min-w-[40px] h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-keyra-violet shadow-glow-violet text-white font-bold text-lg select-none">
          K
        </div>
        <AnimatePresence>
          {!isCollapsed && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="text-base font-bold tracking-tight text-slate-800 dark:text-white truncate"
            >
              Keyra
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-2">
        {navLinks.map((link, idx) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;

          return (
            <div
              key={link.href}
              className="relative"
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <Link
                href={link.href}
                className={cn(
                  "flex items-center gap-3 min-h-[44px] rounded-xl px-3 transition-colors duration-200 relative z-10",
                  isActive
                    ? "text-indigo-600 dark:text-keyra-violet font-semibold"
                    : "text-slate-600 dark:text-keyra-text/60 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="dock-active-pill"
                    className="absolute inset-0 bg-indigo-50 dark:bg-keyra-violet/10 border-l-2 border-indigo-600 dark:border-keyra-violet rounded-xl -z-10"
                    transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                  />
                )}
                <div
                  className="min-w-[20px] flex justify-center items-center transition-transform duration-200"
                  style={{ transform: `scale(${getIconScale(idx)})` }}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                      className="text-sm truncate"
                    >
                      {link.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>

              {/* Tooltip on collapsed state hover */}
              <AnimatePresence>
                {isCollapsed && hoveredIndex === idx && (
                  <motion.div
                    initial={{ opacity: 0, x: -10, scale: 0.95 }}
                    animate={{ opacity: 1, x: 10, scale: 1 }}
                    exit={{ opacity: 0, x: -10, scale: 0.95 }}
                    className="absolute left-14 top-1/2 -translate-y-1/2 z-50 bg-slate-900/90 dark:bg-keyra-charcoal/95 backdrop-blur-md text-white text-xs py-1.5 px-3 rounded-lg border border-slate-700 dark:border-white/10 shadow-lg whitespace-nowrap font-medium pointer-events-none"
                  >
                    {link.label}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </nav>

      {/* Collapse/Expand Toggle Button */}
      <div className="mb-2">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex w-full items-center gap-3 min-h-[44px] rounded-xl px-3 text-slate-400 dark:text-keyra-text/40 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
        >
          <div className="min-w-[20px] flex justify-center items-center">
            {isCollapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="text-sm truncate"
              >
                Collapse
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Footer Profile & Logout */}
      <div className="border-t border-slate-200/80 dark:border-white/10 pt-4 flex flex-col gap-2">
        {user?.email && !isCollapsed && (
          <div className="px-2 text-[10px] text-slate-400 dark:text-keyra-text/40 truncate text-center">
            {user.email}
          </div>
        )}
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 min-h-[44px] rounded-xl px-3 text-slate-600 dark:text-keyra-text/60 hover:text-rose-600 dark:hover:text-keyra-red hover:bg-rose-50 dark:hover:bg-keyra-red/10 transition-colors duration-200"
        >
          <div className="min-w-[20px] flex justify-center items-center">
            <LogOut className="h-5 w-5" />
          </div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="text-sm font-medium truncate"
              >
                Sign Out
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.div>
  );
}
