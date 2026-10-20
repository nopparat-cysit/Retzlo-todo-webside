"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  Bell,
  Check,
  CheckCircle2,
  Clock,
  Coins,
  Gift,
  Inbox,
  PackageOpen,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Store,
  Trash2,
  Wallet,
  X
} from "lucide-react";

import { AppModal } from "@/components/ui/app-modal";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { FilterSelect } from "@/components/ui/filter-select";
import { Input, Textarea } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/state";
import { useToast } from "@/components/ui/toast";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { AiChatTrigger } from "@/components/ai/ai-chat-trigger";
import { HelpButton } from "@/components/ui/help-button";
import { UserProfilePopover } from "@/components/project/user-profile-popover";
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

export interface RewardsStoreProps {
  projectId?: string;
  projectName?: string;
  projectCoinName?: string;
  projectCoinSymbol?: string;
  isProjectAdmin?: boolean;
  userProjects?: Array<{ id: string; name: string; isProjectAdmin: boolean }>;
  userProfile?: {
    name: string | null;
    email: string;
    avatar: string | null;
    status: "ONLINE" | "BUSY" | "OFFLINE";
    isAdmin?: boolean;
  };
}

export function RewardsStore({
  projectId,
  projectName,
  isProjectAdmin = false,
  userProjects,
  userProfile
}: RewardsStoreProps) {
  const router = useRouter();
  const { toast } = useToast();

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
  const [ledgerTab, setLedgerTab] = useState<"pending" | "history">("pending");
  const [loading, setLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form states
  const [rewardName, setRewardName] = useState("");
  const [rewardDesc, setRewardDesc] = useState("");
  const [rewardPrice, setRewardPrice] = useState(10);
  const [rewardHasQuantity, setRewardHasQuantity] = useState(false);
  const [rewardQuantity, setRewardQuantity] = useState(5);
  const [rewardDuration, setRewardDuration] = useState("");
  const [rewardIconSrc, setRewardIconSrc] = useState<string>(defaultRewardIcon.src);

  // Modals & confirmation intents
  const [editingReward, setEditingReward] = useState<Reward | null>(null);
  const [deletingReward, setDeletingReward] = useState<Reward | null>(null);
  const [confirmRedeemReward, setConfirmRedeemReward] = useState<Reward | null>(null);
  const [confirmApproveRedemption, setConfirmApproveRedemption] = useState<Redemption | null>(null);
  const [confirmSeedPresets, setConfirmSeedPresets] = useState(false);
  const [rejectingRedemptionId, setRejectingRedemptionId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const activeScopeLabel = activeProjectId ? activeProjectName ?? "Project" : "Personal";
  const balanceLabel = activeProjectId ? "Team Coins" : "Global Coins";
  const canManageRewards = !activeProjectId || activeIsProjectAdmin;

  const pendingRedemptions = useMemo(
    () => redemptions.filter((redemption) => redemption.status === "PENDING"),
    [redemptions]
  );
  const pastRedemptions = useMemo(
    () => redemptions.filter((redemption) => redemption.status !== "PENDING"),
    [redemptions]
  );

  const affordableCount = useMemo(
    () => rewards.filter((r) => balance >= r.price && (!r.hasQuantity || (r.quantity ?? 0) > 0)).length,
    [rewards, balance]
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
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
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
        toast({ message: "Reward created successfully!", type: "success" });
        await loadData();
      } else {
        const err = (await res.json()) as { error?: string };
        toast({ message: err.error ?? "Failed to create reward.", type: "error" });
      }
    } catch {
      toast({ message: "Connection failure while creating reward.", type: "error" });
    }
  }

  function openEditReward(reward: Reward) {
    setEditingReward(reward);
    setRewardName(reward.name);
    setRewardDesc(reward.description ?? "");
    setRewardPrice(reward.price);
    setRewardHasQuantity(reward.hasQuantity);
    setRewardQuantity(reward.quantity ?? 5);
    setRewardDuration(reward.duration ?? "");
    setRewardIconSrc(reward.image || defaultRewardIcon.src);
  }

  async function handleUpdateReward(event: React.FormEvent) {
    event.preventDefault();
    if (!editingReward || !rewardName.trim()) return;

    try {
      const res = await fetch(`/api/rewards/${editingReward.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: rewardName.trim(),
          description: rewardDesc.trim() || null,
          price: rewardPrice,
          hasQuantity: rewardHasQuantity,
          quantity: rewardHasQuantity ? rewardQuantity : null,
          duration: rewardDuration.trim() || null,
          image: rewardIconSrc
        })
      });

      if (res.ok) {
        setEditingReward(null);
        toast({ message: "Reward updated successfully!", type: "success" });
        await loadData();
      } else {
        const err = await res.json().catch(() => ({}));
        toast({ message: err.error ?? "Failed to update reward.", type: "error" });
      }
    } catch {
      toast({ message: "Connection failure while updating reward.", type: "error" });
    }
  }

  async function handleExecuteDelete() {
    if (!deletingReward) return;

    try {
      const res = await fetch(`/api/rewards/${deletingReward.id}`, {
        method: "DELETE"
      });

      if (res.ok) {
        toast({ message: "Reward deleted successfully!", type: "success" });
        setDeletingReward(null);
        await loadData();
      } else {
        const err = await res.json().catch(() => ({}));
        toast({ message: err.error ?? "Failed to delete reward.", type: "error" });
      }
    } catch {
      toast({ message: "Connection failure while deleting reward.", type: "error" });
    }
  }

  async function handleSeedAllPresets() {
    try {
      setIsSeeding(true);
      for (const preset of REWARD_PRESETS) {
        await fetch("/api/rewards", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: preset.name,
            description: preset.description,
            price: preset.price,
            hasQuantity: preset.hasQuantity,
            quantity: preset.quantity,
            duration: null,
            image: preset.iconSrc,
            projectId: activeProjectId || null
          })
        });
      }
      toast({ message: "Added 5 starter rewards to catalog!", type: "success" });
      await loadData();
      router.refresh();
    } catch {
      toast({ message: "Failed to seed starter rewards.", type: "error" });
    } finally {
      setIsSeeding(false);
      setConfirmSeedPresets(false);
    }
  }

  async function handleSeedSinglePreset(preset: (typeof REWARD_PRESETS)[number]) {
    try {
      const res = await fetch("/api/rewards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: preset.name,
          description: preset.description,
          price: preset.price,
          hasQuantity: preset.hasQuantity,
          quantity: preset.quantity,
          duration: null,
          image: preset.iconSrc,
          projectId: activeProjectId || null
        })
      });

      if (res.ok) {
        toast({ message: `Added "${preset.name}" to catalog!`, type: "success" });
        await loadData();
        router.refresh();
      } else {
        toast({ message: "Failed to add reward.", type: "error" });
      }
    } catch {
      toast({ message: "Network error adding reward.", type: "error" });
    }
  }

  async function handleExecuteRedeem() {
    if (!confirmRedeemReward) return;
    const rewardId = confirmRedeemReward.id;
    const rewardName = confirmRedeemReward.name;

    try {
      const res = await fetch("/api/rewards/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rewardId })
      });

      if (res.ok) {
        playBell();
        toast({ message: `🎉 You redeemed "${rewardName}"!`, type: "success" });
        await loadData();
        router.refresh();
      } else {
        const err = (await res.json()) as { error?: string };
        toast({ message: err.error ?? "Failed to redeem reward.", type: "error" });
      }
    } catch {
      toast({ message: "Redemption failed due to network error.", type: "error" });
    } finally {
      setConfirmRedeemReward(null);
    }
  }

  async function handleExecuteApprove() {
    if (!confirmApproveRedemption) return;
    const redemptionId = confirmApproveRedemption.id;

    try {
      const res = await fetch("/api/rewards/redeem", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ redemptionId, status: "APPROVED" })
      });

      if (res.ok) {
        playBell();
        toast({ message: "Redemption approved successfully.", type: "success" });
        await loadData();
        router.refresh();
      } else {
        const err = (await res.json()) as { error?: string };
        toast({ message: err.error ?? "Failed to approve redemption.", type: "error" });
      }
    } catch {
      toast({ message: "Network error during approval.", type: "error" });
    } finally {
      setConfirmApproveRedemption(null);
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
        toast({ message: "Redemption rejected and coins refunded.", type: "info" });
        await loadData();
        router.refresh();
      } else {
        const err = (await res.json()) as { error?: string };
        toast({ message: err.error ?? "Failed to reject redemption.", type: "error" });
      }
    } catch {
      toast({ message: "Network error during rejection.", type: "error" });
    }
  }

  async function handleClearNotifications() {
    try {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true })
      });
      if (res.ok) {
        setNotifications([]);
        toast({ message: "Notifications cleared.", type: "info" });
      }
    } catch {
      toast({ message: "Failed to clear notifications.", type: "error" });
    }
  }

  return (
    <div className="space-y-5">
      {/* Standalone Topbar Header (Only on /projects/rewards when not embedded in project shell) */}
      {!projectId && (
        <header className="lofi-panel flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl p-3.5 sm:px-5 sm:py-3.5 backdrop-blur-xl border border-stone-200/80 dark:border-white/10 bg-white/80 dark:bg-ink-950/75 shadow-xs">
          <div className="flex items-center justify-between sm:justify-start gap-3">
            <Link href="/projects" className="flex items-center gap-2.5 group">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-dusk-amber/30 bg-dusk-amber/10 text-dusk-amber shadow-xs group-hover:scale-105 transition-transform">
                <Gift className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-dusk-amber">
                  <Sparkles className="h-3 w-3" />
                  <span>Retzlo Arcade</span>
                </div>
                <h1 className="text-base font-bold text-stone-900 dark:text-stone-100 leading-tight whitespace-nowrap">
                  Reward Lounge
                </h1>
              </div>
            </Link>

            <Link
              href="/projects"
              className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200/80 bg-stone-100/60 px-2.5 py-1 text-xs font-medium text-stone-600 hover:text-stone-900 dark:border-white/10 dark:bg-white/[0.04] dark:text-stone-400 dark:hover:text-stone-200 transition"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Workspaces</span>
            </Link>
          </div>

          {/* Quick Search */}
          <div className="relative flex-1 max-w-md mx-0 sm:mx-4">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
            <input
              type="text"
              placeholder="Search rewards, treats, perks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-stone-200/80 bg-stone-100/70 pl-9 pr-8 py-2 text-xs text-stone-800 placeholder-stone-400 focus:border-amber-400 focus:bg-white focus:outline-none dark:border-white/10 dark:bg-white/[0.04] dark:text-stone-100 dark:placeholder-stone-500 dark:focus:border-dusk-amber/50 dark:focus:bg-white/[0.07] transition shadow-inner"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-200 cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Desktop Right Utilities Bar */}
          <div className="flex items-center gap-2 shrink-0 justify-end">
            <LanguageSwitcher />
            <AiChatTrigger className="h-9 w-9 rounded-xl border border-stone-200/90 bg-white/80 dark:border-white/10 dark:bg-white/[0.04] hover:scale-105 transition-transform" />
            <HelpButton />
            {userProfile && (
              <UserProfilePopover
                avatar={userProfile.avatar}
                email={userProfile.email}
                initials={(userProfile.name ?? userProfile.email)
                  .split(" ")
                  .map((w) => w[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
                name={userProfile.name ?? userProfile.email}
                status={userProfile.status}
                statusColor={
                  userProfile.status === "ONLINE"
                    ? "bg-emerald-400"
                    : userProfile.status === "BUSY"
                    ? "bg-dusk-amber"
                    : "bg-stone-500"
                }
                variant="avatar"
                isAdmin={userProfile.isAdmin}
              />
            )}
          </div>
        </header>
      )}

      {/* Hero Arcade Banner */}
      <section className="lofi-panel overflow-visible rounded-2xl p-4 sm:p-6 border border-stone-200/80 dark:border-white/10 bg-white/70 dark:bg-ink-950/70 backdrop-blur-md">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-dusk-amber/30 bg-dusk-amber/10 px-3 py-1 text-xs font-semibold text-dusk-amber">
              <Gift className="h-3.5 w-3.5" />
              <span>Reward Exchange · แลกของรางวัลและความสำเร็จ</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
              {activeProjectId ? `${activeScopeLabel} Team Shop` : "Personal Reward Lounge"}
            </h2>
            <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
              Earn coins through focused work streaks and rituals. Redeem cozy milestones, track requests, and celebrate wins.
            </p>

            {/* Scope Switcher */}
            {userProjects && userProjects.length > 0 ? (
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <div className="inline-flex rounded-xl border border-stone-200/80 bg-stone-100/80 p-1 dark:border-white/10 dark:bg-ink-950/60 shadow-inner">
                  <ScopeButton
                    active={storeMode === "global"}
                    label="Global Arcade"
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
                    label="Team Shop"
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
                  <div className="min-w-[200px] max-w-xs">
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
          </div>

          {/* Coin Vault Card */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end gap-3.5 bg-stone-50/70 dark:bg-white/[0.03] p-4 sm:p-5 rounded-2xl border border-stone-200/70 dark:border-white/10 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-xl border border-dusk-amber/30 bg-dusk-amber/10 shadow-xs">
                <RewardIcon src={coinRewardIcon.src} label="Coins" size="sm" />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500 dark:text-stone-400">
                  {balanceLabel}
                </p>
                <p className="text-3xl font-extrabold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                  <span>{balance}</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-dusk-amber/15 text-dusk-amber">
                    Coins
                  </span>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full pt-1">
              {canManageRewards && (
                <Button size="sm" onClick={() => setIsCreateOpen(true)} className="flex-1">
                  <Plus className="h-3.5 w-3.5" />
                  New Reward
                </Button>
              )}
              {canManageRewards && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setConfirmSeedPresets(true)}
                  disabled={isSeeding}
                  className="flex-1"
                >
                  <Sparkles className="h-3.5 w-3.5 text-dusk-amber" />
                  {isSeeding ? "Seeding..." : "Seed Presets"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {errorMsg ? (
        <div className="flex items-center gap-2 rounded-xl border border-theme-danger-border bg-theme-danger-surface p-3 text-sm text-theme-danger">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <p>{errorMsg}</p>
          <button className="ml-auto text-xs text-theme-danger hover:underline cursor-pointer" onClick={() => setErrorMsg(null)}>
            Dismiss
          </button>
        </div>
      ) : null}

      {/* Main Store Layout (72% Main Shelf + 28% Sidebar Ledger) */}
      <div className="grid gap-5 lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_380px]">
        {/* Main Catalog Shelf */}
        <section className="lofi-panel rounded-2xl p-4 sm:p-5 border border-stone-200/80 dark:border-white/10 bg-white/70 dark:bg-ink-950/70 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-stone-200/80 dark:border-white/10 pb-4">
            <div>
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-dusk-lavender font-semibold">
                <Store className="h-4 w-4" />
                <span>Catalog Shelf</span>
              </div>
              <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100">Reward Catalog</h3>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-1.5">
              {([
                ["all", `All (${rewards.length})`],
                ["affordable", `Can Redeem (${affordableCount})`],
                ["team", "Team"],
                ["global", "Global"]
              ] as const).map(([value, label]) => (
                <button
                  key={value}
                  className={cn(
                    "rounded-xl border px-3 py-1.5 text-xs font-semibold transition cursor-pointer select-none",
                    catalogFilter === value
                      ? "border-dusk-amber bg-dusk-amber/15 text-dusk-amber shadow-2xs"
                      : "border-stone-200/80 bg-stone-100/50 text-stone-600 hover:border-stone-300 hover:text-stone-900 dark:border-white/10 dark:bg-white/[0.035] dark:text-stone-400 dark:hover:border-white/20 dark:hover:text-stone-200"
                  )}
                  onClick={() => setCatalogFilter(value)}
                  type="button"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="grid min-h-[20rem] place-items-center text-sm text-stone-500">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 animate-spin text-dusk-amber" />
                <span>Syncing catalog...</span>
              </div>
            </div>
          ) : filteredRewards.length === 0 ? (
            /* Starter Presets Showcase when Catalog is Empty */
            <div className="space-y-4 py-3">
              <div className="rounded-2xl border border-dashed border-stone-300 dark:border-white/15 bg-stone-50/60 dark:bg-white/[0.02] p-6 sm:p-8 text-center space-y-3">
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border border-dusk-amber/25 bg-dusk-amber/10 shadow-xs">
                  <RewardIcon src={emptyRewardIcon.src} label="Empty Catalog" size="lg" />
                </div>
                <h4 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                  {canManageRewards ? "Your Reward Lounge is Ready to Stock!" : "No rewards available right now."}
                </h4>
                <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto">
                  {canManageRewards
                    ? "Add cozy milestones for you and your team. You can seed the store with 5 popular starter presets in one click:"
                    : "Check back later or ask your workspace admin to add items to the store."}
                </p>

                {canManageRewards && (
                  <div className="pt-2 flex flex-wrap justify-center gap-2">
                    <Button onClick={() => setConfirmSeedPresets(true)} disabled={isSeeding}>
                      <Sparkles className="h-4 w-4" />
                      Add All 5 Starter Rewards (คลิกเดียวเพิ่มทั้งหมด)
                    </Button>
                    <Button variant="secondary" onClick={() => setIsCreateOpen(true)}>
                      <Plus className="h-4 w-4" />
                      Create Custom Reward
                    </Button>
                  </div>
                )}
              </div>

              {/* Starter Presets Cards Grid */}
              {canManageRewards && (
                <div className="space-y-2 pt-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500 dark:text-stone-400">
                    Starter Reward Ideas · ไอเดียรางวัลเริ่มต้น
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {REWARD_PRESETS.map((preset) => (
                      <div
                        key={preset.name}
                        className="flex flex-col justify-between rounded-xl border border-stone-200/80 bg-white/60 p-4 shadow-xs transition hover:border-dusk-amber/40 hover:bg-white dark:border-white/10 dark:bg-white/[0.035] dark:hover:bg-white/[0.06]"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <div className="grid h-12 w-12 place-items-center rounded-xl border border-stone-200/80 bg-stone-100/60 dark:border-white/10 dark:bg-ink-950/40">
                              <RewardIcon label={preset.name} size="sm" src={preset.iconSrc} />
                            </div>
                            <span className="inline-flex items-center gap-1 rounded-lg border border-dusk-amber/30 bg-dusk-amber/10 px-2 py-0.5 text-xs font-bold text-dusk-amber">
                              <Coins className="h-3 w-3" />
                              {preset.price}c
                            </span>
                          </div>
                          <h5 className="mt-3 text-sm font-bold text-stone-900 dark:text-stone-100">{preset.name}</h5>
                          <p className="mt-1 line-clamp-2 text-xs text-stone-500 leading-relaxed">{preset.description}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="mt-3 w-full"
                          onClick={() => handleSeedSinglePreset(preset)}
                        >
                          <Plus className="h-3 w-3" />
                          Add to Catalog
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Active Catalog Items Grid */
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filteredRewards.map((reward) => (
                <RewardCard
                  key={reward.id}
                  activeProjectId={activeProjectId}
                  balance={balance}
                  reward={reward}
                  isAdmin={activeIsProjectAdmin}
                  onEdit={openEditReward}
                  onDelete={(r) => setDeletingReward(r)}
                  onRedeem={(reward) => setConfirmRedeemReward(reward)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Right Sidebar Passbook & Ledger */}
        <aside className="space-y-4">
          {/* Wallet Passbook Card */}
          <section className="lofi-panel rounded-2xl p-4 sm:p-5 border border-stone-200/80 dark:border-white/10 bg-white/70 dark:bg-ink-950/70 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wallet className="h-4 w-4 text-dusk-amber" />
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-stone-500 dark:text-stone-400">
                  Passbook
                </p>
              </div>
              <span className="text-xs font-medium text-stone-500">{activeScopeLabel}</span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center pt-1">
              <div className="rounded-xl border border-stone-200/80 bg-stone-100/50 p-2.5 dark:border-white/10 dark:bg-white/[0.035]">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-500">Catalog</p>
                <p className="mt-1 text-base font-bold text-stone-900 dark:text-stone-100">{rewards.length}</p>
              </div>
              <div className="rounded-xl border border-stone-200/80 bg-stone-100/50 p-2.5 dark:border-white/10 dark:bg-white/[0.035]">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-500">Pending</p>
                <p className="mt-1 text-base font-bold text-dusk-rose">{pendingRedemptions.length}</p>
              </div>
              <div className="rounded-xl border border-stone-200/80 bg-stone-100/50 p-2.5 dark:border-white/10 dark:bg-white/[0.035]">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-500">Claimed</p>
                <p className="mt-1 text-base font-bold text-theme-success">{pastRedemptions.length}</p>
              </div>
            </div>
          </section>

          {/* Unified Ledger Tabs (Pending Queue | History) */}
          <section className="lofi-panel rounded-2xl p-4 sm:p-5 border border-stone-200/80 dark:border-white/10 bg-white/70 dark:bg-ink-950/70 space-y-3">
            <div className="flex items-center justify-between border-b border-stone-200/80 dark:border-white/10 pb-3">
              <div className="inline-flex rounded-xl border border-stone-200/80 bg-stone-100/80 p-1 dark:border-white/10 dark:bg-ink-950/60 shadow-inner w-full">
                <button
                  type="button"
                  onClick={() => setLedgerTab("pending")}
                  className={cn(
                    "flex-1 rounded-lg py-1 text-xs font-semibold transition cursor-pointer text-center",
                    ledgerTab === "pending"
                      ? "bg-white text-stone-900 shadow-xs dark:bg-white/10 dark:text-stone-100"
                      : "text-stone-500 hover:text-stone-900 dark:hover:text-stone-300"
                  )}
                >
                  Pending ({pendingRedemptions.length})
                </button>
                <button
                  type="button"
                  onClick={() => setLedgerTab("history")}
                  className={cn(
                    "flex-1 rounded-lg py-1 text-xs font-semibold transition cursor-pointer text-center",
                    ledgerTab === "history"
                      ? "bg-white text-stone-900 shadow-xs dark:bg-white/10 dark:text-stone-100"
                      : "text-stone-500 hover:text-stone-900 dark:hover:text-stone-300"
                  )}
                >
                  History ({pastRedemptions.length})
                </button>
              </div>
            </div>

            {ledgerTab === "pending" ? (
              <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                {pendingRedemptions.length === 0 ? (
                  <EmptySmall text="No pending redemptions. All caught up!" />
                ) : (
                  pendingRedemptions.map((redemption) => (
                    <PendingItem
                      key={redemption.id}
                      isAdmin={Boolean(activeProjectId && activeIsProjectAdmin)}
                      redemption={redemption}
                      onApprove={(redemption) => setConfirmApproveRedemption(redemption)}
                      onReject={(id) => setRejectingRedemptionId(id)}
                    />
                  ))
                )}
              </div>
            ) : (
              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {pastRedemptions.length === 0 ? (
                  <EmptySmall text="No completed redemptions yet." />
                ) : (
                  pastRedemptions.slice(0, 10).map((redemption) => (
                    <HistoryItem key={redemption.id} redemption={redemption} />
                  ))
                )}
              </div>
            )}
          </section>

          {/* Activity Updates / Notifications */}
          <section className="lofi-panel rounded-2xl p-4 border border-stone-200/80 dark:border-white/10 bg-white/70 dark:bg-ink-950/70">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-stone-400" />
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-stone-500 dark:text-stone-400">
                  Updates
                </p>
              </div>
              <button
                type="button"
                className="relative grid h-7 w-7 place-items-center rounded-lg border border-stone-200/80 bg-stone-100/60 text-stone-600 transition hover:border-dusk-lavender/45 hover:text-dusk-lavender dark:border-white/10 dark:bg-white/[0.045] dark:text-stone-300 cursor-pointer"
                onClick={() => setShowNotifications((value) => !value)}
              >
                <Bell className="h-3.5 w-3.5" />
                {notifications.length > 0 ? (
                  <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-dusk-rose px-1 text-[9px] font-bold text-ink-950">
                    {notifications.length}
                  </span>
                ) : null}
              </button>
            </div>
            {showNotifications && (
              <div className="mt-3 space-y-2 border-t border-stone-200/80 dark:border-white/10 pt-3">
                {notifications.length === 0 ? (
                  <p className="rounded-xl border border-stone-200/80 bg-stone-100/50 p-2.5 text-xs text-stone-500 dark:border-white/10 dark:bg-white/[0.035]">
                    No new reward updates.
                  </p>
                ) : (
                  notifications.slice(0, 4).map((notification) => (
                    <div key={notification.id} className="rounded-xl border border-stone-200/80 bg-stone-100/50 p-2.5 dark:border-white/10 dark:bg-white/[0.035]">
                      <p className="text-xs font-bold text-stone-900 dark:text-stone-200">{notification.title}</p>
                      <p className="mt-0.5 line-clamp-2 text-xs text-stone-500">{notification.message}</p>
                    </div>
                  ))
                )}
                {notifications.length > 0 && (
                  <Button className="w-full" size="sm" variant="ghost" onClick={handleClearNotifications}>
                    Clear updates
                  </Button>
                )}
              </div>
            )}
          </section>
        </aside>
      </div>

      {/* Create Reward Modal */}
      {isCreateOpen && (
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
      )}

      {/* Edit Reward Modal */}
      {editingReward && (
        <CreateRewardModal
          activeProjectId={activeProjectId}
          isEditing={true}
          rewardDesc={rewardDesc}
          rewardDuration={rewardDuration}
          rewardHasQuantity={rewardHasQuantity}
          rewardIconSrc={rewardIconSrc}
          rewardName={rewardName}
          rewardPrice={rewardPrice}
          rewardQuantity={rewardQuantity}
          onApplyPreset={applyPreset}
          onClose={() => setEditingReward(null)}
          onDescriptionChange={setRewardDesc}
          onDurationChange={setRewardDuration}
          onHasQuantityChange={setRewardHasQuantity}
          onNameChange={setRewardName}
          onPriceChange={setRewardPrice}
          onQuantityChange={setRewardQuantity}
          onRewardIconChange={setRewardIconSrc}
          onSubmit={handleUpdateReward}
        />
      )}

      {/* Intent Confirm: Delete Reward */}
      {deletingReward && (
        <ConfirmModal
          open={true}
          title={`Delete Reward "${deletingReward.name}"?`}
          message="Are you sure you want to delete this reward from the store? Members will no longer be able to claim it."
          confirmLabel="Delete Reward"
          variant="danger"
          onClose={() => setDeletingReward(null)}
          onConfirm={handleExecuteDelete}
        />
      )}

      {/* Reject Reason Modal */}
      {rejectingRedemptionId && (
        <RejectRewardModal
          rejectionReason={rejectionReason}
          onClose={() => {
            setRejectingRedemptionId(null);
            setRejectionReason("");
          }}
          onReasonChange={setRejectionReason}
          onSubmit={handleReject}
        />
      )}

      {/* Intent Confirm: Redeem Reward */}
      {confirmRedeemReward && (
        <ConfirmModal
          open={true}
          title={`Redeem "${confirmRedeemReward.name}"?`}
          message={`Are you sure you want to spend ${confirmRedeemReward.price} ${balanceLabel} from your balance to claim this reward?`}
          confirmLabel={`Redeem for ${confirmRedeemReward.price} coins`}
          variant="default"
          onClose={() => setConfirmRedeemReward(null)}
          onConfirm={handleExecuteRedeem}
        />
      )}

      {/* Intent Confirm: Approve Redemption */}
      {confirmApproveRedemption && (
        <ConfirmModal
          open={true}
          title={`Approve Redemption for "${confirmApproveRedemption.reward.name}"?`}
          message={`Approve request submitted by ${confirmApproveRedemption.user?.name || confirmApproveRedemption.user?.email || "team member"}?`}
          confirmLabel="Approve Redemption"
          variant="default"
          onClose={() => setConfirmApproveRedemption(null)}
          onConfirm={handleExecuteApprove}
        />
      )}

      {/* Intent Confirm: Seed Presets */}
      {confirmSeedPresets && (
        <ConfirmModal
          open={true}
          title="Seed 5 Starter Rewards?"
          message="This will add 5 popular starter rewards (Coffee Break, Gaming Session, Movie Ticket, Pocket Cash, and Rest Pass) to your catalog shelf."
          confirmLabel="Add All 5 Presets"
          variant="default"
          onClose={() => setConfirmSeedPresets(false)}
          onConfirm={handleSeedAllPresets}
        />
      )}
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

function ScopeButton({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      className={cn(
        "rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer select-none",
        active
          ? "bg-dusk-amber text-ink-950 font-bold shadow-xs"
          : "text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
      )}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}

function RewardCard({
  activeProjectId,
  balance,
  onRedeem,
  reward,
  isAdmin,
  onEdit,
  onDelete
}: {
  activeProjectId?: string;
  balance: number;
  onRedeem: (reward: Reward) => void;
  reward: Reward;
  isAdmin?: boolean;
  onEdit?: (reward: Reward) => void;
  onDelete?: (reward: Reward) => void;
}) {
  const isAffordable = balance >= reward.price;
  const isOutOfStock = reward.hasQuantity && reward.quantity !== null && reward.quantity < 1;
  const icon = getRewardIconForName(reward.name);
  const iconSrc = reward.image || icon.src;

  return (
    <article className="group flex min-h-[14rem] flex-col justify-between rounded-2xl border border-stone-200/80 bg-white/70 p-4 transition-all hover:-translate-y-0.5 hover:border-dusk-amber/40 hover:shadow-sm dark:border-white/10 dark:bg-white/[0.035] dark:hover:border-dusk-amber/30 dark:hover:bg-white/[0.055]">
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl border border-stone-200/80 bg-stone-100/60 dark:border-white/10 dark:bg-ink-950/35 shadow-2xs">
            <RewardIcon label={icon.label} src={iconSrc} />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 rounded-xl border border-dusk-amber/30 bg-dusk-amber/10 px-2.5 py-1 text-xs font-bold text-dusk-amber shadow-2xs">
              <Coins className="h-3 w-3" />
              {reward.price} Coins
            </span>
            {isAdmin && onEdit && onDelete && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(reward);
                  }}
                  className="grid h-7 w-7 place-items-center rounded-lg border border-stone-200/80 bg-stone-100/60 text-stone-600 hover:bg-stone-200 hover:text-stone-900 dark:border-white/10 dark:bg-white/[0.04] dark:text-stone-400 dark:hover:bg-white/10 dark:hover:text-stone-100 transition cursor-pointer"
                  title="Edit reward"
                  aria-label={`Edit ${reward.name}`}
                >
                  <Pencil className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(reward);
                  }}
                  className="grid h-7 w-7 place-items-center rounded-lg border border-red-500/20 bg-red-500/10 text-red-600 hover:bg-red-500/20 hover:text-red-700 dark:border-red-400/20 dark:bg-red-500/15 dark:text-red-400 dark:hover:bg-red-500/25 transition cursor-pointer"
                  title="Delete reward"
                  aria-label={`Delete ${reward.name}`}
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        </div>
        <h4 className="mt-3 line-clamp-1 text-base font-bold text-stone-900 dark:text-stone-100">{reward.name}</h4>
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-stone-500 dark:text-stone-400">
          {reward.description ?? "No description."}
        </p>
      </div>

      <div className="mt-4 space-y-3 border-t border-stone-200/80 dark:border-white/10 pt-3">
        <div className="flex flex-wrap gap-1.5">
          {reward.duration ? (
            <span className="inline-flex items-center gap-1 rounded-md border border-stone-200/80 bg-stone-100/50 px-2 py-0.5 text-[10px] font-medium text-stone-500 dark:border-white/10 dark:bg-white/[0.035] dark:text-stone-400">
              <Clock className="h-3 w-3" />
              {reward.duration}
            </span>
          ) : null}
          <span
            className={cn(
              "rounded-md border px-2 py-0.5 text-[10px] font-medium",
              isOutOfStock
                ? "border-theme-danger-border bg-theme-danger-surface text-theme-danger"
                : "border-stone-200/80 bg-stone-100/50 text-stone-500 dark:border-white/10 dark:bg-white/[0.035] dark:text-stone-400"
            )}
          >
            {reward.hasQuantity ? (isOutOfStock ? "Out of stock" : `Stock: ${reward.quantity}`) : "Unlimited"}
          </span>
          <span className="rounded-md border border-stone-200/80 bg-stone-100/50 px-2 py-0.5 text-[10px] font-medium text-stone-500 dark:border-white/10 dark:bg-white/[0.035] dark:text-stone-400">
            {activeProjectId ? "Team" : reward.projectId ? "Team" : "Global"}
          </span>
        </div>

        <Button
          className="w-full"
          disabled={!isAffordable || isOutOfStock}
          size="sm"
          variant={isAffordable && !isOutOfStock ? "primary" : "secondary"}
          onClick={() => onRedeem(reward)}
        >
          {isOutOfStock ? "Sold Out" : isAffordable ? `Redeem (${reward.price} Coins)` : `Need ${reward.price - balance} more coins`}
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
  onApprove: (redemption: Redemption) => void;
  onReject: (redemptionId: string) => void;
  redemption: Redemption;
}) {
  return (
    <div className="rounded-xl border border-stone-200/80 bg-stone-50/70 p-3 dark:border-white/10 dark:bg-white/[0.035]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="line-clamp-1 text-sm font-bold text-stone-900 dark:text-stone-100">{redemption.reward.name}</p>
          <p className="mt-0.5 text-xs text-stone-500">{redemption.user?.name || redemption.user?.email || "Member"}</p>
        </div>
        <span className="rounded-lg bg-dusk-amber/10 px-2 py-0.5 text-xs font-bold text-dusk-amber">
          {redemption.cost}c
        </span>
      </div>
      {isAdmin ? (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Button size="sm" onClick={() => onApprove(redemption)}>
            <Check className="h-3 w-3" />
            Approve
          </Button>
          <Button size="sm" variant="danger" onClick={() => onReject(redemption.id)}>
            <X className="h-3 w-3" />
            Reject
          </Button>
        </div>
      ) : (
        <div className="mt-2 flex items-center gap-1 text-[11px] text-dusk-amber">
          <Clock className="h-3 w-3" />
          <span>Waiting for admin approval</span>
        </div>
      )}
    </div>
  );
}

function HistoryItem({ redemption }: { redemption: Redemption }) {
  const isApproved = redemption.status === "APPROVED";

  return (
    <div className="rounded-xl border border-stone-200/80 bg-stone-50/70 p-2.5 dark:border-white/10 dark:bg-white/[0.03]">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="line-clamp-1 text-xs font-bold text-stone-900 dark:text-stone-200">{redemption.reward.name}</p>
          <p className="mt-0.5 text-[10px] text-stone-400">{formatMediumDate(redemption.createdAt)}</p>
        </div>
        <span
          className={cn(
            "rounded-md px-1.5 py-0.5 text-[10px] font-bold shrink-0",
            isApproved
              ? "bg-theme-success-surface text-theme-success"
              : "bg-theme-danger-surface text-theme-danger"
          )}
        >
          {isApproved ? "Approved" : "Rejected"}
        </span>
      </div>
      {redemption.rejectionReason ? (
        <p className="mt-1 line-clamp-2 text-[11px] text-stone-500 italic">&ldquo;{redemption.rejectionReason}&rdquo;</p>
      ) : null}
    </div>
  );
}

function EmptySmall({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-dashed border-stone-300 dark:border-white/10 bg-stone-50/50 dark:bg-white/[0.02] p-4 text-center">
      <PackageOpen className="mx-auto h-5 w-5 text-stone-400" />
      <p className="mt-2 text-xs text-stone-500">{text}</p>
    </div>
  );
}

function CreateRewardModal({
  activeProjectId,
  isEditing = false,
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
  isEditing?: boolean;
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
      <form className="lofi-panel w-full max-w-3xl rounded-2xl p-5 sm:p-6" onSubmit={onSubmit}>
        <div className="flex items-start justify-between gap-3 border-b border-stone-200/80 dark:border-white/10 pb-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-dusk-amber font-semibold">Catalog Editor</p>
            <h2 id="create-reward-title" className="mt-1 text-xl font-bold text-stone-900 dark:text-stone-100">
              {isEditing ? "Edit Reward" : "Create New Reward"}
            </h2>
          </div>
          <button className="rounded-lg p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-900 dark:hover:bg-white/10 dark:hover:text-stone-100 cursor-pointer" type="button" onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-stone-500 font-semibold">Quick Presets</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {REWARD_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  className="rounded-xl border border-stone-200/80 bg-stone-50/60 p-3 text-left transition hover:border-dusk-amber/35 hover:bg-white dark:border-white/10 dark:bg-white/[0.035] dark:hover:bg-white/[0.055] cursor-pointer"
                  type="button"
                  onClick={() => onApplyPreset(preset)}
                >
                  <RewardIcon label={preset.name} size="sm" src={preset.iconSrc} />
                  <p className="mt-2 text-xs font-bold text-stone-900 dark:text-stone-100">{preset.name}</p>
                  <p className="mt-0.5 text-[11px] text-dusk-amber font-semibold">{preset.price} coins</p>
                </button>
              ))}
            </div>

            <div className="mt-4 rounded-xl border border-stone-200/80 bg-stone-50/50 p-3 dark:border-white/10 dark:bg-white/[0.025]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-stone-500 font-semibold">Reward Icon</p>
                  <p className="mt-0.5 text-xs text-stone-700 dark:text-stone-300 font-medium">{selectedIcon.label}</p>
                </div>
                <RewardIcon label={selectedIcon.label} size="sm" src={selectedIcon.src} />
              </div>
              <div className="mt-3 grid max-h-48 grid-cols-5 gap-2 overflow-y-auto pr-1 scrollbar-soft">
                {rewardIconOptions.map((icon) => (
                  <button
                    key={icon.id}
                    aria-label={`Use ${icon.label} icon`}
                    className={cn(
                      "grid h-11 w-full place-items-center rounded-xl border transition hover:-translate-y-0.5 cursor-pointer",
                      icon.src === rewardIconSrc
                        ? "border-dusk-amber bg-dusk-amber/15 shadow-[0_0_0_2px_rgba(249,199,132,0.18)]"
                        : "border-stone-200/80 bg-stone-100/60 dark:border-white/10 dark:bg-ink-950/35"
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
            {/* Live Reward Store Card Mockup Preview */}
            <div className="rounded-2xl border-2 border-indigo-500/35 bg-gradient-to-b from-indigo-50/50 via-white to-indigo-50/30 p-3 dark:border-dusk-lavender/35 dark:from-ink-950/70 dark:via-ink-950/50 dark:to-stone-900/60 shadow-xs space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-indigo-950 dark:text-indigo-100 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-dusk-amber" />
                  <span>Store Card Mockup Preview</span>
                </span>
                <span className="rounded-full border border-indigo-200/70 bg-white/80 px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider text-indigo-700 dark:border-white/10 dark:bg-white/5 dark:text-dusk-lavender">
                  Live Mockup
                </span>
              </div>

              <div className="rounded-xl border border-stone-200/80 bg-white/95 p-3 shadow-2xs dark:border-white/10 dark:bg-stone-900/90 space-y-2.5">
                <div className="flex items-start justify-between gap-2.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-stone-200/80 bg-stone-100/60 dark:border-white/10 dark:bg-ink-950/40">
                      <RewardIcon label={selectedIcon.label} size="sm" src={selectedIcon.src} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-stone-900 dark:text-stone-100 truncate">
                        {rewardName.trim() || "Coffee Break"}
                      </p>
                      <p className="mt-0.5 text-[10px] text-stone-500 dark:text-stone-400 line-clamp-1">
                        {rewardDesc.trim() || "Redeem a relaxing reward milestone with your earned coins."}
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-xl border border-dusk-amber/30 bg-dusk-amber/10 px-2 py-0.5 text-[10px] font-bold text-dusk-amber shrink-0">
                    <Coins className="h-3 w-3" />
                    {rewardPrice} Coins
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2 border-t border-stone-100 dark:border-white/5 pt-2">
                  <div className="flex flex-wrap gap-1">
                    {rewardDuration.trim() && (
                      <span className="inline-flex items-center gap-1 rounded-md border border-stone-200/80 bg-stone-100/50 px-1.5 py-0.2 text-[9px] font-medium text-stone-500 dark:border-white/10 dark:bg-white/5 dark:text-stone-400">
                        <Clock className="h-2.5 w-2.5" />
                        {rewardDuration.trim()}
                      </span>
                    )}
                    <span className="rounded-md border border-stone-200/80 bg-stone-100/50 px-1.5 py-0.2 text-[9px] font-medium text-stone-500 dark:border-white/10 dark:bg-white/5 dark:text-stone-400">
                      {rewardHasQuantity ? `Stock: ${rewardQuantity}` : "Unlimited"}
                    </span>
                    <span className="rounded-md border border-stone-200/80 bg-stone-100/50 px-1.5 py-0.2 text-[9px] font-medium text-stone-500 dark:border-white/10 dark:bg-white/5 dark:text-stone-400">
                      {activeProjectId ? "Team" : "Global"}
                    </span>
                  </div>
                  <span className="rounded-lg bg-indigo-600 px-2.5 py-1 text-[10px] font-bold text-white shadow-2xs">
                    Redeem ({rewardPrice}c)
                  </span>
                </div>
              </div>
            </div>

            <label className="block space-y-1.5">
              <span className="text-xs uppercase tracking-[0.16em] text-stone-500 dark:text-stone-400 font-semibold">
                Reward Title
              </span>
              <Input
                maxLength={120}
                placeholder="Coffee Break"
                required
                value={rewardName}
                onChange={(event) => onNameChange(event.target.value)}
              />
            </label>

            <label className="block space-y-1.5">
              <span className="text-xs uppercase tracking-[0.16em] text-stone-500 dark:text-stone-400 font-semibold">
                Description
              </span>
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
                <span className="text-xs uppercase tracking-[0.16em] text-stone-500 dark:text-stone-400 font-semibold">
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
                <span className="text-xs uppercase tracking-[0.16em] text-stone-500 dark:text-stone-400 font-semibold">
                  Cooldown
                </span>
                <Input
                  placeholder="Once per week"
                  value={rewardDuration}
                  onChange={(event) => onDurationChange(event.target.value)}
                />
              </label>
            </div>

            <div className="rounded-xl border border-stone-200/80 bg-stone-50/50 p-3 dark:border-white/10 dark:bg-white/[0.035]">
              <label className="flex cursor-pointer items-center justify-between gap-3">
                <span className="text-sm font-semibold text-stone-800 dark:text-stone-200">Limit stock quantity</span>
                <input
                  checked={rewardHasQuantity}
                  className="h-4 w-4 accent-amber-500 cursor-pointer"
                  type="checkbox"
                  onChange={(event) => onHasQuantityChange(event.target.checked)}
                />
              </label>
              {rewardHasQuantity ? (
                <label className="mt-3 block space-y-1.5">
                  <span className="text-xs uppercase tracking-[0.16em] text-stone-500 dark:text-stone-400 font-semibold">
                    Stock Quantity
                  </span>
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

        <div className="mt-6 flex justify-end gap-2 border-t border-stone-200/80 dark:border-white/10 pt-4">
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
      <form className="lofi-panel w-full max-w-md rounded-2xl p-5" onSubmit={onSubmit}>
        <div className="flex items-start justify-between gap-3 border-b border-stone-200/80 dark:border-white/10 pb-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-theme-danger font-semibold">Reject Request</p>
            <h2 id="reject-reward-title" className="mt-1 text-lg font-bold text-stone-900 dark:text-stone-100">
              Provide Reason
            </h2>
          </div>
          <button className="rounded-lg p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-900 dark:hover:bg-white/10 dark:hover:text-stone-100 cursor-pointer" type="button" onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </div>
        <label className="mt-4 block space-y-1.5">
          <span className="text-xs uppercase tracking-[0.16em] text-stone-500 dark:text-stone-400 font-semibold">
            Reason for Rejection
          </span>
          <Textarea
            className="resize-none"
            maxLength={500}
            placeholder="Explain why this request cannot be approved..."
            required
            value={rejectionReason}
            onChange={(event) => onReasonChange(event.target.value)}
          />
        </label>
        <div className="mt-5 flex justify-end gap-2 border-t border-stone-200/80 dark:border-white/10 pt-4">
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
