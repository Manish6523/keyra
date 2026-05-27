"use client";

import { useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useVaultStore, type Project } from "@/store/vault";
import { createProjectInDB, deleteProjectFromDB } from "@/lib/db";
import { Plus, FolderKanban, ExternalLink, Trash2, Copy } from "lucide-react";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export default function ProjectsPage() {
  const projects = useVaultStore((s) => s.projects);
  const addProject = useVaultStore((s) => s.addProject);
  const removeProject = useVaultStore((s) => s.removeProject);
  const keys = useVaultStore((s) => s.keys);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [copyingProjectId, setCopyingProjectId] = useState<string | null>(null);
  const [copiedProjectId, setCopiedProjectId] = useState<string | null>(null);

  const handleCopyProjectKeysAsEnv = async (projId: string) => {
    const projKeys = keys.filter((k) => k.projectId === projId && !k.archived);
    if (projKeys.length === 0) return;
    setCopyingProjectId(projId);
    try {
      const lines = [];
      const { decryptKeyValue } = await import("@/lib/db");
      for (const k of projKeys) {
        const plaintext = await decryptKeyValue(k.encryptedValue, k.projectId);
        const keyName = k.label.toUpperCase().replace(/\s+/g, "_");
        lines.push(`${keyName}=${plaintext}`);
      }
      const envText = lines.join("\n");
      await navigator.clipboard.writeText(envText);
      setCopiedProjectId(projId);
      setTimeout(() => setCopiedProjectId(null), 3000);
    } catch (err) {
      console.error("Failed to copy project keys:", err);
    } finally {
      setCopyingProjectId(null);
    }
  };

  const handleCreate = async () => {
    if (!name.trim()) return;
    try {
      const project = await createProjectInDB(name.trim());
      addProject(project);
    } catch (err) {
      console.error("Failed to create project:", err);
    }
    setName("");
    setShowCreate(false);
  };

  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      await deleteProjectFromDB(deleteConfirmId);
      removeProject(deleteConfirmId);
    } catch (err) {
      console.error("Failed to delete project:", err);
    }
    setDeleteConfirmId(null);
  };

  const projectKeyCounts = projects.reduce((acc, p) => {
    acc[p.id] = keys.filter((k) => k.projectId === p.id && !k.archived).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Projects
          </h1>
          <p className="text-sm text-slate-500 dark:text-keyra-text/50">
            {projects.length} project{projects.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button
          className="bg-keyra-violet text-white hover:bg-keyra-violet/90 shadow-md"
          onClick={() => setShowCreate(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>

      {projects.length === 0 ? (
        <ScrollReveal className="rounded-xl border border-slate-200/60 dark:border-white/5 bg-white dark:bg-keyra-navy p-16 text-center shadow-sm flex flex-col items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-keyra-text/20 mb-4 animate-float-slow">
            <FolderKanban className="h-6 w-6" />
          </div>
          <p className="text-sm font-medium text-slate-400 dark:text-keyra-text/40">
            No projects yet. Create one to organize your keys.
          </p>
        </ScrollReveal>
      ) : (
        <ScrollReveal>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => {
              return (
                <ProjectCard
                  key={project.id}
                  project={project}
                  keyCount={projectKeyCounts[project.id]}
                  onCopy={handleCopyProjectKeysAsEnv}
                  copied={copiedProjectId === project.id}
                  copying={copyingProjectId === project.id}
                  onDelete={setDeleteConfirmId}
                />
              );
            })}
          </div>
        </ScrollReveal>
      )}

      {/* Create Project Modal */}
      <Dialog open={showCreate} onClose={() => setShowCreate(false)}>
        <DialogHeader>
          <DialogTitle className="text-slate-900 dark:text-white">Create Project</DialogTitle>
          <DialogDescription className="text-slate-500 dark:text-slate-400">
            Organize your keys into project groups.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleCreate();
          }}
          className="space-y-4"
        >
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Project name"
            autoFocus
            required
          />
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCreate(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Create</Button>
          </div>
        </form>
      </Dialog>

      {/* Delete Project Confirm Modal */}
      <Dialog open={!!deleteConfirmId} onClose={() => setDeleteConfirmId(null)}>
        <DialogHeader>
          <DialogTitle className="text-slate-900 dark:text-white">Delete Project</DialogTitle>
          <DialogDescription className="text-slate-500 dark:text-slate-400">
            Are you sure you want to delete this project? Keys inside this
            project will <strong className="text-slate-800 dark:text-white font-semibold">NOT</strong> be deleted, but they will lose their project
            association.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
            Cancel
          </Button>
          <Button
            className="bg-keyra-red text-white hover:bg-keyra-red/90"
            onClick={handleDelete}
          >
            Delete Project
          </Button>
        </div>
      </Dialog>
    </div>
  );
}

