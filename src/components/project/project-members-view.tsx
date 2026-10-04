"use client";

import { useState, useMemo, FormEvent, useRef } from "react";
import Link from "next/link";
import {
  Calendar,
  Check,
  ChevronDown,
  Clock,
  Coffee,
  Copy,
  Crown,
  ExternalLink,
  FolderKanban,
  Mail,
  Search,
  Send,
  Shield,
  ShieldAlert,
  Sparkles,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
  UserX,
  X
} from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { AppModal } from "@/components/ui/app-modal";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { useToast } from "@/components/ui/toast";
import { formatMediumDate, formatShortDate } from "@/lib/date-format";
import { cn } from "@/lib/utils";

export interface ProjectMemberData {
  id: string;
  userId: string;
  role: string;
  createdAt: string;
  totalCoffees?: number;
  user: {
    id: string;
    name: string | null;
    email: string;
    avatar: string | null;
    status: string;
    createdAt: string;
  };
}

export interface PendingInvitationData {
  id: string;
  email: string;
  token: string;
  status: string;
  expiresAt: string;
  createdAt: string;
  inviter: {
    id: string;
    name: string | null;
    email: string;
  };
}

interface ProjectMembersViewProps {
  projectId: string;
  projectName: string;
  currentUserId: string;
  currentUserRole: string;
  initialMembers: ProjectMemberData[];
  initialPendingInvitations: PendingInvitationData[];
}

type MembersTabId = "members" | "invitations" | "roles";

