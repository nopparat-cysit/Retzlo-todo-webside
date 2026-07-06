"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Bell,
  Check,
  CheckCircle2,
  Clock,
  Coins,
  Gift,
  Inbox,
  PackageOpen,
  Plus,
  Search,
  Sparkles,
  Store,
  X
} from "lucide-react";

import { AppModal } from "@/components/ui/app-modal";
import { Button } from "@/components/ui/button";
import { FilterSelect } from "@/components/ui/filter-select";
import { Input, Textarea } from "@/components/ui/input";
import { formatMediumDate } from "@/lib/date-format";
import { getRewardIconForName, getRewardIconOption, rewardIconOptions } from "@/lib/rewards/reward-icons";
import { cn } from "@/lib/utils";

const defaultRewardIcon = getRewardIconOption("gift");
const coinRewardIcon = getRewardIconOption("coin-reward");
const walletRewardIcon = getRewardIconOption("reward-wallet");
const emptyRewardIcon = getRewardIconOption("reward-treasure");

const REWARD_PRESETS = [
  {
    name: "Coffee Break",
    description: "A warm drink break to recharge after finishing focused work.",
    price: 10,
    iconSrc: getRewardIconOption("coffee-cup").src,
    hasQuantity: false,
    quantity: null
  },
  {
    name: "Gaming Session",
    description: "Unwind with 30 minutes of cozy games after a productive run.",
    price: 50,
    iconSrc: getRewardIconOption("reward-game").src,
    hasQuantity: true,
    quantity: 5
  },
  {
    name: "Movie Ticket",
    description: "Trade coins for a movie night or a streaming watch pass.",
    price: 100,
    iconSrc: getRewardIconOption("reward-ticket").src,
    hasQuantity: true,
    quantity: 3
  },
  {
    name: "Pocket Cash",
    description: "A small cash or gift-card reward for a strong week.",
    price: 200,
    iconSrc: walletRewardIcon.src,
    hasQuantity: true,
    quantity: 2
  },
  {
    name: "Rest Pass",
    description: "A calm recovery window for chores, sleep, or quiet time.",
    price: 80,
    iconSrc: getRewardIconOption("reward-rest-pillow").src,
    hasQuantity: false,
    quantity: null
  }
] as const;

