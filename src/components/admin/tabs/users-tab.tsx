"use client";

import { useState } from "react";
import {
  Coins,
  Cpu,
  Eye,
  Filter,
  Search,
  Shield,
  ShieldCheck,
  UserCheck,
  Users,
  UserX
} from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { FilterSelect } from "@/components/ui/filter-select";
import { Input } from "@/components/ui/input";
import { Panel } from "@/components/ui/panel";
import type { AdminUser } from "../types";

interface UsersTabProps {
  users: AdminUser[];
  total: number;
  search: string;
  onSearchChange: (val: string) => void;
  roleFilter: string;
  onRoleFilterChange: (val: string) => void;
  statusFilter: string;
  onStatusFilterChange: (val: string) => void;
  onInspectUser: (user: AdminUser) => void;
  isLoading: boolean;
}

export function UsersTab({
  users,
  total,
  search,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  statusFilter,
  onStatusFilterChange,
  onInspectUser,
  isLoading
}: UsersTabProps) {
  return (
    <div className="space-y-4">
      {/* Controls Bar: Search & Filters */}
      <Panel className="p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search users by name, email, or @handle..."
            className="pl-9 text-xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Role Filter */}
          <FilterSelect
            value={roleFilter}
            options={[
              { value: "ALL", label: "All Roles" },
              { value: "USER", label: "User" },
              { value: "ADMIN", label: "Admin" }
            ]}
            onValueChange={onRoleFilterChange}
            triggerClassName="h-9 text-xs min-w-[120px]"
          />

          {/* Status Filter */}
          <FilterSelect
            value={statusFilter}
            options={[
              { value: "ALL", label: "All Status" },
              { value: "ONLINE", label: "Online" },
              { value: "OFFLINE", label: "Offline" },
              { value: "BUSY", label: "Busy" },
              { value: "SUSPENDED", label: "Suspended" }
            ]}
            onValueChange={onStatusFilterChange}
            triggerClassName="h-9 text-xs min-w-[130px]"
          />

          <div className="font-mono text-xs text-stone-400">
            Total: <span className="font-bold text-stone-800 dark:text-stone-200">{total}</span>
          </div>
        </div>
      </Panel>

      {/* Users Data Table */}
      <div className="overflow-hidden rounded-xl border border-stone-200/80 bg-white shadow-sm dark:border-white/10 dark:bg-[#0c0d18]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-stone-200/80 bg-stone-50/80 font-mono text-[11px] uppercase tracking-wider text-stone-500 dark:border-white/10 dark:bg-white/5 dark:text-stone-400">
              <tr>
                <th className="px-4 py-3 font-semibold">User / Identity</th>
                <th className="px-4 py-3 font-semibold">Role</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Coins</th>
                <th className="px-4 py-3 font-semibold">AI Quota</th>
                <th className="px-4 py-3 font-semibold">Joined</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-stone-400 font-mono">
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-stone-400">
                    No users matching criteria.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user.id}
                    onClick={() => onInspectUser(user)}
                    className="cursor-pointer transition-colors hover:bg-stone-50/80 dark:hover:bg-white/[0.03]"
                  >
                    {/* User Identity */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={user.avatar || undefined}
                          name={user.name || user.email}
                          size={24}
                        />
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-stone-900 dark:text-stone-100">
                            {user.name || "Anonymous User"}
                          </p>
                          <p className="truncate text-[11px] text-stone-500 dark:text-stone-400">
                            {user.email}
                          </p>
                          {user.username && (
                            <p className="font-mono text-[10px] text-stone-400">
                              @{user.username}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Global Role */}
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded px-2 py-0.5 font-mono text-[10px] font-bold ${
                          user.globalRole === "ADMIN"
                            ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300"
                            : "bg-stone-100 text-stone-600 dark:bg-white/10 dark:text-stone-300"
                        }`}
                      >
                        {user.globalRole === "ADMIN" ? (
                          <ShieldCheck className="h-3 w-3" />
                        ) : (
                          <UserCheck className="h-3 w-3" />
                        )}
                        {user.globalRole}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                          user.status === "SUSPENDED"
                            ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                            : user.status === "ONLINE"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "bg-stone-500/10 text-stone-500"
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>

                    {/* Coins */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 font-mono font-bold text-amber-500">
                        <Coins className="h-3 w-3" />
                        <span>{user.globalCoins ?? 0}</span>
                      </div>
                    </td>

                    {/* AI Quota */}
                    <td className="px-4 py-3">
                      <div className="font-mono text-[11px]">
                        <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
                          {user.aiQuota?.tier || (user.globalRole === "ADMIN" ? "ADMIN" : "FREE")}
                        </span>
                        <span className="text-stone-400 ml-1">
                          ({user.aiQuota?.credits ?? (user.globalRole === "ADMIN" ? "∞" : 50)} cr)
                        </span>
                      </div>
                    </td>

                    {/* Joined Date */}
                    <td className="px-4 py-3 font-mono text-stone-400">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>

                    {/* Action */}
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onInspectUser(user);
                        }}
                        className="h-7 text-xs"
                      >
                        <Eye className="mr-1 h-3.5 w-3.5" />
                        Inspect
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
