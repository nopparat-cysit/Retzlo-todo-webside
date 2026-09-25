"use client";

import Link from "next/link";
import { LogOut, User } from "lucide-react";
import { signOut } from "next-auth/react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { cn } from "@/lib/utils";

interface UserProfilePopoverProps {
  avatar: string | null | undefined;
  email: string;
  initials: string;
  name: string;
  status: string | null | undefined;
  statusColor: string;
  variant?: "avatar" | "card";
}

function statusLabel(status: string | null | undefined) {
  if (status === "BUSY") return "Busy";
  if (status === "OFFLINE") return "Offline";
  return "Online";
}

export function UserProfilePopover({
  avatar,
  email,
  initials,
  name,
  status,
  statusColor,
  variant = "card",
}: UserProfilePopoverProps) {
  const side = variant === "avatar" ? "bottom" : "top";
  const align = variant === "avatar" ? "end" : "start";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "group w-full transition",
            variant === "avatar" &&
              "relative block h-9 w-9 rounded-full focus:outline-none focus:ring-4 focus:ring-dusk-lavender/20",
            variant === "card" &&
              "flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.035] p-2.5 text-left hover:border-dusk-lavender/35 hover:bg-dusk-lavender/5 data-[state=open]:border-dusk-lavender/40 data-[state=open]:bg-dusk-lavender/10"
          )}
          aria-label="Open user menu"
        >
          <Avatar src={avatar} initials={initials} name={name} statusColor={statusColor} size={variant === "avatar" ? 36 : 32} />
          {variant === "card" ? (
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-stone-200 group-hover:text-dusk-lavender">
                {name}
              </p>
              <p className="text-[10px] text-stone-500">{statusLabel(status)}</p>
            </div>
          ) : null}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align={align}
        side={side}
        sideOffset={variant === "avatar" ? 10 : 12}
        className="w-72 overflow-hidden rounded-xl border border-[#e2dcd2] bg-[#faf7f2] p-0 shadow-[0_18px_48px_-6px_rgba(41,37,36,0.16)] dark:border-white/15 dark:bg-[#020208] dark:shadow-[0_24px_64px_rgba(0,0,0,0.58),inset_0_1px_0_rgba(255,255,255,0.05)]"
      >
        <div className="h-16 bg-[radial-gradient(circle_at_18%_20%,rgba(229,189,114,0.22),transparent_34%),radial-gradient(circle_at_82%_22%,rgba(213,154,179,0.22),transparent_32%),linear-gradient(135deg,rgba(35,31,68,0.9),rgba(63,46,86,0.82))]" />
        <div className="px-4 pb-4">
          <div className="-mt-7 flex items-end gap-3">
            <Avatar src={avatar} initials={initials} name={name} statusColor={statusColor} size={56} />
            <span className="mb-1 rounded-full border border-stone-200/90 bg-stone-100/90 px-2 py-1 text-[11px] text-stone-600 dark:border-white/10 dark:bg-white/5 dark:text-stone-300">
              {statusLabel(status)}
            </span>
          </div>
          <div className="mt-3">
            <p className="truncate text-sm font-semibold text-stone-900 dark:text-stone-100">{name}</p>
            <p className="mt-0.5 truncate text-xs text-stone-500">{email}</p>
          </div>
          <div className="mt-3 border-t border-stone-200/80 dark:border-white/10 pt-2.5">
            <ThemeToggle variant="dropdown" />
          </div>

          <div className="mt-2.5 space-y-1 border-t border-stone-200/80 dark:border-white/10 pt-2">
            <DropdownMenuItem asChild>
              <Link
                href="/profile"
                className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-stone-700 transition hover:bg-stone-200/60 hover:text-stone-950 focus:bg-stone-200/60 focus:text-stone-950 dark:text-stone-300 dark:hover:bg-white/5 dark:hover:text-stone-100 dark:focus:bg-white/10 dark:focus:text-stone-100"
              >
                <User className="h-4 w-4 text-indigo-600 dark:text-dusk-lavender" />
                Profile Settings
              </Link>
            </DropdownMenuItem>
          </div>

          <div className="mt-1 border-t border-stone-200/80 dark:border-white/10 pt-2">
            <DropdownMenuItem
              onSelect={(event) => {
                event.preventDefault();
                void signOut({ callbackUrl: "/login" });
              }}
              className="flex cursor-pointer items-center gap-2 rounded-lg border border-red-300/15 bg-red-400/10 px-3 py-2 text-sm text-red-200 focus:border-red-300/30 focus:bg-red-400/15 focus:text-red-100"
            >
              <LogOut className="h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
