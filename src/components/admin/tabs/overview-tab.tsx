"use client";

import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Coins,
  Cpu,
  Database,
  Eye,
  FolderGit2,
  Gift,
  HardDrive,
  Kanban,
  Radio,
  Shield,
  ShieldAlert,
  Users,
  Zap
} from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { AdminOverviewData, AdminUser, AdminTab } from "../types";

interface OverviewTabProps {
  data: AdminOverviewData | null;
  onNavigateTab: (tab: AdminTab) => void;
  onInspectUser: (user: AdminUser) => void;
  onRefresh: () => void;
}

export function OverviewTab({
  data,
  onNavigateTab,
  onInspectUser,
  onRefresh
}: OverviewTabProps) {
  if (!data) {
    return (
      <div className="flex h-96 items-center justify-center">
        <span className="font-mono text-xs text-stone-400">Loading system telemetry...</span>
      </div>
    );
  }

  const { stats, systemHealth, recentUsers, recentActivities, broadcast, decoyHitsCount } = data;

  return (
    <div className="space-y-6">
      {/* Live System Telemetry Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-indigo-500/20 bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-[#0c0d18] p-5 shadow-lg backdrop-blur-md dark:border-indigo-500/30">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-indigo-400">
                Super Admin Telemetry Core
              </span>
            </div>
            <h2 className="text-lg font-bold text-stone-900 dark:text-white sm:text-xl">
              Platform Status: Operational & Fortified
            </h2>
          </div>

          {/* Telemetry Chips */}
          <div className="flex flex-wrap items-center gap-2">
            {/* DB Health */}
            <div className="flex items-center gap-1.5 rounded-lg border border-stone-200/80 bg-white/70 px-3 py-1.5 font-mono text-xs text-stone-700 backdrop-blur-sm dark:border-white/10 dark:bg-white/5 dark:text-stone-300">
              <Database className="h-3.5 w-3.5 text-emerald-500" />
              <span>Neon DB: {systemHealth.dbLatencyMs}ms</span>
            </div>

            {/* Honeypot hits */}
            <button
              onClick={() => onNavigateTab("security")}
              className="flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 font-mono text-xs text-rose-600 transition hover:bg-rose-500/20 dark:text-rose-400"
              title="Click to view decoy logs"
            >
              <ShieldAlert className="h-3.5 w-3.5" />
              <span>Decoy Hits: {decoyHitsCount}</span>
            </button>

            {/* Pending Redemptions */}
            {stats.pendingRedemptions > 0 && (
              <button
                onClick={() => onNavigateTab("rewards")}
                className="flex items-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 font-mono text-xs text-amber-600 animate-bounce transition hover:bg-amber-500/20 dark:text-amber-400"
              >
                <Gift className="h-3.5 w-3.5" />
                <span>{stats.pendingRedemptions} Redemptions Pending</span>
              </button>
            )}

            {/* Active Broadcast */}
            {broadcast && broadcast.active ? (
              <button
                onClick={() => onNavigateTab("operations")}
                className="flex items-center gap-1.5 rounded-lg border border-indigo-500/40 bg-indigo-500/10 px-3 py-1.5 font-mono text-xs text-indigo-400 hover:bg-indigo-500/20"
              >
                <Radio className="h-3.5 w-3.5 animate-pulse text-indigo-400" />
                <span>Broadcast Live</span>
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* Primary Key Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <div
          onClick={() => onNavigateTab("users")}
          className="group cursor-pointer rounded-xl border border-stone-200/80 bg-white p-4 transition-all hover:border-indigo-500/50 hover:shadow-md dark:border-white/10 dark:bg-[#0d0e1b]"
        >
          <div className="flex items-center justify-between text-stone-500 dark:text-stone-400">
            <span className="text-[11px] font-medium uppercase tracking-wider">Users</span>
            <Users className="h-4 w-4 group-hover:text-indigo-400 transition-colors" />
          </div>
          <p className="mt-2 font-mono text-2xl font-bold text-stone-900 dark:text-white">
            {stats.totalUsers}
          </p>
          <p className="mt-0.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-mono">
            {stats.activeUsers} active online
          </p>
        </div>

        <div
          onClick={() => onNavigateTab("workspaces")}
          className="group cursor-pointer rounded-xl border border-stone-200/80 bg-white p-4 transition-all hover:border-indigo-500/50 hover:shadow-md dark:border-white/10 dark:bg-[#0d0e1b]"
        >
          <div className="flex items-center justify-between text-stone-500 dark:text-stone-400">
            <span className="text-[11px] font-medium uppercase tracking-wider">Workspaces</span>
            <FolderGit2 className="h-4 w-4 group-hover:text-indigo-400 transition-colors" />
          </div>
          <p className="mt-2 font-mono text-2xl font-bold text-stone-900 dark:text-white">
            {stats.totalProjects}
          </p>
          <p className="mt-0.5 text-[11px] text-stone-400 font-mono">
            {stats.totalBoards} boards total
          </p>
        </div>

        <div
          onClick={() => onNavigateTab("workspaces")}
          className="group cursor-pointer rounded-xl border border-stone-200/80 bg-white p-4 transition-all hover:border-indigo-500/50 hover:shadow-md dark:border-white/10 dark:bg-[#0d0e1b]"
        >
          <div className="flex items-center justify-between text-stone-500 dark:text-stone-400">
            <span className="text-[11px] font-medium uppercase tracking-wider">Total Cards</span>
            <Kanban className="h-4 w-4 group-hover:text-indigo-400 transition-colors" />
          </div>
          <p className="mt-2 font-mono text-2xl font-bold text-stone-900 dark:text-white">
            {stats.totalCards}
          </p>
          <p className="mt-0.5 text-[11px] text-stone-400 font-mono">
            Across all workspaces
          </p>
        </div>

        <div
          onClick={() => onNavigateTab("rewards")}
          className="group cursor-pointer rounded-xl border border-stone-200/80 bg-white p-4 transition-all hover:border-amber-500/50 hover:shadow-md dark:border-white/10 dark:bg-[#0d0e1b]"
        >
          <div className="flex items-center justify-between text-stone-500 dark:text-stone-400">
            <span className="text-[11px] font-medium uppercase tracking-wider">Coin Economy</span>
            <Coins className="h-4 w-4 text-amber-500 group-hover:scale-110 transition-transform" />
          </div>
          <p className="mt-2 font-mono text-2xl font-bold text-amber-500">
            {stats.totalCoinsCirculation}c
          </p>
          <p className="mt-0.5 text-[11px] text-amber-600/80 dark:text-amber-400/80 font-mono">
            In user circulation
          </p>
        </div>

        <div
          onClick={() => onNavigateTab("storage")}
          className="group cursor-pointer rounded-xl border border-stone-200/80 bg-white p-4 transition-all hover:border-indigo-500/50 hover:shadow-md dark:border-white/10 dark:bg-[#0d0e1b]"
        >
          <div className="flex items-center justify-between text-stone-500 dark:text-stone-400">
            <span className="text-[11px] font-medium uppercase tracking-wider">Storage</span>
            <HardDrive className="h-4 w-4 group-hover:text-indigo-400 transition-colors" />
          </div>
          <p className="mt-2 font-mono text-2xl font-bold text-stone-900 dark:text-white">
            {stats.totalAttachments}
          </p>
          <p className="mt-0.5 text-[11px] text-stone-400 font-mono">
            Files & attachments
          </p>
        </div>

        <div
          onClick={() => onNavigateTab("ai")}
          className="group cursor-pointer rounded-xl border border-stone-200/80 bg-white p-4 transition-all hover:border-indigo-500/50 hover:shadow-md dark:border-white/10 dark:bg-[#0d0e1b]"
        >
          <div className="flex items-center justify-between text-stone-500 dark:text-stone-400">
            <span className="text-[11px] font-medium uppercase tracking-wider">AI Intel</span>
            <Cpu className="h-4 w-4 group-hover:text-indigo-400 transition-colors" />
          </div>
          <p className="mt-2 font-mono text-2xl font-bold text-stone-900 dark:text-white">
            Active
          </p>
          <p className="mt-0.5 text-[11px] text-indigo-400 font-mono">
            Multi-model engine
          </p>
        </div>
      </div>

      {/* Split Section: Recent Registrations & Live Platform Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Registrations */}
        <div className="rounded-xl border border-stone-200/80 bg-white p-5 dark:border-white/10 dark:bg-[#0c0d18]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-indigo-500" />
              <h3 className="font-semibold text-stone-900 dark:text-white text-sm">
                Recent User Registrations
              </h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigateTab("users")}
              className="text-xs"
            >
              <span>View All</span>
              <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </div>

          <div className="divide-y divide-stone-100 dark:divide-white/5">
            {recentUsers.map((u) => (
              <div
                key={u.id}
                onClick={() => onInspectUser(u)}
                className="flex items-center justify-between py-2.5 px-2 rounded-lg hover:bg-stone-50 dark:hover:bg-white/5 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar src={u.avatar || undefined} name={u.name || u.email} size={24} />
                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium text-stone-800 dark:text-stone-200">
                      {u.name || "Anonymous User"}
                    </p>
                    <p className="truncate text-[11px] text-stone-400">{u.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                      u.globalRole === "ADMIN"
                        ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300"
                        : "bg-stone-100 text-stone-600 dark:bg-white/10 dark:text-stone-400"
                    }`}
                  >
                    {u.globalRole}
                  </span>
                  <Eye className="h-3.5 w-3.5 text-stone-400 hover:text-indigo-400 transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Platform Activity Stream */}
        <div className="rounded-xl border border-stone-200/80 bg-white p-5 dark:border-white/10 dark:bg-[#0c0d18]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-emerald-500" />
              <h3 className="font-semibold text-stone-900 dark:text-white text-sm">
                Live Platform Events
              </h3>
            </div>
            <span className="font-mono text-[11px] text-stone-400">Real-time trace</span>
          </div>

          <div className="space-y-3">
            {recentActivities.map((act) => (
              <div
                key={act.id}
                className="flex items-start gap-3 rounded-lg border border-stone-100 bg-stone-50/50 p-2.5 text-xs dark:border-white/5 dark:bg-white/[0.02]"
              >
                <Avatar
                  src={act.user?.avatar || undefined}
                  name={act.user?.name || act.user?.email || "System"}
                  size={24}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-stone-800 dark:text-stone-200 truncate">
                      {act.user?.name || act.user?.email || "System Activity"}
                    </span>
                    <span className="font-mono text-[10px] text-stone-400 shrink-0">
                      {new Date(act.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-stone-500 dark:text-stone-400">
                    <span className="font-mono font-medium text-indigo-600 dark:text-indigo-400 uppercase">
                      [{act.action}]
                    </span>{" "}
                    {typeof act.details === "object" && act.details !== null
                      ? JSON.stringify(act.details).slice(0, 80)
                      : String(act.details || "Activity performed")}
                  </p>
                </div>
              </div>
            ))}

            {recentActivities.length === 0 && (
              <p className="text-center py-8 text-xs text-stone-400">
                No recent activity recorded
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
