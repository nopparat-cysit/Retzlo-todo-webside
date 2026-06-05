"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Gift,
  Coins,
  Plus,
  X,
  Check,
  AlertCircle,
  Clock,
  Inbox,
  Bell,
  CheckCircle2,
  Coffee,
  Gamepad,
  Compass,
  DollarSign,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// Preset configurations for simple reward creation
const REWARD_PRESETS = [
  {
    name: "Coffee Break ☕",
    description: "A warm cup of fresh lofi blend espresso to charge up your tasks.",
    price: 10,
    icon: Coffee,
    hasQuantity: false,
    quantity: null,
  },
  {
    name: "Gaming Session 🎮",
    description: "Unwind with 30 minutes of retro arcade or casual indie gaming.",
    price: 50,
    icon: Gamepad,
    hasQuantity: true,
    quantity: 5,
  },
  {
    name: "Solitary Outing ✈️",
    description: "Take a refreshing walk in the physical world or enjoy a tea session offsite.",
    price: 100,
    icon: Compass,
    hasQuantity: false,
    quantity: null,
  },
  {
    name: "LoFi Pocket Cash 💸",
    description: "A minor cash reward or physical gift card reward for outstanding flow.",
    price: 200,
    icon: DollarSign,
    hasQuantity: true,
    quantity: 2,
  },
  {
    name: "Mechanical Keycap 🛍️",
    description: "A gorgeous single artisan resin mechanical keycap for your desk aesthetics.",
    price: 150,
    icon: Package,
    hasQuantity: true,
    quantity: 3,
  },
];

interface Reward {
  id: string;
  name: string;
  description: string | null;
  price: number;
  hasQuantity: boolean;
  quantity: number | null;
  duration: string | null;
  projectId: string | null;
  creatorId: string;
}

