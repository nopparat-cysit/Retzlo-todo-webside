"use client";

import { useState, useEffect, useCallback } from "react";
import { Bell, Check, Sparkles, UserPlus } from "lucide-react";
import { formatShortDate } from "@/lib/date-format";
import { useToast } from "@/components/ui/toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useLiveSync } from "@/hooks/use-live-sync";
import { InvitationConfirmModal, type InvitationData } from "./invitation-confirm-modal";

interface NotificationItem {
  id: string;
  userId: string;
  projectId: string | null;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  invitation?: InvitationData | null;
}

export function NotificationsPopover() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedInvite, setSelectedInvite] = useState<InvitationData | null>(null);

  const { toast } = useToast();

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications ?? []);
      }
    } catch {
      // Silent error
    } finally {
      setLoading(false);
    }
  }, []);

  const { broadcastChange } = useLiveSync({
    channelKey: "notifications",
    intervalMs: 15000,
    canSync: () => !selectedInvite,
    onSync: fetchNotifications
  });

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  async function markAllAsRead() {
    try {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true })
      });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        toast({ message: "ทำเครื่องหมายอ่านแล้วทั้งหมด", type: "success" });
        broadcastChange();
      }
    } catch {
      toast({ message: "ไม่สามารถอัปเดตสถานะได้", type: "error" });
    }
  }

  async function markAsRead(notificationId: string) {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId })
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
      );
      broadcastChange();
    } catch {
      // Silent error
    }
  }

  return (
    <>
      <Popover
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (next) fetchNotifications();
        }}
      >
        <PopoverTrigger asChild>
          <button
            type="button"
            className="relative grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/[0.045] text-stone-400 transition hover:border-dusk-lavender/45 hover:text-dusk-lavender focus:outline-none focus-visible:ring-2 focus-visible:ring-dusk-lavender/50"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-dusk-amber px-1 text-[10px] font-bold text-ink-950 shadow-[0_0_8px_rgba(229,189,114,0.6)]">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
        </PopoverTrigger>

        <PopoverContent
          align="end"
          sideOffset={8}
          className="z-[1000] w-80 sm:w-96 rounded-2xl border border-white/10 bg-ink-950/95 p-4 shadow-2xl backdrop-blur-xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-stone-100">การแจ้งเตือน</span>
              {unreadCount > 0 && (
                <span className="rounded-full bg-dusk-lavender/20 px-2 py-0.5 text-[11px] font-medium text-dusk-lavender">
                  {unreadCount} ใหม่
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="text-[11px] text-stone-400 hover:text-dusk-lavender transition cursor-pointer"
              >
                อ่านทั้งหมด
              </button>
            )}
          </div>

          {/* List */}
          <div className="scrollbar-soft max-h-80 overflow-y-auto space-y-2 pr-1">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-stone-500">
                <Bell className="mx-auto mb-2 h-6 w-6 opacity-30 text-stone-400" />
                <p>ไม่มีการแจ้งเตือนในขณะนี้</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`rounded-xl border p-3 transition ${
                    n.isRead
                      ? "border-white/5 bg-white/[0.02] text-stone-400"
                      : "border-dusk-lavender/30 bg-dusk-lavender/[0.06] text-stone-200"
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div
                      className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${
                        n.type === "PROJECT_INVITATION"
                          ? "bg-dusk-lavender/20 text-dusk-lavender"
                          : "bg-white/10 text-stone-300"
                      }`}
                    >
                      {n.type === "PROJECT_INVITATION" ? (
                        <UserPlus className="h-4 w-4" />
                      ) : (
                        <Sparkles className="h-4 w-4" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <p className="font-medium text-xs text-stone-100 truncate">{n.title}</p>
                        <span className="text-[10px] text-stone-500 shrink-0">
                          {formatShortDate(n.createdAt)}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-stone-400 line-clamp-2 leading-relaxed">
                        {n.message}
                      </p>

                      {/* Action for Project Invitation */}
                      {n.type === "PROJECT_INVITATION" && (
                        <div className="mt-2 flex items-center gap-2">
                          {n.invitation ? (
                            <button
                              type="button"
                              onClick={() => {
                                markAsRead(n.id);
                                setSelectedInvite(n.invitation!);
                              }}
                              className="rounded-lg bg-gradient-to-r from-dusk-lavender to-indigo-500 px-3 py-1 text-xs font-semibold text-white shadow-sm hover:from-dusk-lavender/90 hover:to-indigo-500/90 transition cursor-pointer"
                            >
                              👉 ดูคำเชิญ / เข้าร่วม
                            </button>
                          ) : (
                            <span className="text-[11px] text-stone-500 italic">
                              (คำเชิญนี้หมดอายุแล้วหรือถูกตอบรับแล้ว)
                            </span>
                          )}
                          {!n.isRead && (
                            <button
                              type="button"
                              onClick={() => markAsRead(n.id)}
                              className="rounded p-1 text-stone-500 hover:text-stone-300 transition cursor-pointer"
                              title="ทำเครื่องหมายว่าอ่านแล้ว"
                            >
                              <Check className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </PopoverContent>
      </Popover>

      {/* Confirmation Modal when user clicks an invitation notification */}
      {selectedInvite && (
        <InvitationConfirmModal
          open={Boolean(selectedInvite)}
          onClose={() => setSelectedInvite(null)}
          invitation={selectedInvite}
          onAccepted={() => {
            fetchNotifications();
            setOpen(false);
            broadcastChange();
          }}
          onDeclined={() => {
            fetchNotifications();
            setOpen(false);
            broadcastChange();
          }}
        />
      )}
    </>
  );
}
