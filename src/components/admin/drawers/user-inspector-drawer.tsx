"use client";

import { useState, useEffect } from "react";
import {
  Coins,
  Cpu,
  Mail,
  Shield,
  ShieldAlert,
  Sparkles,
  UserCheck,
  UserX,
  X
} from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import type { AdminUser } from "../types";

interface UserInspectorDrawerProps {
  user: AdminUser | null;
  isOpen: boolean;
  onClose: () => void;
  currentAdminEmail?: string;
  onUserUpdated: () => void;
}

export function UserInspectorDrawer({
  user,
  isOpen,
  onClose,
  currentAdminEmail,
  onUserUpdated
}: UserInspectorDrawerProps) {
  const { toast } = useToast();

  const [role, setRole] = useState<"USER" | "ADMIN">("USER");
  const [status, setStatus] = useState<"ONLINE" | "OFFLINE" | "BUSY" | "SUSPENDED">("ONLINE");
  const [coins, setCoins] = useState<number>(0);
  const [aiTier, setAiTier] = useState<"FREE" | "PRO">("FREE");
  const [aiCredits, setAiCredits] = useState<number>(50);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (user) {
      setRole(user.globalRole === "ADMIN" ? "ADMIN" : "USER");
      setStatus(
        (user.status === "SUSPENDED" || user.status === "OFFLINE" || user.status === "BUSY"
          ? user.status
          : "ONLINE") as "ONLINE" | "OFFLINE" | "BUSY" | "SUSPENDED"
      );
      setCoins(user.globalCoins ?? 0);
      setAiTier(user.aiQuota?.tier === "PRO" ? "PRO" : "FREE");
      setAiCredits(user.aiQuota?.credits ?? 50);
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const isSelf = currentAdminEmail && user.email.toLowerCase() === currentAdminEmail.toLowerCase();

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          globalRole: role,
          status,
          globalCoins: coins,
          aiTier,
          aiCredits
        })
      });

      if (res.ok) {
        toast({ message: `Successfully updated user ${user.email}`, type: "success" });
        onUserUpdated();
        setShowConfirm(false);
        onClose();
      } else {
        const data = await res.json();
        toast({ message: data.error || "Failed to update user", type: "error" });
      }
    } catch {
      toast({ message: "Network error saving changes", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const adjustCoins = (delta: number) => {
    setCoins((prev) => Math.max(0, prev + delta));
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity"
      />

      {/* Slide-over Drawer Panel */}
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white shadow-2xl transition-all dark:bg-[#0c0d18] dark:border-l dark:border-white/10 sm:max-w-lg">
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-stone-200 px-6 py-4 dark:border-white/10">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <span className="font-mono text-sm font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-300">
              User Inspector
            </span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-white/5 dark:hover:text-stone-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
          {/* User Profile Card */}
          <div className="flex items-start gap-4 rounded-xl border border-stone-200/80 bg-stone-50/80 p-4 dark:border-white/10 dark:bg-white/5">
            <Avatar
              src={user.avatar || undefined}
              name={user.name || user.email}
              size={44}
              className="ring-2 ring-indigo-500/20"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="truncate font-semibold text-stone-900 dark:text-white">
                  {user.name || "Anonymous User"}
                </h3>
                {user.globalRole === "ADMIN" && (
                  <span className="rounded bg-indigo-100 px-1.5 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300">
                    ADMIN
                  </span>
                )}
              </div>
              <p className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400">
                <Mail className="h-3 w-3 shrink-0" />
                <span className="truncate">{user.email}</span>
              </p>
              {user.username && (
                <p className="mt-0.5 font-mono text-[11px] text-stone-400 dark:text-stone-500">
                  @{user.username}
                </p>
              )}
              <div className="mt-2 flex items-center gap-2 text-[11px] text-stone-400 dark:text-stone-500">
                <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                <span>•</span>
                <span className="font-mono text-[10px]">{user.id.slice(0, 10)}...</span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg border border-stone-200/70 bg-white p-3 text-center dark:border-white/10 dark:bg-stone-900/40">
              <span className="text-[10px] font-medium text-stone-500 uppercase tracking-wider dark:text-stone-400">
                Workspaces
              </span>
              <p className="mt-1 font-mono text-lg font-bold text-stone-900 dark:text-stone-100">
                {user.counts?.memberships ?? user._count?.memberships ?? 0}
              </p>
            </div>
            <div className="rounded-lg border border-stone-200/70 bg-white p-3 text-center dark:border-white/10 dark:bg-stone-900/40">
              <span className="text-[10px] font-medium text-stone-500 uppercase tracking-wider dark:text-stone-400">
                Notes
              </span>
              <p className="mt-1 font-mono text-lg font-bold text-stone-900 dark:text-stone-100">
                {user.counts?.notes ?? user._count?.notes ?? 0}
              </p>
            </div>
            <div className="rounded-lg border border-stone-200/70 bg-white p-3 text-center dark:border-white/10 dark:bg-stone-900/40">
              <span className="text-[10px] font-medium text-stone-500 uppercase tracking-wider dark:text-stone-400">
                Diaries
              </span>
              <p className="mt-1 font-mono text-lg font-bold text-stone-900 dark:text-stone-100">
                {user.counts?.diaryItems ?? user._count?.diaryItems ?? 0}
              </p>
            </div>
          </div>

          {/* Role & Privileges */}
          <div className="space-y-3 rounded-xl border border-stone-200/80 bg-white p-4 dark:border-white/10 dark:bg-stone-900/30">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-700 dark:text-stone-200">
                System Privilege Role
              </span>
              <span className="text-[11px] font-mono text-stone-400">
                {role === "ADMIN" ? "Elevated Root Access" : "Standard Workspace User"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={Boolean(isSelf)}
                onClick={() => setRole("USER")}
                className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition ${
                  role === "USER"
                    ? "border-indigo-500 bg-indigo-50/50 text-indigo-700 dark:border-indigo-500/80 dark:bg-indigo-950/30 dark:text-indigo-300"
                    : "border-stone-200 bg-transparent text-stone-600 hover:bg-stone-50 dark:border-white/10 dark:text-stone-400 dark:hover:bg-white/5"
                } ${isSelf ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <UserCheck className="h-3.5 w-3.5" />
                USER
              </button>
              <button
                type="button"
                onClick={() => setRole("ADMIN")}
                className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition ${
                  role === "ADMIN"
                    ? "border-indigo-500 bg-indigo-50/50 text-indigo-700 dark:border-indigo-500/80 dark:bg-indigo-950/30 dark:text-indigo-300"
                    : "border-stone-200 bg-transparent text-stone-600 hover:bg-stone-50 dark:border-white/10 dark:text-stone-400 dark:hover:bg-white/5"
                }`}
              >
                <Shield className="h-3.5 w-3.5" />
                ADMIN
              </button>
            </div>
            {isSelf && (
              <p className="text-[11px] text-amber-600 dark:text-amber-400">
                * You cannot demote your own current session admin account.
              </p>
            )}
          </div>

          {/* Account Status / Suspension */}
          <div className="space-y-3 rounded-xl border border-stone-200/80 bg-white p-4 dark:border-white/10 dark:bg-stone-900/30">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-700 dark:text-stone-200">
                Account Status
              </span>
              <span
                className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                  status === "SUSPENDED"
                    ? "bg-rose-500/20 text-rose-500"
                    : "bg-emerald-500/20 text-emerald-500"
                }`}
              >
                {status}
              </span>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStatus("ONLINE")}
                className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition ${
                  status !== "SUSPENDED"
                    ? "border-emerald-500 bg-emerald-50/50 text-emerald-700 dark:border-emerald-500/80 dark:bg-emerald-950/30 dark:text-emerald-300"
                    : "border-stone-200 bg-transparent text-stone-600 hover:bg-stone-50 dark:border-white/10 dark:text-stone-400 dark:hover:bg-white/5"
                }`}
              >
                <UserCheck className="h-3.5 w-3.5" />
                Active (Online)
              </button>
              <button
                type="button"
                disabled={Boolean(isSelf)}
                onClick={() => setStatus("SUSPENDED")}
                className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition ${
                  status === "SUSPENDED"
                    ? "border-rose-500 bg-rose-50/50 text-rose-700 dark:border-rose-500/80 dark:bg-rose-950/30 dark:text-rose-300"
                    : "border-stone-200 bg-transparent text-stone-600 hover:bg-stone-50 dark:border-white/10 dark:text-stone-400 dark:hover:bg-white/5"
                } ${isSelf ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <UserX className="h-3.5 w-3.5" />
                Suspend Account
              </button>
            </div>
          </div>

          {/* Economy: Global Coins Control */}
          <div className="space-y-3 rounded-xl border border-stone-200/80 bg-white p-4 dark:border-white/10 dark:bg-stone-900/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Coins className="h-4 w-4 text-amber-500" />
                <span className="text-xs font-semibold text-stone-700 dark:text-stone-200">
                  Global Coins Balance
                </span>
              </div>
              <span className="font-mono text-sm font-bold text-amber-600 dark:text-amber-400">
                {coins} Coins
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={0}
                max={999999}
                value={coins}
                onChange={(e) => setCoins(Math.max(0, parseInt(e.target.value, 10) || 0))}
                className="font-mono text-sm"
              />
            </div>

            {/* Quick Adjustment Shortcuts */}
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => adjustCoins(10)}
                className="rounded-md border border-stone-200 bg-stone-50 px-2 py-1 text-[11px] font-mono text-stone-600 hover:bg-stone-100 dark:border-white/10 dark:bg-white/5 dark:text-stone-300 dark:hover:bg-white/10"
              >
                +10
              </button>
              <button
                type="button"
                onClick={() => adjustCoins(50)}
                className="rounded-md border border-stone-200 bg-stone-50 px-2 py-1 text-[11px] font-mono text-stone-600 hover:bg-stone-100 dark:border-white/10 dark:bg-white/5 dark:text-stone-300 dark:hover:bg-white/10"
              >
                +50
              </button>
              <button
                type="button"
                onClick={() => adjustCoins(100)}
                className="rounded-md border border-stone-200 bg-stone-50 px-2 py-1 text-[11px] font-mono text-stone-600 hover:bg-stone-100 dark:border-white/10 dark:bg-white/5 dark:text-stone-300 dark:hover:bg-white/10"
              >
                +100
              </button>
              <button
                type="button"
                onClick={() => adjustCoins(500)}
                className="rounded-md border border-stone-200 bg-stone-50 px-2 py-1 text-[11px] font-mono text-stone-600 hover:bg-stone-100 dark:border-white/10 dark:bg-white/5 dark:text-stone-300 dark:hover:bg-white/10"
              >
                +500
              </button>
              <button
                type="button"
                onClick={() => adjustCoins(-50)}
                className="rounded-md border border-stone-200 bg-stone-50 px-2 py-1 text-[11px] font-mono text-stone-600 hover:bg-stone-100 dark:border-white/10 dark:bg-white/5 dark:text-stone-300 dark:hover:bg-white/10"
              >
                -50
              </button>
              <button
                type="button"
                onClick={() => setCoins(0)}
                className="rounded-md border border-rose-200 bg-rose-50 px-2 py-1 text-[11px] font-mono text-rose-600 hover:bg-rose-100 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-400"
              >
                Reset 0
              </button>
            </div>
          </div>

          {/* AI Quota & Tier Controls */}
          <div className="space-y-3 rounded-xl border border-stone-200/80 bg-white p-4 dark:border-white/10 dark:bg-stone-900/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-indigo-500" />
                <span className="text-xs font-semibold text-stone-700 dark:text-stone-200">
                  AI Intelligence Quota
                </span>
              </div>
              <span className="font-mono text-xs text-indigo-600 dark:text-indigo-400">
                Tier: {aiTier}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setAiTier("FREE");
                  setAiCredits(50);
                }}
                className={`flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition ${
                  aiTier === "FREE"
                    ? "border-indigo-500 bg-indigo-50/50 text-indigo-700 dark:border-indigo-500/80 dark:bg-indigo-950/30 dark:text-indigo-300"
                    : "border-stone-200 bg-transparent text-stone-600 hover:bg-stone-50 dark:border-white/10 dark:text-stone-400 dark:hover:bg-white/5"
                }`}
              >
                <Cpu className="h-3.5 w-3.5" />
                FREE (50/day)
              </button>
              <button
                type="button"
                onClick={() => {
                  setAiTier("PRO");
                  setAiCredits(500);
                }}
                className={`flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition ${
                  aiTier === "PRO"
                    ? "border-indigo-500 bg-indigo-50/50 text-indigo-700 dark:border-indigo-500/80 dark:bg-indigo-950/30 dark:text-indigo-300"
                    : "border-stone-200 bg-transparent text-stone-600 hover:bg-stone-50 dark:border-white/10 dark:text-stone-400 dark:hover:bg-white/5"
                }`}
              >
                <Sparkles className="h-3.5 w-3.5" />
                PRO (500/day)
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-medium text-stone-500 dark:text-stone-400">
                Available AI Credit Allowance
              </label>
              <Input
                type="number"
                min={0}
                max={999999}
                value={aiCredits}
                onChange={(e) => setAiCredits(Math.max(0, parseInt(e.target.value, 10) || 0))}
                className="font-mono text-sm"
              />
            </div>
          </div>
        </div>

        {/* Drawer Footer Actions */}
        <div className="border-t border-stone-200 px-6 py-4 dark:border-white/10">
          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => setShowConfirm(true)}
              disabled={isSubmitting}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleSave}
        title="Confirm User Account Modification"
        message={`Are you sure you want to update ${user.email}? This will set Global Role to ${role}, Status to ${status}, Coins to ${coins}, and AI Tier to ${aiTier} (${aiCredits} credits).`}
        confirmLabel="Confirm & Apply"
        variant={status === "SUSPENDED" ? "danger" : "default"}
        isLoading={isSubmitting}
      />
    </>
  );
}