interface Reward {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
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

type CatalogFilter = "all" | "affordable" | "team" | "global";

export function RewardsStore({
  projectId,
  projectName,
  isProjectAdmin = false,
  userProjects
}: {
  projectId?: string;
  projectName?: string;
  projectCoinName?: string;
  projectCoinSymbol?: string;
  isProjectAdmin?: boolean;
  userProjects?: Array<{ id: string; name: string; isProjectAdmin: boolean }>;
}) {
  const router = useRouter();
  const [activeProjectId, setActiveProjectId] = useState<string | undefined>(projectId);
  const [activeProjectName, setActiveProjectName] = useState<string | undefined>(projectName);
  const [activeIsProjectAdmin, setActiveIsProjectAdmin] = useState<boolean>(isProjectAdmin);
  const [storeMode, setStoreMode] = useState<"global" | "project">(projectId ? "project" : "global");

  const [balance, setBalance] = useState(0);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const [catalogFilter, setCatalogFilter] = useState<CatalogFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [rewardName, setRewardName] = useState("");
  const [rewardDesc, setRewardDesc] = useState("");
  const [rewardPrice, setRewardPrice] = useState(10);
  const [rewardHasQuantity, setRewardHasQuantity] = useState(false);
  const [rewardQuantity, setRewardQuantity] = useState(5);
  const [rewardDuration, setRewardDuration] = useState("");
  const [rewardIconSrc, setRewardIconSrc] = useState<string>(defaultRewardIcon.src);

  const [rejectingRedemptionId, setRejectingRedemptionId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const activeScopeLabel = activeProjectId ? activeProjectName ?? "Project" : "Personal";
  const balanceLabel = activeProjectId ? "Team Coins" : "Global Coins";
  const coinSymbol = activeProjectId ? "coin" : "spark";
  const canManageRewards = !activeProjectId || activeIsProjectAdmin;

  const pendingRedemptions = useMemo(
    () => redemptions.filter((redemption) => redemption.status === "PENDING"),
    [redemptions]
  );
  const pastRedemptions = useMemo(
    () => redemptions.filter((redemption) => redemption.status !== "PENDING"),
    [redemptions]
  );

  const filteredRewards = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return rewards.filter((reward) => {
      const isAffordable = balance >= reward.price;
      const matchesSearch =
        !normalizedSearch ||
        reward.name.toLowerCase().includes(normalizedSearch) ||
        (reward.description ?? "").toLowerCase().includes(normalizedSearch);
      const matchesFilter =
        catalogFilter === "all" ||
        (catalogFilter === "affordable" && isAffordable) ||
        (catalogFilter === "team" && Boolean(reward.projectId)) ||
        (catalogFilter === "global" && !reward.projectId);

      return matchesSearch && matchesFilter;
    });
  }, [balance, catalogFilter, rewards, searchQuery]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg(null);

      const balanceRes = await fetch("/api/profile");
      if (balanceRes.ok) {
        const balanceData = (await balanceRes.json()) as {
          user: { globalCoins?: number; memberships?: Array<{ projectId: string; coins: number }> };
        };

        if (activeProjectId) {
          const projectMembership = balanceData.user.memberships?.find(
            (membership) => membership.projectId === activeProjectId
          );
          setBalance(projectMembership?.coins ?? 0);
        } else {
          setBalance(balanceData.user.globalCoins ?? 0);
        }
      }

      const rewardsUrl = activeProjectId ? `/api/rewards?projectId=${activeProjectId}` : "/api/rewards";
      const rewardsRes = await fetch(rewardsUrl);
      if (rewardsRes.ok) {
        const rewardsData = (await rewardsRes.json()) as { rewards?: Reward[] };
        setRewards(rewardsData.rewards ?? []);
      }

      const redemptionsUrl = activeProjectId
        ? `/api/rewards/redeem?projectId=${activeProjectId}`
        : "/api/rewards/redeem";
      const redemptionsRes = await fetch(redemptionsUrl);
      if (redemptionsRes.ok) {
        const redemptionsData = (await redemptionsRes.json()) as { redemptions?: Redemption[] };
        setRedemptions(redemptionsData.redemptions ?? []);
      }

      const notificationsRes = await fetch("/api/notifications?unread=true");
      if (notificationsRes.ok) {
        const notificationsData = (await notificationsRes.json()) as { notifications?: Notification[] };
        setNotifications(notificationsData.notifications ?? []);
      }
    } catch {
      setErrorMsg("Failed to sync rewards. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [activeProjectId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  function playBell() {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContextClass();
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(880, audioContext.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.05);
      gain.gain.setValueAtTime(0.08, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.6);
      osc.connect(gain);
      gain.connect(audioContext.destination);
      osc.start();
      osc.stop(audioContext.currentTime + 0.7);
    } catch {}
  }

  function applyPreset(preset: (typeof REWARD_PRESETS)[number]) {
    setRewardName(preset.name);
    setRewardDesc(preset.description);
    setRewardPrice(preset.price);
    setRewardHasQuantity(preset.hasQuantity);
    setRewardQuantity(preset.quantity ?? 5);
    setRewardIconSrc(preset.iconSrc);
  }

