"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useVaultStore, type ApiKey } from "@/store/vault";
import { KeyCard } from "@/components/keys/key-card";
import { KeyDialog } from "@/components/keys/key-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Select } from "@/components/ui/select";
import { ArrowLeft, Trash2, Folder, FolderOpen, FolderOutput, Users, Copy, Plus } from "lucide-react";
import Link from "next/link";
import { deleteProjectFromDB, updateKeyInDB, deleteKeyFromDB } from "@/lib/db";
import { LayoutGroup, motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const projects = useVaultStore((s) => s.projects);
  const removeProject = useVaultStore((s) => s.removeProject);
  const keys = useVaultStore((s) => s.keys);
  const removeKey = useVaultStore((s) => s.removeKey);
  const updateKey = useVaultStore((s) => s.updateKey);

  const project = projects.find((p) => p.id === projectId);
  const projectKeys = keys.filter(
    (k) => k.projectId === projectId && !k.archived
  );

  const searchQuery = useVaultStore((s) => s.searchQuery);
  const [filterEnvironment, setFilterEnvironment] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState("recent");

  const filteredProjectKeys = projectKeys
    .filter((k) => {
      if (filterEnvironment && filterEnvironment !== "all") {
        return k.environment === filterEnvironment;
      }
      return true;
    })
    .filter((k) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        k.label.toLowerCase().includes(q) ||
        k.serviceName.toLowerCase().includes(q) ||
        k.tags.some((t) => t.toLowerCase().includes(q))
      );
    })
    .sort((a, b) => {
      if (sortBy === "alpha") return a.label.localeCompare(b.label);
      if (sortBy === "expiry")
        return (a.expiryDate || "").localeCompare(b.expiryDate || "");
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [moveKeysOpen, setMoveKeysOpen] = useState(false);
  const [targetProjectId, setTargetProjectId] = useState("");
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [copyingAll, setCopyingAll] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);

  // Edit/delete local key dialog states
  const [editKey, setEditKey] = useState<ApiKey | null>(null);
  const [showEdit, setShowEdit] = useState(false);
  const [deleteKeyConfirmId, setDeleteKeyConfirmId] = useState<string | null>(null);

  // Drag and Drop hover states
  const [draggedKeyId, setDraggedKeyId] = useState<string | null>(null);
  const [dragOverProjectId, setDragOverProjectId] = useState<string | null>(null);

  const handleCopyAllAsEnv = async () => {
    if (projectKeys.length === 0) return;
    setCopyingAll(true);
    try {
      const lines = [];
      const { decryptKeyValue } = await import("@/lib/db");
      for (const k of projectKeys) {
        const plaintext = await decryptKeyValue(k.encryptedValue, k.projectId);
        const keyName = k.label.toUpperCase().replace(/\s+/g, "_");
        lines.push(`${keyName}=${plaintext}`);
      }
      const envText = lines.join("\n");
      await navigator.clipboard.writeText(envText);
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 3000);
    } catch (err) {
      console.error("Failed to copy all keys as .env:", err);
    } finally {
      setCopyingAll(false);
    }
  };

  const handleDeleteProject = async () => {
    try {
      await deleteProjectFromDB(projectId);
      removeProject(projectId);
      router.push("/dashboard/projects");
    } catch (err) {
      console.error("Failed to delete project:", err);
    }
  };

  const handleMoveKeys = async () => {
    const finalTarget = targetProjectId === "none" ? "" : targetProjectId;
    if (selectedKeys.length === 0) return;
    try {
      for (const keyId of selectedKeys) {
        await updateKeyInDB(keyId, { projectId: finalTarget });
        updateKey(keyId, { projectId: finalTarget });
      }
      setMoveKeysOpen(false);
      setSelectedKeys([]);
    } catch (err) {
      console.error("Failed to move keys:", err);
    }
  };

  const handleMoveSingleKey = async (keyId: string, destProjectId: string) => {
    try {
      await updateKeyInDB(keyId, { projectId: destProjectId });
      updateKey(keyId, { projectId: destProjectId });
    } catch (err) {
      console.error("Failed to move key:", err);
    }
  };

  const toggleKeySelection = (keyId: string) => {
    setSelectedKeys((prev) =>
      prev.includes(keyId)
        ? prev.filter((id) => id !== keyId)
        : [...prev, keyId]
    );
  };

  const confirmDeleteKey = async () => {
    if (!deleteKeyConfirmId) return;
    try {
      await deleteKeyFromDB(deleteKeyConfirmId);
      removeKey(deleteKeyConfirmId);
    } catch (err) {
      console.error("Failed to delete key:", err);
    }
    setDeleteKeyConfirmId(null);
  };

  const handleEditSave = async (id: string, data: Partial<ApiKey>) => {
    try {
      const updated = await updateKeyInDB(id, data);
      updateKey(id, updated);
    } catch (err) {
      console.error("Failed to update key:", err);
    }
  };

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center h-[50vh]">
        <p className="text-slate-500 dark:text-keyra-text/50 font-medium">Project not found.</p>
        <Button
          variant="outline"
          className="mt-4 border-slate-200 dark:border-white/10 bg-white dark:bg-keyra-charcoal hover:bg-slate-50 dark:hover:bg-white/5 text-slate-900 dark:text-white"
          onClick={() => router.push("/dashboard/projects")}
        >
          Back to Projects
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-12">
      {/* Top Navigation & Details */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center justify-between">
        <div className="flex gap-4">
          <Link
            href="/dashboard/projects"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 dark:border-white/5 bg-white dark:bg-keyra-navy/50 text-slate-400 dark:text-keyra-text/50 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="flex items-center gap-3 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              <span
                className="flex h-8 w-8 items-center justify-center rounded-lg text-base"
                style={{ backgroundColor: project.color + "20" }}
              >
                <FolderOpen className="h-4 w-4" style={{ color: project.color }} />
              </span>
              {project.name}
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-keyra-text/50">
              Created on {new Date(project.createdAt).toLocaleDateString()}{" "}
              &middot; {projectKeys.length} key{projectKeys.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link href={`/dashboard/project/${project.id}/team`}>
            <Button
              variant="outline"
              className="border-emerald-200 dark:border-keyra-mint/20 text-emerald-600 bg-white/70 dark:bg-keyra-navy/40 dark:text-keyra-mint hover:bg-emerald-50 dark:hover:bg-keyra-mint/10 h-9"
            >
              <Users className="mr-2 h-4 w-4" />
              Manage Team
            </Button>
          </Link>
          <Button
            variant="outline"
            className="border-indigo-200 dark:border-keyra-violet/20 text-indigo-600 bg-white/70 dark:bg-keyra-navy/40 dark:text-keyra-violet hover:bg-indigo-50 dark:hover:bg-keyra-violet/10 disabled:opacity-50 h-9"
            onClick={handleCopyAllAsEnv}
            disabled={copyingAll || projectKeys.length === 0}
          >
            <Copy className="mr-2 h-4 w-4" />
            {copyingAll
              ? "Copying..."
              : copiedAll
              ? "Copied!"
              : "Copy all as .env"}
          </Button>
          <Button
            variant="outline"
            className="border-slate-200 dark:border-white/10 bg-white/70 dark:hover:bg-white/5 dark:bg-keyra-navy/40 h-9"
            onClick={() => setMoveKeysOpen(true)}
            disabled={projectKeys.length === 0}
          >
            <FolderOutput className="mr-2 h-4 w-4" />
            Move Keys
          </Button>
          <Button
            variant="outline"
            className="border-rose-200 dark:border-keyra-red/20 bg-white/70 dark:bg-keyra-navy/40 text-rose-600 dark:text-keyra-red hover:bg-rose-50 dark:hover:bg-keyra-red/10 h-9"
            onClick={() => setDeleteConfirmOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Project
          </Button>
        </div>
      </div>

      {/* Split-pane Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Pane (30% width on large screens) - Folder navigation & Drag targets */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white/70 dark:bg-keyra-navy/40 border border-slate-200/80 dark:border-white/5 rounded-2xl p-5 shadow-sm">
            <h3 className="font-bold text-sm text-slate-800 dark:text-white mb-4">
              Project Spaces
            </h3>
            
            <div className="space-y-1.5">
              {projects.map((p) => {
                const isActive = p.id === projectId;
                const isDragOver = dragOverProjectId === p.id;
                const count = keys.filter((k) => k.projectId === p.id && !k.archived).length;

                return (
                  <div
                    key={p.id}
                    onDragOver={(e) => {
                      e.preventDefault();
                      if (!isActive) {
                        setDragOverProjectId(p.id);
                      }
                    }}
                    onDragLeave={() => {
                      setDragOverProjectId(null);
                    }}
                    onDrop={async (e) => {
                      e.preventDefault();
                      setDragOverProjectId(null);
                      const keyId = e.dataTransfer.getData("text/plain");
                      if (keyId && keyId !== "" && !isActive) {
                        await handleMoveSingleKey(keyId, p.id);
                      }
                    }}
                    className={cn(
                      "group relative rounded-xl border p-3 transition-all duration-200",
                      isActive
                        ? "bg-indigo-50/50 dark:bg-keyra-violet/10 border-indigo-200 dark:border-keyra-violet/30"
                        : "bg-transparent border-transparent hover:bg-slate-50 dark:hover:bg-white/5",
                      isDragOver && "border-dashed border-indigo-500 dark:border-keyra-violet bg-indigo-50/80 dark:bg-keyra-violet/20 scale-[1.02] shadow-md"
                    )}
                  >
                    <Link
                      href={`/dashboard/project/${p.id}`}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-sm shrink-0"
                          style={{
                            backgroundColor: p.color + "15",
                            color: p.color,
                          }}
                        >
                          {isActive ? (
                            <FolderOpen className="h-4 w-4" />
                          ) : (
                            <Folder className="h-4 w-4" />
                          )}
                        </div>
                        <span
                          className={cn(
                            "text-sm font-semibold truncate",
                            isActive
                              ? "text-indigo-600 dark:text-keyra-violet"
                              : "text-slate-700 dark:text-keyra-text/80 group-hover:text-slate-900 dark:group-hover:text-white"
                          )}
                        >
                          {p.name}
                        </span>
                      </div>
                      
                      <span className="text-xs font-semibold text-slate-400 dark:text-keyra-text/30 group-hover:text-slate-600 dark:group-hover:text-keyra-text/50">
                        {count} key{count !== 1 ? "s" : ""}
                      </span>
                    </Link>
                  </div>
                );
              })}
              
              {/* Optional Link to view all keys or create project */}
              <div className="pt-3 border-t border-slate-200/60 dark:border-white/5 mt-3 flex justify-between">
                <Link
                  href="/dashboard"
                  className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-keyra-text/40 dark:hover:text-white transition-colors"
                >
                  View All Keys
                </Link>
                <Link
                  href="/dashboard/projects"
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-500 dark:text-keyra-violet dark:hover:text-keyra-violet/85 flex items-center gap-1 transition-colors"
                >
                  <Plus className="h-3 w-3" /> New Project
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Right Pane (70% width on large screens) - Explorer details and Keys grid */}
        <div className="lg:col-span-8 space-y-4 pb-24">
          <div className="bg-white/70 dark:bg-keyra-navy/40  border border-slate-200/80 dark:border-white/5 rounded-2xl p-5 shadow-sm min-h-[50vh]">
            <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-white/5 pb-4 mb-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Project Keys
              </h2>
              <span className="text-xs text-slate-400 dark:text-keyra-text/40 italic">
                Drag a key card onto a project space on the left to move it
              </span>
            </div>

            {/* Filters & Controls */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white/40 dark:bg-white/[0.01] rounded-xl  mb-6">
              <div>
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  options={[
                    { value: "recent", label: "Recently Added" },
                    { value: "alpha", label: "Alphabetical" },
                    { value: "expiry", label: "Expiry Date" },
                  ]}
                  className="w-44"
                />
              </div>

              {/* Sliding Pill segment control */}
              <div
                className="flex gap-1 p-1 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200/50 dark:border-white/[0.03]"
                role="group"
                aria-label="Filter by environment"
              >
                {["all", "development", "staging", "production"].map((env) => {
                  const isSelected = (filterEnvironment || "all") === env;
                  return (
                    <span
                      key={env}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setFilterEnvironment(env === "all" ? null : env);
                        }
                      }}
                      onClick={() => setFilterEnvironment(env === "all" ? null : env)}
                      className="relative cursor-pointer px-3 py-1.5 text-xs font-semibold select-none rounded-lg focus-visible:outline-none"
                    >
                      {isSelected && (
                        <motion.div
                          layoutId="project-filter-active-pill"
                          className="absolute inset-0 bg-white dark:bg-keyra-navy rounded-lg shadow-sm border border-slate-200/50 dark:border-white/[0.04]"
                          transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                        />
                      )}
                      <span
                        className={cn(
                          "relative z-10 capitalize transition-colors duration-200",
                          isSelected
                            ? "text-indigo-600 dark:text-keyra-violet font-bold"
                            : "text-slate-500 dark:text-keyra-text/40 hover:text-slate-800 dark:hover:text-keyra-text/60"
                        )}
                      >
                        {env === "all" ? "All" : env}
                      </span>
                    </span>
                  );
                })}
              </div>
            </div>

            {filteredProjectKeys.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-16 text-center h-[30vh]">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-keyra-text/20 mb-4 animate-float-slow">
                  <Folder className="h-6 w-6" />
                </div>
                <p className="text-sm font-medium text-slate-400 dark:text-keyra-text/40">
                  {projectKeys.length === 0
                    ? "No keys in this project yet."
                    : "No keys match your filters."}
                </p>
              </div>
            ) : (
              <LayoutGroup>
                <div className="grid gap-4 sm:grid-cols-2">
                  {filteredProjectKeys.map((key) => (
                    <div
                      key={key.id}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData("text/plain", key.id);
                        e.dataTransfer.effectAllowed = "move";
                        setDraggedKeyId(key.id);
                      }}
                      onDragEnd={() => {
                        setDraggedKeyId(null);
                      }}
                      className={cn(
                        "cursor-grab active:cursor-grabbing transition-opacity duration-200",
                        draggedKeyId === key.id && "opacity-40"
                      )}
                    >
                      <KeyCard
                        keyData={key}
                        onEdit={(k) => {
                          setEditKey(k);
                          setShowEdit(true);
                        }}
                        onDelete={(id) => setDeleteKeyConfirmId(id)}
                      />
                    </div>
                  ))}
                </div>
              </LayoutGroup>
            )}
          </div>
        </div>
      </div>

      {/* Delete Project Modal */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
      >
        <DialogHeader>
          <DialogTitle className="text-slate-900 dark:text-white">Delete Project</DialogTitle>
          <DialogDescription className="text-slate-500 dark:text-slate-400">
            Are you sure you want to delete {project.name}? Keys inside this
            project will <strong className="text-slate-800 dark:text-white font-semibold">NOT</strong> be deleted, but they will lose their project
            association.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
            Cancel
          </Button>
          <Button
            className="bg-keyra-red text-white hover:bg-keyra-red/90"
            onClick={handleDeleteProject}
          >
            Delete
          </Button>
        </div>
      </Dialog>

      {/* Move Keys Dialog */}
      <Dialog open={moveKeysOpen} onClose={() => setMoveKeysOpen(false)}>
        <DialogHeader>
          <DialogTitle className="text-slate-900 dark:text-white">Move Keys to Another Project</DialogTitle>
          <DialogDescription className="text-slate-500 dark:text-slate-400">
            Select keys to move and choose a target project.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-keyra-text/80">
              Select Keys
            </label>
            <div className="max-h-48 overflow-auto rounded-lg border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-keyra-navy p-2">
              {projectKeys.map((k) => (
                <label
                  key={k.id}
                  className="flex cursor-pointer items-center gap-2 p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-md transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedKeys.includes(k.id)}
                    onChange={() => toggleKeySelection(k.id)}
                    className="h-4 w-4 rounded border-slate-300 dark:border-white/10 bg-white dark:bg-keyra-charcoal text-keyra-violet focus:ring-keyra-violet"
                  />
                  <span className="text-sm font-medium text-slate-700 dark:text-white">
                    {k.label}
                  </span>
                </label>
              ))}
              {projectKeys.length === 0 && (
                <p className="p-2 text-sm text-slate-400 dark:text-keyra-text/50">
                  No keys available.
                </p>
              )}
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-keyra-text/80">
              Target Project
            </label>
            <Select
              value={targetProjectId}
              onChange={(e) => setTargetProjectId(e.target.value)}
              options={[
                { value: "", label: "Select a project..." },
                { value: "none", label: "No Project (Root)" },
                ...projects
                  .filter((p) => p.id !== projectId)
                  .map((p) => ({ value: p.id, label: p.name })),
              ]}
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setMoveKeysOpen(false)}>
            Cancel
          </Button>
          <Button
            className="bg-keyra-violet text-white hover:bg-keyra-violet/90"
            onClick={handleMoveKeys}
            disabled={selectedKeys.length === 0 || !targetProjectId}
          >
            Move {selectedKeys.length} Keys
          </Button>
        </div>
      </Dialog>

      {/* Edit Dialog */}
      <KeyDialog
        open={showEdit}
        onClose={() => {
          setShowEdit(false);
          setEditKey(null);
        }}
        onSave={(data) => {
          if (editKey) {
            handleEditSave(editKey.id, data);
          }
          setShowEdit(false);
          setEditKey(null);
        }}
        editKey={editKey}
      />

      {/* Permanent Delete Key Dialog */}
      <Dialog
        open={!!deleteKeyConfirmId}
        onClose={() => setDeleteKeyConfirmId(null)}
      >
        <DialogHeader>
          <DialogTitle className="text-slate-900 dark:text-white">Delete Key</DialogTitle>
          <DialogDescription className="text-slate-500 dark:text-slate-400">
            Are you sure you want to delete this key? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setDeleteKeyConfirmId(null)}>
            Cancel
          </Button>
          <Button
            className="bg-keyra-red text-white hover:bg-keyra-red/90"
            onClick={confirmDeleteKey}
          >
            Delete
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
