"use client";

import { useEffect, useState, useTransition, useCallback } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowLeft,
  Coins,
  Cpu,
  Database,
  FolderGit2,
  Gift,
  HardDrive,
  LayoutDashboard,
  Radio,
  RefreshCw,
  Shield,
  ShieldAlert,
  Users,
  Zap
} from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { useToast } from "@/components/ui/toast";

import type {
  AdminOverviewData,
  AdminProject,
  AdminTab,
  AdminUser
} from "./types";
import { UserInspectorDrawer } from "./drawers/user-inspector-drawer";
import { WorkspaceInspectorDrawer } from "./drawers/workspace-inspector-drawer";
import { OverviewTab } from "./tabs/overview-tab";
import { UsersTab } from "./tabs/users-tab";
import { WorkspacesTab } from "./tabs/workspaces-tab";
import { RewardsTab } from "./tabs/rewards-tab";
import { AiHubTab } from "./tabs/ai-hub-tab";
import { StorageTab } from "./tabs/storage-tab";
import { SecurityTab } from "./tabs/security-tab";
import { OperationsTab } from "./tabs/operations-tab";

interface AdminDashboardClientProps {
  currentAdminEmail?: string;
  currentAdminName?: string;
}

export function AdminDashboardClient({
  currentAdminEmail,
  currentAdminName
}: AdminDashboardClientProps) {
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [overview, setOverview] = useState<AdminOverviewData | null>(null);

  // Users state
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [userTotal, setUserTotal] = useState(0);
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("ALL");
  const [userStatusFilter, setUserStatusFilter] = useState("ALL");
  const [isUsersLoading, setIsUsersLoading] = useState(false);

  // Projects state
  const [projects, setProjects] = useState<AdminProject[]>([]);
  const [projectTotal, setProjectTotal] = useState(0);
  const [projectSearch, setProjectSearch] = useState("");
  const [isProjectsLoading, setIsProjectsLoading] = useState(false);

  // Inspector Drawers State
  const [inspectingUser, setInspectingUser] = useState<AdminUser | null>(null);
  const [inspectingProject, setInspectingProject] = useState<AdminProject | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

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
    setIsUsersLoading(true);
    try {
      const query = new URLSearchParams({
        search: userSearch,
        role: userRoleFilter,
        status: userStatusFilter,
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
    } finally {
      setIsUsersLoading(false);
    }
  }, [userSearch, userRoleFilter, userStatusFilter, toast]);

  // Fetch Projects
  const fetchProjects = useCallback(async () => {
    setIsProjectsLoading(true);
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
      toast({ message: "Failed to load workspaces", type: "error" });
    } finally {
      setIsProjectsLoading(false);
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
  }, [activeTab, fetchUsers]);

  useEffect(() => {
    if (activeTab === "workspaces") {
      void fetchProjects();
    }
  }, [activeTab, fetchProjects]);

  const tabItems: Array<{
    id: AdminTab;
    label: string;
    icon: typeof LayoutDashboard;
    badge?: number | string | null;
    badgeVariant?: "amber" | "rose" | "indigo";
  }> = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "users", label: "Users & Identity", icon: Users, badge: userTotal || null },
    { id: "workspaces", label: "Workspaces", icon: FolderGit2, badge: projectTotal || null },
    {
      id: "rewards",
      label: "Rewards & Economy",
      icon: Gift,
      badge: overview?.stats.pendingRedemptions ? `${overview.stats.pendingRedemptions}` : null,
      badgeVariant: "amber"
    },
    { id: "ai", label: "AI & Intel", icon: Cpu },
    { id: "storage", label: "Storage", icon: HardDrive },
    {
      id: "security",
      label: "Security & Decoy",
      icon: Shield,
      badge: overview?.decoyHitsCount ? `${overview.decoyHitsCount}` : null,
      badgeVariant: "rose"
    },
    {
      id: "operations",
      label: "Operations & Broadcast",
      icon: Radio,
      badge: overview?.broadcast?.active ? "Live" : null,
      badgeVariant: "indigo"
    }
  ];

  return (
    <div className="flex min-h-screen flex-col bg-stone-100 text-stone-900 selection:bg-indigo-500/20 selection:text-indigo-400 dark:bg-[#07070e] dark:text-stone-100 font-sans">
      {/* Top Header */}
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
            <span className="font-mono text-sm font-bold tracking-tight text-indigo-700 dark:text-indigo-400">
              RETZLO
            </span>
            <span className="rounded bg-rose-500/10 px-1.5 py-0.5 font-mono text-[10px] font-bold text-rose-600 dark:bg-rose-950/80 dark:text-rose-400">
              SUPER ADMIN
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick Refresh */}
          <Button
            variant="ghost"
            size="sm"
            onClick={refreshAll}
            disabled={isLoading || isPending}
            className="text-stone-600 dark:text-stone-300"
            title="Refresh All Telemetry"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading || isPending ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline ml-1 text-xs">Sync</span>
          </Button>

          <div className="h-4 w-px bg-stone-200 dark:bg-white/10" />

          {/* Current Admin Identity Pill */}
          <div className="flex items-center gap-2 rounded-full border border-stone-200/80 bg-stone-50/80 px-2.5 py-1 dark:border-white/10 dark:bg-white/5">
            <Avatar name={currentAdminName || "Admin"} size={24} />
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold leading-none text-stone-800 dark:text-stone-200">
                {currentAdminName || "Super Admin"}
              </p>
              <p className="text-[10px] font-mono leading-tight text-stone-400">
                {currentAdminEmail}
              </p>
            </div>
          </div>

          <ThemeToggle />
        </div>
      </header>

      {/* Navigation Sub-Header (8 Hubs Tabs) */}
      <nav className="border-b border-stone-200/80 bg-white/70 px-4 backdrop-blur-sm dark:border-white/10 dark:bg-[#0c0d18]/80 sm:px-6">
        <div className="flex space-x-1 overflow-x-auto py-2 no-scrollbar">
          {tabItems.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700 shadow-sm dark:bg-indigo-950/60 dark:text-indigo-300 font-semibold"
                    : "text-stone-600 hover:bg-stone-100 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-white/5 dark:hover:text-stone-200"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-indigo-600 dark:text-indigo-400" : ""}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`ml-1 rounded px-1.5 py-0.2 font-mono text-[10px] font-bold ${
                      tab.badgeVariant === "amber"
                        ? "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                        : tab.badgeVariant === "rose"
                        ? "bg-rose-500/20 text-rose-600 dark:text-rose-400"
                        : tab.badgeVariant === "indigo"
                        ? "bg-indigo-500/20 text-indigo-600 dark:text-indigo-400"
                        : "bg-stone-200 text-stone-700 dark:bg-white/10 dark:text-stone-300"
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Main Workspace Body */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        {activeTab === "overview" && (
          <OverviewTab
            data={overview}
            onNavigateTab={setActiveTab}
            onInspectUser={setInspectingUser}
            onRefresh={refreshAll}
          />
        )}

        {activeTab === "users" && (
          <UsersTab
            users={users}
            total={userTotal}
            search={userSearch}
            onSearchChange={setUserSearch}
            roleFilter={userRoleFilter}
            onRoleFilterChange={setUserRoleFilter}
            statusFilter={userStatusFilter}
            onStatusFilterChange={setUserStatusFilter}
            onInspectUser={setInspectingUser}
            isLoading={isUsersLoading}
          />
        )}

        {activeTab === "workspaces" && (
          <WorkspacesTab
            projects={projects}
            total={projectTotal}
            search={projectSearch}
            onSearchChange={setProjectSearch}
            onInspectProject={setInspectingProject}
            isLoading={isProjectsLoading}
          />
        )}

        {activeTab === "rewards" && <RewardsTab />}

        {activeTab === "ai" && <AiHubTab />}

        {activeTab === "storage" && <StorageTab />}

        {activeTab === "security" && <SecurityTab />}

        {activeTab === "operations" && <OperationsTab />}
      </main>

      {/* Slide-over User Inspector Drawer */}
      <UserInspectorDrawer
        user={inspectingUser}
        isOpen={Boolean(inspectingUser)}
        onClose={() => setInspectingUser(null)}
        currentAdminEmail={currentAdminEmail}
        onUserUpdated={() => {
          fetchUsers();
          fetchOverview();
        }}
      />

      {/* Slide-over Workspace Inspector Drawer */}
      <WorkspaceInspectorDrawer
        project={inspectingProject}
        isOpen={Boolean(inspectingProject)}
        onClose={() => setInspectingProject(null)}
        onProjectUpdated={() => {
          fetchProjects();
          fetchOverview();
        }}
      />
    </div>
  );
}
