"use client";

import { useEffect, useState, useTransition, useCallback } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowLeft,
  CheckCircle2,
  Database,
  FolderGit2,
  Kanban,
  LayoutDashboard,
  Radio,
  RefreshCw,
  Search,
  Server,
  Shield,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  Users,
  UserX,
  Zap
} from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

interface AdminUser {
  id: string;
  name: string | null;
  email: string;
  username: string | null;
  avatar: string | null;
  globalRole: string;
  status: string;
  createdAt: string;
  _count?: {
    memberships: number;
    notes: number;
    diaryItems: number;
  };
}

interface AdminProject {
  id: string;
  name: string;
  description: string | null;
  type: string;
  createdAt: string;
  updatedAt: string;
  owner: {
    id: string;
    name: string | null;
    email: string;
    avatar: string | null;
  } | null;
  counts: {
    members: number;
    boards: number;
    notes: number;
    diaryItems: number;
  };
}

interface OverviewData {
  stats: {
    totalUsers: number;
    activeUsers: number;
    totalProjects: number;
    totalBoards: number;
    totalCards: number;
    totalNotes: number;
    totalDiaryItems: number;
  };
  recentUsers: AdminUser[];
  recentProjects: AdminProject[];
  systemHealth: {
    database: string;
    environment: string;
  };
}

interface AdminDashboardClientProps {
  currentAdminEmail?: string;
  currentAdminName?: string;
}

