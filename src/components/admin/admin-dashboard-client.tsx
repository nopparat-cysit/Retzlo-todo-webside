"use client";

import { useEffect, useState, useTransition, useCallback } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowLeft,
  ChevronRight,
  Cpu,
  ExternalLink,
  FileSearch,
  FolderGit2,
  Gift,
  HardDrive,
  LayoutDashboard,
  Menu,
  Radio,
  RefreshCw,
  Shield,
  Sparkles,
  Users,
  X
} from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

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
import { AuditTab } from "./tabs/audit-tab";

interface AdminDashboardClientProps {
  currentAdminEmail?: string;
  currentAdminName?: string;
}

interface NavItem {
  id: AdminTab;
  label: string;
  description: string;
  icon: typeof LayoutDashboard;
  badge?: number | string | null;
  badgeVariant?: "amber" | "rose" | "indigo" | "emerald";
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export function AdminDashboardClient({
  currentAdminEmail,
  currentAdminName
}: AdminDashboardClientProps) {
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [overview, setOverview] = useState<AdminOverviewData | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Users state with Pagination
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [userTotal, setUserTotal] = useState(0);
  const [userPage, setUserPage] = useState(1);
  const userPageSize = 20;
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("ALL");
  const [userStatusFilter, setUserStatusFilter] = useState("ALL");
  const [isUsersLoading, setIsUsersLoading] = useState(false);

  // Projects state with Pagination
  const [projects, setProjects] = useState<AdminProject[]>([]);
  const [projectTotal, setProjectTotal] = useState(0);
  const [projectPage, setProjectPage] = useState(1);
  const projectPageSize = 20;
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

  // Fetch Users with Page Support
  const fetchUsers = useCallback(
    async (targetPage?: number) => {
      setIsUsersLoading(true);
      const p = targetPage ?? userPage;
      try {
        const query = new URLSearchParams({
          search: userSearch,
          role: userRoleFilter,
          status: userStatusFilter,
          page: String(p),
          limit: String(userPageSize)
        });
        const res = await fetch(`/api/admin/users?${query.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setUsers(data.users);
          setUserTotal(data.total);
          if (targetPage !== undefined) setUserPage(targetPage);
        }
      } catch {
        toast({ message: "Failed to load users", type: "error" });
      } finally {
        setIsUsersLoading(false);
      }
    },
    [userSearch, userRoleFilter, userStatusFilter, userPage, userPageSize, toast]
  );

  // Fetch Projects with Page Support
  const fetchProjects = useCallback(
    async (targetPage?: number) => {
      setIsProjectsLoading(true);
      const p = targetPage ?? projectPage;
      try {
        const query = new URLSearchParams({
          search: projectSearch,
          page: String(p),
          limit: String(projectPageSize)
        });
        const res = await fetch(`/api/admin/projects?${query.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setProjects(data.projects);
          setProjectTotal(data.total);
          if (targetPage !== undefined) setProjectPage(targetPage);
        }
      } catch {
        toast({ message: "Failed to load workspaces", type: "error" });
      } finally {
        setIsProjectsLoading(false);
      }
    },
    [projectSearch, projectPage, projectPageSize, toast]
  );

  const handleUserSearchChange = (val: string) => {
    setUserSearch(val);
    setUserPage(1);
  };

  const handleUserRoleChange = (val: string) => {
    setUserRoleFilter(val);
    setUserPage(1);
  };

  const handleUserStatusChange = (val: string) => {
    setUserStatusFilter(val);
    setUserPage(1);
  };

  const handleProjectSearchChange = (val: string) => {
    setProjectSearch(val);
    setProjectPage(1);
  };

  const refreshAll = useCallback(() => {
    setIsLoading(true);
    startTransition(async () => {
      await Promise.all([fetchOverview(), fetchUsers(1), fetchProjects(1)]);
      setIsLoading(false);
    });
  }, [fetchOverview, fetchUsers, fetchProjects]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  useEffect(() => {
    if (activeTab === "users") {
      void fetchUsers(userPage);
    }
  }, [activeTab, fetchUsers, userPage]);

  useEffect(() => {
    if (activeTab === "workspaces") {
      void fetchProjects(projectPage);
    }
  }, [activeTab, fetchProjects, projectPage]);

  const navSections: NavSection[] = [
    {
      title: "Core & Telemetry",
      items: [
        {
          id: "overview",
          label: "Overview",
          description: "System health and telemetry",
          icon: LayoutDashboard
        },
        {
          id: "audit",
          label: "Audit Trail",
          description: "Forensic compliance logs",
          icon: FileSearch
        },
        {
          id: "operations",
          label: "Operations & Broadcast",
          description: "Live banners & emergency controls",
          icon: Radio,
          badge: overview?.broadcast?.active ? "Live" : null,
          badgeVariant: "indigo"
        }
      ]
    },
    {
      title: "Directory & Resources",
      items: [
        {
          id: "users",
          label: "Users & Accounts",
          description: "Identity, status, coins & roles",
          icon: Users,
          badge: userTotal > 0 ? userTotal.toLocaleString() : null
        },
        {
          id: "workspaces",
          label: "Workspaces & Teams",
          description: "Projects, boards & memberships",
          icon: FolderGit2,
          badge: projectTotal > 0 ? projectTotal.toLocaleString() : null
        },
        {
          id: "rewards",
          label: "Rewards & Economy",
          description: "Store catalog & redemptions",
          icon: Gift,
          badge: overview?.stats.pendingRedemptions ? `${overview.stats.pendingRedemptions}` : null,
          badgeVariant: "amber"
        }
      ]
    },
    {
      title: "Systems & Infrastructure",
      items: [
        {
          id: "ai",
          label: "AI Hub & Intel",
          description: "Model quotas and token credits",
          icon: Cpu
        },
        {
          id: "storage",
          label: "Storage & Database",
          description: "Neon DB latency & attachments",
          icon: HardDrive
        },
        {
          id: "security",
          label: "Security & Decoy",
          description: "Honeypot hits & rate limits",
          icon: Shield,
          badge: overview?.decoyHitsCount ? `${overview.decoyHitsCount}` : null,
          badgeVariant: "rose"
        }
      ]
    }
  ];

  // Find active nav item details for header breadcrumb
  const activeNavItem = navSections
    .flatMap((s) => s.items)
    .find((item) => item.id === activeTab) ?? navSections[0].items[0];
  const ActiveIcon = activeNavItem.icon;

  const handleSelectTab = (tab: AdminTab) => {
    setActiveTab(tab);
    setIsMobileSidebarOpen(false);
  };

  // Render Sidebar Navigation Content (shared between Desktop & Mobile drawer)
  const renderSidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Sidebar Header & Brand */}
      <div className="flex items-center justify-between border-b border-stone-200/80 px-5 py-4 dark:border-white/10">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-600 text-white shadow-xs">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-sm font-black tracking-wider text-stone-900 dark:text-stone-100">
                RETZLO
              </span>
              <span className="rounded bg-rose-500/15 px-1.5 py-0.2 font-mono text-[9px] font-bold text-rose-600 dark:text-rose-400">
                VAULT
              </span>
            </div>
            <p className="text-[10px] font-mono text-stone-500 dark:text-stone-400">Super Admin Console</p>
          </div>
        </div>

        {/* Mobile close button */}
        <button
          type="button"
          onClick={() => setIsMobileSidebarOpen(false)}
          className="rounded-lg p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-600 dark:hover:bg-white/10 dark:hover:text-stone-200 md:hidden"
          aria-label="Close navigation sidebar"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* System Pulse Indicator */}
      <div className="border-b border-stone-200/80 bg-stone-50/70 px-5 py-2.5 dark:border-white/10 dark:bg-white/[0.02]">
        <div className="flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span className="font-semibold text-stone-700 dark:text-stone-300">
              {overview?.systemHealth?.database === "HEALTHY" ? "System Healthy" : "Online"}
            </span>
          </div>
          <span className="text-[11px] text-stone-500 dark:text-stone-400">
            {overview?.systemHealth?.dbLatencyMs !== undefined
              ? `${overview.systemHealth.dbLatencyMs}ms`
              : "Neon PG"}
          </span>
        </div>
      </div>

      {/* Navigation Groups List */}
      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4 scrollbar-soft">
        {navSections.map((section) => (
          <div key={section.title} className="space-y-1">
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400">
              {section.title}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const ItemIcon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectTab(item.id)}
                    className={cn(
                      "group flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition cursor-pointer text-left",
                      isActive
                        ? "bg-indigo-600 text-white font-semibold shadow-xs shadow-indigo-500/20"
                        : "text-stone-700 hover:bg-stone-100 hover:text-stone-900 dark:text-stone-300 dark:hover:bg-white/5 dark:hover:text-stone-100"
                    )}
                    title={item.description}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <ItemIcon
                        className={cn(
                          "h-4 w-4 shrink-0 transition-colors",
                          isActive
                            ? "text-white"
                            : "text-stone-400 group-hover:text-stone-600 dark:text-stone-500 dark:group-hover:text-stone-300"
                        )}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge ? (
                      <span
                        className={cn(
                          "ml-1.5 shrink-0 rounded px-1.5 py-0.2 font-mono text-[10px] font-bold",
                          isActive
                            ? "bg-white/20 text-white"
                            : item.badgeVariant === "amber"
                            ? "bg-amber-500/20 text-amber-700 dark:text-amber-400"
                            : item.badgeVariant === "rose"
                            ? "bg-rose-500/20 text-rose-700 dark:text-rose-400"
                            : item.badgeVariant === "indigo"
                            ? "bg-indigo-500/20 text-indigo-700 dark:text-indigo-400"
                            : "bg-stone-200 text-stone-700 dark:bg-white/10 dark:text-stone-300"
                        )}
                      >
                        {item.badge}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Sidebar Footer: Admin Identity & Exit Link */}
      <div className="border-t border-stone-200/80 bg-stone-50/80 p-3.5 dark:border-white/10 dark:bg-white/[0.02] space-y-2.5">
        <div className="flex items-center gap-2.5 rounded-xl border border-stone-200/90 bg-white p-2.5 shadow-2xs dark:border-white/10 dark:bg-white/5">
          <Avatar name={currentAdminName || "Admin"} size={32} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-stone-900 dark:text-stone-100">
              {currentAdminName || "Super Admin"}
            </p>
            <p className="truncate text-[10px] font-mono text-stone-500 dark:text-stone-400">
              {currentAdminEmail}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-1.5 pt-0.5">
          <Link
            href="/projects"
            className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-stone-600 hover:bg-stone-100 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-white/10 dark:hover:text-stone-200 transition"
            title="Leave admin console and return to user workspaces"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Workspaces</span>
          </Link>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={refreshAll}
              disabled={isLoading || isPending}
              className="h-8 w-8 p-0 text-stone-500"
              title="Sync All Telemetry"
            >
              <RefreshCw className={cn("h-3.5 w-3.5", (isLoading || isPending) && "animate-spin")} />
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-stone-100 text-stone-900 selection:bg-indigo-500/20 selection:text-indigo-400 dark:bg-[#07070e] dark:text-stone-100 font-sans">
      {/* Desktop Permanent Left Sidebar */}
      <aside className="hidden md:flex md:w-64 lg:w-72 md:flex-col md:fixed md:inset-y-0 z-30 border-r border-stone-200/80 bg-white/95 dark:border-white/10 dark:bg-[#090a12]/95 backdrop-blur-xl shadow-xs">
        {renderSidebarContent()}
      </aside>

      {/* Mobile Sidebar Overlay Drawer */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={() => setIsMobileSidebarOpen(false)}
            aria-hidden="true"
          />
          {/* Drawer Panel */}
          <div className="relative z-10 flex w-72 max-w-[80vw] flex-col bg-white shadow-2xl transition-transform dark:bg-[#090a12] animate-in slide-in-from-left duration-200">
            {renderSidebarContent()}
          </div>
        </div>
      )}

      {/* Main Content Area (Offset by sidebar width on desktop) */}
      <div className="flex flex-1 flex-col md:pl-64 lg:pl-72 min-w-0">
        {/* Top Navbar Header */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-stone-200/80 bg-white/90 px-4 backdrop-blur-md dark:border-white/10 dark:bg-[#0c0d18]/90 sm:px-6">
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="rounded-lg p-1.5 text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-white/10 md:hidden"
              aria-label="Open navigation sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Breadcrumb Info */}
            <div className="flex items-center gap-2.5 truncate">
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                <ActiveIcon className="h-4 w-4" />
              </div>
              <div className="truncate">
                <h1 className="text-sm font-bold text-stone-900 dark:text-stone-100 truncate leading-tight">
                  {activeNavItem.label}
                </h1>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 truncate hidden sm:block">
                  {activeNavItem.description}
                </p>
              </div>
            </div>
          </div>

          {/* Right Header Utilities */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={refreshAll}
              disabled={isLoading || isPending}
              className="h-8 gap-1.5 text-xs font-medium text-stone-700 dark:text-stone-300"
              title="Refresh All Telemetry"
            >
              <RefreshCw className={cn("h-3.5 w-3.5", (isLoading || isPending) && "animate-spin")} />
              <span className="hidden sm:inline">Sync Data</span>
            </Button>

            <Link
              href="/projects"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-stone-700 shadow-2xs hover:bg-stone-50 hover:text-stone-950 dark:border-white/10 dark:bg-white/5 dark:text-stone-300 dark:hover:bg-white/10 transition"
              title="Return to user workspace"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>User Mode</span>
            </Link>

            <div className="hidden sm:block">
              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* Tab Body Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === "overview" && (
            <OverviewTab
              data={overview}
              onNavigateTab={handleSelectTab}
              onInspectUser={setInspectingUser}
              onRefresh={refreshAll}
            />
          )}

          {activeTab === "users" && (
            <UsersTab
              users={users}
              total={userTotal}
              page={userPage}
              pageSize={userPageSize}
              onPageChange={(newPage) => {
                setUserPage(newPage);
                void fetchUsers(newPage);
              }}
              search={userSearch}
              onSearchChange={handleUserSearchChange}
              roleFilter={userRoleFilter}
              onRoleFilterChange={handleUserRoleChange}
              statusFilter={userStatusFilter}
              onStatusFilterChange={handleUserStatusChange}
              onInspectUser={setInspectingUser}
              isLoading={isUsersLoading}
            />
          )}

          {activeTab === "workspaces" && (
            <WorkspacesTab
              projects={projects}
              total={projectTotal}
              page={projectPage}
              pageSize={projectPageSize}
              onPageChange={(newPage) => {
                setProjectPage(newPage);
                void fetchProjects(newPage);
              }}
              search={projectSearch}
              onSearchChange={handleProjectSearchChange}
              onInspectProject={setInspectingProject}
              isLoading={isProjectsLoading}
            />
          )}

          {activeTab === "rewards" && <RewardsTab />}

          {activeTab === "ai" && <AiHubTab />}

          {activeTab === "storage" && <StorageTab />}

          {activeTab === "security" && <SecurityTab />}

          {activeTab === "operations" && <OperationsTab />}

          {activeTab === "audit" && <AuditTab />}
        </main>
      </div>

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