  async function handleCreateReward(event: React.FormEvent) {
    event.preventDefault();
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
          image: rewardIconSrc,
          projectId: activeProjectId || null
        })
      });

      if (res.ok) {
        setIsCreateOpen(false);
        setRewardName("");
        setRewardDesc("");
        setRewardPrice(10);
        setRewardHasQuantity(false);
        setRewardQuantity(5);
        setRewardDuration("");
        setRewardIconSrc(defaultRewardIcon.src);
        await loadData();
      } else {
        const err = (await res.json()) as { error?: string };
        setErrorMsg(err.error ?? "Failed to create reward.");
      }
    } catch {
      setErrorMsg("Connection failure while creating reward.");
    }
  }

  async function handleRedeem(rewardId: string) {
    try {
      const res = await fetch("/api/rewards/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rewardId })
      });

      if (res.ok) {
        playBell();
        await loadData();
        router.refresh();
      } else {
        const err = (await res.json()) as { error?: string };
        setErrorMsg(err.error ?? "Failed to redeem reward.");
      }
    } catch {
      setErrorMsg("Redemption failed due to network error.");
    }
  }

  async function handleApprove(redemptionId: string) {
    try {
      const res = await fetch("/api/rewards/redeem", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ redemptionId, status: "APPROVED" })
      });

      if (res.ok) {
        playBell();
        await loadData();
        router.refresh();
      } else {
        const err = (await res.json()) as { error?: string };
        setErrorMsg(err.error ?? "Failed to approve redemption.");
      }
    } catch {
      setErrorMsg("Network error during approval.");
    }
  }

  async function handleReject(event: React.FormEvent) {
    event.preventDefault();
    if (!rejectingRedemptionId) return;

    try {
      const res = await fetch("/api/rewards/redeem", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          redemptionId: rejectingRedemptionId,
          status: "REJECTED",
          rejectionReason: rejectionReason.trim() || null
        })
      });

      if (res.ok) {
        setRejectingRedemptionId(null);
        setRejectionReason("");
        await loadData();
        router.refresh();
      } else {
        const err = (await res.json()) as { error?: string };
        setErrorMsg(err.error ?? "Failed to reject redemption.");
      }
    } catch {
      setErrorMsg("Network error during rejection.");
    }
  }

  async function handleClearNotifications() {
    try {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true })
      });
      if (res.ok) setNotifications([]);
    } catch {}
  }

  return (
    <div className="space-y-5">
      <section className="lofi-panel overflow-visible rounded-xl p-4 sm:p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-dusk-amber">
              <Gift className="h-4 w-4" />
              Reward Exchange
            </div>
            <h2 className="mt-2 text-2xl font-semibold text-stone-100">
              {activeProjectId ? `${activeScopeLabel} rewards` : "Personal rewards"}
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-stone-400">
              Redeem cozy milestones, review requests, and keep the reward catalog tidy.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <StatPill label={balanceLabel} value={balance.toString()} tone="coin" />
            <StatPill label="Pending" value={pendingRedemptions.length.toString()} tone="rose" />
            <StatPill label="Redeemed" value={pastRedemptions.length.toString()} tone="cyan" />
            {canManageRewards ? (
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="h-4 w-4" />
                New Reward
              </Button>
            ) : null}
          </div>
        </div>

        {userProjects && userProjects.length > 0 ? (
          <div className="mt-5 flex flex-col gap-3 border-t border-white/10 pt-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="inline-flex w-fit rounded-lg border border-white/10 bg-ink-950/55 p-1">
              <ScopeButton
                active={storeMode === "global"}
                label="Global"
                onClick={() => {
                  setStoreMode("global");
                  setActiveProjectId(undefined);
                  setActiveProjectName(undefined);
                  setActiveIsProjectAdmin(false);
                  setCatalogFilter("all");
                }}
              />
              <ScopeButton
                active={storeMode === "project"}
                label="Team"
                onClick={() => {
                  setStoreMode("project");
                  const firstProject = userProjects[0];
                  setActiveProjectId(firstProject.id);
                  setActiveProjectName(firstProject.name);
                  setActiveIsProjectAdmin(firstProject.isProjectAdmin);
                  setCatalogFilter("all");
                }}
              />
            </div>

            {storeMode === "project" ? (
              <div className="w-full max-w-sm">
                <FilterSelect
                  value={activeProjectId || ""}
                  options={userProjects.map((project) => ({
                    value: project.id,
                    label: `${project.name}${project.isProjectAdmin ? " (Admin)" : ""}`
                  }))}
                  onValueChange={(projectId) => {
                    const project = userProjects.find((item) => item.id === projectId);
                    if (!project) return;
                    setActiveProjectId(project.id);
                    setActiveProjectName(project.name);
                    setActiveIsProjectAdmin(project.isProjectAdmin);
                  }}
                />
              </div>
            ) : null}
          </div>
        ) : null}
      </section>

      {errorMsg ? (
        <div className="flex items-center gap-2 rounded-lg border border-red-300/20 bg-red-400/10 p-3 text-sm text-red-200">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <p>{errorMsg}</p>
          <button className="ml-auto text-xs text-red-100/80 hover:text-red-100" onClick={() => setErrorMsg(null)}>
            Dismiss
          </button>
        </div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[18rem_minmax(0,1fr)_20rem]">
        <aside className="space-y-4">
          <section className="lofi-panel rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-dusk-amber">My Wallet</p>
                <p className="mt-2 text-4xl font-semibold text-stone-100">{balance}</p>
                <p className="text-xs text-stone-500">{balanceLabel}</p>
              </div>
              <div className="grid h-16 w-16 place-items-center rounded-xl border border-dusk-amber/20 bg-dusk-amber/10">
                <RewardIcon src={coinSymbol === "coin" ? coinRewardIcon.src : walletRewardIcon.src} label="Balance" size="lg" />
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              <WalletMetric label="Available" value={filteredRewards.length.toString()} />
              <WalletMetric label="Requests" value={pendingRedemptions.length.toString()} />
            </div>
          </section>

          <section className="lofi-panel rounded-xl p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.2em] text-stone-400">Notifications</p>
              <button
                type="button"
                className="relative grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-white/[0.045] text-stone-300 transition hover:border-dusk-lavender/45 hover:text-dusk-lavender"
                onClick={() => setShowNotifications((value) => !value)}
              >
                <Bell className="h-4 w-4" />
                {notifications.length > 0 ? (
                  <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-dusk-rose px-1 text-[9px] font-bold text-ink-950">
                    {notifications.length}
                  </span>
                ) : null}
              </button>
            </div>
            {showNotifications ? (
              <div className="mt-3 space-y-2">
                {notifications.length === 0 ? (
                  <p className="rounded-lg border border-white/10 bg-white/[0.035] p-3 text-xs text-stone-500">
                    No new reward updates.
                  </p>
                ) : (
                  notifications.slice(0, 4).map((notification) => (
                    <div key={notification.id} className="rounded-lg border border-white/10 bg-white/[0.035] p-3">
                      <p className="text-xs font-semibold text-stone-200">{notification.title}</p>
                      <p className="mt-1 line-clamp-2 text-xs text-stone-500">{notification.message}</p>
                    </div>
                  ))
                )}
                {notifications.length > 0 ? (
                  <Button className="w-full" size="sm" variant="ghost" onClick={handleClearNotifications}>
                    Clear updates
                  </Button>
                ) : null}
              </div>
            ) : null}
          </section>
        </aside>

        <section className="lofi-panel rounded-xl p-4 sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-dusk-lavender">
                <Store className="h-4 w-4" />
                Catalog
              </div>
              <h3 className="mt-1 text-xl font-semibold text-stone-100">Reward catalog</h3>
            </div>
            <label className="relative block w-full lg:max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
              <Input
                className="pl-9"
                placeholder="Search rewards..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </label>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {([
              ["all", "All"],
              ["affordable", "Affordable"],
              ["team", "Team"],
              ["global", "Global"]
            ] as const).map(([value, label]) => (
              <button
                key={value}
                className={cn(
                  "rounded-lg border px-3 py-1.5 text-xs font-medium transition",
                  catalogFilter === value
                    ? "border-dusk-lavender/50 bg-dusk-lavender/20 text-dusk-lavender"
                    : "border-white/10 bg-white/[0.035] text-stone-400 hover:border-white/20 hover:text-stone-200"
                )}
                onClick={() => setCatalogFilter(value)}
                type="button"
              >
                {label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="grid min-h-[22rem] place-items-center text-sm text-stone-500">
              Syncing rewards...
            </div>
          ) : filteredRewards.length === 0 ? (
            <div className="mt-5 grid min-h-[22rem] place-items-center rounded-xl border border-dashed border-white/12 bg-white/[0.02] p-8 text-center">
              <div>
                <RewardIcon src={emptyRewardIcon.src} label="Empty catalog" size="xl" />
                <h4 className="mt-3 text-base font-semibold text-stone-200">No rewards here yet</h4>
                <p className="mt-1 max-w-sm text-sm text-stone-500">
                  {canManageRewards ? "Create a reward or choose a preset to seed the catalog." : "The owner has not added rewards in this scope yet."}
                </p>
                {canManageRewards ? (
                  <Button className="mt-4" onClick={() => setIsCreateOpen(true)}>
                    <Plus className="h-4 w-4" />
                    New Reward
                  </Button>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="mt-5 grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
              {filteredRewards.map((reward) => (
                <RewardCard
                  key={reward.id}
                  activeProjectId={activeProjectId}
                  balance={balance}
                  reward={reward}
                  onRedeem={handleRedeem}
                />
              ))}
            </div>
          )}
        </section>

        <aside className="space-y-4">
          <section className="lofi-panel rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-dusk-amber">Pending</p>
                <h3 className="mt-1 text-lg font-semibold text-stone-100">Approval queue</h3>
              </div>
              <Inbox className="h-5 w-5 text-dusk-amber" />
            </div>

            <div className="mt-4 space-y-3">
              {pendingRedemptions.length === 0 ? (
                <EmptySmall text="No pending redemptions." />
              ) : (
                pendingRedemptions.slice(0, 5).map((redemption) => (
                  <PendingItem
                    key={redemption.id}
                    isAdmin={Boolean(activeProjectId && activeIsProjectAdmin)}
                    redemption={redemption}
                    onApprove={handleApprove}
                    onReject={setRejectingRedemptionId}
                  />
                ))
              )}
            </div>
          </section>

          <section className="lofi-panel rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-dusk-cyan">Recent</p>
                <h3 className="mt-1 text-lg font-semibold text-stone-100">Redemptions</h3>
              </div>
              <CheckCircle2 className="h-5 w-5 text-dusk-cyan" />
            </div>
            <div className="mt-4 space-y-2">
              {pastRedemptions.length === 0 ? (
                <EmptySmall text="No completed redemptions yet." />
              ) : (
                pastRedemptions.slice(0, 6).map((redemption) => (
                  <HistoryItem key={redemption.id} redemption={redemption} />
                ))
              )}
            </div>
          </section>
        </aside>
      </div>

      {isCreateOpen ? (
        <CreateRewardModal
          activeProjectId={activeProjectId}
          rewardDesc={rewardDesc}
          rewardDuration={rewardDuration}
          rewardHasQuantity={rewardHasQuantity}
          rewardIconSrc={rewardIconSrc}
          rewardName={rewardName}
          rewardPrice={rewardPrice}
          rewardQuantity={rewardQuantity}
          onApplyPreset={applyPreset}
          onClose={() => setIsCreateOpen(false)}
          onDescriptionChange={setRewardDesc}
          onDurationChange={setRewardDuration}
          onHasQuantityChange={setRewardHasQuantity}
          onNameChange={setRewardName}
          onPriceChange={setRewardPrice}
          onQuantityChange={setRewardQuantity}
          onRewardIconChange={setRewardIconSrc}
          onSubmit={handleCreateReward}
        />
      ) : null}

      {rejectingRedemptionId ? (
        <RejectRewardModal
          rejectionReason={rejectionReason}
          onClose={() => {
            setRejectingRedemptionId(null);
            setRejectionReason("");
          }}
          onReasonChange={setRejectionReason}
          onSubmit={handleReject}
        />
      ) : null}
    </div>
  );
}

function RewardIcon({ label, size = "md", src }: { label: string; size?: "sm" | "md" | "lg" | "xl"; src: string }) {
  const dimensions = {
    sm: "h-9 w-9",
    md: "h-12 w-12",
    lg: "h-14 w-14",
    xl: "h-20 w-20"
  };

  return (
    <span className={cn("inline-grid place-items-center", dimensions[size])}>
      <Image alt={label} className="h-full w-full object-contain" height={96} src={`${src}?v=20260621-rewards`} width={96} />
    </span>
  );
}

function StatPill({ label, tone, value }: { label: string; tone: "coin" | "rose" | "cyan"; value: string }) {
  return (
    <div
      className={cn(
        "rounded-lg border px-3 py-2",
        tone === "coin" && "border-dusk-amber/20 bg-dusk-amber/10 text-dusk-amber",
        tone === "rose" && "border-dusk-rose/20 bg-dusk-rose/10 text-dusk-rose",
        tone === "cyan" && "border-dusk-cyan/20 bg-dusk-cyan/10 text-dusk-cyan"
      )}
    >
      <p className="text-[10px] uppercase tracking-[0.18em] opacity-75">{label}</p>
      <p className="text-lg font-semibold text-stone-100">{value}</p>
    </div>
  );
}

function ScopeButton({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      className={cn(
        "rounded-md px-3 py-1.5 text-xs font-semibold transition",
        active ? "bg-dusk-lavender text-ink-950" : "text-stone-400 hover:text-stone-100"
      )}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}

function WalletMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.035] p-2">
      <p className="text-[10px] uppercase tracking-[0.16em] text-stone-500">{label}</p>
      <p className="mt-1 text-base font-semibold text-stone-100">{value}</p>
    </div>
  );
}

