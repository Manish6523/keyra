"use client";

import { useState } from "react";
import { KeyCard } from "@/components/keys/key-card";
import { useVaultStore } from "@/store/vault";
import { ArchiveRestore, Loader2 } from "lucide-react";
import { updateKeyInDB, deleteKeyFromDB } from "@/lib/db";
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { LayoutGroup, motion } from "framer-motion";

export default function ArchivePage() {
  const keys = useVaultStore((s) => s.keys);
  const updateKey = useVaultStore((s) => s.updateKey);
  const removeKey = useVaultStore((s) => s.removeKey);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const archivedKeys = keys.filter((k) => k.archived);

  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    setIsProcessing(deleteConfirmId);
    try {
      await deleteKeyFromDB(deleteConfirmId);
      removeKey(deleteConfirmId);
    } catch (err) {
      console.error("Failed to delete key:", err);
    } finally {
      setIsProcessing(null);
      setDeleteConfirmId(null);
    }
  };

  const handleRestore = async (id: string) => {
    setIsProcessing(id);
    try {
      await updateKeyInDB(id, { archived: false });
      updateKey(id, { archived: false });
    } catch (err) {
      console.error("Failed to restore key:", err);
    } finally {
      setIsProcessing(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Archive
        </h1>
        <p className="text-sm text-slate-500 dark:text-keyra-text/50">
          {archivedKeys.length} archived key{archivedKeys.length !== 1 ? "s" : ""}
        </p>
      </div>

      {archivedKeys.length === 0 ? (
        <ScrollReveal className="rounded-xl border border-slate-200/60 dark:border-white/5 bg-white dark:bg-keyra-navy p-16 text-center shadow-sm flex flex-col items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-keyra-text/20 mb-4 animate-float-slow">
            <ArchiveRestore className="h-6 w-6" />
          </div>
          <p className="text-sm font-medium text-slate-400 dark:text-keyra-text/40">
            Archive is empty.
          </p>
        </ScrollReveal>
      ) : (
        <LayoutGroup>
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {archivedKeys.map((key) => (
              <motion.div key={key.id} layout className="relative group">
                <KeyCard
                  keyData={key}
                  onEdit={() => {}}
                  onDelete={(id) => setDeleteConfirmId(id)}
                />
                {/* Float restore button next to options trigger */}
                <button
                  onClick={() => handleRestore(key.id)}
                  disabled={isProcessing === key.id}
                  className="absolute top-4 right-12 z-20 flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d0f14] text-slate-400 dark:text-keyra-text/45 hover:text-indigo-600 dark:hover:text-keyra-cyan hover:bg-slate-100 dark:hover:bg-white/5 transition-colors disabled:opacity-50 shadow-sm"
                  title="Restore Key"
                >
                  {isProcessing === key.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ArchiveRestore className="h-4 w-4" />
                  )}
                </button>
              </motion.div>
            ))}
          </div>
        </LayoutGroup>
      )}

      {/* Delete Confirmation Modal */}
      <Dialog
        open={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
      >
        <DialogHeader>
          <DialogTitle className="text-slate-900 dark:text-white">Permanently Delete Key</DialogTitle>
          <DialogDescription className="text-slate-500 dark:text-slate-400">
            Are you sure you want to permanently delete this key? This action is irreversible and all backup links will be broken.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-6 flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => setDeleteConfirmId(null)}
            disabled={!!isProcessing}
          >
            Cancel
          </Button>
          <Button
            className="bg-keyra-red text-white hover:bg-keyra-red/90"
            onClick={handleDelete}
            disabled={!!isProcessing}
          >
            {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete Permanently
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