// Sub-component for individual project card with 3D Tilt
function ProjectCard({
  project,
  keyCount,
  onCopy,
  copied,
  copying,
  onDelete,
}: {
  project: Project;
  keyCount: number;
  onCopy: (id: string) => void;
  copied: boolean;
  copying: boolean;
  onDelete: (id: string) => void;
}) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateXSpring = useSpring(x, { stiffness: 300, damping: 25 });
  const rotateYSpring = useSpring(y, { stiffness: 300, damping: 25 });

  const rotateX = useTransform(rotateXSpring, [-0.5, 0.5], [6, -6]);
  const rotateY = useTransform(rotateYSpring, [-0.5, 0.5], [-6, 6]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width - 0.5;
    const yPct = (e.clientY - rect.top) / rect.height - 0.5;
    x.set(yPct);
    y.set(xPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
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
      className="rounded-xl transition-all duration-300 h-full"
    >
      <SpotlightCard className="p-5 bg-white/70 dark:bg-white/[0.02] border-slate-200/60 dark:border-white/[0.06] hover:border-keyra-violet/30 hover:shadow-glow-violet transition-all duration-300">
        <div className="flex items-center justify-between">
          <Link
            href={`/dashboard/project/${project.id}`}
            className="flex items-center gap-3.5 flex-1 min-w-0"
          >
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg shadow-sm"
              style={{ backgroundColor: project.color + "20" }}
            >
              <FolderKanban
                className="h-5 w-5"
                style={{ color: project.color }}
              />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-slate-800 dark:text-white truncate text-base hover:text-indigo-600 dark:hover:text-keyra-violet transition-colors">
                {project.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-keyra-text/40 font-medium">
                {keyCount} key{keyCount !== 1 ? "s" : ""}
              </p>
            </div>
          </Link>
          <div className="flex items-center gap-1 opacity-0 focus-within:opacity-100 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onCopy(project.id)}
              className="rounded-lg p-1.5 text-slate-400 dark:text-keyra-text/30 hover:text-indigo-600 dark:hover:text-keyra-violet hover:bg-slate-100 dark:hover:bg-white/5 disabled:opacity-50 flex items-center justify-center min-w-[32px] h-8 transition-colors"
              disabled={copying || keyCount === 0}
              aria-label="Copy keys as .env"
              title="Copy keys as .env"
            >
              {copied ? (
                <span className="text-[10px] text-emerald-600 dark:text-keyra-mint font-semibold">
                  Copied!
                </span>
              ) : copying ? (
                <span className="text-[10px] text-indigo-600 dark:text-keyra-violet font-semibold">
                  ...
                </span>
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
            <Link
              href={`/dashboard/project/${project.id}`}
              className="rounded-lg p-1.5 text-slate-400 dark:text-keyra-text/30 hover:text-cyan-600 dark:hover:text-keyra-cyan hover:bg-slate-100 dark:hover:bg-white/5 flex items-center justify-center h-8 w-8 transition-colors"
              aria-label="View Project"
            >
              <ExternalLink className="h-4 w-4" />
            </Link>
            <button
              onClick={() => onDelete(project.id)}
              className="rounded-lg p-1.5 text-slate-400 dark:text-keyra-text/30 hover:text-rose-600 dark:hover:text-keyra-red hover:bg-slate-100 dark:hover:bg-white/5 flex items-center justify-center h-8 w-8 transition-colors"
              aria-label="Delete Project"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </SpotlightCard>
    </motion.div>
  );
}
