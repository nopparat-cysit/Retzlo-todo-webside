"use client";

import { useState, useMemo, FormEvent, useRef } from "react";
import Link from "next/link";
import {
  Calendar,
  Check,
  Clock,
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
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { formatMediumDate, formatShortDate } from "@/lib/date-format";
import { cn } from "@/lib/utils";

export interface ProjectMemberData {
  id: string;
  userId: string;
  role: string;
  createdAt: string;
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
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"ALL" | "OWNER" | "MEMBER">("ALL");

  // Invite form states
  const [inviteEmail, setInviteEmail] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  const [inviteAcceptUrl, setInviteAcceptUrl] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const inviteInputRef = useRef<HTMLInputElement>(null);

  // Modals for deletion
  const [memberToRemove, setMemberToRemove] = useState<ProjectMemberData | null>(null);
  const [isRemovingMember, setIsRemovingMember] = useState(false);

  const [invitationToRevoke, setInvitationToRevoke] = useState<PendingInvitationData | null>(null);
  const [isRevokingInvitation, setIsRevokingInvitation] = useState(false);

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
        body: JSON.stringify({ email: inviteEmail.trim() })
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

  const focusInviteInput = () => {
    inviteInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    inviteInputRef.current?.focus();
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
                Manage teammate access, collaborator permissions, and pending workspace invitations.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleCopyWorkspaceLink}
                className="gap-1.5 text-xs"
              >
                <Copy className="h-3.5 w-3.5 text-stone-400" />
                <span className="hidden sm:inline">Share Workspace</span>
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={focusInviteInput}
                className="gap-1.5 text-xs shadow-sm bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-dusk-lavender dark:text-ink-950 dark:hover:bg-dusk-lavender/90 font-medium"
              >
                <UserPlus className="h-3.5 w-3.5" />
                <span>Invite Teammate</span>
              </Button>
            </div>
          </div>
        </section>

        {/* ── KPI Metric Cards ── */}
        <section className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {/* Metric 1: Total Members */}
          <div className="group rounded-2xl border border-stone-200/90 bg-white/80 p-4 shadow-xs transition hover:border-indigo-300 dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-white/20">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-stone-500 dark:text-stone-400">Total Members</span>
              <div className="grid h-8 w-8 place-items-center rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-600 dark:border-dusk-lavender/30 dark:bg-dusk-lavender/10 dark:text-dusk-lavender">
                <Users className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-2 text-2xl font-bold font-mono text-stone-900 dark:text-stone-100">{totalCount}</p>
            <p className="mt-0.5 text-[11px] text-stone-500 dark:text-stone-400">Active collaborators</p>
          </div>

          {/* Metric 2: Owners */}
          <div className="group rounded-2xl border border-stone-200/90 bg-white/80 p-4 shadow-xs transition hover:border-amber-300 dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-white/20">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-stone-500 dark:text-stone-400">Workspace Owners</span>
              <div className="grid h-8 w-8 place-items-center rounded-xl border border-amber-200 bg-amber-50 text-amber-600 dark:border-dusk-amber/30 dark:bg-dusk-amber/10 dark:text-dusk-amber">
                <Crown className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-2 text-2xl font-bold font-mono text-stone-900 dark:text-stone-100">{ownersCount}</p>
            <p className="mt-0.5 text-[11px] text-stone-500 dark:text-stone-400">Full admin controls</p>
          </div>

          {/* Metric 3: Regular Members */}
          <div className="group rounded-2xl border border-stone-200/90 bg-white/80 p-4 shadow-xs transition hover:border-teal-300 dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-white/20">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-stone-500 dark:text-stone-400">Project Members</span>
              <div className="grid h-8 w-8 place-items-center rounded-xl border border-teal-200 bg-teal-50 text-teal-600 dark:border-dusk-cyan/30 dark:bg-dusk-cyan/10 dark:text-dusk-cyan">
                <UserCheck className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-2 text-2xl font-bold font-mono text-stone-900 dark:text-stone-100">{regularCount}</p>
            <p className="mt-0.5 text-[11px] text-stone-500 dark:text-stone-400">Standard task editors</p>
          </div>

          {/* Metric 4: Pending Invites */}
          <div className="group rounded-2xl border border-stone-200/90 bg-white/80 p-4 shadow-xs transition hover:border-purple-300 dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-white/20">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-stone-500 dark:text-stone-400">Pending Invites</span>
              <div className="grid h-8 w-8 place-items-center rounded-xl border border-purple-200 bg-purple-50 text-purple-600 dark:border-purple-500/30 dark:bg-purple-500/10 dark:text-purple-400">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-2 text-2xl font-bold font-mono text-stone-900 dark:text-stone-100">{pendingCount}</p>
            <p className="mt-0.5 text-[11px] text-stone-500 dark:text-stone-400">Awaiting acceptance</p>
          </div>
        </section>

        {/* ── Main 2-Column Content ── */}
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
          {/* ── Left Column: Active Members & Pending Invites ── */}
          <div className="space-y-5 min-w-0">
            {/* Active Members Card */}
            <div className="rounded-2xl border border-stone-200/90 bg-white/95 p-4 sm:p-5 shadow-xs dark:border-white/10 dark:bg-white/[0.035]">
              {/* Header & Search Bar */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-stone-200/80 dark:border-white/10 pb-4">
                <div>
                  <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                    <span>Active Collaborators</span>
                    <span className="text-xs text-stone-400 font-normal">({filteredMembers.length})</span>
                  </h2>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                    Team members with direct workspace permissions
                  </p>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-1 rounded-xl border border-stone-200/80 bg-stone-100/70 p-1 dark:border-white/10 dark:bg-white/5 text-xs">
                  <button
                    type="button"
                    onClick={() => setRoleFilter("ALL")}
                    className={cn(
                      "px-2.5 py-1 rounded-lg font-medium transition",
                      roleFilter === "ALL"
                        ? "bg-white text-stone-900 shadow-xs dark:bg-white/15 dark:text-white"
                        : "text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white"
                    )}
                  >
                    All ({totalCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setRoleFilter("OWNER")}
                    className={cn(
                      "px-2.5 py-1 rounded-lg font-medium transition",
                      roleFilter === "OWNER"
                        ? "bg-white text-stone-900 shadow-xs dark:bg-white/15 dark:text-white"
                        : "text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white"
                    )}
                  >
                    Owners ({ownersCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setRoleFilter("MEMBER")}
                    className={cn(
                      "px-2.5 py-1 rounded-lg font-medium transition",
                      roleFilter === "MEMBER"
                        ? "bg-white text-stone-900 shadow-xs dark:bg-white/15 dark:text-white"
                        : "text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white"
                    )}
                  >
                    Members ({regularCount})
                  </button>
                </div>
              </div>

              {/* Search Filter */}
              <div className="mt-3.5 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search members by name or email..."
                  className="pl-9 pr-9 text-xs h-9 bg-stone-50/60 dark:bg-white/[0.02]"
                />
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-0.5"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                ) : null}
              </div>

              {/* Members List */}
              <div className="mt-4 space-y-2.5">
                {filteredMembers.length === 0 ? (
                  <div className="py-12 text-center rounded-xl border border-dashed border-stone-200 dark:border-white/10 p-6">
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
                      className="mt-3 text-xs"
                    >
                      Clear filters
                    </Button>
                  </div>
                ) : (
                  filteredMembers.map((member) => {
                    const isSelf = member.userId === currentUserId;
                    const canRemove = isOwner && !isSelf;

                    return (
                      <div
                        key={member.id}
                        className="group flex items-center justify-between gap-3 rounded-xl border border-stone-200/80 bg-white/70 p-3 sm:p-3.5 transition hover:border-indigo-300 hover:bg-white dark:border-white/10 dark:bg-white/[0.025] dark:hover:border-white/20 dark:hover:bg-white/[0.05]"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          {/* Member Avatar */}
                          <Avatar
                            user={{
                              id: member.user.id,
                              name: member.user.name,
                              email: member.user.email,
                              avatar: member.user.avatar
                            }}
                            size={42}
                            showTooltip
                          />

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

                        {/* Right: Role & Actions */}
                        <div className="flex items-center gap-2.5 shrink-0">
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

                          {canRemove && (
                            <button
                              type="button"
                              onClick={() => setMemberToRemove(member)}
                              className="opacity-0 group-hover:opacity-100 focus:opacity-100 grid h-8 w-8 place-items-center rounded-lg border border-transparent text-stone-400 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 dark:hover:border-rose-500/20 dark:hover:bg-rose-500/10 dark:hover:text-rose-400 cursor-pointer"
                              title={`Remove ${member.user.name || member.user.email}`}
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

            {/* Pending Invitations Card */}
            {pendingInvitations.length > 0 && (
              <div className="rounded-2xl border border-stone-200/90 bg-white/95 p-4 sm:p-5 shadow-xs dark:border-white/10 dark:bg-white/[0.035]">
                <div className="flex items-center justify-between border-b border-stone-200/80 dark:border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    <h3 className="text-base font-semibold text-stone-900 dark:text-stone-100">
                      Pending Invitations
                    </h3>
                    <span className="rounded-full border border-purple-200 bg-purple-50 px-2 py-0.2 text-[11px] font-semibold text-purple-700 dark:border-purple-500/30 dark:bg-purple-500/15 dark:text-purple-300">
                      {pendingInvitations.length}
                    </span>
                  </div>
                  <span className="text-xs text-stone-400">Awaiting confirmation</span>
                </div>

                <div className="mt-3 space-y-2.5">
                  {pendingInvitations.map((inv) => {
                    const acceptUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/accept-invitation?token=${inv.token}`;

                    return (
                      <div
                        key={inv.id}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 rounded-xl border border-purple-200/70 bg-purple-50/30 p-3 text-xs dark:border-purple-500/20 dark:bg-purple-500/[0.03]"
                      >
                        <div className="min-w-0">
                          <p className="font-semibold font-mono text-stone-900 dark:text-stone-100 truncate">
                            {inv.email}
                          </p>
                          <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                            Invited by {inv.inviter?.name || inv.inviter?.email || "Team member"} • Expires{" "}
                            {formatShortDate(inv.expiresAt)}
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            onClick={() => handleCopyInviteUrl(acceptUrl)}
                            className="h-7 px-2.5 text-xs gap-1 border-stone-200 dark:border-white/10"
                          >
                            <Copy className="h-3 w-3 text-stone-400" />
                            <span>Copy link</span>
                          </Button>

                          {isOwner && (
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => setInvitationToRevoke(inv)}
                              className="h-7 px-2 text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:text-rose-400 dark:hover:bg-rose-500/10"
                            >
                              Revoke
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* ── Right Column: Invite Form & Permissions Matrix ── */}
          <div className="space-y-5">
            {/* Invite Teammate Card */}
            <div className="rounded-2xl border border-stone-200/90 bg-white/95 p-4 sm:p-5 shadow-xs dark:border-white/10 dark:bg-white/[0.035]">
              <div className="flex items-center gap-2 mb-1">
                <div className="grid h-7 w-7 place-items-center rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-600 dark:border-dusk-lavender/30 dark:bg-dusk-lavender/10 dark:text-dusk-lavender">
                  <UserPlus className="h-4 w-4" />
                </div>
                <h3 className="text-base font-semibold text-stone-900 dark:text-stone-100">Invite New Member</h3>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400 mb-4 leading-relaxed">
                Send an invitation link or email directly to a collaborator to join this project.
              </p>

              <form onSubmit={handleSendInvite} className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-stone-700 dark:text-stone-300">
                    Teammate Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                    <Input
                      ref={inviteInputRef}
                      type="email"
                      required
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="colleague@example.com"
                      disabled={isInviting}
                      className="pl-9 text-xs h-9.5"
                    />
                  </div>
                </div>

                {inviteError && (
                  <p className="text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 p-2 rounded-lg border border-rose-200 dark:border-rose-500/20">
                    {inviteError}
                  </p>
                )}

                <Button
                  type="submit"
                  disabled={isInviting || !inviteEmail.trim()}
                  className="w-full gap-1.5 text-xs h-9 bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-dusk-lavender dark:text-ink-950 font-medium"
                >
                  {isInviting ? (
                    <span>Sending invitation...</span>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" />
                      <span>Send Invitation</span>
                    </>
                  )}
                </Button>
              </form>

              {/* Generated Invite Link Preview */}
              {inviteAcceptUrl && (
                <div className="mt-4 space-y-2 rounded-xl border border-teal-200 bg-teal-50/70 p-3 text-xs dark:border-dusk-cyan/30 dark:bg-dusk-cyan/10">
                  <div className="flex items-center justify-between text-teal-800 dark:text-dusk-cyan font-semibold">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5" />
                      Invitation Link Created
                    </span>
                    <span className="text-[10px] font-normal text-teal-700 dark:text-teal-300">7 days valid</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <input
                      readOnly
                      value={inviteAcceptUrl}
                      className="flex-1 rounded-lg border border-teal-300/60 bg-white/90 px-2 py-1.5 font-mono text-[11px] text-stone-700 dark:border-white/10 dark:bg-ink-950/80 dark:text-stone-300 outline-none truncate"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => handleCopyInviteUrl(inviteAcceptUrl)}
                      className="h-7 px-2 shrink-0 gap-1 text-[11px] bg-white dark:bg-white/10"
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
                    You can share this link directly via Chat, Line, or Slack.
                  </p>
                </div>
              )}
            </div>

            {/* Role Permissions Matrix Card */}
            <div className="rounded-2xl border border-stone-200/90 bg-white/95 p-4 sm:p-5 shadow-xs dark:border-white/10 dark:bg-white/[0.035]">
              <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-2 mb-3">
                <Shield className="h-4 w-4 text-dusk-amber" />
                <span>Workspace Roles & Access</span>
              </h3>

              <div className="space-y-3.5 text-xs">
                {/* Owner Role */}
                <div className="rounded-xl border border-amber-200/80 bg-amber-50/40 p-3 dark:border-dusk-amber/20 dark:bg-dusk-amber/[0.04]">
                  <div className="flex items-center gap-1.5 font-semibold text-amber-900 dark:text-dusk-amber mb-1.5">
                    <Crown className="h-3.5 w-3.5 text-amber-600 dark:text-dusk-amber" />
                    <span>Workspace Owner</span>
                  </div>
                  <ul className="space-y-1 text-stone-600 dark:text-stone-400 text-[11px] leading-relaxed">
                    <li className="flex items-start gap-1.5">
                      <span className="text-amber-500 font-bold">•</span>
                      <span>Manage workspace settings, boards & custom branding</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-amber-500 font-bold">•</span>
                      <span>Invite new teammates and manage or remove members</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-amber-500 font-bold">•</span>
                      <span>Create and manage private or restricted boards</span>
                    </li>
                  </ul>
                </div>

                {/* Member Role */}
                <div className="rounded-xl border border-indigo-200/80 bg-indigo-50/40 p-3 dark:border-dusk-lavender/20 dark:bg-dusk-lavender/[0.04]">
                  <div className="flex items-center gap-1.5 font-semibold text-indigo-900 dark:text-dusk-lavender mb-1.5">
                    <UserCheck className="h-3.5 w-3.5 text-indigo-600 dark:text-dusk-lavender" />
                    <span>Project Member</span>
                  </div>
                  <ul className="space-y-1 text-stone-600 dark:text-stone-400 text-[11px] leading-relaxed">
                    <li className="flex items-start gap-1.5">
                      <span className="text-indigo-500 font-bold">•</span>
                      <span>Create, edit, assign, and drag cards on all public boards</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-indigo-500 font-bold">•</span>
                      <span>Create shared project notes and log diary entries</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-indigo-500 font-bold">•</span>
                      <span>Earn and redeem activity reward coins in the store</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Tip */}
              <div className="mt-4 rounded-xl border border-stone-200/80 bg-stone-50/80 p-3 text-[11px] text-stone-600 dark:border-white/10 dark:bg-white/[0.02] dark:text-stone-400">
                <span className="font-semibold text-stone-800 dark:text-stone-200">Pro Tip: </span>
                To restrict certain cards or tasks to specific people, use the Lock icon in Board Settings to turn the board into a Private Board.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Remove Member Modal */}
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

      {/* Confirm Revoke Invitation Modal */}
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
    </div>
  );
}