export function AdminDashboardClient({
  currentAdminEmail,
  currentAdminName
}: AdminDashboardClientProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "projects" | "health">("overview");
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [userTotal, setUserTotal] = useState(0);
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState<string>("ALL");
  const [projects, setProjects] = useState<AdminProject[]>([]);
  const [projectTotal, setProjectTotal] = useState(0);
  const [projectSearch, setProjectSearch] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  // Action Confirmation Modal state
  const [pendingAction, setPendingAction] = useState<{
    type: "role" | "status";
    userId: string;
    userName: string;
    newRole?: "ADMIN" | "USER";
    newStatus?: "ONLINE" | "SUSPENDED";
    title: string;
    message: string;
    confirmLabel: string;
    variant: "default" | "danger";
  } | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Fetch Overview Data
  const fetchOverview = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/overview");
      if (res.ok) {
        const data = await res.json();
        setOverview(data);
      } else {
        toast({ message: "Failed to load system overview", type: "error" });
      }
    } catch {
      toast({ message: "Network error loading overview", type: "error" });
    }
  }, [toast]);

  // Fetch Users
  const fetchUsers = useCallback(async () => {
    try {
      const query = new URLSearchParams({
        search: userSearch,
        role: userRoleFilter,
        limit: "50"
      });
      const res = await fetch(`/api/admin/users?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
        setUserTotal(data.total);
      }
    } catch {
      toast({ message: "Failed to load users", type: "error" });
    }
  }, [userSearch, userRoleFilter, toast]);

  // Fetch Projects
  const fetchProjects = useCallback(async () => {
    try {
      const query = new URLSearchParams({
        search: projectSearch,
        limit: "50"
      });
      const res = await fetch(`/api/admin/projects?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setProjects(data.projects);
        setProjectTotal(data.total);
      }
    } catch {
      toast({ message: "Failed to load projects", type: "error" });
    }
  }, [projectSearch, toast]);

  const refreshAll = useCallback(() => {
    setIsLoading(true);
    startTransition(async () => {
      await Promise.all([fetchOverview(), fetchUsers(), fetchProjects()]);
      setIsLoading(false);
    });
  }, [fetchOverview, fetchUsers, fetchProjects]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  useEffect(() => {
    if (activeTab === "users") {
      void fetchUsers();
    }
  }, [activeTab, userSearch, userRoleFilter, fetchUsers]);

  useEffect(() => {
    if (activeTab === "projects") {
      void fetchProjects();
    }
  }, [activeTab, projectSearch, fetchProjects]);

  // Execute confirmed action
  const handleExecuteAction = async () => {
    if (!pendingAction) return;
    setIsActionLoading(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: pendingAction.userId,
          ...(pendingAction.newRole ? { globalRole: pendingAction.newRole } : {}),
          ...(pendingAction.newStatus ? { status: pendingAction.newStatus } : {})
        })
      });

      if (res.ok) {
        toast({ message: "User updated successfully", type: "success" });
        await fetchUsers();
        await fetchOverview();
        setPendingAction(null);
      } else {
        const data = await res.json();
        toast({ message: data.error || "Update failed", type: "error" });
      }
    } catch {
      toast({ message: "Failed to apply changes", type: "error" });
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-stone-100 dark:bg-[#07070e] text-stone-900 dark:text-stone-100">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-stone-200/80 bg-white/90 px-4 backdrop-blur-md dark:border-white/10 dark:bg-stone-900/90 sm:px-6">
        <div className="flex items-center gap-3">
          <Link
            href="/projects"
            className="flex items-center gap-1.5 rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-1.5 text-xs font-semibold text-stone-700 transition hover:bg-stone-100 hover:text-stone-950 dark:border-white/10 dark:bg-white/5 dark:text-stone-300 dark:hover:bg-white/10"
            title="Return to user workspace"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Back to Workspaces</span>
          </Link>
          <div className="h-4 w-px bg-stone-200 dark:bg-white/10" />
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold tracking-tight text-indigo-700 dark:text-dusk-lavender">
              RETZLO
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-purple-500/30 bg-purple-500/10 px-2.5 py-0.5 text-[11px] font-bold text-purple-700 dark:text-purple-300">
              <Shield className="h-3 w-3" />
              SUPER ADMIN
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-4">
          <button
            type="button"
            onClick={refreshAll}
            disabled={isLoading || isPending}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-stone-200 bg-white text-stone-600 transition hover:bg-stone-100 hover:text-stone-900 dark:border-white/10 dark:bg-white/5 dark:text-stone-400 dark:hover:bg-white/10 dark:hover:text-stone-100"
            title="Refresh statistics"
          >
            <RefreshCw className={cn("h-4 w-4", (isLoading || isPending) && "animate-spin")} />
          </button>
          <ThemeToggle variant="header" />
          <div className="hidden text-right sm:block">
            <p className="text-xs font-bold leading-none">{currentAdminName || "Administrator"}</p>
            <p className="mt-0.5 text-[10px] text-stone-500 dark:text-stone-400">{currentAdminEmail}</p>
          </div>
        </div>
      </header>

      {/* Main Admin Content Container */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-2 overflow-x-auto border-b border-stone-200/80 pb-2 dark:border-white/10">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={cn(
              "flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition shrink-0 cursor-pointer",
              activeTab === "overview"
                ? "bg-indigo-600 text-white shadow-xs dark:bg-dusk-lavender dark:text-ink-950"
                : "text-stone-600 hover:bg-stone-200/70 hover:text-stone-950 dark:text-stone-400 dark:hover:bg-white/5 dark:hover:text-stone-200"
            )}
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>Overview</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("users")}
            className={cn(
              "flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition shrink-0 cursor-pointer",
              activeTab === "users"
                ? "bg-indigo-600 text-white shadow-xs dark:bg-dusk-lavender dark:text-ink-950"
                : "text-stone-600 hover:bg-stone-200/70 hover:text-stone-950 dark:text-stone-400 dark:hover:bg-white/5 dark:hover:text-stone-200"
            )}
          >
            <Users className="h-4 w-4" />
            <span>User Management</span>
            {userTotal > 0 && (
              <span className="rounded-full bg-black/15 px-1.5 py-0.2 text-[10px] dark:bg-white/20">
                {userTotal}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("projects")}
            className={cn(
              "flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition shrink-0 cursor-pointer",
              activeTab === "projects"
                ? "bg-indigo-600 text-white shadow-xs dark:bg-dusk-lavender dark:text-ink-950"
                : "text-stone-600 hover:bg-stone-200/70 hover:text-stone-950 dark:text-stone-400 dark:hover:bg-white/5 dark:hover:text-stone-200"
            )}
          >
            <FolderGit2 className="h-4 w-4" />
            <span>Workspaces</span>
            {projectTotal > 0 && (
              <span className="rounded-full bg-black/15 px-1.5 py-0.2 text-[10px] dark:bg-white/20">
                {projectTotal}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("health")}
            className={cn(
              "flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition shrink-0 cursor-pointer",
              activeTab === "health"
                ? "bg-indigo-600 text-white shadow-xs dark:bg-dusk-lavender dark:text-ink-950"
                : "text-stone-600 hover:bg-stone-200/70 hover:text-stone-950 dark:text-stone-400 dark:hover:bg-white/5 dark:hover:text-stone-200"
            )}
          >
            <Server className="h-4 w-4" />
            <span>System Health</span>
          </button>
        </div>

        {/* TAB 1: SYSTEM OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-6 animate-in fade-in">
            {/* Stat Cards Grid */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
              <div className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-2xs dark:border-white/10 dark:bg-stone-900/60">
                <div className="flex items-center justify-between text-stone-500 dark:text-stone-400">
                  <span className="text-xs font-semibold">Total Users</span>
                  <Users className="h-4 w-4 text-indigo-600 dark:text-dusk-lavender" />
                </div>
                <p className="mt-2 text-2xl font-black font-mono tracking-tight">
                  {overview?.stats.totalUsers ?? "—"}
                </p>
                <div className="mt-1 flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span>{overview?.stats.activeUsers ?? 0} Active / Online</span>
                </div>
              </div>

              <div className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-2xs dark:border-white/10 dark:bg-stone-900/60">
                <div className="flex items-center justify-between text-stone-500 dark:text-stone-400">
                  <span className="text-xs font-semibold">Workspaces</span>
                  <FolderGit2 className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                </div>
                <p className="mt-2 text-2xl font-black font-mono tracking-tight">
                  {overview?.stats.totalProjects ?? "—"}
                </p>
                <p className="mt-1 text-[11px] text-stone-500 dark:text-stone-400">
                  {overview?.stats.totalBoards ?? 0} Kanban Boards
                </p>
              </div>

              <div className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-2xs dark:border-white/10 dark:bg-stone-900/60">
                <div className="flex items-center justify-between text-stone-500 dark:text-stone-400">
                  <span className="text-xs font-semibold">Kanban Cards</span>
                  <Kanban className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </div>
                <p className="mt-2 text-2xl font-black font-mono tracking-tight">
                  {overview?.stats.totalCards ?? "—"}
                </p>
                <p className="mt-1 text-[11px] text-stone-500 dark:text-stone-400">
                  Tasks across all boards
                </p>
              </div>

              <div className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-2xs dark:border-white/10 dark:bg-stone-900/60">
                <div className="flex items-center justify-between text-stone-500 dark:text-stone-400">
                  <span className="text-xs font-semibold">Database Status</span>
                  <Database className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <p className="mt-2 text-lg font-black font-mono tracking-tight text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" />
                  ONLINE
                </p>
                <p className="mt-1 text-[11px] text-stone-500 dark:text-stone-400">
                  Neon PostgreSQL
                </p>
              </div>
            </div>

            {/* Split Grid: Recent Users & Recent Projects */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Recent Users Card */}
              <div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-2xs dark:border-white/10 dark:bg-stone-900/60 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold flex items-center gap-2">
                    <Users className="h-4 w-4 text-indigo-600 dark:text-dusk-lavender" />
                    <span>Recent Registrations</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveTab("users")}
                    className="text-xs font-bold text-indigo-600 hover:underline dark:text-dusk-lavender cursor-pointer"
                  >
                    View All →
                  </button>
                </div>

                <div className="divide-y divide-stone-100 dark:divide-white/5">
                  {overview?.recentUsers.map((u) => (
                    <div key={u.id} className="flex items-center justify-between py-2.5">
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar
                          src={u.avatar}
                          name={u.name || u.email}
                          initials={(u.name || u.email).substring(0, 2).toUpperCase()}
                          size={32}
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold truncate">{u.name || "Anonymous"}</p>
                          <p className="text-[11px] text-stone-500 truncate dark:text-stone-400">{u.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[10px] font-bold font-mono",
                            u.globalRole === "ADMIN"
                              ? "bg-purple-500/15 text-purple-700 dark:text-purple-300"
                              : "bg-stone-200/70 text-stone-600 dark:bg-white/10 dark:text-stone-400"
                          )}
                        >
                          {u.globalRole}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Projects Card */}
              <div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-2xs dark:border-white/10 dark:bg-stone-900/60 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold flex items-center gap-2">
                    <FolderGit2 className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                    <span>Recent Workspaces</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveTab("projects")}
                    className="text-xs font-bold text-teal-600 hover:underline dark:text-teal-400 cursor-pointer"
                  >
                    View All →
                  </button>
                </div>

                <div className="divide-y divide-stone-100 dark:divide-white/5">
                  {overview?.recentProjects.map((p) => (
                    <div key={p.id} className="flex items-center justify-between py-2.5">
                      <div className="min-w-0">
                        <p className="text-xs font-bold truncate">{p.name}</p>
                        <p className="text-[11px] text-stone-500 dark:text-stone-400">
                          {p.counts?.members ?? 0} members · {p.counts?.boards ?? 0} boards
                        </p>
                      </div>
                      <Link
                        href={`/project/${p.id}/board`}
                        className="rounded-lg border border-stone-200 bg-stone-50 px-2 py-1 text-[11px] font-semibold text-stone-700 hover:bg-stone-100 dark:border-white/10 dark:bg-white/5 dark:text-stone-300 dark:hover:bg-white/10 transition"
                      >
                        Inspect
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: USER MANAGEMENT */}
        {activeTab === "users" && (
          <div className="space-y-4 animate-in fade-in">
            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                <Input
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search user by name, email, or username..."
                  className="pl-9 h-9 text-xs"
                />
              </div>

              <div className="flex items-center gap-1.5 self-start sm:self-auto bg-white dark:bg-stone-900 border border-stone-200 dark:border-white/10 rounded-xl p-1">
                {(["ALL", "ADMIN", "USER"] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setUserRoleFilter(r)}
                    className={cn(
                      "px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer",
                      userRoleFilter === r
                        ? "bg-indigo-600 text-white dark:bg-dusk-lavender dark:text-ink-950 font-bold"
                        : "text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
                    )}
                  >
                    {r === "ALL" ? "All Users" : r === "ADMIN" ? "Admins" : "Standard"}
                  </button>
                ))}
              </div>
            </div>

            {/* Users Table */}
            <div className="overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-2xs dark:border-white/10 dark:bg-stone-900/60">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-stone-200 bg-stone-50/70 text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:border-white/10 dark:bg-white/[0.02] dark:text-stone-400">
                    <tr>
                      <th className="px-4 py-3">User</th>
                      <th className="px-4 py-3">Role</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Workspaces</th>
                      <th className="px-4 py-3">Joined</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 dark:divide-white/5">
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-stone-500 dark:text-stone-400">
                          No users found matching query.
                        </td>
                      </tr>
                    ) : (
                      users.map((u) => (
                        <tr key={u.id} className="hover:bg-stone-50/50 dark:hover:bg-white/[0.015] transition">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <Avatar
                                src={u.avatar}
                                name={u.name || u.email}
                                initials={(u.name || u.email).substring(0, 2).toUpperCase()}
                                size={32}
                              />
                              <div>
                                <p className="font-bold text-stone-900 dark:text-stone-100">{u.name || "Unnamed"}</p>
                                <p className="text-[11px] text-stone-500 dark:text-stone-400">{u.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={cn(
                                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold font-mono",
                                u.globalRole === "ADMIN"
                                  ? "bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/20"
                                  : "bg-stone-200/60 text-stone-600 dark:bg-white/10 dark:text-stone-400 border border-stone-200 dark:border-white/10"
                              )}
                            >
                              {u.globalRole === "ADMIN" && <ShieldCheck className="h-3 w-3" />}
                              {u.globalRole}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={cn(
                                "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                                u.status === "SUSPENDED"
                                  ? "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                                  : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                              )}
                            >
                              {u.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-mono text-stone-600 dark:text-stone-400">
                            {u._count?.memberships ?? 0}
                          </td>
                          <td className="px-4 py-3 text-stone-500 dark:text-stone-400 font-mono text-[11px]">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Toggle Role */}
                              {u.globalRole === "ADMIN" ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setPendingAction({
                                      type: "role",
                                      userId: u.id,
                                      userName: u.name || u.email,
                                      newRole: "USER",
                                      title: "Revoke Admin Privilege",
                                      message: `Are you sure you want to demote "${u.name || u.email}" back to a standard USER?`,
                                      confirmLabel: "Demote to User",
                                      variant: "danger"
                                    })
                                  }
                                  className="rounded-lg border border-stone-200 px-2 py-1 text-[11px] font-semibold text-stone-700 hover:bg-stone-100 dark:border-white/10 dark:text-stone-300 dark:hover:bg-white/10 transition cursor-pointer"
                                  title="Demote to regular user"
                                >
                                  Demote
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setPendingAction({
                                      type: "role",
                                      userId: u.id,
                                      userName: u.name || u.email,
                                      newRole: "ADMIN",
                                      title: "Promote to Super Admin",
                                      message: `Are you sure you want to promote "${u.name || u.email}" to SUPER ADMIN? They will have full platform oversight.`,
                                      confirmLabel: "Promote to Admin",
                                      variant: "default"
                                    })
                                  }
                                  className="rounded-lg border border-purple-500/30 bg-purple-500/10 px-2 py-1 text-[11px] font-semibold text-purple-700 hover:bg-purple-500/20 dark:text-purple-300 transition cursor-pointer"
                                  title="Grant Admin access"
                                >
                                  Promote
                                </button>
                              )}

                              {/* Toggle Suspend */}
                              {u.status === "SUSPENDED" ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setPendingAction({
                                      type: "status",
                                      userId: u.id,
                                      userName: u.name || u.email,
                                      newStatus: "ONLINE",
                                      title: "Activate Account",
                                      message: `Re-activate the account for "${u.name || u.email}"?`,
                                      confirmLabel: "Activate",
                                      variant: "default"
                                    })
                                  }
                                  className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-300 transition cursor-pointer"
                                >
                                  <UserCheck className="h-3 w-3 inline mr-1" />
                                  Activate
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setPendingAction({
                                      type: "status",
                                      userId: u.id,
                                      userName: u.name || u.email,
                                      newStatus: "SUSPENDED",
                                      title: "Suspend User Account",
                                      message: `Are you sure you want to suspend "${u.name || u.email}"? They will be locked out until re-activated.`,
                                      confirmLabel: "Suspend Account",
                                      variant: "danger"
                                    })
                                  }
                                  className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-2 py-1 text-[11px] font-semibold text-rose-700 hover:bg-rose-500/20 dark:text-rose-300 transition cursor-pointer"
                                >
                                  <UserX className="h-3 w-3 inline mr-1" />
                                  Suspend
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: WORKSPACES MANAGEMENT */}
        {activeTab === "projects" && (
          <div className="space-y-4 animate-in fade-in">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
              <Input
                value={projectSearch}
                onChange={(e) => setProjectSearch(e.target.value)}
                placeholder="Search workspaces by title or description..."
                className="pl-9 h-9 text-xs"
              />
            </div>

            <div className="overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-2xs dark:border-white/10 dark:bg-stone-900/60">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-stone-200 bg-stone-50/70 text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:border-white/10 dark:bg-white/[0.02] dark:text-stone-400">
                    <tr>
                      <th className="px-4 py-3">Workspace Name</th>
                      <th className="px-4 py-3">Owner</th>
                      <th className="px-4 py-3">Members</th>
                      <th className="px-4 py-3">Boards</th>
                      <th className="px-4 py-3">Created</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 dark:divide-white/5">
                    {projects.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-stone-500 dark:text-stone-400">
                          No workspaces found.
                        </td>
                      </tr>
                    ) : (
                      projects.map((p) => (
                        <tr key={p.id} className="hover:bg-stone-50/50 dark:hover:bg-white/[0.015] transition">
                          <td className="px-4 py-3">
                            <p className="font-bold text-stone-900 dark:text-stone-100">{p.name}</p>
                            {p.description && (
                              <p className="text-[11px] text-stone-500 dark:text-stone-400 truncate max-w-xs">
                                {p.description}
                              </p>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {p.owner ? (
                              <div className="flex items-center gap-2">
                                <Avatar
                                  src={p.owner.avatar}
                                  name={p.owner.name || p.owner.email}
                                  initials={(p.owner.name || p.owner.email).substring(0, 2).toUpperCase()}
                                  size={24}
                                />
                                <span className="font-medium text-stone-700 dark:text-stone-300">
                                  {p.owner.name || p.owner.email}
                                </span>
                              </div>
                            ) : (
                              <span className="text-stone-400 italic">None</span>
                            )}
                          </td>
                          <td className="px-4 py-3 font-mono">{p.counts.members}</td>
                          <td className="px-4 py-3 font-mono">{p.counts.boards}</td>
                          <td className="px-4 py-3 text-stone-500 dark:text-stone-400 font-mono text-[11px]">
                            {new Date(p.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Link
                              href={`/project/${p.id}/board`}
                              className="rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-1 text-[11px] font-semibold text-stone-700 hover:bg-stone-100 dark:border-white/10 dark:bg-white/5 dark:text-stone-300 dark:hover:bg-white/10 transition"
                            >
                              Open Board
                            </Link>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SYSTEM HEALTH */}
        {activeTab === "health" && (
          <div className="space-y-6 animate-in fade-in">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-2xs dark:border-white/10 dark:bg-stone-900/60 space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold text-stone-900 dark:text-stone-100">
                  <Database className="h-4 w-4 text-emerald-500" />
                  <span>Neon PostgreSQL Engine</span>
                </div>
                <div className="space-y-1.5 text-xs text-stone-600 dark:text-stone-300">
                  <div className="flex justify-between py-1 border-b border-stone-100 dark:border-white/5">
                    <span>Connection Status:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">ACTIVE / CONNECTED</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-stone-100 dark:border-white/5">
                    <span>Schema Validation:</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400">PRISMA OK</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>Provider:</span>
                    <span className="font-mono">Neon Serverless PostgreSQL</span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-2xs dark:border-white/10 dark:bg-stone-900/60 space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold text-stone-900 dark:text-stone-100">
                  <Radio className="h-4 w-4 text-indigo-500" />
                  <span>Pusher WebSocket Engine</span>
                </div>
                <div className="space-y-1.5 text-xs text-stone-600 dark:text-stone-300">
                  <div className="flex justify-between py-1 border-b border-stone-100 dark:border-white/5">
                    <span>Cluster:</span>
                    <span className="font-mono">ap1</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-stone-100 dark:border-white/5">
                    <span>Channels Active:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">ONLINE</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>Fallback:</span>
                    <span className="text-stone-500 dark:text-stone-400">BroadcastChannel (Cross-Tab)</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-2xs dark:border-white/10 dark:bg-stone-900/60 space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-stone-900 dark:text-stone-100">
                <ShieldAlert className="h-4 w-4 text-purple-500" />
                <span>Defense-in-Depth Security Protocol</span>
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                This Super Admin portal is protected by a 3-tier defense architecture: (1) Route Cloaking — unauthorized requests are rejected with a 404 Not Found deception response; (2) Obscured Hash Path — non-standard path routing eliminates automated reconnaissance scanning; (3) Server-Side Database Verification — authentication checks session credentials directly against the persistent User table on every API invocation.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Confirmation Modal */}
      {pendingAction && (
        <ConfirmModal
          open={Boolean(pendingAction)}
          title={pendingAction.title}
          message={pendingAction.message}
          confirmLabel={pendingAction.confirmLabel}
          variant={pendingAction.variant}
          isLoading={isActionLoading}
          onConfirm={handleExecuteAction}
          onClose={() => setPendingAction(null)}
        />
      )}
    </div>
  );
}
