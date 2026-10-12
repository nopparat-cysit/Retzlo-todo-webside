"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Check,
  Cpu,
  Flame,
  PlusCircle,
  RefreshCw,
  Search,
  Sparkles,
  Zap
} from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

interface RecentAiUser {
  id: string;
  name: string | null;
  email: string;
  avatar: string | null;
  globalRole: string;
  tier: string;
  credits: number;
  lastUsedAt: string | null;
}

interface AiHubData {
  costs: Record<string, number>;
  tierLimits: Record<string, number>;
  totalUsers: number;
  recentAiUsers: RecentAiUser[];
}

export function AiHubTab() {
  const { toast } = useToast();
  const [data, setData] = useState<AiHubData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Grant credit state
  const [selectedUser, setSelectedUser] = useState<RecentAiUser | null>(null);
  const [creditGrantAmount, setCreditGrantAmount] = useState<number>(100);
  const [tierSelection, setTierSelection] = useState<"FREE" | "PRO">("PRO");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const fetchAiData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/ai");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      } else {
        toast({ message: "Failed to load AI intelligence data", type: "error" });
      }
    } catch {
      toast({ message: "Network error loading AI telemetry", type: "error" });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchAiData();
  }, [fetchAiData]);

  const handleGrantCredits = async () => {
    if (!selectedUser) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUser.id,
          tier: tierSelection,
          credits: creditGrantAmount
        })
      });

      if (res.ok) {
        toast({
          message: `Granted ${creditGrantAmount} AI credits to ${selectedUser.email}`,
          type: "success"
        });
        setShowConfirm(false);
        setSelectedUser(null);
        fetchAiData();
      } else {
        const error = await res.json();
        toast({ message: error.error || "Failed to grant AI credits", type: "error" });
      }
    } catch {
      toast({ message: "Network error granting AI credits", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col gap-3 rounded-xl border border-stone-200/80 bg-white p-4 dark:border-white/10 dark:bg-[#0c0d18] sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-indigo-500/10 p-2 text-indigo-500">
            <Cpu className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-stone-900 dark:text-white text-sm">
              Machine Intelligence & Neural Engine Management
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Monitor AI operation token economics, quota allowances, and override user credit tiers.
            </p>
          </div>
        </div>

        <Button variant="ghost" size="sm" onClick={fetchAiData} disabled={isLoading}>
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {/* Pricing & Tier Limits Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Tier Daily Limits */}
        <div className="rounded-xl border border-stone-200/80 bg-white p-5 dark:border-white/10 dark:bg-[#0c0d18]">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-indigo-500" />
            <h4 className="font-semibold text-stone-900 dark:text-white text-xs uppercase tracking-wider">
              Tier Daily Allowances
            </h4>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between rounded-lg border border-stone-100 p-2.5 text-xs dark:border-white/5 dark:bg-white/[0.02]">
              <span className="font-medium text-stone-700 dark:text-stone-300">Free Tier</span>
              <span className="font-mono font-bold text-stone-900 dark:text-stone-100">
                50 credits / day
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-stone-100 p-2.5 text-xs dark:border-white/5 dark:bg-white/[0.02]">
              <span className="font-medium text-stone-700 dark:text-stone-300">Pro Tier</span>
              <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                500 credits / day
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-stone-100 p-2.5 text-xs dark:border-white/5 dark:bg-white/[0.02]">
              <span className="font-medium text-stone-700 dark:text-stone-300">System Admin</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                Unlimited (∞ credits)
              </span>
            </div>
          </div>
        </div>

        {/* Operational Costs */}
        <div className="rounded-xl border border-stone-200/80 bg-white p-5 dark:border-white/10 dark:bg-[#0c0d18]">
          <div className="flex items-center gap-2 mb-3">
            <Flame className="h-4 w-4 text-amber-500" />
            <h4 className="font-semibold text-stone-900 dark:text-white text-xs uppercase tracking-wider">
              Action Credit Unit Costs
            </h4>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {data?.costs ? (
              Object.entries(data.costs).map(([action, cost]) => (
                <div
                  key={action}
                  className="flex items-center justify-between rounded-lg border border-stone-100 p-2 dark:border-white/5 dark:bg-white/[0.02]"
                >
                  <span className="truncate text-stone-600 dark:text-stone-400 font-mono text-[11px]">
                    {action}
                  </span>
                  <span className="font-mono font-bold text-amber-500">{cost} cr</span>
                </div>
              ))
            ) : (
              <span className="text-stone-400">Loading costs...</span>
            )}
          </div>
        </div>
      </div>

      {/* Credit Grant & User Tier Override Panel */}
      <div className="rounded-xl border border-stone-200/80 bg-white p-5 dark:border-white/10 dark:bg-[#0c0d18]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4 text-indigo-500" />
            <h4 className="font-semibold text-stone-900 dark:text-white text-sm">
              Quick User Quota Override & Grant Tool
            </h4>
          </div>
          {selectedUser && (
            <button
              onClick={() => setSelectedUser(null)}
              className="text-xs text-stone-400 hover:text-stone-200"
            >
              Clear Selection
            </button>
          )}
        </div>

        {selectedUser ? (
          <div className="space-y-4 rounded-xl border border-indigo-500/30 bg-indigo-500/5 p-4">
            <div className="flex items-center gap-3">
              <Avatar
                src={selectedUser.avatar || undefined}
                name={selectedUser.name || selectedUser.email}
                size={32}
              />
              <div>
                <p className="font-semibold text-stone-900 dark:text-white text-sm">
                  {selectedUser.name || selectedUser.email}
                </p>
                <p className="text-xs text-stone-400">{selectedUser.email}</p>
                <p className="font-mono text-[11px] text-indigo-400 mt-0.5">
                  Current: {selectedUser.tier} • {selectedUser.credits} credits
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                  Target AI Tier
                </label>
                <div className="mt-1 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setTierSelection("FREE")}
                    className={`flex-1 rounded-md border p-2 text-xs font-medium transition ${
                      tierSelection === "FREE"
                        ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
                        : "border-stone-200 dark:border-white/10 text-stone-600 dark:text-stone-400"
                    }`}
                  >
                    FREE
                  </button>
                  <button
                    type="button"
                    onClick={() => setTierSelection("PRO")}
                    className={`flex-1 rounded-md border p-2 text-xs font-medium transition ${
                      tierSelection === "PRO"
                        ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
                        : "border-stone-200 dark:border-white/10 text-stone-600 dark:text-stone-400"
                    }`}
                  >
                    PRO (500/day)
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                  Credits to Set / Grant
                </label>
                <Input
                  type="number"
                  min={0}
                  max={999999}
                  value={creditGrantAmount}
                  onChange={(e) => setCreditGrantAmount(parseInt(e.target.value, 10) || 0)}
                  className="mt-1 font-mono text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setSelectedUser(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={() => setShowConfirm(true)}>
                Apply Credit Override
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-xs text-stone-400 italic">
            Select any user from the list below to grant AI credits or elevate their quota tier.
          </p>
        )}
      </div>

      {/* Recent AI Users Table */}
      <div className="overflow-hidden rounded-xl border border-stone-200/80 bg-white shadow-sm dark:border-white/10 dark:bg-[#0c0d18]">
        <div className="p-4 border-b border-stone-200/80 dark:border-white/10 flex items-center justify-between">
          <h4 className="font-semibold text-stone-900 dark:text-white text-xs uppercase tracking-wider">
            Active AI Intelligence Consumers
          </h4>
          <span className="font-mono text-xs text-stone-400">
            Total users: {data?.totalUsers ?? 0}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-stone-200/80 bg-stone-50/80 font-mono text-[11px] uppercase tracking-wider text-stone-500 dark:border-white/10 dark:bg-white/5 dark:text-stone-400">
              <tr>
                <th className="px-4 py-3 font-semibold">User</th>
                <th className="px-4 py-3 font-semibold">Role</th>
                <th className="px-4 py-3 font-semibold">AI Tier</th>
                <th className="px-4 py-3 font-semibold">Credits Available</th>
                <th className="px-4 py-3 font-semibold">Last AI Activity</th>
                <th className="px-4 py-3 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-stone-400 font-mono">
                    Loading AI accounts...
                  </td>
                </tr>
              ) : data?.recentAiUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-stone-400">
                    No active AI users recorded yet.
                  </td>
                </tr>
              ) : (
                data?.recentAiUsers.map((u) => (
                  <tr
                    key={u.id}
                    className="transition-colors hover:bg-stone-50/80 dark:hover:bg-white/[0.03]"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar src={u.avatar || undefined} name={u.name || u.email} size={24} />
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-stone-900 dark:text-stone-100">
                            {u.name || "User"}
                          </p>
                          <p className="truncate text-[11px] text-stone-400">{u.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3 font-mono text-[10px]">
                      <span className="rounded bg-stone-100 px-1.5 py-0.5 dark:bg-white/10">
                        {u.globalRole}
                      </span>
                    </td>

                    <td className="px-4 py-3 font-mono font-semibold">
                      <span
                        className={
                          u.tier === "PRO"
                            ? "text-indigo-500"
                            : u.tier === "ADMIN"
                            ? "text-emerald-500"
                            : "text-stone-400"
                        }
                      >
                        {u.tier}
                      </span>
                    </td>

                    <td className="px-4 py-3 font-mono font-bold text-stone-800 dark:text-stone-200">
                      {u.globalRole === "ADMIN" ? "∞ (Unlimited)" : `${u.credits} cr`}
                    </td>

                    <td className="px-4 py-3 font-mono text-stone-400">
                      {u.lastUsedAt ? new Date(u.lastUsedAt).toLocaleString() : "Never used"}
                    </td>

                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedUser(u);
                          setCreditGrantAmount(u.credits + 100);
                          setTierSelection(u.tier === "PRO" ? "PRO" : "FREE");
                        }}
                        className="h-7 text-xs"
                      >
                        <Zap className="mr-1 h-3.5 w-3.5 text-amber-500" />
                        Grant / Override
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirm Grant Modal */}
      {selectedUser && (
        <ConfirmModal
          open={showConfirm}
          onClose={() => setShowConfirm(false)}
          onConfirm={handleGrantCredits}
          title="Confirm AI Quota Grant"
          message={`Are you sure you want to set ${selectedUser.email}'s AI Quota to ${tierSelection} tier with ${creditGrantAmount} credits?`}
          confirmLabel="Grant Quota"
          variant="default"
          isLoading={isSubmitting}
        />
      )}
    </div>
  );
}
