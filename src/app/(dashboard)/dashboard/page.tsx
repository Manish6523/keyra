"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { KeyCard } from "@/components/keys/key-card";
import { KeyDialog } from "@/components/keys/key-dialog";
import { ActivityFeed } from "@/components/keys/activity-feed";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useVaultStore, type ApiKey } from "@/store/vault";
import {
  updateKeyInDB,
  deleteKeyFromDB,
  fetchPendingInvitations,
  acceptInvitation,
  rejectInvitation,
  debugInvitations,
} from "@/lib/db";
import { Check, X, Bell, AlertTriangle } from "lucide-react";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { LayoutGroup, motion } from "framer-motion";
import { cn } from "@/lib/utils";

const sortOptions = [
  { value: "recent", label: "Recently Added" },
  { value: "alpha", label: "Alphabetical" },
  { value: "expiry", label: "Expiry Date" },
];

function DashboardContent() {
  const searchParams = useSearchParams();
  const keys = useVaultStore((s) => s.keys);
  const projects = useVaultStore((s) => s.projects);
  const searchQuery = useVaultStore((s) => s.searchQuery);
  const filterEnvironment = useVaultStore((s) => s.filterEnvironment);
  const filterProject = useVaultStore((s) => s.filterProject);
  const setFilterEnvironment = useVaultStore((s) => s.setFilterEnvironment);
  const setFilterProject = useVaultStore((s) => s.setFilterProject);
  const removeKey = useVaultStore((s) => s.removeKey);
  const updateKey = useVaultStore((s) => s.updateKey);

  useEffect(() => {
    const projectParam = searchParams.get("project");
    if (projectParam) {
      setFilterProject(projectParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const [editKey, setEditKey] = useState<ApiKey | null>(null);
  const [showEdit, setShowEdit] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState("recent");
  const [invitations, setInvitations] = useState<
    Array<{ id: string; role: string; projects?: { name: string } }>
  >([]);

  const loadInvitations = async () => {
    try {
      const data = await fetchPendingInvitations();
      setInvitations(data);
      debugInvitations()
        .then((debugData) => {
          console.log("DB Diagnostics:", debugData);
        })
        .catch((debugErr) => {
          console.error("DB Diagnostics Error:", debugErr);
        });
    } catch (err) {
      console.error("Failed to load invitations", err);
    }
  };

  useEffect(() => {
    loadInvitations();
  }, []);

  const handleAcceptInvite = async (id: string) => {
    try {
      await acceptInvitation(id);
      await loadInvitations();
      const { fetchProjects, fetchKeys } = await import("@/lib/db");
      const newProjects = await fetchProjects();
      useVaultStore.getState().setProjects(newProjects);
      const ids = new Set(newProjects.map((p) => p.id));
      const newKeys = await fetchKeys(ids);
      useVaultStore.getState().setKeys(newKeys);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRejectInvite = async (id: string) => {
    try {
      await rejectInvitation(id);
      await loadInvitations();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredKeys = keys
    .filter((k) => !k.archived)
    .filter((k) => {
      if (filterEnvironment && filterEnvironment !== "all") {
        return k.environment === filterEnvironment;
      }
      return true;
    })
    .filter((k) => {
      if (filterProject && filterProject !== "all") {
        return k.projectId === filterProject;
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

  const expiringKeys = filteredKeys.filter((k) => {
    if (!k.expiryDate) return false;
    const daysLeft =
      (new Date(k.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return daysLeft <= 7;
  });

  const stats = {
    total: filteredKeys.length,
    prod: filteredKeys.filter((k) => k.environment === "production").length,
    staging: filteredKeys.filter((k) => k.environment === "staging").length,
    dev: filteredKeys.filter((k) => k.environment === "development").length,
    expiring: expiringKeys.length,
  };

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      await deleteKeyFromDB(deleteConfirmId);
      removeKey(deleteConfirmId);
    } catch (err) {
      console.error("Failed to delete key:", err);
    }
    setDeleteConfirmId(null);
  };

  const handleEditSave = async (id: string, data: Partial<ApiKey>) => {
    try {
      const updated = await updateKeyInDB(id, data);
      updateKey(id, updated);
    } catch (err) {
      console.error("Failed to update key:", err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Dashboard
        </h1>
        <p className="text-sm text-slate-500 dark:text-keyra-text/50">
          {filteredKeys.length} key{filteredKeys.length !== 1 ? "s" : ""} stored securely
        </p>
      </div>

      {stats.expiring > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-amber-200 dark:border-yellow-500/20 bg-amber-50 dark:bg-yellow-500/5 px-4 py-3 text-sm text-amber-700 dark:text-yellow-400 shadow-sm animate-pulse-glow">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>
            {stats.expiring} key{stats.expiring !== 1 ? "s are" : " is"} expiring soon. Please rotate them.
          </span>
        </div>
      )}

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Side: Keys & Filtering (occupies 2/3 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Project Invitations */}
          {invitations.length > 0 && (
            <div className="space-y-4">
              {invitations.map((inv) => {
                const projectsData = inv.projects as unknown;
                const projectName = Array.isArray(projectsData)
                  ? (projectsData[0] as { name?: string })?.name
                  : (projectsData as { name?: string })?.name;
                return (
                  <div
                    key={inv.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-indigo-200 dark:border-keyra-violet/20 bg-indigo-50/50 dark:bg-keyra-violet/5 p-4 shadow-sm backdrop-blur-sm animate-breathing"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 dark:bg-keyra-violet/20 shrink-0">
                        <Bell className="h-5 w-5 text-indigo-600 dark:text-keyra-violet" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm text-slate-900 dark:text-white">
                          Project Invitation
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-keyra-text/70">
                          You&apos;ve been invited to join{" "}
                          <strong className="text-slate-800 dark:text-white font-semibold">
                            {projectName || "a project"}
                          </strong>{" "}
                          as a <span className="capitalize">{inv.role}</span>.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-rose-200 hover:border-rose-300 dark:border-keyra-red/20 text-rose-600 dark:text-keyra-red hover:bg-rose-50 dark:hover:bg-keyra-red/10"
                        onClick={() => handleRejectInvite(inv.id)}
                      >
                        <X className="mr-1.5 h-4 w-4" /> Reject
                      </Button>
                      <Button
                        size="sm"
                        className="bg-keyra-violet text-white hover:bg-keyra-violet/90"
                        onClick={() => handleAcceptInvite(inv.id)}
                      >
                        <Check className="mr-1.5 h-4 w-4" /> Accept
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Filters & Navigation Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-white/40 dark:bg-white/[0.01] border border-slate-200/60 dark:border-white/[0.04] rounded-xl p-3 shadow-sm backdrop-blur-md">
            <div className="flex flex-wrap items-center gap-3">
              <Select
                value={filterProject || "all"}
                onChange={(e) =>
                  setFilterProject(e.target.value === "all" ? null : e.target.value)
                }
                options={[
                  { value: "all", label: "All Projects" },
                  ...projects.map((p) => ({ value: p.id, label: p.name })),
                ]}
                className="w-44"
              />

              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                options={sortOptions}
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
                        layoutId="filter-active-pill"
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

          {/* Expiring Keys Section */}
          {expiringKeys.length > 0 && (
            <ScrollReveal className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Needs Rotation
                </h2>
                <Badge variant="warning">{expiringKeys.length}</Badge>
              </div>
              <LayoutGroup>
                <div className="grid gap-4 sm:grid-cols-2 ">
                  {expiringKeys.map((key) => (
                    <KeyCard
                      key={`expiring-${key.id}`}
                      keyData={key}
                      onEdit={(k) => {
                        setEditKey(k);
                        setShowEdit(true);
                      }}
                      onDelete={(id) => setDeleteConfirmId(id)}
                    />
                  ))}
                </div>
              </LayoutGroup>
            </ScrollReveal>
          )}

          {/* All Keys Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              All Keys
            </h2>

            {filteredKeys.length === 0 ? (
              <div className="rounded-xl border border-slate-200/60 dark:border-white/5 bg-white dark:bg-keyra-navy p-12 text-center shadow-sm">
                <p className="text-slate-400 dark:text-keyra-text/40">
                  {keys.length === 0
                    ? 'No keys yet. Click "Add Key" to get started.'
                    : "No keys match your filters."}
                </p>
              </div>
            ) : (
              <LayoutGroup>
                <div className="grid gap-4 sm:grid-cols-2 pb-24">
                  {filteredKeys.map((key) => (
                    <KeyCard
                      key={key.id}
                      keyData={key}
                      onEdit={(k) => {
                        setEditKey(k);
                        setShowEdit(true);
                      }}
                      onDelete={(id) => setDeleteConfirmId(id)}
                    />
                  ))}
                </div>
              </LayoutGroup>
            )}
          </div>
        </div>

        {/* Right Side: Stats & Activity Bento Sidebar (occupies 1/3 cols) */}
        <div className="space-y-6">
          {/* Stats Bento Card */}
          <SpotlightCard className="p-6 bg-white/70 dark:bg-keyra-navy/40 border-slate-200/60 dark:border-white/[0.06] shadow-sm rounded-2xl">
            <h3 className="font-bold text-sm text-slate-800 dark:text-white mb-4">
              Vault Analytics
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 p-3 bg-indigo-50/50 dark:bg-keyra-violet/5 rounded-xl border border-indigo-100/50 dark:border-keyra-violet/10">
                <p className="text-xs font-semibold text-slate-500 dark:text-keyra-text/50">
                  Total Keys
                </p>
                <p className="mt-1 text-3xl font-extrabold text-slate-900 dark:text-white">
                  <AnimatedCounter value={stats.total} />
                </p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-white/[0.02] rounded-xl border border-slate-200/50 dark:border-white/[0.04]">
                <p className="text-xs font-semibold text-slate-500 dark:text-keyra-text/50">
                  Production
                </p>
                <p className="mt-1 text-xl font-extrabold text-rose-600 dark:text-keyra-red">
                  <AnimatedCounter value={stats.prod} />
                </p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-white/[0.02] rounded-xl border border-slate-200/50 dark:border-white/[0.04]">
                <p className="text-xs font-semibold text-slate-500 dark:text-keyra-text/50">
                  Staging
                </p>
                <p className="mt-1 text-xl font-extrabold text-amber-500 dark:text-yellow-400">
                  <AnimatedCounter value={stats.staging} />
                </p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-white/[0.02] rounded-xl border border-slate-200/50 dark:border-white/[0.04]">
                <p className="text-xs font-semibold text-slate-500 dark:text-keyra-text/50">
                  Development
                </p>
                <p className="mt-1 text-xl font-extrabold text-cyan-600 dark:text-keyra-cyan">
                  <AnimatedCounter value={stats.dev} />
                </p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-white/[0.02] rounded-xl border border-slate-200/50 dark:border-white/[0.04]">
                <p className="text-xs font-semibold text-slate-500 dark:text-keyra-text/50">
                  Expiring Soon
                </p>
                <p className="mt-1 text-xl font-extrabold text-emerald-600 dark:text-keyra-mint">
                  <AnimatedCounter value={stats.expiring} />
                </p>
              </div>
            </div>
          </SpotlightCard>

          {/* Activity Log Bento Card */}
          <SpotlightCard className="p-6 bg-white/70 dark:bg-keyra-navy/40 border-slate-200/60 dark:border-white/[0.06] shadow-sm rounded-2xl overflow-hidden">
            <h3 className="font-bold text-sm text-slate-800 dark:text-white mb-4">
              Recent Activity
            </h3>
            <div className="max-h-[350px] overflow-y-auto pr-1">
              <ActivityFeed />
            </div>
          </SpotlightCard>
        </div>
      </div>

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

      <Dialog open={!!deleteConfirmId} onClose={() => setDeleteConfirmId(null)}>
        <DialogHeader>
          <DialogTitle className="text-slate-900 dark:text-white">Delete Key</DialogTitle>
          <DialogDescription className="text-slate-500 dark:text-slate-400">
            Are you sure you want to delete this key? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
            Cancel
          </Button>
          <Button
            className="bg-keyra-red text-white hover:bg-keyra-red/90"
            onClick={confirmDelete}
          >
            Delete
          </Button>
        </div>
      </Dialog>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="text-slate-400 dark:text-keyra-text/40">Loading...</div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
