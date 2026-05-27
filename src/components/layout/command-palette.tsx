"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, Settings as SettingsIcon, FileText, Download } from "lucide-react";
import { useRouter } from "next/navigation";
import { useVaultStore } from "@/store/vault";

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  onAddKey: () => void;
}

const commands = [
  { id: "add-key", icon: Plus, label: "Add API Key", shortcut: "A" },
  { id: "search", icon: Search, label: "Search keys...", shortcut: "S" },
  { id: "import", icon: FileText, label: "Import from .env", shortcut: "I" },
  { id: "export", icon: Download, label: "Export backup", shortcut: "E" },
  { id: "settings", icon: SettingsIcon, label: "Open Settings", shortcut: "G" },
];

export function CommandPalette({
  open,
  onClose,
  onAddKey,
}: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();

  const filtered = commands.filter((c) =>
    c.label.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIndex(0);
    }
  }, [open]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleSelect = (id: string) => {
    onClose();
    switch (id) {
      case "add-key":
        onAddKey();
        break;
      case "search":
        setTimeout(() => {
          const searchInput = document.querySelector(
            'input[placeholder*="Search keys"]'
          ) as HTMLInputElement;
          if (searchInput) searchInput.focus();
        }, 100);
        break;
      case "export":
        const keys = useVaultStore.getState().keys;
        const backup = {
          version: 1,
          exportDate: new Date().toISOString(),
          keys,
        };
        const blob = new Blob([JSON.stringify(backup, null, 2)], {
          type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `keyra-backup-${
          new Date().toISOString().split("T")[0]
        }.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        break;
      case "settings":
        router.push("/settings");
        break;
      case "import":
        router.push("/import");
        break;
    }
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      }
      if (e.key === "Enter" && filtered[selectedIndex]) {
        handleSelect(filtered[selectedIndex].id);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, filtered, selectedIndex]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 dark:bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -20 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="fixed left-1/2 top-[15%] z-50 w-full max-w-lg -translate-x-1/2 p-4"
          >
            <div className="rounded-xl border border-slate-200 dark:border-white/5 bg-white dark:bg-keyra-charcoal shadow-2xl overflow-hidden">
              <div className="flex items-center border-b border-slate-100 dark:border-white/5 px-4 py-1">
                <Search className="h-4 w-4 text-slate-400 dark:text-keyra-text/40" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Type a command..."
                  aria-label="Search commands"
                  className="flex-1 bg-transparent px-3 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-keyra-text/30 focus:outline-none"
                />
                <kbd className="rounded border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-keyra-navy px-1.5 py-0.5 text-[10px] text-slate-400 dark:text-keyra-text/30 font-sans font-medium">
                  ESC
                </kbd>
              </div>
              <div className="p-2 max-h-80 overflow-y-auto">
                {filtered.map((cmd, i) => {
                  const Icon = cmd.icon;
                  return (
                    <button
                      key={cmd.id}
                      onClick={() => handleSelect(cmd.id)}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                        i === selectedIndex
                          ? "bg-indigo-50 dark:bg-keyra-violet/10 text-indigo-600 dark:text-keyra-violet"
                          : "text-slate-700 dark:text-keyra-text/70 hover:bg-slate-50 dark:hover:bg-white/5"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="flex-1 text-left font-medium">
                        {cmd.label}
                      </span>
                      <kbd className="rounded border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-keyra-navy px-1.5 py-0.5 text-[10px] text-slate-400 dark:text-keyra-text/30 font-sans font-medium">
                        {cmd.shortcut}
                      </kbd>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
