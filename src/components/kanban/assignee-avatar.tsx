"use client";

import { Avatar, AvatarStack } from "@/components/ui/avatar";
import type { CardAssignee } from "@/types/kanban";

export interface AssigneeAvatarProps {
  user: CardAssignee;
  size?: number;
  className?: string;
  showTooltip?: boolean;
}

export function AssigneeAvatar({
  user,
  size = 24,
  className,
  showTooltip = false
}: AssigneeAvatarProps) {
  return (
    <Avatar
      user={user}
      size={size}
      className={className}
      showTooltip={showTooltip}
    />
  );
}

export interface AssigneeStackProps {
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

  const names = assignees.map((a) => a.name?.trim() || a.email).join(", ");

  return (
    <div className="flex items-center gap-1.5" title={`ผู้รับผิดชอบ: ${names}`}>
      <AvatarStack
        users={assignees}
        max={max}
        size={size}
        className={className}
      />
      {assignees.length === 1 && (
        <span className="max-w-[100px] truncate text-xs text-stone-400">
          {assignees[0].name?.trim() || assignees[0].email.split("@")[0]}
        </span>
      )}
    </div>
  );
}
