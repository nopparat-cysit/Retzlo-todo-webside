"use client";

import Image from "next/image";
import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { useEffect, useRef, useState } from "react";

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
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  return (
    <div ref={rootRef} className="relative z-[220]">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={cn(
          "group w-full transition",
          variant === "avatar" &&
            "relative block h-9 w-9 rounded-full focus:outline-none focus:ring-4 focus:ring-dusk-lavender/20",
          variant === "card" &&
            "flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.035] p-2.5 text-left hover:border-dusk-lavender/35 hover:bg-dusk-lavender/5"
        )}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <Avatar avatar={avatar} initials={initials} name={name} statusColor={statusColor} size={variant === "avatar" ? 36 : 32} />
        {variant === "card" ? (
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-stone-200 group-hover:text-dusk-lavender">
              {name}
            </p>
            <p className="text-[10px] text-stone-500">{statusLabel(status)}</p>
          </div>
        ) : null}
      </button>

      {open ? (
        <div
          role="menu"
          className={cn(
            "absolute z-[220] w-72 overflow-hidden rounded-2xl border border-white/15 bg-[#020208] shadow-[0_28px_80px_rgba(0,0,0,0.86),inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-xl",
            variant === "avatar" ? "right-0 top-12" : "bottom-full left-0 mb-3"
          )}
        >
          <div className="h-16 bg-[radial-gradient(circle_at_18%_20%,rgba(229,189,114,0.22),transparent_34%),radial-gradient(circle_at_82%_22%,rgba(213,154,179,0.22),transparent_32%),linear-gradient(135deg,rgba(35,31,68,0.9),rgba(63,46,86,0.82))]" />
          <div className="px-4 pb-4">
            <div className="-mt-7 flex items-end gap-3">
              <Avatar avatar={avatar} initials={initials} name={name} statusColor={statusColor} size={56} />
              <span className="mb-1 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-stone-300">
                {statusLabel(status)}
              </span>
            </div>
            <div className="mt-3">
              <p className="truncate text-sm font-semibold text-stone-100">{name}</p>
              <p className="mt-0.5 truncate text-xs text-stone-500">{email}</p>
            </div>
            <div className="mt-4 grid gap-2">
              <button
                role="menuitem"
                type="button"
                onClick={() => void signOut({ callbackUrl: "/login" })}
                className="flex items-center gap-2 rounded-xl border border-red-300/15 bg-red-400/10 px-3 py-2 text-left text-sm text-red-200 transition hover:border-red-300/30 hover:bg-red-400/15"
              >
                <LogOut className="h-4 w-4" />
                Log out
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Avatar({
  avatar,
  initials,
  name,
  size,
  statusColor,
}: {
  avatar: string | null | undefined;
  initials: string;
  name: string;
  size: number;
  statusColor: string;
}) {
  return (
    <span className="relative block shrink-0" style={{ height: size, width: size }}>
      <span className="block h-full w-full overflow-hidden rounded-full border border-white/20 bg-dusk-lavender/15">
        {avatar ? (
          <Image
            src={avatar}
            alt={name}
            width={size}
            height={size}
            className="h-full w-full object-cover"
            unoptimized
          />
        ) : (
          <span className="grid h-full w-full place-items-center text-xs font-bold text-dusk-lavender">
            {initials}
          </span>
        )}
      </span>
      <span
        className={cn(
          "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-ink-950",
          statusColor
        )}
      />
    </span>
  );
}
