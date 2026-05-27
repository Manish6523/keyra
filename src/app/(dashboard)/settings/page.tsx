"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/auth-context";
import { useVaultStore } from "@/store/vault";
import { LogOut, Shield, Clock, Copy, Trash2, Download } from "lucide-react";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import confetti from "canvas-confetti";

export default function SettingsPage() {
  const { signOut, user } = useAuth();
  const router = useRouter();
  const keys = useVaultStore((s) => s.keys);

  const [clipboardClear, setClipboardClear] = useState(30);
  const [sessionTimeout, setSessionTimeout] = useState(15);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");

  const [pkiStatus, setPkiStatus] = useState<"ok" | "corrupted" | "missing">("ok");
  const [isRegenerating, setIsRegenerating] = useState(false);

  useEffect(() => {
    const fetchPki = async () => {
      const { checkPkiStatus } = await import("@/lib/pki");
      const status = await checkPkiStatus();
      setPkiStatus(status);
    };
    fetchPki();
  }, []);

  const handleRegeneratePki = async () => {
    setIsRegenerating(true);
    try {
      const { regenerateUserPKI } = await import("@/lib/pki");
      await regenerateUserPKI();
      setPkiStatus("ok");
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.8 },
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsRegenerating(false);
    }
  };

  useEffect(() => {
    const savedClipboard = localStorage.getItem("keyra_clipboard_clear");
    const savedSession = localStorage.getItem("keyra_session_timeout");
    if (savedClipboard) setClipboardClear(Number(savedClipboard));
    if (savedSession) setSessionTimeout(Number(savedSession));
  }, []);

  const handleClipboardChange = (val: number) => {
    setClipboardClear(val);
    localStorage.setItem("keyra_clipboard_clear", val.toString());
  };

  const handleSessionChange = (val: number) => {
    setSessionTimeout(val);
    localStorage.setItem("keyra_session_timeout", val.toString());
  };

  const handleExportBackup = () => {
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
    a.download = `keyra-full-backup-${
      new Date().toISOString().split("T")[0]
    }.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Confetti success celebration
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.8 },
    });
  };

  const handleDeleteAccount = async () => {
    if (deleteInput !== "DELETE") return;
    await signOut();
    router.push("/");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Settings
        </h1>
        <p className="text-sm text-slate-500 dark:text-keyra-text/50">
          Manage vault security settings, account connections, and local backups.
        </p>
      </div>

      <div className="space-y-6 max-w-3xl">
        {/* Session & Clipboard Card */}
        <ScrollReveal>
          <SpotlightCard className="p-6 bg-white/70 dark:bg-white/[0.02] border-slate-200/60 dark:border-white/[0.06] shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 dark:bg-keyra-cyan/10 text-indigo-500">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Vault Security Settings
                </h2>
                <p className="text-xs text-slate-500 dark:text-keyra-text/50">
                  Configure local clipboard and session lock timers.
                </p>
              </div>
            </div>
            <Separator className="my-4" />
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-white">
                    Session Inactivity Lock
                  </p>
                  <p className="text-xs text-slate-400 dark:text-keyra-text/50 mt-0.5">
                    Minutes of idle time before automatic lockout
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-slate-400 dark:text-keyra-text/40" />
                  <Input
                    type="number"
                    value={sessionTimeout}
                    onChange={(e) =>
                      handleSessionChange(Number(e.target.value))
                    }
                    className="w-20 text-center font-medium"
                    min={1}
                    max={120}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-white">
                    Clipboard Auto-Clear
                  </p>
                  <p className="text-xs text-slate-400 dark:text-keyra-text/50 mt-0.5">
                    Seconds after key copy before clipboard is cleared
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Copy className="h-4 w-4 text-slate-400 dark:text-keyra-text/40" />
                  <Input
                    type="number"
                    value={clipboardClear}
                    onChange={(e) =>
                      handleClipboardChange(Number(e.target.value))
                    }
                    className="w-20 text-center font-medium"
                    min={5}
                    max={120}
                  />
                </div>
              </div>
            </div>
          </SpotlightCard>
        </ScrollReveal>

        {/* Cryptographic Diagnostics Card */}
        <ScrollReveal>
          <SpotlightCard className="p-6 bg-white/70 dark:bg-white/[0.02] border-slate-200/60 dark:border-white/[0.06] shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 dark:bg-keyra-cyan/10 text-indigo-500">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Cryptographic Keys Status
                </h2>
                <p className="text-xs text-slate-500 dark:text-keyra-text/50">
                  Verify the status of your client-side encryption key pair.
                </p>
              </div>
            </div>
            <Separator className="my-4" />
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-white">
                    E2EE Key Pair Status
                  </p>
                  <p className="text-xs text-slate-400 dark:text-keyra-text/50 mt-0.5">
                    Used to decrypt keys shared in group projects
                  </p>
                </div>
                <div>
                  {pkiStatus === "ok" ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      Secure & Active
                    </span>
                  ) : pkiStatus === "corrupted" ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 dark:bg-rose-500/10 px-2.5 py-0.5 text-xs font-semibold text-rose-600 dark:text-rose-400 animate-pulse">
                      Stale / Action Required
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-white/5 px-2.5 py-0.5 text-xs font-semibold text-slate-600 dark:text-slate-400">
                      Uninitialized
                    </span>
                  )}
                </div>
              </div>

              {pkiStatus === "corrupted" && (
                <div className="rounded-xl border border-rose-200 dark:border-rose-500/20 bg-rose-50/50 dark:bg-rose-500/5 p-4 space-y-3">
                  <p className="text-xs text-rose-700 dark:text-rose-400 leading-relaxed">
                    Your key pair could not be decrypted, likely due to a stale session key or password change. Regenerating your keys will restore E2EE functionality for your own projects, but you will need to ask owners to re-invite you to shared projects.
                  </p>
                  <Button
                    size="sm"
                    className="bg-rose-600 hover:bg-rose-700 dark:bg-keyra-red dark:hover:bg-keyra-red/90 text-white font-semibold text-xs rounded-lg shadow-sm"
                    onClick={handleRegeneratePki}
                    disabled={isRegenerating}
                  >
                    {isRegenerating ? "Regenerating..." : "Regenerate Cryptographic Keys"}
                  </Button>
                </div>
              )}
            </div>
          </SpotlightCard>
        </ScrollReveal>

        {/* Account Info Card */}
        <ScrollReveal>
          <SpotlightCard className="p-6 bg-white/70 dark:bg-white/[0.02] border-slate-200/60 dark:border-white/[0.06] shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-50 dark:bg-keyra-red/10 text-rose-500">
                <LogOut className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Developer Account
                </h2>
                <p className="text-xs text-slate-500 dark:text-keyra-text/50">
                  Signed in as <strong className="text-slate-700 dark:text-white font-semibold">{user?.email}</strong>
                </p>
              </div>
            </div>
            <Separator className="my-4" />
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full border-rose-200 hover:border-rose-300 dark:border-keyra-red/20 text-rose-600 dark:text-keyra-red hover:bg-rose-50 dark:hover:bg-keyra-red/10"
                onClick={signOut}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </SpotlightCard>
        </ScrollReveal>

        {/* Danger Zone Card */}
        <ScrollReveal>
          <SpotlightCard className="p-6 bg-white/70 dark:bg-white/[0.02] border-slate-200/60 dark:border-white/[0.06] shadow-sm border-rose-100 dark:border-rose-950/20">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-100 dark:bg-keyra-red/20 text-rose-600">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-rose-600 dark:text-white">
                  Danger Zone
                </h2>
                <p className="text-xs text-slate-500 dark:text-keyra-text/50">
                  Actions are irreversible. Backup data before proceeding.
                </p>
              </div>
            </div>
            <Separator className="my-4" />
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full border-slate-200 dark:border-white/10"
                onClick={handleExportBackup}
              >
                <Download className="mr-2 h-4 w-4 text-indigo-600 dark:text-keyra-violet" />
                Export Full Encrypted Backup
              </Button>
              <Button
                variant="outline"
                className="w-full border-rose-200 hover:border-rose-300 dark:border-keyra-red/20 text-rose-600 dark:text-keyra-red hover:bg-rose-50 dark:hover:bg-keyra-red/10"
                onClick={() => setDeleteConfirmOpen(true)}
              >
                Delete Account & All Data
              </Button>
            </div>
          </SpotlightCard>
        </ScrollReveal>
      </div>

      {/* Account Delete Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setDeleteInput("");
        }}
      >
        <DialogHeader>
          <DialogTitle className="text-slate-900 dark:text-white">Delete Vault Account</DialogTitle>
          <DialogDescription className="text-slate-500 dark:text-slate-400">
            This action is irreversible. All stored keys, environments, and collaborators will be deleted permanently. Type <strong className="text-slate-800 dark:text-white font-semibold">DELETE</strong> below to confirm.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <Input
            value={deleteInput}
            onChange={(e) => setDeleteInput(e.target.value)}
            placeholder="DELETE"
            className="text-center font-bold tracking-widest text-rose-600 dark:text-keyra-red focus:border-rose-600 focus:ring-rose-500/25 uppercase"
          />
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => {
              setDeleteConfirmOpen(false);
              setDeleteInput("");
            }}
          >
            Cancel
          </Button>
          <Button
            className="bg-keyra-red text-white hover:bg-keyra-red/90"
            onClick={handleDeleteAccount}
            disabled={deleteInput !== "DELETE"}
          >
            Delete Account
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