interface Redemption {
  id: string;
  userId: string;
  rewardId: string;
  projectId: string | null;
  cost: number;
  quantity: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  rejectionReason: string | null;
  createdAt: string;
  reward: Reward;
  user?: {
    id: string;
    name: string | null;
    email: string;
    avatar: string | null;
  };
}

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export function RewardsStore({
  projectId,
  projectName,
  isProjectAdmin = false,
  userProjects,
}: {
  projectId?: string;
  projectName?: string;
  projectCoinName?: string;
  projectCoinSymbol?: string;
  isProjectAdmin?: boolean;
  userProjects?: Array<{ id: string; name: string; isProjectAdmin: boolean }>;
}) {
  const router = useRouter();

  // Active state derived from selection
  const [activeProjectId, setActiveProjectId] = useState<string | undefined>(projectId);
  const [activeProjectName, setActiveProjectName] = useState<string | undefined>(projectName);
  const [activeIsProjectAdmin, setActiveIsProjectAdmin] = useState<boolean>(isProjectAdmin);

  // Tab state (global vs project)
  const [storeMode, setStoreMode] = useState<"global" | "project">(
    projectId ? "project" : "global"
  );

  // Balanced states
  const [balance, setBalance] = useState<number>(0);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // UI state toggles
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form states
  const [rewardName, setRewardName] = useState("");
  const [rewardDesc, setRewardDesc] = useState("");
  const [rewardPrice, setRewardPrice] = useState(10);
  const [rewardHasQuantity, setRewardHasQuantity] = useState(false);
  const [rewardQuantity, setRewardQuantity] = useState(5);
  const [rewardDuration, setRewardDuration] = useState("");

  // Rejection modal state
  const [rejectingRedemptionId, setRejectingRedemptionId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  // Sound triggering helper
  const playBell = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(880, audioContext.currentTime); // High pitch bell A5
      osc.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.05);

      gain.gain.setValueAtTime(0.08, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.6);

      osc.connect(gain);
      gain.connect(audioContext.destination);
      osc.start();
      osc.stop(audioContext.currentTime + 0.7);
    } catch (_) {}
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg(null);

      // Fetch user profile for coin balance
      const balanceRes = await fetch("/api/profile");
      if (balanceRes.ok) {
        const balanceData = await balanceRes.json();
        if (activeProjectId) {
          // If project scope, search the membership coin balance
          const projectMembership = balanceData.user.memberships?.find(
            (m: any) => m.projectId === activeProjectId
          );
          setBalance(projectMembership?.coins ?? 0);
        } else {
          // If global scope, search the global coins
          setBalance(balanceData.user.globalCoins ?? 0);
        }
      }

      // Fetch rewards
      const rewardsUrl = activeProjectId ? `/api/rewards?projectId=${activeProjectId}` : "/api/rewards";
      const rewardsRes = await fetch(rewardsUrl);
      if (rewardsRes.ok) {
        const rewardsData = await rewardsRes.json();
        setRewards(rewardsData.rewards ?? []);
      }

      // Fetch redemptions log
      const redemptionsUrl = activeProjectId
        ? `/api/rewards/redeem?projectId=${activeProjectId}`
        : "/api/rewards/redeem";
      const redemptionsRes = await fetch(redemptionsUrl);
      if (redemptionsRes.ok) {
        const redemptionsData = await redemptionsRes.json();
        setRedemptions(redemptionsData.redemptions ?? []);
      }

      // Fetch unread notifications
      const notificationsRes = await fetch("/api/notifications?unread=true");
      if (notificationsRes.ok) {
        const notificationsData = await notificationsRes.json();
        setNotifications(notificationsData.notifications ?? []);
      }
    } catch (err) {
      setErrorMsg("Failed to synchronize store data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [activeProjectId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Fill form using lofi presets
  function applyPreset(preset: typeof REWARD_PRESETS[0]) {
    setRewardName(preset.name);
    setRewardDesc(preset.description);
    setRewardPrice(preset.price);
    setRewardHasQuantity(preset.hasQuantity);
    if (preset.quantity) setRewardQuantity(preset.quantity);
  }

  // Handle Reward Creation
  async function handleCreateReward(e: React.FormEvent) {
    e.preventDefault();
    if (!rewardName.trim()) return;

    try {
      const res = await fetch("/api/rewards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: rewardName.trim(),
          description: rewardDesc.trim() || null,
          price: rewardPrice,
          hasQuantity: rewardHasQuantity,
          quantity: rewardHasQuantity ? rewardQuantity : null,
          duration: rewardDuration.trim() || null,
          projectId: activeProjectId || null,
        }),
      });

      if (res.ok) {
        setIsCreateOpen(false);
        // Reset states
        setRewardName("");
        setRewardDesc("");
        setRewardPrice(10);
        setRewardHasQuantity(false);
        setRewardQuantity(5);
        setRewardDuration("");
        // Reload
        await loadData();
      } else {
        const err = await res.json();
        setErrorMsg(err.error ?? "Failed to create reward.");
      }
    } catch (err) {
      setErrorMsg("Connection failure while creating reward.");
    }
  }

  // Handle Reward Redemption
  async function handleRedeem(rewardId: string) {
    try {
      const res = await fetch("/api/rewards/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rewardId }),
      });

      if (res.ok) {
        playBell();
        await loadData();
        router.refresh();
      } else {
        const err = await res.json();
        setErrorMsg(err.error ?? "Failed to redeem reward.");
      }
    } catch (err) {
      setErrorMsg("Redemption failed due to network error.");
    }
  }

  // Handle Approve (Project-level only)
  async function handleApprove(redemptionId: string) {
    try {
      const res = await fetch("/api/rewards/redeem", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          redemptionId,
          status: "APPROVED",
        }),
      });

      if (res.ok) {
        playBell();
        await loadData();
        router.refresh();
      } else {
        const err = await res.json();
        setErrorMsg(err.error ?? "Failed to approve redemption.");
      }
    } catch (err) {
      setErrorMsg("Network error during approval.");
    }
  }

  // Handle Reject (Project-level only)
  async function handleReject(e: React.FormEvent) {
    e.preventDefault();
    if (!rejectingRedemptionId) return;

    try {
      const res = await fetch("/api/rewards/redeem", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          redemptionId: rejectingRedemptionId,
          status: "REJECTED",
          rejectionReason: rejectionReason.trim() || null,
        }),
      });

      if (res.ok) {
        setRejectingRedemptionId(null);
        setRejectionReason("");
        await loadData();
        router.refresh();
      } else {
        const err = await res.json();
        setErrorMsg(err.error ?? "Failed to reject redemption.");
      }
    } catch (err) {
      setErrorMsg("Network error during rejection.");
    }
  }

  // Clear unread notifications
  async function handleClearNotifications() {
    try {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
      if (res.ok) {
        setNotifications([]);
      }
    } catch (_) {}
  }

  const pendingRedemptions = redemptions.filter((r) => r.status === "PENDING");
  const pastRedemptions = redemptions.filter((r) => r.status !== "PENDING");

  return (
    <div className="space-y-6">
      {/* SCOPE TAB SWITCHER (Only if userProjects is provided) */}
      {userProjects && userProjects.length > 0 && (
        <div className="flex flex-col gap-3 rounded-lg border border-white/10 bg-white/[0.02] p-3 sm:flex-row sm:items-center">
          <div className="flex rounded-md bg-ink-950/60 p-1 border border-white/5">
            <button
              onClick={() => {
                setStoreMode("global");
                setActiveProjectId(undefined);
                setActiveProjectName(undefined);
                setActiveIsProjectAdmin(false);
              }}
              className={cn(
                "rounded px-3 py-1.5 text-xs font-semibold transition-all",
                storeMode === "global"
                  ? "bg-dusk-lavender text-ink-950 shadow-sm"
                  : "text-stone-400 hover:text-stone-200"
              )}
            >
              My Rewards (ส่วนตัว ✨)
            </button>
            <button
              onClick={() => {
                setStoreMode("project");
                const firstProj = userProjects[0];
                setActiveProjectId(firstProj.id);
                setActiveProjectName(firstProj.name);
                setActiveIsProjectAdmin(firstProj.isProjectAdmin);
              }}
              className={cn(
                "rounded px-3 py-1.5 text-xs font-semibold transition-all",
                storeMode === "project"
                  ? "bg-dusk-lavender text-ink-950 shadow-sm"
                  : "text-stone-400 hover:text-stone-200"
              )}
            >
              Project Rewards (ทีมงาน 🪙)
            </button>
          </div>

          {storeMode === "project" && (
            <select
              value={activeProjectId || ""}
              onChange={(e) => {
                const proj = userProjects.find((p) => p.id === e.target.value);
                if (proj) {
                  setActiveProjectId(proj.id);
                  setActiveProjectName(proj.name);
                  setActiveIsProjectAdmin(proj.isProjectAdmin);
                }
              }}
              className="h-9 rounded-md border border-white/10 bg-ink-950/60 px-3 text-xs text-stone-100 outline-none transition focus:border-dusk-lavender/70 focus:ring-1 focus:ring-dusk-lavender/20"
            >
              {userProjects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} {p.isProjectAdmin ? "👑 (Admin)" : ""}
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      {/* HEADER WITH BALANCES AND WIDGETS */}
      <div className="flex flex-col justify-between gap-4 rounded-lg border border-white/10 bg-white/[0.02] p-5 lg:flex-row lg:items-center">
        <div>
          <div className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-dusk-amber" />
            <p className="text-xs uppercase tracking-[0.25em] text-dusk-amber">
              {activeProjectId ? "Team Rewards Store" : "Global Solitary Rewards"}
            </p>
          </div>
          <h2 className="mt-1 text-2xl font-bold text-stone-100">
            {activeProjectId ? `${activeProjectName} Store` : "My Personal Store"}
          </h2>
          <p className="text-xs text-stone-400">
            {activeProjectId
              ? "Redeem team-scoped rewards configured by project coordinators."
              : "Set up and redeem your own private milestones using personal coins."}
          </p>
        </div>

        {/* COIN BALANCE DISPLAY SHEET */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                if (showNotifications) handleClearNotifications();
              }}
              className="relative flex h-10 w-10 items-center justify-center rounded-md border border-white/10 bg-white/[0.04] text-stone-400 transition hover:border-dusk-lavender/50 hover:text-dusk-lavender"
              title="Notifications"
            >
              <Bell className="h-4 w-4" />
              {notifications.length > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-dusk-rose text-[9px] font-bold text-ink-950 animate-pulse">
                  {notifications.length}
                </span>
              )}
            </button>

            {/* Notifications Dropdown Panel */}
            {showNotifications && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowNotifications(false)} />
                <div className="absolute right-0 top-11 z-40 w-80 rounded-lg border border-white/10 bg-ink-950/95 p-4 shadow-xl backdrop-blur-md">
                  <div className="mb-2 flex items-center justify-between border-b border-white/5 pb-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-stone-300">
                      Notifications
                    </h4>
                    {notifications.length > 0 && (
                      <button
                        onClick={handleClearNotifications}
                        className="text-[10px] text-dusk-cyan hover:underline"
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                  <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                    {notifications.length === 0 ? (
                      <p className="py-4 text-center text-xs text-stone-500">
                        No new updates. All caught up!
                      </p>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className="rounded border border-white/5 bg-white/[0.02] p-2 text-xs"
                        >
                          <p className="font-semibold text-stone-200">{notif.title}</p>
                          <p className="mt-0.5 text-stone-400">{notif.message}</p>
                          <p className="mt-1 text-[9px] text-stone-600">
                            {new Date(notif.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* AMBER NIXIE BALANCES DISPLAY */}
          <div className="lofi-panel flex items-center gap-3 bg-ink-950 px-4 py-2 text-dusk-amber border-dusk-amber/30">
            <Coins className="h-5 w-5 text-dusk-amber animate-pulse" />
            <div>
              <p className="text-[10px] uppercase tracking-widest text-stone-400 font-mono">
                {activeProjectId ? "Project Balance" : "Global Balance"}
              </p>
              <div className="flex items-baseline gap-1">
                <span
                  className="font-mono text-2xl font-bold tracking-widest text-dusk-amber"
                  style={{ textShadow: "0 0 8px rgba(229, 189, 114, 0.8), 0 0 2px rgba(229, 189, 114, 1)" }}
                >
                  {balance.toString().padStart(4, "0")}
                </span>
                <span className="text-xs text-dusk-amber">{activeProjectId ? "🪙" : "✨"}</span>
              </div>
            </div>
          </div>

          {/* Add Reward Button (Only Project Admin or Global User) */}
          {(!activeProjectId || activeIsProjectAdmin) && (
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="h-4 w-4" />
              New Reward
            </Button>
          )}
        </div>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-300">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <p>{errorMsg}</p>
          <button onClick={() => setErrorMsg(null)} className="ml-auto text-xs hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* ADMIN moderation queue */}
      {activeProjectId && activeIsProjectAdmin && pendingRedemptions.length > 0 && (
        <div className="lofi-panel border-dusk-amber/30 rounded-lg p-5 bg-dusk-amber/5 animate-fadeIn">
          <div className="mb-4 flex items-center gap-2">
            <Inbox className="h-5 w-5 text-dusk-amber" />
            <h3 className="text-md font-semibold text-stone-100">
              Pending Redemptions Queue ({pendingRedemptions.length})
            </h3>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {pendingRedemptions.map((red) => (
              <div
                key={red.id}
                className="flex flex-col justify-between rounded-md border border-white/10 bg-ink-950/40 p-4"
              >
                <div>
                  <div className="flex items-center gap-2 border-b border-white/5 pb-2 mb-2">
                    <div className="h-6 w-6 overflow-hidden rounded-full bg-dusk-lavender/20 grid place-items-center text-[10px] font-bold text-dusk-lavender">
                      {red.user?.name ? red.user.name[0].toUpperCase() : "U"}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-stone-200">
                        {red.user?.name || red.user?.email}
                      </p>
                      <p className="text-[9px] text-stone-500">
                        {new Date(red.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <h4 className="font-semibold text-stone-200 text-sm">{red.reward.name}</h4>
                  <p className="text-xs text-stone-400 mt-1 line-clamp-2">
                    {red.reward.description ?? "No description provided."}
                  </p>
                  <p className="mt-2 text-xs font-mono text-dusk-amber font-semibold">
                    Cost: {red.cost} 🪙
                  </p>
                </div>
                <div className="mt-4 flex gap-2 pt-2 border-t border-white/5">
                  <Button
                    size="sm"
                    className="flex-1 bg-emerald-400 text-ink-950 hover:bg-emerald-300"
                    onClick={() => handleApprove(red.id)}
                  >
                    <Check className="h-3 w-3" /> Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    className="flex-1"
                    onClick={() => setRejectingRedemptionId(red.id)}
                  >
                    <X className="h-3 w-3" /> Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* REWARDS STORE GRID */}
      {loading ? (
        <div className="flex h-48 flex-col items-center justify-center gap-3">
          <svg className="h-8 w-8 animate-spin text-dusk-lavender" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          <p className="text-sm text-stone-500 font-mono">Syncing rewards list...</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-bold text-stone-200 mb-3">Available Items</h3>
            {rewards.length === 0 ? (
              <div className="rounded-lg border border-dashed border-white/10 p-8 text-center bg-white/[0.01]">
                <Gift className="mx-auto h-8 w-8 text-stone-600" />
                <h4 className="mt-3 text-sm font-semibold text-stone-400">No Rewards Catalogued</h4>
                <p className="mt-1 text-xs text-stone-500">
                  {(!activeProjectId || activeIsProjectAdmin)
                    ? "Click 'New Reward' above to create custom rewards or choose from lofi presets."
                    : "Wait for the project owner to build the reward catalogue."}
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {rewards.map((reward) => {
                  const isAffordable = balance >= reward.price;
                  const isOutOfStock =
                    reward.hasQuantity && reward.quantity !== null && reward.quantity < 1;

                  return (
                    <article
                      key={reward.id}
                      className="lofi-panel group flex flex-col justify-between rounded-lg p-5 transition hover:border-dusk-lavender/40 hover:bg-white/[0.01]"
                    >
                      <div>
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="text-md font-bold text-stone-100 group-hover:text-dusk-lavender transition-colors">
                            {reward.name}
                          </h4>
                          <span className="flex items-center gap-1 rounded bg-white/5 border border-white/10 px-2.5 py-0.5 text-xs font-semibold text-dusk-cyan">
                            {reward.price} {activeProjectId ? "🪙" : "✨"}
                          </span>
                        </div>
                        <p className="text-xs leading-relaxed text-stone-400">
                          {reward.description ?? "No description."}
                        </p>
                        {reward.duration && (
                          <p className="mt-2 text-[10px] text-stone-500 flex items-center gap-1">
                            <Clock className="h-3 w-3" /> Cooldown: {reward.duration}
                          </p>
                        )}
                      </div>

                      <div className="mt-5 border-t border-white/5 pt-4 flex items-center justify-between">
                        {reward.hasQuantity ? (
                          <span
                            className={`text-xs font-semibold ${
                              isOutOfStock ? "text-red-400" : "text-stone-500"
                            }`}
                          >
                            {isOutOfStock ? "Out of Stock" : `Stock: ${reward.quantity}`}
                          </span>
                        ) : (
                          <span className="text-[10px] uppercase tracking-wider text-stone-600 font-mono">
                            Unlimited Stock
                          </span>
                        )}

                        <Button
                          size="sm"
                          disabled={!isAffordable || isOutOfStock}
                          onClick={() => handleRedeem(reward.id)}
                          className={isAffordable && !isOutOfStock ? "shadow-glow" : ""}
                        >
                          {isOutOfStock ? "Sold Out" : isAffordable ? "Redeem" : "Locked"}
                        </Button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>

          {/* REDEMPTION LOG HISTORY */}
          {pastRedemptions.length > 0 && (
            <div className="animate-fadeIn">
              <h3 className="text-lg font-bold text-stone-200 mb-3">Redemption History</h3>
              <div className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.01]">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/5 text-stone-400 font-mono">
                      <th className="p-3">Item</th>
                      <th className="p-3">Cost</th>
                      {activeProjectId && <th className="p-3">User</th>}
                      <th className="p-3">Redeemed At</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {pastRedemptions.map((red) => (
                      <tr key={red.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="p-3 font-semibold text-stone-200">{red.reward.name}</td>
                        <td className="p-3 font-mono text-dusk-cyan">
                          {red.cost} {activeProjectId ? "🪙" : "✨"}
                        </td>
                        {activeProjectId && (
                          <td className="p-3 text-stone-400">
                            {red.user?.name || red.user?.email || "Anonymous"}
                          </td>
                        )}
                        <td className="p-3 text-stone-500">
                          {new Date(red.createdAt).toLocaleDateString()}{" "}
                          {new Date(red.createdAt).toLocaleTimeString()}
                        </td>
                        <td className="p-3">
                          <div className="flex flex-col gap-0.5">
                            <span
                              className={`inline-flex w-fit items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-bold ${
                                red.status === "APPROVED"
                                  ? "bg-emerald-400/10 text-emerald-400"
                                  : "bg-red-400/10 text-red-400"
                              }`}
                            >
                              {red.status === "APPROVED" ? (
                                <>
                                  <Check className="h-2.5 w-2.5" /> Approved
                                </>
                              ) : (
                                <>
                                  <X className="h-2.5 w-2.5" /> Rejected
                                </>
                              )}
                            </span>
                            {red.status === "REJECTED" && red.rejectionReason && (
                              <span className="text-[10px] text-stone-500">
                                Remark: {red.rejectionReason}
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* CREATE REWARD SIDE-PANEL / MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink-950/80 px-4 backdrop-blur-sm">
          <div className="lofi-panel w-full max-w-xl rounded-lg p-5 bg-ink-950 border-white/10 max-h-[90vh] overflow-y-auto animate-scaleUp">
            <div className="mb-4 flex items-center justify-between border-b border-white/5 pb-3">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-dusk-amber font-mono">
                  Catalog Editor
                </p>
                <h2 className="text-xl font-bold text-stone-100">Create Custom Reward</h2>
              </div>
              <button
                className="rounded-md p-1.5 text-stone-400 hover:bg-white/10 hover:text-stone-100"
                onClick={() => setIsCreateOpen(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* PRESETS BUTTONS ROW */}
            <div className="mb-5">
              <label className="block text-[11px] uppercase tracking-wider text-stone-500 font-mono mb-2">
                Quick Start Presets
              </label>
              <div className="flex flex-wrap gap-1.5">
                {REWARD_PRESETS.map((preset, index) => {
                  const Icon = preset.icon;
                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => applyPreset(preset)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-stone-300 transition hover:border-dusk-lavender/50 hover:bg-dusk-lavender/10 hover:scale-105 active:scale-95 duration-150"
                    >
                      <Icon className="h-3 w-3 text-dusk-cyan" />
                      {preset.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <form onSubmit={handleCreateReward} className="space-y-4">
              <label className="block space-y-1.5">
                <span className="text-xs uppercase tracking-wider text-stone-400 font-mono">
                  Reward Title
                </span>
                <Input
                  placeholder="e.g. Starbucks Treat ☕"
                  value={rewardName}
                  onChange={(e) => setRewardName(e.target.value)}
                  required
                  maxLength={120}
                />
              </label>

              <label className="block space-y-1.5">
                <span className="text-xs uppercase tracking-wider text-stone-400 font-mono">
                  Description
                </span>
                <Textarea
                  placeholder="Details of the reward and how to redeem it..."
                  value={rewardDesc}
                  onChange={(e) => setRewardDesc(e.target.value)}
                  className="resize-none"
                  maxLength={500}
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="block space-y-1.5">
                  <span className="text-xs uppercase tracking-wider text-stone-400 font-mono">
                    Cost ({activeProjectId ? "Project Coins" : "Global Coins"})
                  </span>
                  <Input
                    type="number"
                    min={1}
                    value={rewardPrice}
                    onChange={(e) => setRewardPrice(Math.max(1, parseInt(e.target.value) || 1))}
                    required
                  />
                </label>

                <label className="block space-y-1.5">
                  <span className="text-xs uppercase tracking-wider text-stone-400 font-mono">
                    Cooldown Duration (Optional)
                  </span>
                  <Input
                    placeholder="e.g. Once per week"
                    value={rewardDuration}
                    onChange={(e) => setRewardDuration(e.target.value)}
                  />
                </label>
              </div>

              {/* STOCK CONTROLLER TOGGLE */}
              <div className="rounded border border-white/5 bg-white/[0.02] p-3 space-y-3">
                <label className="flex cursor-pointer items-center justify-between">
                  <span className="text-xs font-semibold text-stone-300">Limit Stock Stockpile</span>
                  <input
                    type="checkbox"
                    checked={rewardHasQuantity}
                    onChange={(e) => setRewardHasQuantity(e.target.checked)}
                    className="h-4 w-4 accent-dusk-lavender cursor-pointer"
                  />
                </label>
                {rewardHasQuantity && (
                  <label className="block space-y-1.5 animate-fadeIn">
                    <span className="text-xs uppercase tracking-wider text-stone-400 font-mono">
                      Quantity Available
                    </span>
                    <Input
                      type="number"
                      min={0}
                      value={rewardQuantity}
                      onChange={(e) =>
                        setRewardQuantity(Math.max(0, parseInt(e.target.value) || 0))
                      }
                      required
                    />
                  </label>
                )}
              </div>

              <div className="mt-6 flex justify-end gap-2 border-t border-white/5 pt-4">
                <Button type="button" variant="ghost" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button disabled={!rewardName.trim()}>Save Reward</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REJECT WITH COMMENT MODAL */}
      {rejectingRedemptionId && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink-950/80 px-4 backdrop-blur-sm">
          <form
            onSubmit={handleReject}
            className="lofi-panel w-full max-w-md rounded-lg p-5 bg-ink-950 border-red-500/20"
          >
            <div className="mb-4 flex items-center justify-between border-b border-white/5 pb-3">
              <h2 className="text-md font-bold text-red-300">Reject Redemption Request</h2>
              <button
                type="button"
                className="rounded-md p-1.5 text-stone-400 hover:bg-white/10 hover:text-stone-100"
                onClick={() => {
                  setRejectingRedemptionId(null);
                  setRejectionReason("");
                }}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-xs text-stone-400 mb-4">
              Providing a reason helps the user understand why the request was turned down. The coins
              spent will be refunded immediately.
            </p>
            <label className="block space-y-1.5">
              <span className="text-xs uppercase tracking-wider text-stone-400 font-mono">
                Rejection Reason / Remark
              </span>
              <Textarea
                placeholder="e.g. Out of stock at our office, please request alternative..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                required
                maxLength={500}
                className="resize-none"
              />
            </label>
            <div className="mt-5 flex justify-end gap-2 border-t border-white/5 pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setRejectingRedemptionId(null);
                  setRejectionReason("");
                }}
              >
                Cancel
              </Button>
              <Button variant="danger" disabled={!rejectionReason.trim()}>
                Reject & Refund
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
