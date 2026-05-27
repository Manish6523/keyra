"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Key,
  FolderKanban,
  Settings,
  LogOut,
  Archive,
  Menu,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { KeyDialog } from "@/components/keys/key-dialog";
import { CommandPalette } from "@/components/layout/command-palette";
import { useVaultStore } from "@/store/vault";
import { useAuth } from "@/contexts/auth-context";
import { fetchKeys, fetchProjects, createKey } from "@/lib/db";
import { ThemeToggle } from "@/contexts/theme-context";
import { FloatingDock } from "@/components/layout/floating-dock";
import { CommandHub } from "@/components/layout/command-hub";
import { FloatingActionBar } from "@/components/layout/floating-action-bar";

const sidebarLinks = [
  { href: "/dashboard", label: "All Keys", icon: Key },
  { href: "/dashboard/projects", label: "Projects", icon: FolderKanban },
  { href: "/dashboard/sandbox", label: "Sandbox", icon: Sparkles },
  { href: "/archive", label: "Archive", icon: Archive },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [showAddKey, setShowAddKey] = useState(false);
  const [showCmdPalette, setShowCmdPalette] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const setKeys = useVaultStore((s) => s.setKeys);
  const setProjects = useVaultStore((s) => s.setProjects);
  const { user, signOut } = useAuth();

  useEffect(() => {
    if (typeof window !== "undefined" && user) {
      const storedKey = sessionStorage.getItem("keyra_encryption_key");
      if (!storedKey) {
        console.warn("Vault session key is missing. Logging out to restore session...");
        signOut();
      }
    }
  }, [user, signOut]);

  useEffect(() => {
    if (!user) return;

    fetchProjects()
      .then((projects) => {
        setProjects(projects);
        const ids = new Set(projects.map((p) => p.id));
        return fetchKeys(ids);
      })
      .then(setKeys)
      .catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setShowCmdPalette(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const SidebarContent = () => (
    <>
      <Link
        href="/dashboard"
        className="flex h-16 items-center gap-2 border-b border-slate-200 dark:border-white/5 px-6 hover:opacity-80 transition-opacity"
      >
        <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
          Keyra
        </span>
      </Link>

      <nav className="flex-1 space-y-1 p-3">
        {sidebarLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                isActive
                  ? "text-indigo-600 dark:text-keyra-violet"
                  : "text-slate-600 dark:text-keyra-text/60 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active-pill"
                  className="absolute inset-0 bg-indigo-50 dark:bg-keyra-violet/10 rounded-lg -z-10"
                  transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                />
              )}
              <Icon className="h-4 w-4" />
              <span className="font-medium">{link.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 dark:border-white/5 p-3 space-y-1">
        {user?.email && (
          <div className="mb-2 px-3 py-2 text-xs text-slate-400 dark:text-keyra-text/40 truncate">
            {user.email}
          </div>
        )}
        <Link
          href="/settings"
          className={cn(
            "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
            pathname === "/settings"
              ? "text-indigo-600 dark:text-keyra-violet"
              : "text-slate-600 dark:text-keyra-text/60 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
          )}
        >
          {pathname === "/settings" && (
            <motion.div
              layoutId="sidebar-active-pill"
              className="absolute inset-0 bg-indigo-50 dark:bg-keyra-violet/10 rounded-lg -z-10"
              transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
            />
          )}
          <Settings className="h-4 w-4" />
          <span className="font-medium">Settings</span>
        </Link>
        <button
          onClick={signOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-600 dark:text-keyra-text/60 transition-colors hover:bg-slate-100 dark:hover:bg-white/5 hover:text-rose-600 dark:hover:text-keyra-red font-medium"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen w-screen bg-[#F8FAFC] dark:bg-[#030303] text-slate-800 dark:text-keyra-text overflow-hidden relative">
      {/* Floating Left Dock (Desktop only) */}
      <FloatingDock />

      {/* Spotlight Command Hub (Desktop only, as mobile has a simple search or drawer) */}
      <div className="hidden md:block">
        <CommandHub onOpenCmdPalette={() => setShowCmdPalette(true)} />
      </div>

      {/* Floating Bottom Action Bar */}
      <FloatingActionBar onAddKey={() => setShowAddKey(true)} />

      {/* Mobile Top Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-white/70 dark:bg-keyra-navy/70 backdrop-blur-md border-b border-slate-200/80 dark:border-white/5 flex items-center justify-between px-4 z-40">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-slate-500 dark:text-keyra-text/60 hover:bg-slate-100 dark:hover:bg-white/5"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <span className="font-bold text-slate-900 dark:text-white">Keyra</span>
        </div>
        <ThemeToggle />
      </div>

      {/* Mobile Sidebar Navigation Drawer */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 z-40 bg-black/40 dark:bg-black/60 backdrop-blur-sm md:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 20, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-white dark:bg-keyra-navy shadow-2xl md:hidden border-r border-slate-200 dark:border-transparent"
            >
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Workspace Frame */}
      <div className="flex flex-1 flex-col min-w-0 h-full overflow-hidden ">
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:pl-28 md:pr-8 pt-20 md:pt-24 pb-28 bg-[#F8FAFC] dark:bg-[#030303] transition-colors duration-200">
          {children}
        </main>
      </div>

      <KeyDialog
        open={showAddKey}
        onClose={() => setShowAddKey(false)}
        onSave={async (data) => {
          try {
            const newKey = await createKey({
              projectId: data.projectId || "",
              serviceName: data.serviceName || "Custom",
              label: data.label || "Untitled",
              encryptedValue: data.encryptedValue || "",
              environment:
                (data.environment as "development" | "staging" | "production") ||
                "development",
              tags: data.tags || [],
              description: data.description,
              docsUrl: data.docsUrl,
              expiryDate: data.expiryDate,
              archived: false,
              favorite: false,
            });
            useVaultStore.getState().addKey(newKey);
          } catch (err) {
            console.error("Failed to create key:", err);
          }
          setShowAddKey(false);
        }}
      />

      <CommandPalette
        open={showCmdPalette}
        onClose={() => setShowCmdPalette(false)}
        onAddKey={() => {
          setShowCmdPalette(false);
          setShowAddKey(true);
        }}
      />
    </div>
  );
}
