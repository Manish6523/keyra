"use client";

import { useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useClipboard } from "@/hooks/use-clipboard";
import type { ApiKey } from "@/store/vault";
import { decryptKeyValue } from "@/lib/db";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { KeyIdenticon } from "@/components/ui/key-identicon";
import {
  Copy,
  Eye,
  EyeOff,
  MoreHorizontal,
  ExternalLink,
  Clock,
  Edit3,
  Trash2,
  Star,
  AlertTriangle,
} from "lucide-react";

const envConfig = {
  development: { label: "Dev", variant: "cyan" as const },
  staging: { label: "Staging", variant: "warning" as const },
  production: { label: "Prod", variant: "danger" as const },
};

interface KeyCardProps {
  keyData: ApiKey;
  onEdit: (key: ApiKey) => void;
  onDelete: (id: string) => void;
}

export function KeyCard({ keyData, onEdit, onDelete }: KeyCardProps) {
  const [revealed, setRevealed] = useState(false);
  const [decryptedValue, setDecryptedValue] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { copy, copied, countdown } = useClipboard(30000);

  // 3D Card Tilt setup
  const rotateXMouse = useMotionValue(0);
  const rotateYMouse = useMotionValue(0);

  const rotateXSpring = useSpring(rotateXMouse, { stiffness: 300, damping: 25 });
  const rotateYSpring = useSpring(rotateYMouse, { stiffness: 300, damping: 25 });

  const rotateX = useTransform(rotateXSpring, [-0.5, 0.5], [6, -6]);
  const rotateY = useTransform(rotateYSpring, [-0.5, 0.5], [-6, 6]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width - 0.5;
    const yPct = (e.clientY - rect.top) / rect.height - 0.5;
    rotateXMouse.set(yPct);
    rotateYMouse.set(xPct);
  };

  const handleMouseLeave = () => {
    rotateXMouse.set(0);
    rotateYMouse.set(0);
  };

  const env = envConfig[keyData.environment];
  const maskedValue = "••••••••••••••••••••••••";

  const getExpiryStatus = () => {
    if (!keyData.expiryDate) return null;
    const daysLeft =
      (new Date(keyData.expiryDate).getTime() - Date.now()) /
      (1000 * 60 * 60 * 24);
    if (daysLeft < 0) return { label: "Expired", color: "text-keyra-red" };
    if (daysLeft <= 7)
      return {
        label: `Expires in ${Math.ceil(daysLeft)}d`,
        color: "text-amber-500 dark:text-yellow-400",
      };
    return null;
  };
  const expiryStatus = getExpiryStatus();

  const handleReveal = async () => {
    if (revealed) {
      setRevealed(false);
      return;
    }
    try {
      const plaintext = await decryptKeyValue(
        keyData.encryptedValue,
        keyData.projectId
      );
      setDecryptedValue(plaintext);
      setRevealed(true);
    } catch (err) {
      console.error("Failed to decrypt key:", err);
    }
  };

  const handleCopy = async () => {
    try {
      const plaintext =
        decryptedValue ||
        (await decryptKeyValue(keyData.encryptedValue, keyData.projectId));
      copy(plaintext);
    } catch (err) {
      console.error("Failed to copy key:", err);
    }
  };

  return (
    <>
      <motion.div
        layout
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
          perspective: 1000,
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="h-full rounded-xl transition-all duration-300"
      >
        <SpotlightCard className="h-full flex flex-col justify-between p-4 bg-white/70 dark:bg-white/[0.02] border-slate-200/60 dark:border-white/[0.06] hover:border-keyra-violet/30 hover:shadow-glow-violet transition-all duration-300">
          <div>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <KeyIdenticon value={keyData.label} size={36} />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-800 dark:text-white">
                      {keyData.label}
                    </span>
                    {keyData.favorite && (
                      <Star className="h-3 w-3 fill-keyra-cyan text-keyra-cyan" />
                    )}
                    {expiryStatus && (
                      <span
                        className={`flex items-center gap-1 text-[10px] font-medium ${expiryStatus.color}`}
                      >
                        <AlertTriangle className="h-3 w-3" />
                        {expiryStatus.label}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-400 dark:text-keyra-text/40">
                    {keyData.serviceName}
                  </span>
                </div>
              </div>

              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 focus:opacity-100 group-hover:opacity-100 transition-opacity"
                  onClick={() => setShowMenu(!showMenu)}
                  aria-label="More options"
                  aria-expanded={showMenu}
                  aria-haspopup="true"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
                {showMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowMenu(false)}
                    />
                    <div
                      className="absolute right-0 top-10 z-20 w-44 rounded-xl border border-slate-200 dark:border-white/5 bg-white dark:bg-keyra-charcoal py-1 shadow-xl text-slate-800 dark:text-keyra-text"
                      role="menu"
                    >
                      {[
                        {
                          icon: Edit3,
                          label: "Edit",
                          onClick: () => {
                            onEdit(keyData);
                            setShowMenu(false);
                          },
                        },
                        {
                          icon: Copy,
                          label: "Copy as .env",
                          onClick: async () => {
                            try {
                              const val =
                                decryptedValue ||
                                (await decryptKeyValue(
                                  keyData.encryptedValue,
                                  keyData.projectId
                                ));
                              const keyName = keyData.label
                                .toUpperCase()
                                .replace(/\s+/g, "_");
                              copy(`${keyName}=${val}`);
                            } catch (e) {
                              console.error(e);
                            }
                            setShowMenu(false);
                          },
                        },
                        {
                          icon: ExternalLink,
                          label: "Open docs",
                          onClick: () => {
                            if (keyData.docsUrl)
                              window.open(keyData.docsUrl, "_blank");
                            setShowMenu(false);
                          },
                        },
                        {
                          icon: Trash2,
                          label: "Delete",
                          className: "text-keyra-red hover:bg-rose-50 dark:hover:bg-rose-500/10",
                          onClick: () => {
                            setShowDeleteConfirm(true);
                            setShowMenu(false);
                          },
                        },
                      ].map((item) => (
                        <button
                          key={item.label}
                          onClick={item.onClick}
                          role="menuitem"
                          className={cn(
                            "flex w-full items-center gap-2 px-3 py-1.5 text-xs transition-colors hover:bg-slate-100 dark:hover:bg-white/5 focus:bg-slate-100 dark:focus:bg-white/5 focus:outline-none",
                            item.className || "text-slate-700 dark:text-keyra-text/70"
                          )}
                        >
                          <item.icon className="h-3.5 w-3.5" />
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
            <div>
              {keyData.description && (
                <div className="mt-4">
                  <span className="flex-1 truncate text-sm font-mono text-slate-600 dark:text-keyra-text/60">
                    {keyData.description}
                  </span>
                </div>
              )}
            </div>
            <div className="mt-4">
              <div className="flex items-center gap-2 rounded-lg bg-slate-50 dark:bg-keyra-charcoal/50 border border-slate-100 dark:border-transparent px-3 py-2 font-mono text-xs text-slate-600 dark:text-keyra-text/60">
                <span className="flex-1 truncate font-mono">
                  {revealed && decryptedValue ? decryptedValue : maskedValue}
                </span>
                <button
                  onClick={handleReveal}
                  aria-label="Reveal key"
                  className="text-slate-400 dark:text-keyra-text/30 hover:text-slate-600 dark:hover:text-keyra-text/60 focus:text-slate-600 dark:focus:text-keyra-text/60 focus:outline-none"
                >
                  {revealed ? (
                    <EyeOff className="h-3.5 w-3.5" />
                  ) : (
                    <Eye className="h-3.5 w-3.5" />
                  )}
                </button>
                <button
                  onClick={handleCopy}
                  aria-label="Copy to clipboard"
                  className="text-slate-400 dark:text-keyra-text/30 hover:text-slate-600 dark:hover:text-keyra-text/60 focus:text-slate-600 dark:focus:text-keyra-text/60 focus:outline-none"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </div>
              {copied && (
                <div className="mt-1.5 flex items-center gap-1 text-[11px] text-emerald-600 dark:text-keyra-mint">
                  <Clock className="h-3 w-3" />
                  Copied — clears in {countdown}s
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 flex items-center gap-1.5 flex-wrap">
            <Badge variant={env.variant}>{env.label}</Badge>
            {keyData.tags.map((tag) => (
              <Badge key={tag} variant="slate">
                {tag}
              </Badge>
            ))}
            {keyData.projectId && <Badge variant="slate">Project</Badge>}
          </div>
        </SpotlightCard>
      </motion.div>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
      >
        <DialogHeader>
          <DialogTitle className="text-slate-900 dark:text-white">Delete Secret Key</DialogTitle>
          <DialogDescription className="text-slate-500 dark:text-slate-400">
            Are you sure you want to permanently delete <strong className="text-slate-800 dark:text-white">&quot;{keyData.label}&quot;</strong>? This action is irreversible and all encrypted values will be lost.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-6 flex justify-end gap-3">
          <Button
            variant="ghost"
            onClick={() => setShowDeleteConfirm(false)}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              onDelete(keyData.id);
              setShowDeleteConfirm(false);
            }}
          >
            Delete Key
          </Button>
        </div>
      </Dialog>
    </>
  );
}
