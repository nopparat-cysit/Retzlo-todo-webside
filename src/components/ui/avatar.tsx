"use client";

import { useMemo } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export interface AvatarUser {
  id?: string;
  name?: string | null;
  email?: string | null;
  avatar?: string | null;
  role?: string;
}

export interface AvatarProps {
  user?: AvatarUser | null;
  src?: string | null;
  name?: string | null;
  email?: string | null;
  initials?: string | null;
  size?: number;
  className?: string;
  showTooltip?: boolean;
  statusColor?: string;
}

export interface AvatarStackProps {
  users?: AvatarUser[];
  assignees?: AvatarUser[];
  max?: number;
  size?: number;
  className?: string;
  showTooltips?: boolean;
}

const AVATAR_COLORS = [
  "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/20 dark:text-indigo-300 dark:border-indigo-500/30",
  "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/20 dark:text-purple-300 dark:border-purple-500/30",
  "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30",
  "bg-teal-50 text-teal-700 border-teal-200 dark:bg-cyan-500/20 dark:text-cyan-300 dark:border-cyan-500/30",
  "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30",
  "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/30",
];

export function getAvatarColor(id: string = ""): string {
  if (!id) return AVATAR_COLORS[0];
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

export function Avatar({
  user,
  src,
  name,
  email,
  initials: explicitInitials,
  size = 24,
  className,
  showTooltip = false,
  statusColor
}: AvatarProps) {
  const avatarSrc = src ?? user?.avatar ?? null;
  const displayName = name ?? user?.name ?? email ?? user?.email ?? "";
  const identifier = user?.id ?? displayName ?? "";

  const initials = useMemo(() => {
    if (explicitInitials) return explicitInitials.toUpperCase();
    const raw = displayName.trim();
    if (!raw) return "?";
    return raw[0]?.toUpperCase() || "?";
  }, [explicitInitials, displayName]);

  const colorClass = useMemo(() => getAvatarColor(identifier), [identifier]);

  return (
    <span
      className={cn("relative inline-block shrink-0 select-none rounded-full", className)}
      style={{ width: size, height: size }}
      title={showTooltip && displayName ? displayName : undefined}
    >
      <span
        className={cn(
          "grid h-full w-full place-items-center overflow-hidden rounded-full text-[11px] font-bold transition duration-150",
          avatarSrc ? "border-0" : cn("border", colorClass)
        )}
      >
        {avatarSrc ? (
          <Image
            src={avatarSrc}
            alt={displayName || "User avatar"}
            width={size}
            height={size}
            className="h-full w-full object-cover rounded-full"
            unoptimized
          />
        ) : (
          <span>{initials}</span>
        )}
      </span>

      {statusColor && (
        <span
          className={cn(
            "absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full ring-2 ring-ink-950",
            statusColor
          )}
        />
      )}
    </span>
  );
}

export function AvatarStack({
  users,
  assignees,
  max = 3,
  size = 20,
  className,
  showTooltips = true
}: AvatarStackProps) {
  const items = users ?? assignees ?? [];
  if (items.length === 0) return null;

  const visible = items.slice(0, max);
  const remaining = items.length - max;

  return (
    <div className={cn("flex items-center -space-x-1.5", className)}>
      {visible.map((item, idx) => (
        <div key={item.id ?? idx} className="relative rounded-full transition hover:z-10 hover:scale-110">
          <Avatar
            user={item}
            size={size}
            showTooltip={showTooltips}
            className={cn("rounded-full", visible.length > 1 && "ring-1.5 ring-white dark:ring-ink-950")}
          />
        </div>
      ))}
      {remaining > 0 && (
        <div
          style={{ width: size, height: size }}
          className="grid shrink-0 place-items-center rounded-full border border-stone-200 bg-stone-100 text-[10px] font-bold text-stone-700 shadow-xs ring-1 ring-white dark:border-white/20 dark:bg-ink-900 dark:text-stone-300 dark:ring-ink-950"
          title={`${remaining} more`}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
}
