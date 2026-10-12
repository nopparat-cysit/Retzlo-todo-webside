"use client";

import { useEffect, useState, useCallback } from "react";
import {
  AlertOctagon,
  Clock,
  KeyRound,
  RefreshCw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  UserCheck
} from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import type { AdminAuditEntry, DecoyHit } from "../types";

interface ActiveAdmin {
  id: string;
  name: string | null;
  email: string;
  avatar: string | null;
  status: string;
  createdAt: string;
}

interface RecentOtp {
  id: string;
  email: string;
  attempts: number;
  usedAt: string | null;
  expiresAt: string;
  createdAt: string;
}

interface SecurityData {
  auditLogs: AdminAuditEntry[];
  decoyTelemetry: {
    totalHits: number;
    recentHits: DecoyHit[];
  };
  recentOtps: RecentOtp[];
  admins: ActiveAdmin[];
}

export function SecurityTab() {
  const { toast } = useToast();
  const [data, setData] = useState<SecurityData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSecurityData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/security");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      } else {
        toast({ message: "Failed to load security telemetry", type: "error" });
      }
    } catch {
      toast({ message: "Network error loading security logs", type: "error" });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchSecurityData();
  }, [fetchSecurityData]);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col gap-3 rounded-xl border border-stone-200/80 bg-white p-4 dark:border-white/10 dark:bg-[#0c0d18] sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-rose-500/10 p-2 text-rose-500">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-stone-900 dark:text-white text-sm">
              Fortress Defense & Honeypot Audit Matrix
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Live intrusion detection, decoy route hits, admin audit logs, and OTP verification logs.
            </p>
          </div>
        </div>

        <Button variant="ghost" size="sm" onClick={fetchSecurityData} disabled={isLoading}>
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {/* Grid: Honeypot Decoy Telemetry & Active Admins */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Honeypot Decoy Telemetry */}
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/[0.03] p-5 dark:border-rose-500/30 dark:bg-[#0f0c18]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertOctagon className="h-4 w-4 text-rose-500" />
              <h4 className="font-semibold text-rose-600 dark:text-rose-400 text-xs uppercase tracking-wider">
                Honeypot Decoy Route Telemetry (/admin)
              </h4>
            </div>
            <span className="font-mono text-xs font-bold text-rose-600 dark:text-rose-400">
              {data?.decoyTelemetry.totalHits ?? 0} Probes
            </span>
          </div>

          <p className="text-xs text-stone-500 dark:text-stone-400 mb-3">
            Unauthorized automated scanners or bots probing <code className="text-rose-400 font-mono">/admin</code> are silently captured and blocked with a false 404 Cloak.
          </p>

          <div className="divide-y divide-rose-100 max-h-64 overflow-y-auto dark:divide-white/5">
            {data?.decoyTelemetry.recentHits.map((hit) => (
              <div key={hit.id} className="py-2.5 text-xs">
                <div className="flex items-center justify-between font-mono">
                  <span className="font-bold text-stone-900 dark:text-stone-100">{hit.ip}</span>
                  <span className="text-[10px] text-stone-400">
                    {new Date(hit.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="truncate text-[11px] text-stone-400 mt-0.5" title={hit.userAgent}>
                  {hit.userAgent}
                </p>
              </div>
            ))}

            {(!data?.decoyTelemetry.recentHits || data.decoyTelemetry.recentHits.length === 0) && (
              <p className="py-6 text-center text-xs text-stone-400 italic">
                No intrusion hits recorded yet. Decoy standing by.
              </p>
            )}
          </div>
        </div>

        {/* Elevated Administrators Roster */}
        <div className="rounded-xl border border-stone-200/80 bg-white p-5 dark:border-white/10 dark:bg-[#0c0d18]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-indigo-500" />
              <h4 className="font-semibold text-stone-900 dark:text-white text-xs uppercase tracking-wider">
                Active System Administrators ({data?.admins.length || 0})
              </h4>
            </div>
          </div>

          <div className="divide-y divide-stone-100 dark:divide-white/5">
            {data?.admins.map((adm) => (
              <div key={adm.id} className="flex items-center justify-between py-2.5">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar src={adm.avatar || undefined} name={adm.name || adm.email} size={24} />
                  <div className="min-w-0">
                    <p className="truncate font-medium text-xs text-stone-900 dark:text-stone-100">
                      {adm.name || "Admin"}
                    </p>
                    <p className="truncate text-[11px] text-stone-400">{adm.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="rounded bg-indigo-100 px-1.5 py-0.5 font-mono text-[10px] font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                    ADMIN
                  </span>
                  <span className="font-mono text-[10px] text-emerald-500">{adm.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Admin Audit Logs Table */}
      <div className="overflow-hidden rounded-xl border border-stone-200/80 bg-white shadow-sm dark:border-white/10 dark:bg-[#0c0d18]">
        <div className="p-4 border-b border-stone-200/80 dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-indigo-500" />
            <h4 className="font-semibold text-stone-900 dark:text-white text-xs uppercase tracking-wider">
              Immutable Admin Action Audit Trail
            </h4>
          </div>
          <span className="font-mono text-[11px] text-stone-400">
            {data?.auditLogs.length || 0} events recorded
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-stone-200/80 bg-stone-50/80 font-mono text-[11px] uppercase tracking-wider text-stone-500 dark:border-white/10 dark:bg-white/5 dark:text-stone-400">
              <tr>
                <th className="px-4 py-3 font-semibold">Admin Account</th>
                <th className="px-4 py-3 font-semibold">Action</th>
                <th className="px-4 py-3 font-semibold">Target Type</th>
                <th className="px-4 py-3 font-semibold">Target Name / ID</th>
                <th className="px-4 py-3 font-semibold">Details</th>
                <th className="px-4 py-3 text-right font-semibold">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-stone-400 font-mono">
                    Loading audit trail...
                  </td>
                </tr>
              ) : data?.auditLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-stone-400">
                    No admin actions recorded in this session.
                  </td>
                </tr>
              ) : (
                data?.auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-stone-50/80 dark:hover:bg-white/[0.03]">
                    <td className="px-4 py-3 font-mono text-indigo-600 dark:text-indigo-400 font-medium">
                      {log.adminEmail}
                    </td>

                    <td className="px-4 py-3">
                      <span className="rounded bg-stone-100 px-2 py-0.5 font-mono text-[10px] font-bold text-stone-800 dark:bg-white/10 dark:text-stone-200">
                        {log.action}
                      </span>
                    </td>

                    <td className="px-4 py-3 font-mono text-stone-500 text-[11px]">
                      {log.targetType}
                    </td>

                    <td className="px-4 py-3 text-stone-800 dark:text-stone-200 truncate max-w-[150px]">
                      {log.targetName || log.targetId || "-"}
                    </td>

                    <td className="px-4 py-3 font-mono text-[10px] text-stone-400 max-w-[200px] truncate">
                      {log.details ? JSON.stringify(log.details) : "-"}
                    </td>

                    <td className="px-4 py-3 text-right font-mono text-stone-400">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Password Reset OTP Log Monitor */}
      <div className="overflow-hidden rounded-xl border border-stone-200/80 bg-white shadow-sm dark:border-white/10 dark:bg-[#0c0d18]">
        <div className="p-4 border-b border-stone-200/80 dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-amber-500" />
            <h4 className="font-semibold text-stone-900 dark:text-white text-xs uppercase tracking-wider">
              Password Reset OTP Activity Monitor
            </h4>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-stone-200/80 bg-stone-50/80 font-mono text-[11px] uppercase tracking-wider text-stone-500 dark:border-white/10 dark:bg-white/5 dark:text-stone-400">
              <tr>
                <th className="px-4 py-3 font-semibold">Target Email</th>
                <th className="px-4 py-3 font-semibold">Attempts</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Requested At</th>
                <th className="px-4 py-3 text-right font-semibold">Expires At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-white/5">
              {data?.recentOtps.map((otp) => {
                const isExpired = new Date(otp.expiresAt) < new Date();
                return (
                  <tr key={otp.id} className="hover:bg-stone-50/80 dark:hover:bg-white/[0.03]">
                    <td className="px-4 py-3 font-medium text-stone-900 dark:text-stone-100">
                      {otp.email}
                    </td>
                    <td className="px-4 py-3 font-mono">{otp.attempts} / 5</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded px-1.5 py-0.5 font-mono text-[10px] font-bold ${
                          otp.usedAt
                            ? "bg-emerald-500/10 text-emerald-500"
                            : isExpired
                            ? "bg-stone-100 text-stone-400 dark:bg-white/5"
                            : "bg-amber-500/10 text-amber-500"
                        }`}
                      >
                        {otp.usedAt ? "USED / RESET" : isExpired ? "EXPIRED" : "ACTIVE"}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-stone-400">
                      {new Date(otp.createdAt).toLocaleTimeString()}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-stone-400">
                      {new Date(otp.expiresAt).toLocaleTimeString()}
                    </td>
                  </tr>
                );
              })}
              {(!data?.recentOtps || data.recentOtps.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-stone-400">
                    No recent password reset attempts.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
