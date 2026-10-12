"use client";

import { useEffect, useState, useCallback } from "react";
import {
  AlertTriangle,
  FolderGit2,
  Kanban,
  Save,
  ShieldAlert,
  Trash2,
  UserCheck,
  Users,
  X
} from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import type { AdminProject, ProjectDetail } from "../types";

interface WorkspaceInspectorDrawerProps {
  project: AdminProject | null;
  isOpen: boolean;
  onClose: () => void;
  onProjectUpdated: () => void;
}

export function WorkspaceInspectorDrawer({
  project,
  isOpen,
  onClose,
  onProjectUpdated
}: WorkspaceInspectorDrawerProps) {
  const { toast } = useToast();

  const [detail, setDetail] = useState<ProjectDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [transferOwnerId, setTransferOwnerId] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Deletion state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmInput, setDeleteConfirmInput] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch full project details
  const fetchDetail = useCallback(async (projectId: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/projects/${projectId}`);
      if (res.ok) {
        const data = await res.json();
        setDetail(data.project);
        setName(data.project.name);
        setDescription(data.project.description || "");
      } else {
        toast({ message: "Failed to load workspace details", type: "error" });
      }
    } catch {
      toast({ message: "Network error loading workspace", type: "error" });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (project && isOpen) {
      setTransferOwnerId("");
      setDeleteConfirmInput("");
      fetchDetail(project.id);
    }
  }, [project, isOpen, fetchDetail]);

  if (!isOpen || !project) return null;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          transferOwnerId: transferOwnerId || undefined
        })
      });

      if (res.ok) {
        toast({ message: "Workspace updated successfully", type: "success" });
        onProjectUpdated();
        fetchDetail(project.id);
      } else {
        const data = await res.json();
        toast({ message: data.error || "Failed to update workspace", type: "error" });
      }
    } catch {
      toast({ message: "Network error saving workspace", type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (deleteConfirmInput !== project.name) {
      toast({ message: "Please type the exact workspace name to confirm deletion", type: "error" });
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/projects/${project.id}`, {
        method: "DELETE"
      });

      if (res.ok) {
        toast({ message: `Workspace "${project.name}" permanently deleted`, type: "success" });
        setShowDeleteModal(false);
        onProjectUpdated();
        onClose();
      } else {
        const data = await res.json();
        toast({ message: data.error || "Failed to delete workspace", type: "error" });
      }
    } catch {
      toast({ message: "Network error deleting workspace", type: "error" });
    } finally {
      setIsDeleting(false);
    }
  };

  const currentOwner = detail?.members.find((m) => m.role === "OWNER");

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity"
      />

      {/* Slide-over Drawer Panel */}
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white shadow-2xl transition-all dark:bg-[#0c0d18] dark:border-l dark:border-white/10 sm:max-w-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-200 px-6 py-4 dark:border-white/10">
          <div className="flex items-center gap-2">
            <FolderGit2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <span className="font-mono text-sm font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-300">
              Workspace Inspector
            </span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-white/5 dark:hover:text-stone-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
          {isLoading ? (
            <div className="flex h-48 items-center justify-center">
              <span className="font-mono text-xs text-stone-400">Loading workspace telemetry...</span>
            </div>
          ) : (
            <>
              {/* Basic Workspace Form */}
              <div className="space-y-4 rounded-xl border border-stone-200/80 bg-stone-50/70 p-4 dark:border-white/10 dark:bg-white/5">
                <div>
                  <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                    Workspace Name
                  </label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 font-medium"
                    placeholder="Workspace Title"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Workspace purpose..."
                    className="mt-1 w-full rounded-md border border-stone-300 bg-white p-2.5 text-xs text-stone-900 focus:border-indigo-500 focus:outline-none dark:border-white/10 dark:bg-stone-900 dark:text-stone-100"
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-stone-400">
                  <span className="font-mono">ID: {project.id}</span>
                  <span>Type: {project.type}</span>
                </div>
              </div>

              {/* Ownership Transfer Section */}
              <div className="space-y-3 rounded-xl border border-stone-200/80 bg-white p-4 dark:border-white/10 dark:bg-stone-900/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-indigo-500" />
                    <span className="text-xs font-semibold text-stone-800 dark:text-stone-200">
                      Ownership & Governance
                    </span>
                  </div>
                  {currentOwner && (
                    <span className="text-[11px] text-stone-500 dark:text-stone-400">
                      Owner: {currentOwner.user.name || currentOwner.user.email}
                    </span>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-stone-500 dark:text-stone-400">
                    Transfer Ownership to another Member:
                  </label>
                  <select
                    value={transferOwnerId}
                    onChange={(e) => setTransferOwnerId(e.target.value)}
                    className="w-full rounded-md border border-stone-300 bg-white p-2 text-xs text-stone-800 dark:border-white/10 dark:bg-stone-900 dark:text-stone-100"
                  >
                    <option value="">Keep current owner</option>
                    {detail?.members
                      .filter((m) => m.role !== "OWNER")
                      .map((m) => (
                        <option key={m.user.id} value={m.user.id}>
                          {m.user.name || m.user.email} ({m.role})
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Boards in this Workspace */}
              <div className="space-y-3 rounded-xl border border-stone-200/80 bg-white p-4 dark:border-white/10 dark:bg-stone-900/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Kanban className="h-4 w-4 text-indigo-500" />
                    <span className="text-xs font-semibold text-stone-800 dark:text-stone-200">
                      Associated Kanban Boards ({detail?.boards.length || 0})
                    </span>
                  </div>
                </div>

                <div className="divide-y divide-stone-100 rounded-lg border border-stone-200/70 dark:divide-white/5 dark:border-white/10">
                  {detail?.boards.map((b) => {
                    const totalCards = b.columns.reduce((sum, col) => sum + col._count.cards, 0);
                    return (
                      <div key={b.id} className="flex items-center justify-between p-2.5 text-xs">
                        <div>
                          <p className="font-medium text-stone-800 dark:text-stone-200">{b.name}</p>
                          <p className="text-[11px] text-stone-400">
                            {b.columns.length} columns • {b._count.members} board members
                          </p>
                        </div>
                        <span className="rounded bg-indigo-50 px-2 py-0.5 font-mono text-[11px] font-bold text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                          {totalCards} cards
                        </span>
                      </div>
                    );
                  })}
                  {detail?.boards.length === 0 && (
                    <p className="p-3 text-center text-xs text-stone-400">No boards created yet</p>
                  )}
                </div>
              </div>

              {/* Members Roster */}
              <div className="space-y-3 rounded-xl border border-stone-200/80 bg-white p-4 dark:border-white/10 dark:bg-stone-900/30">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-indigo-500" />
                  <span className="text-xs font-semibold text-stone-800 dark:text-stone-200">
                    Members Roster ({detail?.members.length || 0})
                  </span>
                </div>

                <div className="max-h-48 space-y-2 overflow-y-auto">
                  {detail?.members.map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center justify-between rounded-lg border border-stone-100 p-2 dark:border-white/5 dark:bg-white/[0.02]"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Avatar
                          src={m.user.avatar || undefined}
                          name={m.user.name || m.user.email}
                          size={24}
                        />
                        <div className="min-w-0">
                          <p className="truncate text-xs font-medium text-stone-800 dark:text-stone-200">
                            {m.user.name || "User"}
                          </p>
                          <p className="truncate text-[10px] text-stone-400">{m.user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-amber-500">{m.coins}c</span>
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                            m.role === "OWNER"
                              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                              : "bg-stone-100 text-stone-600 dark:bg-white/10 dark:text-stone-300"
                          }`}
                        >
                          {m.role}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Danger Zone: Permanent Deletion */}
              <div className="space-y-3 rounded-xl border border-rose-200 bg-rose-50/40 p-4 dark:border-rose-900/30 dark:bg-rose-950/10">
                <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-xs font-semibold">Danger Zone</span>
                </div>
                <p className="text-[11px] text-rose-700/80 dark:text-rose-300/70">
                  Permanently eradicate this workspace along with all associated boards, lists,
                  cards, notes, diaries, and attachments. This action cannot be reversed.
                </p>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setShowDeleteModal(true)}
                  className="w-full text-xs"
                >
                  <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                  Delete Workspace Entirely
                </Button>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-stone-200 px-6 py-4 dark:border-white/10">
          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" onClick={onClose} disabled={isSaving}>
              Close
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={isLoading || isSaving}
            >
              <Save className="mr-1.5 h-3.5 w-3.5" />
              Save Workspace
            </Button>
          </div>
        </div>
      </div>

      {/* Delete Workspace Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowDeleteModal(false)}
          />
          <div className="relative w-full max-w-md rounded-xl border border-rose-300 bg-white p-6 shadow-2xl dark:border-rose-900 dark:bg-[#121324]">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-rose-100 p-2.5 text-rose-600 dark:bg-rose-950 dark:text-rose-400">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-stone-900 dark:text-stone-100">
                  Delete Workspace Permanently
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  This action is irreversible and immediately wipes all data.
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <p className="text-xs text-stone-600 dark:text-stone-300">
                To confirm, please type{" "}
                <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                  {project.name}
                </span>{" "}
                below:
              </p>
              <Input
                value={deleteConfirmInput}
                onChange={(e) => setDeleteConfirmInput(e.target.value)}
                placeholder={project.name}
                className="font-mono text-xs"
              />
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <Button
                variant="ghost"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDelete}
                disabled={deleteConfirmInput !== project.name || isDeleting}
              >
                Delete Workspace
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
