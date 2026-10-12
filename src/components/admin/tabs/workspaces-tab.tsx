"use client";

import { Eye, FolderGit2, Kanban, Search, Users } from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Panel } from "@/components/ui/panel";
import type { AdminProject } from "../types";

interface WorkspacesTabProps {
  projects: AdminProject[];
  total: number;
  search: string;
  onSearchChange: (val: string) => void;
  onInspectProject: (project: AdminProject) => void;
  isLoading: boolean;
}

export function WorkspacesTab({
  projects,
  total,
  search,
  onSearchChange,
  onInspectProject,
  isLoading
}: WorkspacesTabProps) {
  return (
    <div className="space-y-4">
      {/* Controls Bar: Search */}
      <Panel className="p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search workspaces by name..."
            className="pl-9 text-xs"
          />
        </div>

        <div className="font-mono text-xs text-stone-400">
          Workspaces: <span className="font-bold text-stone-800 dark:text-stone-200">{total}</span>
        </div>
      </Panel>

      {/* Workspaces Data Table */}
      <div className="overflow-hidden rounded-xl border border-stone-200/80 bg-white shadow-sm dark:border-white/10 dark:bg-[#0c0d18]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-stone-200/80 bg-stone-50/80 font-mono text-[11px] uppercase tracking-wider text-stone-500 dark:border-white/10 dark:bg-white/5 dark:text-stone-400">
              <tr>
                <th className="px-4 py-3 font-semibold">Workspace</th>
                <th className="px-4 py-3 font-semibold">Type</th>
                <th className="px-4 py-3 font-semibold">Owner</th>
                <th className="px-4 py-3 font-semibold">Members</th>
                <th className="px-4 py-3 font-semibold">Boards</th>
                <th className="px-4 py-3 font-semibold">Created</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-stone-400 font-mono">
                    Loading workspaces...
                  </td>
                </tr>
              ) : projects.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-stone-400">
                    No workspaces found.
                  </td>
                </tr>
              ) : (
                projects.map((proj) => (
                  <tr
                    key={proj.id}
                    onClick={() => onInspectProject(proj)}
                    className="cursor-pointer transition-colors hover:bg-stone-50/80 dark:hover:bg-white/[0.03]"
                  >
                    {/* Workspace Details */}
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-semibold text-stone-900 dark:text-stone-100">
                          {proj.name}
                        </p>
                        {proj.description && (
                          <p className="line-clamp-1 text-[11px] text-stone-400">
                            {proj.description}
                          </p>
                        )}
                        <span className="font-mono text-[10px] text-stone-400">
                          {proj.id.slice(0, 12)}...
                        </span>
                      </div>
                    </td>

                    {/* Type Badge */}
                    <td className="px-4 py-3">
                      <span className="rounded bg-indigo-50 px-2 py-0.5 font-mono text-[10px] font-bold text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300">
                        {proj.type}
                      </span>
                    </td>

                    {/* Owner */}
                    <td className="px-4 py-3">
                      {proj.owner ? (
                        <div className="flex items-center gap-2">
                          <Avatar
                            src={proj.owner.avatar || undefined}
                            name={proj.owner.name || proj.owner.email}
                            size={24}
                          />
                          <div className="min-w-0">
                            <p className="truncate text-xs font-medium text-stone-800 dark:text-stone-200">
                              {proj.owner.name || "Owner"}
                            </p>
                            <p className="truncate text-[10px] text-stone-400">
                              {proj.owner.email}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <span className="text-stone-400 italic">No Owner</span>
                      )}
                    </td>

                    {/* Members Count */}
                    <td className="px-4 py-3 font-mono">
                      <div className="flex items-center gap-1.5 text-stone-700 dark:text-stone-300">
                        <Users className="h-3.5 w-3.5 text-stone-400" />
                        <span>{proj.counts?.members ?? proj._count?.members ?? 0}</span>
                      </div>
                    </td>

                    {/* Boards Count */}
                    <td className="px-4 py-3 font-mono">
                      <div className="flex items-center gap-1.5 text-stone-700 dark:text-stone-300">
                        <Kanban className="h-3.5 w-3.5 text-stone-400" />
                        <span>{proj.counts?.boards ?? proj._count?.boards ?? 0}</span>
                      </div>
                    </td>

                    {/* Created Date */}
                    <td className="px-4 py-3 font-mono text-stone-400">
                      {new Date(proj.createdAt).toLocaleDateString()}
                    </td>

                    {/* Action */}
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onInspectProject(proj);
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
