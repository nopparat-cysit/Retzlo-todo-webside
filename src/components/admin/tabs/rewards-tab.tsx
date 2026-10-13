"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Check,
  Coins,
  Gift,
  HelpCircle,
  RefreshCw,
  Undo2,
  X
} from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { FilterSelect } from "@/components/ui/filter-select";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import type { AdminRedemption } from "../types";

export function RewardsTab() {
  const { toast } = useToast();
  const [redemptions, setRedemptions] = useState<AdminRedemption[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);

  // Action state
  const [pendingAction, setPendingAction] = useState<{
    id: string;
    status: "APPROVED" | "REJECTED";
    userEmail: string;
    rewardName: string;
    price: number;
  } | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchRedemptions = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/rewards?status=${statusFilter}`);
      if (res.ok) {
        const data = await res.json();
        setRedemptions(data.redemptions);
        setPendingCount(data.pendingCount);
      } else {
        toast({ message: "Failed to load redemptions", type: "error" });
      }
    } catch {
      toast({ message: "Network error loading rewards", type: "error" });
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, toast]);

  useEffect(() => {
    fetchRedemptions();
  }, [fetchRedemptions]);

  const handleExecute = async () => {
    if (!pendingAction) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/rewards", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          redemptionId: pendingAction.id,
          status: pendingAction.status,
          rejectionReason: pendingAction.status === "REJECTED" ? rejectionReason : undefined
        })
      });

      if (res.ok) {
        toast({
          message:
            pendingAction.status === "APPROVED"
              ? `Approved redemption for ${pendingAction.userEmail}`
              : `Rejected redemption & refunded ${pendingAction.price} coins`,
          type: "success"
        });
        setPendingAction(null);
        setRejectionReason("");
        fetchRedemptions();
      } else {
        const data = await res.json();
        toast({ message: data.error || "Action failed", type: "error" });
      }
    } catch {
      toast({ message: "Network error processing redemption", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Economy Overview Bar */}
      <div className="flex flex-col gap-3 rounded-xl border border-stone-200/80 bg-white p-4 dark:border-white/10 dark:bg-[#0c0d18] sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-amber-500/10 p-2 text-amber-500">
            <Gift className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-stone-900 dark:text-white text-sm">
              Reward Redemptions & Economy Clearance
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Review member claims, approve rewards, or refund coins back to balances.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <FilterSelect
              value={statusFilter}
              options={[
                { value: "ALL", label: `All (${redemptions.length})` },
                { value: "PENDING", label: `Pending Only (${pendingCount})` },
                { value: "APPROVED", label: "Approved" },
                { value: "REJECTED", label: "Rejected" },
              ]}
              onValueChange={setStatusFilter}
              triggerClassName="h-8 rounded-lg border-stone-200 bg-stone-50/80 px-2 text-xs text-stone-700 dark:border-white/10 dark:bg-white/5 dark:text-stone-300"
            />
          </div>

          <Button variant="ghost" size="sm" onClick={fetchRedemptions} disabled={isLoading}>
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Redemptions Table */}
      <div className="overflow-hidden rounded-xl border border-stone-200/80 bg-white shadow-sm dark:border-white/10 dark:bg-[#0c0d18]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-stone-200/80 bg-stone-50/80 font-mono text-[11px] uppercase tracking-wider text-stone-500 dark:border-white/10 dark:bg-white/5 dark:text-stone-400">
              <tr>
                <th className="px-4 py-3 font-semibold">User</th>
                <th className="px-4 py-3 font-semibold">Reward Item</th>
                <th className="px-4 py-3 font-semibold">Workspace</th>
                <th className="px-4 py-3 font-semibold">Price</th>
                <th className="px-4 py-3 font-semibold">Requested At</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-stone-400 font-mono">
                    Loading redemption claims...
                  </td>
                </tr>
              ) : redemptions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-stone-400">
                    No reward redemptions found.
                  </td>
                </tr>
              ) : (
                redemptions.map((item) => (
                  <tr
                    key={item.id}
                    className="transition-colors hover:bg-stone-50/80 dark:hover:bg-white/[0.03]"
                  >
                    {/* User */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar
                          src={item.user.avatar || undefined}
                          name={item.user.name || item.user.email}
                          size={24}
                        />
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-stone-900 dark:text-stone-100">
                            {item.user.name || "User"}
                          </p>
                          <p className="truncate text-[11px] text-stone-400">{item.user.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Reward */}
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-semibold text-stone-900 dark:text-stone-100">
                          {item.reward.name}
                        </p>
                        {item.reward.description && (
                          <p className="line-clamp-1 text-[11px] text-stone-400">
                            {item.reward.description}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Workspace */}
                    <td className="px-4 py-3 text-stone-600 dark:text-stone-300">
                      {item.reward.project?.name || "Global / Platform"}
                    </td>

                    {/* Price */}
                    <td className="px-4 py-3 font-mono font-bold text-amber-500">
                      <div className="flex items-center gap-1">
                        <Coins className="h-3 w-3" />
                        <span>{item.reward.price}c</span>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3 font-mono text-stone-400">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>

                    {/* Status Badge */}
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          item.status === "PENDING"
                            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 animate-pulse"
                            : item.status === "APPROVED"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                        }`}
                      >
                        {item.status}
                      </span>
                      {item.rejectionReason && (
                        <p className="text-[10px] text-rose-500/80 mt-0.5">
                          Reason: {item.rejectionReason}
                        </p>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right">
                      {item.status === "PENDING" ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() =>
                              setPendingAction({
                                id: item.id,
                                status: "APPROVED",
                                userEmail: item.user.email,
                                rewardName: item.reward.name,
                                price: item.reward.price
                              })
                            }
                            className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                          >
                            <Check className="mr-1 h-3 w-3" />
                            Approve
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() =>
                              setPendingAction({
                                id: item.id,
                                status: "REJECTED",
                                userEmail: item.user.email,
                                rewardName: item.reward.name,
                                price: item.reward.price
                              })
                            }
                            className="h-7 text-xs"
                          >
                            <Undo2 className="mr-1 h-3 w-3" />
                            Reject & Refund
                          </Button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-stone-400 italic">Settled</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal for Approval */}
      {pendingAction && pendingAction.status === "APPROVED" && (
        <ConfirmModal
          open={Boolean(pendingAction)}
          onClose={() => setPendingAction(null)}
          onConfirm={handleExecute}
          title="Approve Reward Redemption"
          message={`Confirm approval of "${pendingAction.rewardName}" for ${pendingAction.userEmail}? This marks the item delivered.`}
          confirmLabel="Approve"
          variant="default"
          isLoading={isSubmitting}
        />
      )}

      {/* Modal for Rejection & Refund */}
      {pendingAction && pendingAction.status === "REJECTED" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setPendingAction(null)}
          />
          <div className="relative w-full max-w-md rounded-xl border border-rose-300 bg-white p-6 shadow-2xl dark:border-rose-900 dark:bg-[#121324]">
            <h3 className="font-semibold text-stone-900 dark:text-stone-100 text-sm">
              Reject Redemption & Refund Coins
            </h3>
            <p className="mt-2 text-xs text-stone-600 dark:text-stone-400">
              Rejecting &quot;{pendingAction.rewardName}&quot; for {pendingAction.userEmail} will refund{" "}
              <span className="font-mono font-bold text-amber-500">{pendingAction.price} coins</span> back to their account.
            </p>
            <div className="mt-4">
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                Reason for Rejection:
              </label>
              <Input
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Item unavailable, duplicate claim..."
                className="mt-1 text-xs"
              />
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button
                variant="ghost"
                onClick={() => setPendingAction(null)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleExecute}
                disabled={isSubmitting}
              >
                Reject & Refund
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
