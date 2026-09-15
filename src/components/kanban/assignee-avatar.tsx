"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import type { CardAssignee } from "@/types/kanban";

interface AssigneeAvatarProps {
  user: CardAssignee;
  size?: number;
  className?: string;
  showTooltip?: boolean;
}

// Retro Lo-Fi color backgrounds for initial avatars
const AVATAR_COLORS = [
  "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
  "bg-purple-500/20 text-purple-300 border-purple-500/30",
  "bg-amber-500/20 text-amber-300 border-amber-500/30",
  "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  "bg-rose-500/20 text-rose-300 border-rose-500/30",
];

function getAvatarColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

export function AssigneeAvatar({
  user,
  size = 24,
  className,
  showTooltip = false
}: AssigneeAvatarProps) {
  const initial = useMemo(() => {
    const raw = user.name?.trim() || user.email.trim();
    return raw[0]?.toUpperCase() || "?";
  }, [user.name, user.email]);

  const colorClass = useMemo(() => getAvatarColor(user.id), [user.id]);
  const displayName = user.name?.trim() || user.email;

  const content = (
    <div
      style={{ width: size, height: size }}
      className={cn(
        "relative grid shrink-0 place-items-center rounded-full border text-[11px] font-bold select-none overflow-hidden transition duration-150",
        colorClass,
        className
      )}
      title={showTooltip ? displayName : undefined}
    >
      {user.avatar ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={user.avatar}
          alt={displayName}
          className="h-full w-full object-cover"
        />
      ) : (
        <span>{initial}</span>
      )}
    </div>
  );

  return content;
}

interface AssigneeStackProps {
  assignees: CardAssignee[];
  max?: number;
  size?: number;
  className?: string;
  ringClass?: string;
}

export function AssigneeStack({
  assignees,
  max = 3,
  size = 22,
  className,
  ringClass = "ring-2 ring-[#0e0c1f]"
}: AssigneeStackProps) {
  if (!assignees || assignees.length === 0) {
    return null;
  }

  const visible = assignees.slice(0, max);
  const remaining = assignees.length - max;
  const names = assignees.map((a) => a.name?.trim() || a.email).join(", ");

  return (
    <div
      className={cn("flex items-center gap-1.5", className)}
      title={`ผู้รับผิดชอบ: ${names}`}
    >
      <div className="flex -space-x-1.5 overflow-hidden p-0.5">
        {visible.map((assignee) => (
          <AssigneeAvatar
            key={assignee.id}
            user={assignee}
            size={size}
            className={cn(ringClass, "hover:z-10 hover:scale-110")}
          />
        ))}
        {remaining > 0 && (
          <div
            style={{ width: size, height: size }}
            className={cn(
              "grid shrink-0 place-items-center rounded-full border border-white/10 bg-white/10 text-[10px] font-bold text-stone-300 select-none",
              ringClass
            )}
          >
            +{remaining}
          </div>
        )}
      </div>

      {assignees.length === 1 && (
        <span className="max-w-[100px] truncate text-xs text-stone-400">
          {assignees[0].name?.trim() || assignees[0].email.split("@")[0]}
        </span>
      )}
    </div>
  );
}