function RewardCard({
  activeProjectId,
  balance,
  onRedeem,
  reward
}: {
  activeProjectId?: string;
  balance: number;
  onRedeem: (rewardId: string) => void;
  reward: Reward;
}) {
  const isAffordable = balance >= reward.price;
  const isOutOfStock = reward.hasQuantity && reward.quantity !== null && reward.quantity < 1;
  const icon = getRewardIconForName(reward.name);
  const iconSrc = reward.image || icon.src;

  return (
    <article className="group flex min-h-[13.5rem] flex-col justify-between rounded-xl border border-white/10 bg-white/[0.035] p-4 transition hover:-translate-y-0.5 hover:border-dusk-lavender/35 hover:bg-white/[0.055]">
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl border border-white/10 bg-ink-950/35">
            <RewardIcon label={icon.label} src={iconSrc} />
          </div>
          <span className="inline-flex items-center gap-1 rounded-lg border border-dusk-amber/20 bg-dusk-amber/10 px-2 py-1 text-xs font-semibold text-dusk-amber">
            <Coins className="h-3 w-3" />
            {reward.price}
          </span>
        </div>
        <h4 className="mt-3 line-clamp-1 text-base font-semibold text-stone-100">{reward.name}</h4>
        <p className="mt-1 line-clamp-2 text-sm leading-6 text-stone-400">{reward.description ?? "No description."}</p>
      </div>

      <div className="mt-4 space-y-3 border-t border-white/10 pt-3">
        <div className="flex flex-wrap gap-2">
          {reward.duration ? (
            <span className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/[0.035] px-2 py-1 text-[11px] text-stone-400">
              <Clock className="h-3 w-3" />
              {reward.duration}
            </span>
          ) : null}
          <span
            className={cn(
              "rounded-md border px-2 py-1 text-[11px]",
              isOutOfStock
                ? "border-red-300/20 bg-red-400/10 text-red-300"
                : "border-white/10 bg-white/[0.035] text-stone-400"
            )}
          >
            {reward.hasQuantity ? (isOutOfStock ? "Out of stock" : `Stock ${reward.quantity}`) : "Unlimited"}
          </span>
          <span className="rounded-md border border-white/10 bg-white/[0.035] px-2 py-1 text-[11px] text-stone-400">
            {activeProjectId ? "Team" : reward.projectId ? "Team" : "Global"}
          </span>
        </div>

        <Button
          className="w-full"
          disabled={!isAffordable || isOutOfStock}
          size="sm"
          variant={isAffordable && !isOutOfStock ? "primary" : "secondary"}
          onClick={() => onRedeem(reward.id)}
        >
          {isOutOfStock ? "Sold Out" : isAffordable ? "Redeem" : "Locked"}
        </Button>
      </div>
    </article>
  );
}

