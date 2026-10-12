"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Database,
  Globe,
  Info,
  Radio,
  RefreshCw,
  Send,
  Server,
  Trash2,
  Zap
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import type { SystemBroadcast } from "../types";

export function OperationsTab() {
  const { toast } = useToast();

  const [broadcast, setBroadcast] = useState<SystemBroadcast | null>(null);
  const [message, setMessage] = useState("");
  const [broadcastType, setBroadcastType] = useState<"info" | "warning" | "urgent">("info");
  const [isActive, setIsActive] = useState(true);
  const [isDeploying, setIsDeploying] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // DB diagnostic ping state
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [isPinging, setIsPinging] = useState(false);

  const fetchBroadcast = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/broadcast");
      if (res.ok) {
        const data = await res.json();
        setBroadcast(data.broadcast);
        if (data.broadcast) {
          setMessage(data.broadcast.message);
          setBroadcastType(data.broadcast.type);
          setIsActive(data.broadcast.active);
        }
      }
    } catch {
      // silent
    }
  }, []);

  const measureLatency = useCallback(async () => {
    setIsPinging(true);
    const start = performance.now();
    try {
      const res = await fetch("/api/admin/overview");
      if (res.ok) {
        const data = await res.json();
        setLatencyMs(data.systemHealth?.dbLatencyMs ?? Math.round(performance.now() - start));
      }
    } catch {
      // silent
    } finally {
      setIsPinging(false);
    }
  }, []);

  useEffect(() => {
    fetchBroadcast();
    measureLatency();
  }, [fetchBroadcast, measureLatency]);

  const handleDeployBroadcast = async () => {
    if (!message.trim()) {
      toast({ message: "Please provide a broadcast announcement message", type: "error" });
      return;
    }

    setIsDeploying(true);
    try {
      const res = await fetch("/api/admin/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: message.trim(),
          type: broadcastType,
          active: isActive
        })
      });

      if (res.ok) {
        const data = await res.json();
        setBroadcast(data.broadcast);
        toast({ message: "Global broadcast banner deployed successfully", type: "success" });
      } else {
        const err = await res.json();
        toast({ message: err.error || "Failed to deploy broadcast", type: "error" });
      }
    } catch {
      toast({ message: "Network error deploying announcement", type: "error" });
    } finally {
      setIsDeploying(false);
    }
  };

  const handleClearBroadcast = async () => {
    setIsDeploying(true);
    try {
      const res = await fetch("/api/admin/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clear: true })
      });

      if (res.ok) {
        setBroadcast(null);
        setMessage("");
        setShowClearConfirm(false);
        toast({ message: "Global broadcast announcement cleared", type: "success" });
      }
    } catch {
      toast({ message: "Network error clearing announcement", type: "error" });
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Broadcast Manager Banner */}
      <div className="rounded-xl border border-stone-200/80 bg-white p-5 dark:border-white/10 dark:bg-[#0c0d18]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Radio className="h-5 w-5 text-indigo-500 animate-pulse" />
            <div>
              <h3 className="font-semibold text-stone-900 dark:text-white text-sm">
                Global Platform Broadcast System
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Instantly transmit critical notices, maintenance warnings, or updates to all logged-in users.
              </p>
            </div>
          </div>

          {broadcast && broadcast.active && (
            <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-500 font-mono">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              BROADCAST ACTIVE
            </span>
          )}
        </div>

        {/* Live Preview of Banner */}
        <div className="mb-5 space-y-1.5">
          <span className="text-[11px] font-mono text-stone-400 uppercase tracking-wider">
            Live Preview (How users will see this banner)
          </span>
          <div
            className={`flex items-center gap-2.5 rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
              broadcastType === "urgent"
                ? "border-rose-800/80 bg-rose-950/80 text-rose-200"
                : broadcastType === "warning"
                ? "border-amber-800/80 bg-amber-950/80 text-amber-200"
                : "border-indigo-800/80 bg-indigo-950/80 text-indigo-200"
            }`}
          >
            {broadcastType === "urgent" ? (
              <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
            ) : broadcastType === "warning" ? (
              <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
            ) : (
              <Info className="h-4 w-4 text-indigo-400 shrink-0" />
            )}
            <span className="font-mono uppercase text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/10">
              {broadcastType}
            </span>
            <p className="truncate">
              {message.trim() || "Enter your announcement message below to preview..."}
            </p>
          </div>
        </div>

        {/* Editor Form */}
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
              Announcement Message (Max 300 characters)
            </label>
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g. Retzlo scheduled maintenance will occur at 02:00 UTC."
              maxLength={300}
              className="mt-1 text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                Notice Severity
              </label>
              <div className="mt-1 grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setBroadcastType("info")}
                  className={`rounded-lg border p-2 text-xs font-medium transition ${
                    broadcastType === "info"
                      ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300"
                      : "border-stone-200 dark:border-white/10 text-stone-500"
                  }`}
                >
                  INFO
                </button>
                <button
                  type="button"
                  onClick={() => setBroadcastType("warning")}
                  className={`rounded-lg border p-2 text-xs font-medium transition ${
                    broadcastType === "warning"
                      ? "border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
                      : "border-stone-200 dark:border-white/10 text-stone-500"
                  }`}
                >
                  WARNING
                </button>
                <button
                  type="button"
                  onClick={() => setBroadcastType("urgent")}
                  className={`rounded-lg border p-2 text-xs font-medium transition ${
                    broadcastType === "urgent"
                      ? "border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
                      : "border-stone-200 dark:border-white/10 text-stone-500"
                  }`}
                >
                  URGENT
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                Broadcast State
              </label>
              <div className="mt-1 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsActive(true)}
                  className={`flex-1 rounded-lg border p-2 text-xs font-medium transition ${
                    isActive
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                      : "border-stone-200 dark:border-white/10 text-stone-500"
                  }`}
                >
                  Enabled (Broadcasting)
                </button>
                <button
                  type="button"
                  onClick={() => setIsActive(false)}
                  className={`flex-1 rounded-lg border p-2 text-xs font-medium transition ${
                    !isActive
                      ? "border-stone-500 bg-stone-100 text-stone-800 dark:bg-white/10 dark:text-stone-200"
                      : "border-stone-200 dark:border-white/10 text-stone-500"
                  }`}
                >
                  Draft / Inactive
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            {broadcast && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowClearConfirm(true)}
                className="text-xs text-rose-500 hover:text-rose-600"
              >
                <Trash2 className="mr-1 h-3.5 w-3.5" />
                Clear Announcement
              </Button>
            )}
            <Button
              variant="primary"
              size="sm"
              onClick={handleDeployBroadcast}
              disabled={isDeploying}
            >
              <Send className="mr-1.5 h-3.5 w-3.5" />
              Deploy Global Broadcast
            </Button>
          </div>
        </div>
      </div>

      {/* System Diagnostics & Latency Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Neon Postgres Diagnostic */}
        <div className="rounded-xl border border-stone-200/80 bg-white p-5 dark:border-white/10 dark:bg-[#0c0d18]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono text-stone-500 uppercase tracking-wider">
              Neon PostgreSQL
            </span>
            <Database className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="font-mono text-2xl font-bold text-stone-900 dark:text-white">
            {latencyMs !== null ? `${latencyMs} ms` : "..."}
          </p>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-[11px] text-emerald-500 flex items-center gap-1 font-mono">
              <CheckCircle2 className="h-3 w-3" />
              SSL Connected
            </span>
            <Button variant="ghost" size="sm" onClick={measureLatency} disabled={isPinging} className="h-6 px-2 text-[10px]">
              <RefreshCw className={`h-3 w-3 ${isPinging ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>

        {/* Runtime Environment */}
        <div className="rounded-xl border border-stone-200/80 bg-white p-5 dark:border-white/10 dark:bg-[#0c0d18]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono text-stone-500 uppercase tracking-wider">
              Runtime Target
            </span>
            <Server className="h-4 w-4 text-indigo-500" />
          </div>
          <p className="font-mono text-xl font-bold text-stone-900 dark:text-white uppercase">
            {process.env.NODE_ENV || "Development"}
          </p>
          <p className="mt-2 text-[11px] text-stone-400 font-mono">
            Next.js App Router (Node v20+)
          </p>
        </div>

        {/* Identity & Encryption */}
        <div className="rounded-xl border border-stone-200/80 bg-white p-5 dark:border-white/10 dark:bg-[#0c0d18]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono text-stone-500 uppercase tracking-wider">
              Security Cloak
            </span>
            <Globe className="h-4 w-4 text-purple-500" />
          </div>
          <p className="font-mono text-xl font-bold text-purple-500">
            Honeypot Active
          </p>
          <p className="mt-2 text-[11px] text-stone-400 font-mono">
            /admin decoy route active
          </p>
        </div>
      </div>

      {/* Clear Broadcast Modal */}
      <ConfirmModal
        open={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={handleClearBroadcast}
        title="Clear Global Broadcast"
        message="Are you sure you want to completely remove the active global broadcast banner from all user screens?"
        confirmLabel="Clear Banner"
        variant="danger"
        isLoading={isDeploying}
      />
    </div>
  );
}