export function ProjectMembersView({
  projectId,
  projectName,
  currentUserId,
  currentUserRole,
  initialMembers,
  initialPendingInvitations
}: ProjectMembersViewProps) {
  const [members, setMembers] = useState<ProjectMemberData[]>(initialMembers);
  const [pendingInvitations, setPendingInvitations] = useState<PendingInvitationData[]>(initialPendingInvitations);
  const [activeTab, setActiveTab] = useState<MembersTabId>("members");
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"ALL" | "OWNER" | "MEMBER">("ALL");

  // Invite modal states
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"MEMBER" | "OWNER">("MEMBER");
  const [isInviting, setIsInviting] = useState(false);
  const [inviteAcceptUrl, setInviteAcceptUrl] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const inviteInputRef = useRef<HTMLInputElement>(null);

  // Modals for deletion & role changes
  const [memberToRemove, setMemberToRemove] = useState<ProjectMemberData | null>(null);
  const [isRemovingMember, setIsRemovingMember] = useState(false);

  const [invitationToRevoke, setInvitationToRevoke] = useState<PendingInvitationData | null>(null);
  const [isRevokingInvitation, setIsRevokingInvitation] = useState(false);

  const [roleChangeTarget, setRoleChangeTarget] = useState<{ member: ProjectMemberData; nextRole: "OWNER" | "MEMBER" } | null>(null);
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);

  const { toast } = useToast();
  const isOwner = currentUserRole === "OWNER";

  // Filtered members list
  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      const matchesRole = roleFilter === "ALL" || member.role === roleFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (member.user.name && member.user.name.toLowerCase().includes(q)) ||
        member.user.email.toLowerCase().includes(q);
      return matchesRole && matchesSearch;
    });
  }, [members, roleFilter, searchQuery]);

  // Counts for statistics
  const totalCount = members.length;
  const ownersCount = useMemo(() => members.filter((m) => m.role === "OWNER").length, [members]);
  const regularCount = useMemo(() => members.filter((m) => m.role === "MEMBER").length, [members]);
  const pendingCount = pendingInvitations.length;
  const totalCoffeesCount = useMemo(
    () => members.reduce((sum, m) => sum + (m.totalCoffees ?? 0), 0),
    [members]
  );

  // Handle send invitation
  async function handleSendInvite(e: FormEvent) {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setIsInviting(true);
    setInviteError(null);
    setInviteAcceptUrl(null);

    try {
      const response = await fetch(`/api/projects/${projectId}/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail.trim(), role: inviteRole })
      });
      const data = await response.json();

      if (!response.ok || !data.acceptUrl) {
        const errorMsg = data.error || "Could not create invitation.";
        setInviteError(errorMsg);
        toast({ message: errorMsg, type: "error" });
        return;
      }

      const fullUrl = `${window.location.origin}${data.acceptUrl}`;
      setInviteAcceptUrl(fullUrl);
      setInviteEmail("");

      if (data.invitation) {
        setPendingInvitations((prev) => [
          {
            id: data.invitation.id,
            email: data.invitation.email,
            token: data.invitation.token,
            status: data.invitation.status || "PENDING",
            expiresAt: data.invitation.expiresAt,
            createdAt: data.invitation.createdAt || new Date().toISOString(),
            inviter: {
              id: currentUserId,
              name: "You",
              email: ""
            }
          },
          ...prev
        ]);
      }

      toast({ message: "Invitation sent! Teammate notified.", type: "success" });
    } catch {
      setInviteError("Failed to send invitation.");
      toast({ message: "Failed to send invitation.", type: "error" });
    } finally {
      setIsInviting(false);
    }
  }

  // Handle copy invite url
  async function handleCopyInviteUrl(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      toast({ message: "Invitation link copied to clipboard!", type: "info" });
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      toast({ message: "Failed to copy link.", type: "error" });
    }
  }

  // Handle copy workspace link
  async function handleCopyWorkspaceLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast({ message: "Workspace URL copied to clipboard!", type: "info" });
    } catch {
      toast({ message: "Failed to copy link.", type: "error" });
    }
  }

  // Handle revoke invitation
  async function handleConfirmRevokeInvitation() {
    if (!invitationToRevoke) return;
    setIsRevokingInvitation(true);

    try {
      const response = await fetch(
        `/api/projects/${projectId}/invite?invitationId=${invitationToRevoke.id}`,
        { method: "DELETE" }
      );
      if (!response.ok) {
        throw new Error("Failed to revoke invitation");
      }

      setPendingInvitations((prev) => prev.filter((inv) => inv.id !== invitationToRevoke.id));
      setInvitationToRevoke(null);
      toast({ message: `Invitation to ${invitationToRevoke.email} revoked.`, type: "success" });
    } catch {
      toast({ message: "Could not revoke invitation.", type: "error" });
    } finally {
      setIsRevokingInvitation(false);
    }
  }

  // Handle remove member
  async function handleConfirmRemoveMember() {
    if (!memberToRemove) return;
    setIsRemovingMember(true);

    try {
      const response = await fetch(
        `/api/projects/${projectId}/members?memberId=${memberToRemove.id}`,
        { method: "DELETE" }
      );
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to remove member");
      }

      setMembers((prev) => prev.filter((m) => m.id !== memberToRemove.id));
      setMemberToRemove(null);
      toast({
        message: `Removed ${memberToRemove.user.name || memberToRemove.user.email} from project.`,
        type: "success"
      });
    } catch (err: any) {
      toast({ message: err.message || "Could not remove member.", type: "error" });
    } finally {
      setIsRemovingMember(false);
    }
  }

  // Handle role update
  async function handleConfirmRoleChange() {
    if (!roleChangeTarget) return;
    setIsUpdatingRole(true);

    try {
      const response = await fetch(`/api/projects/${projectId}/members`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId: roleChangeTarget.member.id,
          role: roleChangeTarget.nextRole
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to update role");
      }

      setMembers((prev) =>
        prev.map((m) =>
          m.id === roleChangeTarget.member.id ? { ...m, role: roleChangeTarget.nextRole } : m
        )
      );

      toast({
        message: `Changed ${roleChangeTarget.member.user.name || roleChangeTarget.member.user.email}'s role to ${roleChangeTarget.nextRole === "OWNER" ? "Owner" : "Member"}.`,
        type: "success"
      });
      setRoleChangeTarget(null);
    } catch (err: any) {
      toast({ message: err.message || "Could not update member role.", type: "error" });
    } finally {
      setIsUpdatingRole(false);
    }
  }

  const openInviteModal = () => {
    setIsInviteModalOpen(true);
    setInviteError(null);
    setInviteAcceptUrl(null);
    setTimeout(() => inviteInputRef.current?.focus(), 100);
  };

  return (
    <div className="scrollbar-soft h-full min-h-0 overflow-y-auto pr-1">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 pb-12">
        {/* ── Header Banner ── */}
        <section className="relative overflow-hidden rounded-2xl border border-stone-200/90 bg-white/90 p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.035] backdrop-blur-sm">
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-indigo-500/10 dark:bg-dusk-lavender/10 blur-2xl pointer-events-none" />
          <div className="absolute right-32 -bottom-10 h-32 w-32 rounded-full bg-amber-500/10 dark:bg-dusk-amber/10 blur-2xl pointer-events-none" />

          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-medium text-stone-500 dark:text-stone-400 mb-1">
                <Link
                  href={`/project/${projectId}/board`}
                  className="flex items-center gap-1 hover:text-indigo-600 dark:hover:text-dusk-lavender transition"
                >
                  <FolderKanban className="h-3.5 w-3.5 text-dusk-amber" />
                  <span>{projectName}</span>
                </Link>
                <span>/</span>
                <span className="uppercase tracking-widest text-dusk-amber font-mono text-[10px] font-semibold">
                  Workspace
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100 flex items-center gap-2.5">
                <span>Project Members</span>
                <span className="inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 dark:border-dusk-lavender/30 dark:bg-dusk-lavender/15 dark:text-dusk-lavender">
                  {totalCount} {totalCount === 1 ? "Member" : "Members"}
                </span>
              </h1>
              <p className="mt-1 text-sm text-stone-600 dark:text-stone-400 max-w-2xl leading-relaxed">
                Manage teammate access, roles, and pending workspace invitations.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleCopyWorkspaceLink}
                className="gap-1.5 text-xs cursor-pointer"
                title="Copy workspace URL to clipboard"
              >
                <Copy className="h-3.5 w-3.5 text-stone-400" />
                <span className="hidden sm:inline">Share Workspace</span>
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={openInviteModal}
                className="gap-1.5 text-xs shadow-sm bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-dusk-lavender dark:text-ink-950 dark:hover:bg-dusk-lavender/90 font-medium cursor-pointer"
              >
                <UserPlus className="h-3.5 w-3.5" />
                <span>Invite Teammate</span>
              </Button>
            </div>
          </div>
        </section>

        {/* ── KPI Metric Cards (Interactive) ── */}
        <section className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {/* Metric 1: Total Members */}
          <button
            type="button"
            onClick={() => {
              setActiveTab("members");
              setRoleFilter("ALL");
            }}
            className="group text-left rounded-2xl border border-stone-200/90 bg-white/80 p-4 shadow-xs transition hover:border-indigo-400 hover:shadow-sm dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-white/20 cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-stone-500 dark:text-stone-400">Total Members</span>
              <div className="grid h-8 w-8 place-items-center rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-600 dark:border-dusk-lavender/30 dark:bg-dusk-lavender/10 dark:text-dusk-lavender">
                <Users className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-2 text-2xl font-bold font-mono text-stone-900 dark:text-stone-100">{totalCount}</p>
            <p className="mt-0.5 text-[11px] text-stone-500 dark:text-stone-400">Active collaborators</p>
          </button>

          {/* Metric 2: Owners */}
          <button
            type="button"
            onClick={() => {
              setActiveTab("members");
              setRoleFilter("OWNER");
            }}
            className="group text-left rounded-2xl border border-stone-200/90 bg-white/80 p-4 shadow-xs transition hover:border-amber-400 hover:shadow-sm dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-white/20 cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-stone-500 dark:text-stone-400">Workspace Owners</span>
              <div className="grid h-8 w-8 place-items-center rounded-xl border border-amber-200 bg-amber-50 text-amber-600 dark:border-dusk-amber/30 dark:bg-dusk-amber/10 dark:text-dusk-amber">
                <Crown className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-2 text-2xl font-bold font-mono text-stone-900 dark:text-stone-100">{ownersCount}</p>
            <p className="mt-0.5 text-[11px] text-stone-500 dark:text-stone-400">Full admin controls</p>
          </button>

          {/* Metric 3: Regular Members */}
          <button
            type="button"
            onClick={() => {
              setActiveTab("members");
              setRoleFilter("MEMBER");
            }}
            className="group text-left rounded-2xl border border-stone-200/90 bg-white/80 p-4 shadow-xs transition hover:border-teal-400 hover:shadow-sm dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-white/20 cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-stone-500 dark:text-stone-400">Project Members</span>
              <div className="grid h-8 w-8 place-items-center rounded-xl border border-teal-200 bg-teal-50 text-teal-600 dark:border-dusk-cyan/30 dark:bg-dusk-cyan/10 dark:text-dusk-cyan">
                <UserCheck className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-2 text-2xl font-bold font-mono text-stone-900 dark:text-stone-100">{regularCount}</p>
            <p className="mt-0.5 text-[11px] text-stone-500 dark:text-stone-400">Standard task editors</p>
          </button>

          {/* Metric 4: Pending Invites */}
          <button
            type="button"
            onClick={() => setActiveTab("invitations")}
            className="group text-left rounded-2xl border border-stone-200/90 bg-white/80 p-4 shadow-xs transition hover:border-purple-400 hover:shadow-sm dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-white/20 cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-stone-500 dark:text-stone-400">Pending Invites</span>
              <div className="grid h-8 w-8 place-items-center rounded-xl border border-purple-200 bg-purple-50 text-purple-600 dark:border-purple-500/30 dark:bg-purple-500/10 dark:text-purple-400">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-2 text-2xl font-bold font-mono text-stone-900 dark:text-stone-100">{pendingCount}</p>
            <p className="mt-0.5 text-[11px] text-stone-500 dark:text-stone-400">Awaiting acceptance</p>
          </button>

          {/* Metric 5: Total Coffees */}
          <div className="col-span-2 sm:col-span-1 group rounded-2xl border border-stone-200/90 bg-white/80 p-4 shadow-xs transition hover:border-amber-300 dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-white/20">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-stone-500 dark:text-stone-400">Total Coffees</span>
              <div className="grid h-8 w-8 place-items-center rounded-xl border border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700/40 dark:bg-amber-950/40 dark:text-amber-300">
                <Coffee className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-2 text-2xl font-bold font-mono text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
              <span>☕</span>
              <span>{totalCoffeesCount}</span>
            </p>
            <p className="mt-0.5 text-[11px] text-stone-500 dark:text-stone-400">Coffee cheers earned</p>
          </div>
        </section>

        {/* ── Main Tabbed Content Panel ── */}
        <div className="rounded-2xl border border-stone-200/90 bg-white/95 p-4 sm:p-6 shadow-xs dark:border-white/10 dark:bg-white/[0.035]">
          {/* Top-Level Tabs Bar */}
          <div className="flex items-center justify-between border-b border-stone-200/80 dark:border-white/10 pb-4 flex-wrap gap-3">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              <button
                type="button"
                onClick={() => setActiveTab("members")}
                className={cn(
                  "flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-medium transition cursor-pointer shrink-0",
                  activeTab === "members"
                    ? "bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs font-semibold dark:bg-dusk-lavender/20 dark:text-dusk-lavender dark:border-dusk-lavender/40"
                    : "text-stone-500 hover:text-stone-900 hover:bg-stone-100/70 dark:text-stone-400 dark:hover:text-white dark:hover:bg-white/5"
                )}
              >
                <Users className="h-4 w-4" />
                <span>สมาชิกในทีม (Members)</span>
                <span className="rounded-full bg-stone-200/80 px-1.5 py-0.2 text-[10px] font-bold dark:bg-white/10">
                  {totalCount}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("invitations")}
                className={cn(
                  "flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-medium transition cursor-pointer shrink-0",
                  activeTab === "invitations"
                    ? "bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs font-semibold dark:bg-dusk-lavender/20 dark:text-dusk-lavender dark:border-dusk-lavender/40"
                    : "text-stone-500 hover:text-stone-900 hover:bg-stone-100/70 dark:text-stone-400 dark:hover:text-white dark:hover:bg-white/5"
                )}
              >
                <Mail className="h-4 w-4" />
                <span>คำเชิญรอดำเนินการ (Invitations)</span>
                {pendingCount > 0 && (
                  <span className="rounded-full bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300 px-1.5 py-0.2 text-[10px] font-bold">
                    {pendingCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("roles")}
                className={cn(
                  "flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-medium transition cursor-pointer shrink-0",
                  activeTab === "roles"
                    ? "bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs font-semibold dark:bg-dusk-lavender/20 dark:text-dusk-lavender dark:border-dusk-lavender/40"
                    : "text-stone-500 hover:text-stone-900 hover:bg-stone-100/70 dark:text-stone-400 dark:hover:text-white dark:hover:bg-white/5"
                )}
              >
                <Shield className="h-4 w-4" />
                <span>สิทธิ์และการเข้าถึง (Roles & Permissions)</span>
              </button>
            </div>

            <Button
              type="button"
              size="sm"
              onClick={openInviteModal}
              className="gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-dusk-lavender dark:text-ink-950 dark:hover:bg-dusk-lavender/90 font-medium cursor-pointer shrink-0 ml-auto"
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span>+ เชิญสมาชิกใหม่</span>
            </Button>
          </div>

          {/* ── TAB 1: MEMBERS LIST ── */}
          {activeTab === "members" && (
            <div className="mt-4 space-y-4">
              {/* Filter and Search Bar */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                {/* Search Bar */}
                <div className="group/search relative flex-1 max-w-md">
                  <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 transition-colors group-focus-within/search:text-indigo-600 dark:text-stone-500 dark:group-focus-within/search:text-dusk-lavender" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search members by name or email..."
                    className="h-10 w-full rounded-xl border border-stone-200/90 bg-stone-50/70 pl-10 pr-9 text-xs font-medium text-stone-900 placeholder:text-stone-400 shadow-2xs outline-none transition hover:border-stone-300 hover:bg-white focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/15 dark:border-white/10 dark:bg-white/[0.04] dark:text-stone-100 dark:placeholder:text-stone-500 dark:hover:border-white/20 dark:focus:border-dusk-lavender/50 dark:focus:bg-white/[0.07] dark:focus:ring-dusk-lavender/20"
                  />
                  {searchQuery ? (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 grid h-5 w-5 place-items-center rounded-full text-stone-400 transition hover:bg-stone-200/70 hover:text-stone-700 dark:text-stone-400 dark:hover:bg-white/15 dark:hover:text-stone-100 cursor-pointer"
                      aria-label="Clear search"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  ) : null}
                </div>

                {/* Role Filter Tabs */}
                <div className="flex items-center gap-1 rounded-xl border border-stone-200/80 bg-stone-100/70 p-1 dark:border-white/10 dark:bg-white/5 text-xs shrink-0 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setRoleFilter("ALL")}
                    className={cn(
                      "px-2.5 py-1 rounded-lg font-medium transition cursor-pointer",
                      roleFilter === "ALL"
                        ? "border border-stone-200/80 bg-white text-stone-900 shadow-xs dark:border-white/10 dark:bg-stone-800 dark:text-stone-100 font-semibold"
                        : "text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200"
                    )}
                  >
                    All ({totalCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setRoleFilter("OWNER")}
                    className={cn(
                      "px-2.5 py-1 rounded-lg font-medium transition cursor-pointer",
                      roleFilter === "OWNER"
                        ? "border border-stone-200/80 bg-white text-stone-900 shadow-xs dark:border-white/10 dark:bg-stone-800 dark:text-stone-100 font-semibold"
                        : "text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200"
                    )}
                  >
                    Owners ({ownersCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setRoleFilter("MEMBER")}
                    className={cn(
                      "px-2.5 py-1 rounded-lg font-medium transition cursor-pointer",
                      roleFilter === "MEMBER"
                        ? "border border-stone-200/80 bg-white text-stone-900 shadow-xs dark:border-white/10 dark:bg-stone-800 dark:text-stone-100 font-semibold"
                        : "text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200"
                    )}
                  >
                    Members ({regularCount})
                  </button>
                </div>
              </div>

              {/* Members List Cards */}
              <div className="space-y-2.5 pt-1">
                {filteredMembers.length === 0 ? (
                  <div className="py-12 text-center rounded-2xl border border-dashed border-stone-200 dark:border-white/10 p-6">
                    <UserX className="mx-auto h-8 w-8 text-stone-400" />
                    <p className="mt-2 text-sm font-semibold text-stone-900 dark:text-stone-100">
                      No members match &ldquo;{searchQuery}&rdquo;
                    </p>
                    <p className="text-xs text-stone-500 mt-1">Try clearing your search query or role filter.</p>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setSearchQuery("");
                        setRoleFilter("ALL");
                      }}
                      className="mt-3 text-xs cursor-pointer"
                    >
                      Clear filters
                    </Button>
                  </div>
                ) : (
                  filteredMembers.map((member) => {
                    const isSelf = member.userId === currentUserId;
                    const canManageMember = isOwner && !isSelf;
                    const isOnline = member.user.status === "ONLINE";
                    const isBusy = member.user.status === "BUSY";

                    return (
                      <div
                        key={member.id}
                        className="group flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-stone-200/80 bg-white/70 p-3.5 sm:p-4 transition hover:border-indigo-300 hover:bg-white hover:shadow-xs dark:border-white/10 dark:bg-white/[0.025] dark:hover:border-white/20 dark:hover:bg-white/[0.05]"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          {/* Member Avatar with Presence Indicator */}
                          <div className="relative shrink-0">
                            <Avatar
                              user={{
                                id: member.user.id,
                                name: member.user.name,
                                email: member.user.email,
                                avatar: member.user.avatar
                              }}
                              size={44}
                              showTooltip
                            />
                            <span
                              className={cn(
                                "absolute bottom-0 right-0 h-3 w-3 rounded-full ring-2 ring-white dark:ring-stone-900",
                                isOnline
                                  ? "bg-emerald-500"
                                  : isBusy
                                    ? "bg-amber-500"
                                    : "bg-stone-300 dark:bg-stone-600"
                              )}
                              title={isOnline ? "Online" : isBusy ? "Busy" : "Offline"}
                            />
                          </div>

                          {/* Member Info */}
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="truncate text-sm font-semibold text-stone-900 dark:text-stone-100">
                                {member.user.name || member.user.email.split("@")[0]}
                              </p>
                              {isSelf && (
                                <span className="rounded-full border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-700 dark:border-dusk-lavender/30 dark:bg-dusk-lavender/15 dark:text-dusk-lavender">
                                  You
                                </span>
                              )}
                            </div>
                            <p className="truncate text-xs font-mono text-stone-500 dark:text-stone-400 mt-0.5">
                              {member.user.email}
                            </p>
                            <p className="flex items-center gap-1 text-[11px] text-stone-400 dark:text-stone-500 mt-1">
                              <Calendar className="h-3 w-3 shrink-0" />
                              <span>Joined {formatShortDate(member.createdAt)}</span>
                            </p>
                          </div>
                        </div>

                        {/* Right: Role, Coffees & Actions */}
                        <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 shrink-0 pt-2 sm:pt-0 border-t border-stone-100 sm:border-0 dark:border-white/5">
                          {/* Coffee Cheers Earned Badge */}
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold shadow-2xs select-none",
                              (member.totalCoffees ?? 0) > 0
                                ? "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-700/50 dark:bg-amber-950/40 dark:text-amber-200"
                                : "border-stone-200/80 bg-stone-50/80 text-stone-400 dark:border-white/10 dark:bg-white/[0.02] dark:text-stone-500"
                            )}
                            title={`${member.user.name || "Member"} received ${member.totalCoffees ?? 0} coffee cheers for completing tasks`}
                          >
                            <span>☕</span>
                            <span className="font-mono text-xs">{member.totalCoffees ?? 0}</span>
                          </span>

                          {/* Role Switcher or Display Pill */}
                          {canManageMember ? (
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() =>
                                  setRoleChangeTarget({
                                    member,
                                    nextRole: member.role === "OWNER" ? "MEMBER" : "OWNER"
                                  })
                                }
                                className={cn(
                                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold shadow-2xs transition cursor-pointer",
                                  member.role === "OWNER"
                                    ? "border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 dark:border-dusk-amber/35 dark:bg-dusk-amber/15 dark:text-dusk-amber dark:hover:bg-dusk-amber/25"
                                    : "border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:border-dusk-lavender/30 dark:bg-dusk-lavender/10 dark:text-dusk-lavender dark:hover:bg-dusk-lavender/20"
                                )}
                                title={`Click to change role to ${member.role === "OWNER" ? "Member" : "Owner"}`}
                              >
                                {member.role === "OWNER" ? (
                                  <>
                                    <Crown className="h-3.5 w-3.5 text-amber-600 dark:text-dusk-amber" />
                                    <span>Owner</span>
                                  </>
                                ) : (
                                  <>
                                    <UserCheck className="h-3.5 w-3.5 text-indigo-600 dark:text-dusk-lavender" />
                                    <span>Member</span>
                                  </>
                                )}
                                <ChevronDown className="h-3 w-3 opacity-60" />
                              </button>
                            </div>
                          ) : (
                            <div>
                              {member.role === "OWNER" ? (
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/80 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800 dark:border-dusk-amber/35 dark:bg-dusk-amber/15 dark:text-dusk-amber shadow-2xs">
                                  <Crown className="h-3.5 w-3.5 text-amber-600 dark:text-dusk-amber" />
                                  <span>Owner</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 dark:border-dusk-lavender/30 dark:bg-dusk-lavender/10 dark:text-dusk-lavender shadow-2xs">
                                  <UserCheck className="h-3.5 w-3.5 text-indigo-600 dark:text-dusk-lavender" />
                                  <span>Member</span>
                                </span>
                              )}
                            </div>
                          )}

                          {/* Remove Member Button */}
                          {canManageMember && (
                            <button
                              type="button"
                              onClick={() => setMemberToRemove(member)}
                              className="grid h-8 w-8 place-items-center rounded-xl border border-stone-200/80 text-stone-400 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 dark:border-white/10 dark:hover:border-rose-500/20 dark:hover:bg-rose-500/10 dark:hover:text-rose-400 cursor-pointer"
                              title={`Remove ${member.user.name || member.user.email} from project`}
                              aria-label={`Remove ${member.user.name || member.user.email}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* ── TAB 2: PENDING INVITATIONS ── */}
          {activeTab === "invitations" && (
            <div className="mt-4 space-y-4">
              <div className="flex items-center justify-between border-b border-stone-200/80 dark:border-white/10 pb-3">
                <div>
                  <h3 className="text-base font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                    <Mail className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    <span>Invitations Sent</span>
                    <span className="rounded-full bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300 px-2 py-0.2 text-[11px] font-bold">
                      {pendingCount}
                    </span>
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Teammates who have been invited to join this project but have not accepted yet
                  </p>
                </div>

                <Button
                  type="button"
                  size="sm"
                  onClick={openInviteModal}
                  className="text-xs gap-1.5 cursor-pointer"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  <span>Send New Invite</span>
                </Button>
              </div>

              {pendingInvitations.length === 0 ? (
                <div className="py-12 text-center rounded-2xl border border-dashed border-stone-200 dark:border-white/10 p-6">
                  <Mail className="mx-auto h-8 w-8 text-stone-400" />
                  <p className="mt-2 text-sm font-semibold text-stone-900 dark:text-stone-100">
                    No Pending Invitations
                  </p>
                  <p className="text-xs text-stone-500 mt-1">All invited collaborators have joined the workspace.</p>
                  <Button
                    type="button"
                    size="sm"
                    onClick={openInviteModal}
                    className="mt-4 text-xs gap-1.5 cursor-pointer"
                  >
                    <UserPlus className="h-3.5 w-3.5" />
                    <span>Invite Teammate</span>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingInvitations.map((inv) => {
                    const acceptUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/accept-invitation?token=${inv.token}`;

                    return (
                      <div
                        key={inv.id}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-purple-200/70 bg-purple-50/25 p-4 text-xs dark:border-purple-500/20 dark:bg-purple-500/[0.03]"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-purple-200 bg-purple-100 text-purple-700 dark:border-purple-500/30 dark:bg-purple-500/15 dark:text-purple-300">
                            <Mail className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold font-mono text-stone-900 dark:text-stone-100 text-sm truncate">
                              {inv.email}
                            </p>
                            <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                              Invited by {inv.inviter?.name || inv.inviter?.email || "Team member"} • Expires{" "}
                              {formatMediumDate(new Date(inv.expiresAt))}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            onClick={() => handleCopyInviteUrl(acceptUrl)}
                            className="h-8 px-3 text-xs gap-1.5 border-stone-200 dark:border-white/10 cursor-pointer"
                          >
                            <Copy className="h-3.5 w-3.5 text-stone-400" />
                            <span>Copy link</span>
                          </Button>

                          {isOwner && (
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => setInvitationToRevoke(inv)}
                              className="h-8 px-3 text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:text-rose-400 dark:hover:bg-rose-500/10 cursor-pointer"
                            >
                              Revoke
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── TAB 3: ROLES & PERMISSIONS MATRIX ── */}
          {activeTab === "roles" && (
            <div className="mt-4 space-y-5">
              <div className="border-b border-stone-200/80 dark:border-white/10 pb-3">
                <h3 className="text-base font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <Shield className="h-4 w-4 text-dusk-amber" />
                  <span>Workspace Roles & Access Matrix</span>
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Understand permissions and capabilities for Workspace Owners versus Project Members
                </p>
              </div>

              {/* Roles Cards */}
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Workspace Owner Card */}
                <div className="rounded-2xl border border-amber-200 bg-amber-50/30 p-5 dark:border-dusk-amber/30 dark:bg-dusk-amber/[0.04]">
                  <div className="flex items-center gap-2.5 font-semibold text-amber-900 dark:text-dusk-amber mb-2">
                    <div className="grid h-8 w-8 place-items-center rounded-xl bg-amber-100 dark:bg-dusk-amber/20 text-amber-700 dark:text-dusk-amber">
                      <Crown className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold">Workspace Owner</h4>
                      <p className="text-[11px] font-normal text-amber-700 dark:text-dusk-amber/80">Full administrative authority</p>
                    </div>
                  </div>
                  <ul className="mt-4 space-y-2 text-stone-600 dark:text-stone-400 text-xs">
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <span>Manage workspace settings, name, description, and cover image</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <span>Invite teammates, assign roles, and remove collaborators</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <span>Create public or private boards and configure access lists</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <span>Delete or archive the workspace when no longer needed</span>
                    </li>
                  </ul>
                </div>

                {/* Project Member Card */}
                <div className="rounded-2xl border border-indigo-200 bg-indigo-50/30 p-5 dark:border-dusk-lavender/30 dark:bg-dusk-lavender/[0.04]">
                  <div className="flex items-center gap-2.5 font-semibold text-indigo-900 dark:text-dusk-lavender mb-2">
                    <div className="grid h-8 w-8 place-items-center rounded-xl bg-indigo-100 dark:bg-dusk-lavender/20 text-indigo-700 dark:text-dusk-lavender">
                      <UserCheck className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold">Project Member</h4>
                      <p className="text-[11px] font-normal text-indigo-700 dark:text-dusk-lavender/80">Collaborative contributor</p>
                    </div>
                  </div>
                  <ul className="mt-4 space-y-2 text-stone-600 dark:text-stone-400 text-xs">
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <span>Create, edit, assign, and drag cards on all accessible boards</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <span>Manage card checklists, start dates, and due dates</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <span>Write shared workspace notes and log personal daily diary items</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <span>Send coffee cheers (☕) and redeem coins in the Rewards Store</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Detailed Matrix Table */}
              <div className="overflow-x-auto rounded-2xl border border-stone-200/90 dark:border-white/10">
                <table className="w-full text-left text-xs text-stone-700 dark:text-stone-300">
                  <thead className="bg-stone-50 border-b border-stone-200/80 dark:bg-white/[0.03] dark:border-white/10 text-[11px] uppercase font-semibold text-stone-500">
                    <tr>
                      <th className="py-3 px-4">Feature / Action</th>
                      <th className="py-3 px-4 text-center">Owner (👑)</th>
                      <th className="py-3 px-4 text-center">Member (👤)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200/70 dark:divide-white/5">
                    <tr>
                      <td className="py-2.5 px-4 font-medium">Workspace Identity & Settings</td>
                      <td className="py-2.5 px-4 text-center text-emerald-600 font-bold">✓ Full Control</td>
                      <td className="py-2.5 px-4 text-center text-stone-400">View Only</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-medium">Invite Members & Assign Roles</td>
                      <td className="py-2.5 px-4 text-center text-emerald-600 font-bold">✓ Yes</td>
                      <td className="py-2.5 px-4 text-center text-stone-400">✗ No</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-medium">Remove Members from Workspace</td>
                      <td className="py-2.5 px-4 text-center text-emerald-600 font-bold">✓ Yes</td>
                      <td className="py-2.5 px-4 text-center text-stone-400">✗ No</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-medium">Create & Manage Private Boards</td>
                      <td className="py-2.5 px-4 text-center text-emerald-600 font-bold">✓ All Boards</td>
                      <td className="py-2.5 px-4 text-center text-amber-600">Assigned Only</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-medium">Kanban Cards & Spreadsheet View</td>
                      <td className="py-2.5 px-4 text-center text-emerald-600 font-bold">✓ Yes</td>
                      <td className="py-2.5 px-4 text-center text-emerald-600 font-bold">✓ Yes</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-medium">Calendar & Due Date Scheduling</td>
                      <td className="py-2.5 px-4 text-center text-emerald-600 font-bold">✓ Yes</td>
                      <td className="py-2.5 px-4 text-center text-emerald-600 font-bold">✓ Yes</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-medium">Shared Notes & Daily Diary</td>
                      <td className="py-2.5 px-4 text-center text-emerald-600 font-bold">✓ Yes</td>
                      <td className="py-2.5 px-4 text-center text-emerald-600 font-bold">✓ Yes</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-medium">Coffee Cheers & Gamification Rewards</td>
                      <td className="py-2.5 px-4 text-center text-emerald-600 font-bold">✓ Yes</td>
                      <td className="py-2.5 px-4 text-center text-emerald-600 font-bold">✓ Yes</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Tip Banner */}
              <div className="rounded-2xl border border-stone-200/80 bg-stone-50/80 p-4 text-xs text-stone-600 dark:border-white/10 dark:bg-white/[0.02] dark:text-stone-400">
                <span className="font-semibold text-stone-800 dark:text-stone-200">💡 Pro Tip: </span>
                If you have confidential sub-projects, you can make specific boards Private via Board Settings in the sidebar or Project Settings. Only the members you assign will be able to see or interact with that board.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Invite Teammate Modal ── */}
      <AppModal
        open={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        labelledBy="invite-teammate-modal-title"
        contentClassName="lofi-panel w-full max-w-lg rounded-2xl p-6"
      >
        <div className="mb-4 flex items-start justify-between gap-3 border-b border-stone-200/80 pb-3 dark:border-white/10">
          <div>
            <h2 id="invite-teammate-modal-title" className="text-base font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-indigo-600 dark:text-dusk-lavender" />
              Invite Teammate to Workspace
            </h2>
            <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">
              Send an invitation link for {projectName}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsInviteModalOpen(false)}
            className="rounded-lg p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-600 dark:hover:bg-white/10 dark:hover:text-stone-200 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 pt-1">
          <form onSubmit={handleSendInvite} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                Teammate Email Address
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                <input
                  ref={inviteInputRef}
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@example.com"
                  disabled={isInviting}
                  className="h-10 w-full rounded-xl border border-stone-200/90 bg-stone-50/70 pl-10 pr-3 text-xs font-medium text-stone-900 placeholder:text-stone-400 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/15 disabled:opacity-60 dark:border-white/10 dark:bg-white/[0.04] dark:text-stone-100 dark:placeholder:text-stone-500 dark:focus:border-dusk-lavender/50 dark:focus:bg-white/[0.07]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                Role in Workspace
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setInviteRole("MEMBER")}
                  className={cn(
                    "flex flex-col items-start p-3 rounded-xl border text-left transition cursor-pointer",
                    inviteRole === "MEMBER"
                      ? "border-indigo-500 bg-indigo-50/50 dark:border-dusk-lavender dark:bg-dusk-lavender/10"
                      : "border-stone-200 bg-stone-50/50 hover:bg-stone-50 dark:border-white/10 dark:bg-white/[0.02]"
                  )}
                >
                  <div className="flex items-center gap-1.5 font-semibold text-xs text-stone-900 dark:text-stone-100">
                    <UserCheck className="h-3.5 w-3.5 text-indigo-600 dark:text-dusk-lavender" />
                    <span>Project Member</span>
                  </div>
                  <p className="mt-1 text-[11px] text-stone-500 dark:text-stone-400 leading-tight">
                    Standard access to cards, notes & boards
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setInviteRole("OWNER")}
                  className={cn(
                    "flex flex-col items-start p-3 rounded-xl border text-left transition cursor-pointer",
                    inviteRole === "OWNER"
                      ? "border-amber-500 bg-amber-50/50 dark:border-dusk-amber dark:bg-dusk-amber/10"
                      : "border-stone-200 bg-stone-50/50 hover:bg-stone-50 dark:border-white/10 dark:bg-white/[0.02]"
                  )}
                >
                  <div className="flex items-center gap-1.5 font-semibold text-xs text-stone-900 dark:text-stone-100">
                    <Crown className="h-3.5 w-3.5 text-amber-600 dark:text-dusk-amber" />
                    <span>Workspace Owner</span>
                  </div>
                  <p className="mt-1 text-[11px] text-stone-500 dark:text-stone-400 leading-tight">
                    Full workspace administration controls
                  </p>
                </button>
              </div>
            </div>

            {inviteError && (
              <p className="text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 p-2.5 rounded-xl border border-rose-200 dark:border-rose-500/20">
                {inviteError}
              </p>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsInviteModalOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isInviting || !inviteEmail.trim()}
                className="gap-2 text-xs bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-dusk-lavender dark:text-ink-950 dark:hover:bg-dusk-lavender/90 font-medium cursor-pointer"
              >
                {isInviting ? (
                  <span>Sending...</span>
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5" />
                    <span>Send Invitation</span>
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* Generated Link Box */}
          {inviteAcceptUrl && (
            <div className="mt-4 space-y-2 rounded-xl border border-teal-200 bg-teal-50/80 p-3 text-xs dark:border-dusk-cyan/30 dark:bg-dusk-cyan/10">
              <div className="flex items-center justify-between text-teal-800 dark:text-dusk-cyan font-semibold">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" />
                  Invitation Link Ready
                </span>
                <span className="text-[10px] font-normal text-teal-700 dark:text-teal-300">Valid for 7 days</span>
              </div>
              <div className="flex items-center gap-1.5">
                <input
                  readOnly
                  value={inviteAcceptUrl}
                  className="flex-1 rounded-lg border border-teal-300/60 bg-white/95 px-2.5 py-1.5 font-mono text-[11px] text-stone-700 dark:border-white/10 dark:bg-ink-950/80 dark:text-stone-300 outline-none truncate"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => handleCopyInviteUrl(inviteAcceptUrl)}
                  className="h-7 px-2.5 shrink-0 gap-1 text-[11px] cursor-pointer"
                >
                  {copiedLink ? (
                    <>
                      <Check className="h-3 w-3 text-teal-600 dark:text-dusk-cyan" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span>Copy</span>
                    </>
                  )}
                </Button>
              </div>
              <p className="text-[10px] text-stone-500 dark:text-stone-400">
                You can copy and send this link directly to your teammate via Line, Slack, or Chat.
              </p>
            </div>
          )}
        </div>
      </AppModal>

      {/* ── Confirm Remove Member Modal ── */}
      <ConfirmModal
        open={Boolean(memberToRemove)}
        title="Remove Member from Project"
        message={`Are you sure you want to remove "${memberToRemove?.user.name || memberToRemove?.user.email}" from ${projectName}? They will immediately lose access to all project boards, notes, and calendar tasks.`}
        confirmLabel="Remove Member"
        variant="danger"
        isLoading={isRemovingMember}
        onConfirm={handleConfirmRemoveMember}
        onClose={() => setMemberToRemove(null)}
      />

      {/* ── Confirm Revoke Invitation Modal ── */}
      <ConfirmModal
        open={Boolean(invitationToRevoke)}
        title="Revoke Project Invitation"
        message={`Are you sure you want to cancel the invitation for "${invitationToRevoke?.email}"? The invitation link will immediately become invalid.`}
        confirmLabel="Revoke Invitation"
        variant="danger"
        isLoading={isRevokingInvitation}
        onConfirm={handleConfirmRevokeInvitation}
        onClose={() => setInvitationToRevoke(null)}
      />

      {/* ── Confirm Role Change Modal ── */}
      <ConfirmModal
        open={Boolean(roleChangeTarget)}
        title="Change Member Role"
        message={`Are you sure you want to change "${roleChangeTarget?.member.user.name || roleChangeTarget?.member.user.email}"'s role to ${roleChangeTarget?.nextRole === "OWNER" ? "Workspace Owner" : "Project Member"}?`}
        confirmLabel={`Set as ${roleChangeTarget?.nextRole === "OWNER" ? "Owner" : "Member"}`}
        variant="default"
        isLoading={isUpdatingRole}
        onConfirm={handleConfirmRoleChange}
        onClose={() => setRoleChangeTarget(null)}
      />
    </div>
  );
}