function PendingItem({
  isAdmin,
  onApprove,
  onReject,
  redemption
}: {
  isAdmin: boolean;
  onApprove: (redemptionId: string) => void;
  onReject: (redemptionId: string) => void;
  redemption: Redemption;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.035] p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="line-clamp-1 text-sm font-semibold text-stone-100">{redemption.reward.name}</p>
          <p className="mt-1 text-xs text-stone-500">{redemption.user?.name || redemption.user?.email || "Member"}</p>
        </div>
        <span className="rounded-md bg-dusk-amber/10 px-2 py-1 text-xs text-dusk-amber">{redemption.cost}</span>
      </div>
      {isAdmin ? (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Button size="sm" onClick={() => onApprove(redemption.id)}>
            <Check className="h-3 w-3" />
            Approve
          </Button>
          <Button size="sm" variant="danger" onClick={() => onReject(redemption.id)}>
            <X className="h-3 w-3" />
            Reject
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function HistoryItem({ redemption }: { redemption: Redemption }) {
  const isApproved = redemption.status === "APPROVED";

  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="line-clamp-1 text-sm font-medium text-stone-200">{redemption.reward.name}</p>
          <p className="mt-1 text-[11px] text-stone-500">{formatMediumDate(redemption.createdAt)}</p>
        </div>
        <span
          className={cn(
            "rounded-md px-2 py-1 text-[10px] font-semibold",
            isApproved ? "bg-emerald-400/10 text-emerald-300" : "bg-red-400/10 text-red-300"
          )}
        >
          {isApproved ? "Approved" : "Rejected"}
        </span>
      </div>
      {redemption.rejectionReason ? (
        <p className="mt-2 line-clamp-2 text-xs text-stone-500">{redemption.rejectionReason}</p>
      ) : null}
    </div>
  );
}

function EmptySmall({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-4 text-center">
      <PackageOpen className="mx-auto h-5 w-5 text-stone-600" />
      <p className="mt-2 text-xs text-stone-500">{text}</p>
    </div>
  );
}

function CreateRewardModal({
  activeProjectId,
  onApplyPreset,
  onClose,
  onDescriptionChange,
  onDurationChange,
  onHasQuantityChange,
  onNameChange,
  onPriceChange,
  onQuantityChange,
  onRewardIconChange,
  onSubmit,
  rewardDesc,
  rewardDuration,
  rewardHasQuantity,
  rewardIconSrc,
  rewardName,
  rewardPrice,
  rewardQuantity
}: {
  activeProjectId?: string;
  onApplyPreset: (preset: (typeof REWARD_PRESETS)[number]) => void;
  onClose: () => void;
  onDescriptionChange: (value: string) => void;
  onDurationChange: (value: string) => void;
  onHasQuantityChange: (value: boolean) => void;
  onNameChange: (value: string) => void;
  onPriceChange: (value: number) => void;
  onQuantityChange: (value: number) => void;
  onRewardIconChange: (value: string) => void;
  onSubmit: (event: React.FormEvent) => void;
  rewardDesc: string;
  rewardDuration: string;
  rewardHasQuantity: boolean;
  rewardIconSrc: string;
  rewardName: string;
  rewardPrice: number;
  rewardQuantity: number;
}) {
  const selectedIcon = rewardIconOptions.find((icon) => icon.src === rewardIconSrc) ?? defaultRewardIcon;

  return (
    <AppModal
      open
      onClose={onClose}
      labelledBy="create-reward-title"
      contentClassName="max-w-3xl"
    >
      <form className="lofi-panel w-full max-w-3xl rounded-xl p-5" onSubmit={onSubmit}>
        <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-dusk-amber">Catalog editor</p>
            <h2 id="create-reward-title" className="mt-1 text-xl font-semibold text-stone-100">Create reward</h2>
          </div>
          <button className="rounded-lg p-2 text-stone-400 hover:bg-white/10 hover:text-stone-100" type="button" onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-stone-500">Quick presets</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {REWARD_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  className="rounded-xl border border-white/10 bg-white/[0.035] p-3 text-left transition hover:border-dusk-lavender/35 hover:bg-white/[0.055]"
                  type="button"
                  onClick={() => onApplyPreset(preset)}
                >
                  <RewardIcon label={preset.name} size="sm" src={preset.iconSrc} />
                  <p className="mt-2 text-xs font-semibold text-stone-100">{preset.name}</p>
                  <p className="mt-1 text-[11px] text-stone-500">{preset.price} coins</p>
                </button>
              ))}
            </div>

            <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.025] p-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-stone-500">Reward icon</p>
                  <p className="mt-1 text-xs text-stone-400">{selectedIcon.label}</p>
                </div>
                <RewardIcon label={selectedIcon.label} size="sm" src={selectedIcon.src} />
              </div>
              <div className="mt-3 grid max-h-48 grid-cols-5 gap-2 overflow-y-auto pr-1 scrollbar-soft">
                {rewardIconOptions.map((icon) => (
                  <button
                    key={icon.id}
                    aria-label={`Use ${icon.label} icon`}
                    className={cn(
                      "grid h-11 w-full place-items-center rounded-lg border bg-ink-950/35 transition hover:-translate-y-0.5 hover:border-dusk-lavender/45 hover:bg-white/[0.06]",
                      icon.src === rewardIconSrc
                        ? "border-dusk-amber bg-dusk-amber/10 shadow-[0_0_0_2px_rgba(249,199,132,0.18)]"
                        : "border-white/10"
                    )}
                    title={icon.label}
                    type="button"
                    onClick={() => onRewardIconChange(icon.src)}
                  >
                    <Image
                      alt=""
                      aria-hidden="true"
                      className="h-8 w-8 object-contain"
                      height={40}
                      src={`${icon.src}?v=20260621-rewards`}
                      width={40}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block space-y-1.5">
              <span className="text-xs uppercase tracking-[0.16em] text-stone-400">Reward title</span>
              <Input
                maxLength={120}
                placeholder="Coffee Break"
                required
                value={rewardName}
                onChange={(event) => onNameChange(event.target.value)}
              />
            </label>

            <label className="block space-y-1.5">
              <span className="text-xs uppercase tracking-[0.16em] text-stone-400">Description</span>
              <Textarea
                className="resize-none"
                maxLength={500}
                placeholder="How this reward works..."
                value={rewardDesc}
                onChange={(event) => onDescriptionChange(event.target.value)}
              />
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block space-y-1.5">
                <span className="text-xs uppercase tracking-[0.16em] text-stone-400">
                  Cost ({activeProjectId ? "Team Coins" : "Global Coins"})
                </span>
                <Input
                  min={1}
                  required
                  type="number"
                  value={rewardPrice}
                  onChange={(event) => onPriceChange(Math.max(1, parseInt(event.target.value) || 1))}
                />
              </label>

              <label className="block space-y-1.5">
                <span className="text-xs uppercase tracking-[0.16em] text-stone-400">Cooldown</span>
                <Input
                  placeholder="Once per week"
                  value={rewardDuration}
                  onChange={(event) => onDurationChange(event.target.value)}
                />
              </label>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.035] p-3">
              <label className="flex cursor-pointer items-center justify-between gap-3">
                <span className="text-sm font-medium text-stone-200">Limit stock</span>
                <input
                  checked={rewardHasQuantity}
                  className="h-4 w-4 accent-dusk-lavender"
                  type="checkbox"
                  onChange={(event) => onHasQuantityChange(event.target.checked)}
                />
              </label>
              {rewardHasQuantity ? (
                <label className="mt-3 block space-y-1.5">
                  <span className="text-xs uppercase tracking-[0.16em] text-stone-400">Quantity</span>
                  <Input
                    min={0}
                    required
                    type="number"
                    value={rewardQuantity}
                    onChange={(event) => onQuantityChange(Math.max(0, parseInt(event.target.value) || 0))}
                  />
                </label>
              ) : null}
            </div>
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2 border-t border-white/10 pt-4">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={!rewardName.trim()}>Save Reward</Button>
        </div>
      </form>
    </AppModal>
  );
}

