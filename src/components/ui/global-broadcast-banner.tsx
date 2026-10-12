"use client";

import { useEffect, useState } from "react";
import { AlertCircle, AlertTriangle, Info, X } from "lucide-react";

interface SystemBroadcast {
  id: string;
  message: string;
  type: "info" | "warning" | "urgent";
  active: boolean;
  createdAt: string;
  createdBy: string;
}

export function GlobalBroadcastBanner() {
  const [broadcast, setBroadcast] = useState<SystemBroadcast | null>(null);
  const [dismissedId, setDismissedId] = useState<string | null>(null);

  useEffect(() => {
    // Check session storage for dismissed broadcast
    try {
      const stored = sessionStorage.getItem("retzlo_dismissed_broadcast");
      if (stored) {
        setDismissedId(stored);
      }
    } catch {
      // ignore
    }

    const fetchBroadcast = async () => {
      try {
        const res = await fetch("/api/admin/broadcast");
        if (res.ok) {
          const data = await res.json();
          if (data.broadcast && data.broadcast.active) {
            setBroadcast(data.broadcast);
          } else {
            setBroadcast(null);
          }
        }
      } catch {
        // silent fail
      }
    };

    fetchBroadcast();
    // Poll every 60s
    const interval = setInterval(fetchBroadcast, 60000);
    return () => clearInterval(interval);
  }, []);

  if (!broadcast || !broadcast.active || broadcast.id === dismissedId) {
    return null;
  }

  const handleDismiss = () => {
    setDismissedId(broadcast.id);
    try {
      sessionStorage.setItem("retzlo_dismissed_broadcast", broadcast.id);
    } catch {
      // ignore
    }
  };

  const getStyle = () => {
    switch (broadcast.type) {
      case "urgent":
        return {
          wrapper: "bg-rose-950/90 text-rose-200 border-b border-rose-800/80 shadow-rose-950/30",
          icon: <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 animate-pulse" />,
          badge: "bg-rose-500/20 text-rose-300 border border-rose-500/40"
        };
      case "warning":
        return {
          wrapper: "bg-amber-950/90 text-amber-200 border-b border-amber-800/80 shadow-amber-950/30",
          icon: <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />,
          badge: "bg-amber-500/20 text-amber-300 border border-amber-500/40"
        };
      case "info":
      default:
        return {
          wrapper: "bg-indigo-950/90 text-indigo-200 border-b border-indigo-800/80 shadow-indigo-950/30",
          icon: <Info className="w-4 h-4 text-indigo-400 shrink-0" />,
          badge: "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40"
        };
    }
  };

  const style = getStyle();

  return (
    <div
      role="alert"
      className={`relative z-50 px-4 py-2 text-xs md:text-sm backdrop-blur-md shadow-md transition-all ${style.wrapper}`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          {style.icon}
          <span
            className={`hidden sm:inline-block text-[10px] font-mono uppercase px-1.5 py-0.5 rounded tracking-wider font-semibold ${style.badge}`}
          >
            {broadcast.type}
          </span>
          <p className="truncate font-medium">{broadcast.message}</p>
        </div>
        <button
          onClick={handleDismiss}
          type="button"
          aria-label="Dismiss announcement"
          className="p-1 rounded hover:bg-white/10 text-stone-400 hover:text-stone-100 transition-colors shrink-0"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
