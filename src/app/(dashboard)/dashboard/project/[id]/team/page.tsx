"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  UserPlus,
  Shield,
  ShieldAlert,
  Trash2,
  ShieldCheck,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useVaultStore } from "@/store/vault";
import { fetchProjectMembers, updateMemberRole, removeProjectMember } from "@/lib/db";
import { useAuth } from "@/contexts/auth-context";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { motion } from "framer-motion";

type Member = {
  id: string;
  user_id: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
};

export default function TeamManagementPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const project = useVaultStore((s) =>
    s.projects.find((p) => p.id === projectId)
  );
  const { user } = useAuth();

  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("viewer");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [removeConfirm, setRemoveConfirm] = useState<Member | null>(null);

  useEffect(() => {
    if (!project) {
      router.push("/dashboard/projects");
      return;
    }

    loadMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, project]);

  const loadMembers = async () => {
    try {
      const data = await fetchProjectMembers(projectId);
      setMembers(data as Member[]);
    } catch (err) {
      console.error("Failed to load members", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (
    memberId: string,
    userId: string,
    newRole: string
  ) => {
    try {
      setMembers(
        members.map((m) => (m.id === memberId ? { ...m, role: newRole } : m))
      );
      await updateMemberRole(projectId, userId, newRole);
    } catch (err) {
      console.error("Failed to update role", err);
      loadMembers();
    }
  };

  const handleRemoveMember = async () => {
    if (!removeConfirm) return;
    try {
      setMembers(members.filter((m) => m.id !== removeConfirm.id));
      await removeProjectMember(projectId, removeConfirm.user_id);
    } catch (err) {
      console.error("Failed to remove member", err);
      loadMembers();
    } finally {
      setRemoveConfirm(null);
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail) return;
    setInviteLoading(true);
    try {
      const { inviteUserToProject } = await import("@/lib/pki");
      await inviteUserToProject(projectId, inviteEmail, inviteRole);
      setInviteOpen(false);
      setInviteEmail("");
      setInviteRole("viewer");
      await loadMembers();
    } catch (err: unknown) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Failed to invite member");
    } finally {
      setInviteLoading(false);
    }
  };

  if (!project) return null;

  const currentUserMember = members.find((m) => m.user_id === user?.id);
  const isOwner = currentUserMember?.role === "owner";
  const isAdmin = currentUserMember?.role === "admin";
  const canManage = isOwner || isAdmin;

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href={`/dashboard/project/${projectId}`}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 dark:border-white/5 bg-white dark:bg-keyra-navy/50 text-slate-400 dark:text-keyra-text/55 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                {project.name}
              </h1>
              <Badge variant="slate">Team</Badge>
            </div>
            <p className="mt-1 text-sm text-slate-500 dark:text-keyra-text/50">
              Manage team workspace access and permissions
            </p>
          </div>
        </div>

        {canManage && (
          <Button onClick={() => setInviteOpen(true)} className="shadow-md">
            <UserPlus className="mr-2 h-4 w-4" />
            Invite Member
          </Button>
        )}
      </div>

      <ScrollReveal className="rounded-xl border border-slate-200/60 dark:border-white/5 bg-white dark:bg-keyra-navy shadow-md overflow-hidden">
        <div className="border-b border-slate-200 dark:border-white/5 p-4 sm:px-6 py-4 flex justify-between items-center bg-slate-50/50 dark:bg-white/[0.02]">
          <h2 className="text-sm font-semibold text-slate-800 dark:text-white flex items-center gap-2">
            <Shield className="h-4 w-4 text-indigo-600 dark:text-keyra-violet" />
            Workspace Members
          </h2>
          <span className="text-xs font-semibold text-slate-500 dark:text-keyra-text/50">
            {members.length} members
          </span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-white/5">
          {loading ? (
            <div className="p-8 text-center text-slate-400 dark:text-keyra-text/40 font-medium">
              Loading members...
            </div>
          ) : members.length === 0 ? (
            <div className="p-8 text-center text-slate-400 dark:text-keyra-text/40 font-medium">
              No members found.
            </div>
          ) : (
            members.map((member, i) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between p-4 sm:px-6 hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-50 dark:bg-gradient-to-br dark:from-keyra-violet/20 dark:to-keyra-cyan/20 border border-slate-200 dark:border-white/5 shadow-sm text-indigo-500">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-800 dark:text-white text-sm">
                          {member.email}
                        </span>
                        {member.user_id === user?.id && (
                          <Badge variant="default">You</Badge>
                        )}
                        {member.status === "pending" && (
                          <Badge variant="warning">Pending</Badge>
                        )}
                      </div>
                      <span className="text-xs text-slate-400 dark:text-keyra-text/50 mt-0.5">
                        Joined{" "}
                        {new Date(member.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {member.role === "owner" ? (
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-cyan-600 dark:text-keyra-cyan">
                      <ShieldCheck className="h-4 w-4" />
                      Workspace Owner
                    </div>
                  ) : canManage && member.user_id !== user?.id ? (
                    <>
                      <Select
                        value={member.role}
                        onChange={(e) =>
                          handleRoleChange(
                            member.id,
                            member.user_id,
                            e.target.value
                          )
                        }
                        options={[
                          { value: "viewer", label: "Viewer" },
                          { value: "editor", label: "Editor" },
                          { value: "admin", label: "Admin" },
                        ]}
                        className="w-32 h-8 text-xs font-semibold"
                      />
                      <button
                        onClick={() => setRemoveConfirm(member)}
                        className="text-slate-400 dark:text-keyra-text/30 hover:text-rose-600 dark:hover:text-keyra-red transition-colors p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5"
                        aria-label="Remove member"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  ) : (
                    <div className="text-xs font-semibold text-slate-500 dark:text-keyra-text/60 capitalize">
                      {member.role}
                    </div>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </ScrollReveal>

      {/* Invite Modal */}
      <Dialog open={inviteOpen} onClose={() => setInviteOpen(false)}>
        <DialogHeader>
          <DialogTitle className="text-slate-900 dark:text-white">Invite to {project.name}</DialogTitle>
          <DialogDescription className="text-slate-500 dark:text-slate-400">
            Securely invite a collaborator to this project.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-keyra-text/80">
              User Email
            </label>
            <Input
              type="email"
              placeholder="colleague@example.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              autoFocus
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-keyra-text/80">
              Access Permission
            </label>
            <Select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              options={[
                { value: "viewer", label: "Viewer (Can only read/copy keys)" },
                {
                  value: "editor",
                  label: "Editor (Can add, edit, and copy keys)",
                },
                { value: "admin", label: "Admin (Can edit and manage team)" },
              ]}
            />
          </div>
          <div className="rounded-xl border border-emerald-200 dark:border-keyra-mint/20 bg-emerald-50 dark:bg-keyra-mint/5 p-3 flex gap-3 text-sm text-emerald-800 dark:text-keyra-mint/90">
            <ShieldAlert className="h-5 w-5 shrink-0 text-emerald-600 dark:text-keyra-mint" />
            <p className="text-xs leading-relaxed font-medium">
              E2EE Security: Their public PKI key will be fetched and verified automatically. The Project Key will be encrypted with their key, keeping your data secure.
            </p>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setInviteOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleInvite}
            disabled={inviteLoading || !inviteEmail}
          >
            {inviteLoading ? "Sending..." : "Send Invite"}
          </Button>
        </div>
      </Dialog>

      {/* Remove Access Confirm Modal */}
      <Dialog open={!!removeConfirm} onClose={() => setRemoveConfirm(null)}>
        <DialogHeader>
          <DialogTitle className="text-slate-900 dark:text-white">Revoke Member Access</DialogTitle>
          <DialogDescription className="text-slate-500 dark:text-slate-400">
            Are you sure you want to revoke workspace access for{" "}
            <strong className="text-slate-800 dark:text-white font-semibold">
              {removeConfirm?.email}
            </strong>
            ? They will immediately lose access to all keys and configurations in this project.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setRemoveConfirm(null)}>
            Cancel
          </Button>
          <Button
            className="bg-keyra-red text-white hover:bg-keyra-red/90"
            onClick={handleRemoveMember}
          >
            Revoke Access
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