function RejectRewardModal({
  onClose,
  onReasonChange,
  onSubmit,
  rejectionReason
}: {
  onClose: () => void;
  onReasonChange: (value: string) => void;
  onSubmit: (event: React.FormEvent) => void;
  rejectionReason: string;
}) {
  return (
    <AppModal
      open
      onClose={onClose}
      labelledBy="reject-reward-title"
      contentClassName="max-w-md"
    >
      <form className="lofi-panel w-full max-w-md rounded-xl p-5" onSubmit={onSubmit}>
        <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-red-300">Reject request</p>
            <h2 id="reject-reward-title" className="mt-1 text-lg font-semibold text-stone-100">Add a reason</h2>
          </div>
          <button className="rounded-lg p-2 text-stone-400 hover:bg-white/10 hover:text-stone-100" type="button" onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </div>
        <label className="mt-4 block space-y-1.5">
          <span className="text-xs uppercase tracking-[0.16em] text-stone-400">Reason</span>
          <Textarea
            className="resize-none"
            maxLength={500}
            placeholder="Explain why this request cannot be approved..."
            required
            value={rejectionReason}
            onChange={(event) => onReasonChange(event.target.value)}
          />
        </label>
        <div className="mt-5 flex justify-end gap-2 border-t border-white/10 pt-4">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={!rejectionReason.trim()} variant="danger">
            Reject & Refund
          </Button>
        </div>
      </form>
    </AppModal>
  );
}
