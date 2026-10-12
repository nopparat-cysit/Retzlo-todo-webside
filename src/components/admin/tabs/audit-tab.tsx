"use client";

import { useEffect, useState, useCallback, useTransition } from "react";
import {
  Activity,
  AlertOctagon,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  FileSpreadsheet,
  Filter,
  Layers,
  Lock,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  SlidersHorizontal,
  Terminal,
  UserCheck
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import type { AdminAuditLog, AdminAuditMetrics } from "../types";
import { AuditDetailDrawer } from "../drawers/audit-detail-drawer";

const CATEGORIES = [
  "ALL",
  "AUTH",
  "USER",
  "PROJECT",
  "BOARD",
  "CARD",
  "REWARDS",
  "FINANCE",
  "AI",
  "SECURITY",
  "SYSTEM"
];

const SEVERITIES = ["ALL", "INFO", "NOTICE", "WARNING", "ERROR", "CRITICAL"];

const STATUSES = ["ALL", "SUCCESS", "FAILED", "DENIED"];

export function AuditTab() {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  // Data state
  const [logs, setLogs] = useState<AdminAuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [metrics, setMetrics] = useState<AdminAuditMetrics>({
    total24h: 0,
    errorsCount: 0,
    securityBlocksCount: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");
  const [severity, setSeverity] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Inspect state
  const [selectedLog, setSelectedLog] = useState<AdminAuditLog | null>(null);

  const fetchLogs = useCallback(
    async (targetPage = 1) => {
      setIsLoading(true);
      try {
        const query = new URLSearchParams({
          page: String(targetPage),
          limit: "25"
        });
        if (search.trim()) query.set("search", search.trim());
        if (category !== "ALL") query.set("category", category);
        if (severity !== "ALL") query.set("severity", severity);
        if (status !== "ALL") query.set("status", status);
        if (startDate) query.set("startDate", startDate);
        if (endDate) query.set("endDate", endDate);

        const res = await fetch(`/api/admin/audit-logs?${query.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setLogs(data.logs || []);
          setTotal(data.total || 0);
          setPage(data.page || 1);
          setTotalPages(data.totalPages || 1);
          if (data.metrics) {
            setMetrics(data.metrics);
          }
        } else {
          toast({ message: "Failed to load audit logs", type: "error" });
        }
      } catch {
        toast({ message: "Network error loading audit telemetry", type: "error" });
      } finally {
        setIsLoading(false);
      }
    },
    [search, category, severity, status, startDate, endDate, toast]
  );

  useEffect(() => {
    fetchLogs(1);
  }, [fetchLogs]);

  // Handle Preset Filters
  const applyPreset = (preset: "ALL" | "SECURITY" | "FAILURES" | "USERS" | "AI") => {
    setPage(1);
    switch (preset) {
      case "SECURITY":
        setCategory("SECURITY");
        setSeverity("ALL");
        setStatus("ALL");
        break;
      case "FAILURES":
        setCategory("ALL");
        setSeverity("ALL");
        setStatus("FAILED");
        break;
      case "USERS":
        setCategory("USER");
        setSeverity("ALL");
        setStatus("ALL");
        break;
      case "AI":
        setCategory("AI");
        setSeverity("ALL");
        setStatus("ALL");
        break;
      case "ALL":
      default:
        setCategory("ALL");
        setSeverity("ALL");
        setStatus("ALL");
        setSearch("");
        setStartDate("");
        setEndDate("");
        break;
    }
  };

  const handleExport = (format: "csv" | "json") => {
    const query = new URLSearchParams({
      export: format
    });
    if (search.trim()) query.set("search", search.trim());
    if (category !== "ALL") query.set("category", category);
    if (severity !== "ALL") query.set("severity", severity);
    if (status !== "ALL") query.set("status", status);
    if (startDate) query.set("startDate", startDate);
    if (endDate) query.set("endDate", endDate);

    window.open(`/api/admin/audit-logs?${query.toString()}`, "_blank");
    toast({
      message: `Exporting audit records as ${format.toUpperCase()}...`,
      type: "success"
    });
  };

  const getSeverityBadgeClass = (sev: string) => {
    switch (sev.toUpperCase()) {
      case "CRITICAL":
        return "bg-red-500/15 text-red-600 border-red-500/30 dark:bg-red-950/40 dark:text-red-400";
      case "ERROR":
        return "bg-rose-500/15 text-rose-600 border-rose-500/30 dark:bg-rose-950/40 dark:text-rose-400";
      case "WARNING":
        return "bg-amber-500/15 text-amber-600 border-amber-500/30 dark:bg-amber-950/40 dark:text-amber-400";
      case "NOTICE":
        return "bg-purple-500/15 text-purple-600 border-purple-500/30 dark:bg-purple-950/40 dark:text-purple-400";
      default:
        return "bg-indigo-500/15 text-indigo-600 border-indigo-500/30 dark:bg-indigo-950/40 dark:text-indigo-400";
    }
  };

  const getStatusBadgeClass = (stat: string) => {
    switch (stat.toUpperCase()) {
      case "SUCCESS":
        return "bg-emerald-500/15 text-emerald-600 border-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-400";
      case "DENIED":
        return "bg-amber-500/15 text-amber-600 border-amber-500/30 dark:bg-amber-950/40 dark:text-amber-400";
      case "FAILED":
      default:
        return "bg-rose-500/15 text-rose-600 border-rose-500/30 dark:bg-rose-950/40 dark:text-rose-400";
    }
  };

  return (
    <div className="space-y-6">
      {/* Metric Tiles */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-stone-200/80 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#0c0d18]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-stone-500 dark:text-stone-400">
                Total Events (Past 24h)
              </p>
              <p className="mt-2 text-2xl font-bold font-mono text-stone-900 dark:text-white">
                {metrics.total24h.toLocaleString()}
              </p>
            </div>
            <div className="rounded-xl bg-indigo-500/10 p-3 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
              <Activity className="h-6 w-6" />
            </div>
          </div>
          <p className="mt-3 text-[11px] text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Neon PostgreSQL + Memory Buffer Active
          </p>
        </div>

        <div className="rounded-xl border border-stone-200/80 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#0c0d18]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-stone-500 dark:text-stone-400">
                Failed Operations
              </p>
              <p className="mt-2 text-2xl font-bold font-mono text-rose-600 dark:text-rose-400">
                {metrics.errorsCount.toLocaleString()}
              </p>
            </div>
            <div className="rounded-xl bg-rose-500/10 p-3 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
              <AlertOctagon className="h-6 w-6" />
            </div>
          </div>
          <p className="mt-3 text-[11px] text-stone-500 dark:text-stone-400">
            System errors and unhandled exceptions
          </p>
        </div>

        <div className="rounded-xl border border-stone-200/80 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#0c0d18]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-stone-500 dark:text-stone-400">
                Security Violations & Blocks
              </p>
              <p className="mt-2 text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">
                {metrics.securityBlocksCount.toLocaleString()}
              </p>
            </div>
            <div className="rounded-xl bg-amber-500/10 p-3 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
              <ShieldAlert className="h-6 w-6" />
            </div>
          </div>
          <p className="mt-3 text-[11px] text-stone-500 dark:text-stone-400">
            Honeypots, rate-limits & auth denials
          </p>
        </div>
      </div>

      {/* Filter Presets Chips */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 mr-1 flex items-center gap-1">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Presets:
        </span>
        <button
          onClick={() => applyPreset("ALL")}
          className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
            category === "ALL" && status === "ALL" && severity === "ALL"
              ? "bg-indigo-600 text-white font-semibold"
              : "border border-stone-200 bg-white text-stone-600 hover:bg-stone-50 dark:border-white/10 dark:bg-white/5 dark:text-stone-300"
          }`}
        >
          All Activity
        </button>
        <button
          onClick={() => applyPreset("SECURITY")}
          className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
            category === "SECURITY"
              ? "bg-indigo-600 text-white font-semibold"
              : "border border-stone-200 bg-white text-stone-600 hover:bg-stone-50 dark:border-white/10 dark:bg-white/5 dark:text-stone-300"
          }`}
        >
          Security & Intrusion
        </button>
        <button
          onClick={() => applyPreset("FAILURES")}
          className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
            status === "FAILED"
              ? "bg-rose-600 text-white font-semibold"
              : "border border-stone-200 bg-white text-stone-600 hover:bg-stone-50 dark:border-white/10 dark:bg-white/5 dark:text-stone-300"
          }`}
        >
          Errors & Failures
        </button>
        <button
          onClick={() => applyPreset("USERS")}
          className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
            category === "USER"
              ? "bg-indigo-600 text-white font-semibold"
              : "border border-stone-200 bg-white text-stone-600 hover:bg-stone-50 dark:border-white/10 dark:bg-white/5 dark:text-stone-300"
          }`}
        >
          User Modifications
        </button>
        <button
          onClick={() => applyPreset("AI")}
          className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
            category === "AI"
              ? "bg-indigo-600 text-white font-semibold"
              : "border border-stone-200 bg-white text-stone-600 hover:bg-stone-50 dark:border-white/10 dark:bg-white/5 dark:text-stone-300"
          }`}
        >
          AI Intelligence
        </button>
      </div>

      {/* Forensic Search & Multi-dimension Filter Bar */}
      <div className="rounded-xl border border-stone-200/80 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#0c0d18] space-y-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          {/* Search Field */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by summary, email, action, IP, target..."
              className="pl-9 text-xs"
            />
          </div>

          {/* Export Actions & Refresh */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport("csv")}
              className="text-xs font-medium"
              title="Export filtered logs as CSV"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 mr-1.5 text-emerald-600 dark:text-emerald-400" />
              <span>Export CSV</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport("json")}
              className="text-xs font-medium"
              title="Export filtered logs as JSON"
            >
              <Download className="h-3.5 w-3.5 mr-1.5 text-indigo-600 dark:text-indigo-400" />
              <span>Export JSON</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fetchLogs(page)}
              disabled={isLoading}
              title="Refresh Audit Telemetry"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>

        {/* Dropdowns Row: Category, Severity, Status, Date */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-stone-100 dark:border-white/5">
          {/* Category Dropdown */}
          <div className="flex items-center gap-1.5 rounded-lg border border-stone-200 bg-stone-50/80 px-2 py-1 text-xs dark:border-white/10 dark:bg-white/5">
            <Layers className="h-3.5 w-3.5 text-stone-400" />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              aria-label="Filter by category"
              className="bg-transparent text-xs text-stone-700 outline-none dark:text-stone-300"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c === "ALL" ? "All Categories" : c}
                </option>
              ))}
            </select>
          </div>

          {/* Severity Dropdown */}
          <div className="flex items-center gap-1.5 rounded-lg border border-stone-200 bg-stone-50/80 px-2 py-1 text-xs dark:border-white/10 dark:bg-white/5">
            <AlertOctagon className="h-3.5 w-3.5 text-stone-400" />
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              aria-label="Filter by severity"
              className="bg-transparent text-xs text-stone-700 outline-none dark:text-stone-300"
            >
              {SEVERITIES.map((s) => (
                <option key={s} value={s}>
                  {s === "ALL" ? "All Severities" : s}
                </option>
              ))}
            </select>
          </div>

          {/* Status Dropdown */}
          <div className="flex items-center gap-1.5 rounded-lg border border-stone-200 bg-stone-50/80 px-2 py-1 text-xs dark:border-white/10 dark:bg-white/5">
            <Filter className="h-3.5 w-3.5 text-stone-400" />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              aria-label="Filter by status"
              className="bg-transparent text-xs text-stone-700 outline-none dark:text-stone-300"
            >
              {STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st === "ALL" ? "All Statuses" : st}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range Start */}
          <div className="flex items-center gap-1.5 rounded-lg border border-stone-200 bg-stone-50/80 px-2 py-1 text-xs dark:border-white/10 dark:bg-white/5">
            <Calendar className="h-3.5 w-3.5 text-stone-400" />
            <span className="text-[10px] text-stone-400">From:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-transparent text-xs text-stone-700 outline-none dark:text-stone-300"
            />
          </div>

          {/* Date Range End */}
          <div className="flex items-center gap-1.5 rounded-lg border border-stone-200 bg-stone-50/80 px-2 py-1 text-xs dark:border-white/10 dark:bg-white/5">
            <Calendar className="h-3.5 w-3.5 text-stone-400" />
            <span className="text-[10px] text-stone-400">To:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-transparent text-xs text-stone-700 outline-none dark:text-stone-300"
            />
          </div>

          {/* Clear Dates if set */}
          {(startDate || endDate) && (
            <button
              onClick={() => {
                setStartDate("");
                setEndDate("");
              }}
              className="text-[11px] font-mono text-stone-500 hover:text-stone-900 dark:hover:text-stone-200 underline"
            >
              Clear Dates
            </button>
          )}

          <div className="ml-auto font-mono text-xs text-stone-400">
            Total Matches: <span className="font-bold text-stone-800 dark:text-stone-200">{total}</span>
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="overflow-hidden rounded-xl border border-stone-200/80 bg-white shadow-sm dark:border-white/10 dark:bg-[#0c0d18]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-stone-200 bg-stone-50/80 font-mono text-stone-500 dark:border-white/10 dark:bg-white/5 dark:text-stone-400">
              <tr>
                <th className="px-4 py-3 font-semibold">Timestamp</th>
                <th className="px-4 py-3 font-semibold">Status & Severity</th>
                <th className="px-4 py-3 font-semibold">Action & Category</th>
                <th className="px-4 py-3 font-semibold">Actor</th>
                <th className="px-4 py-3 font-semibold">Target Entity</th>
                <th className="px-4 py-3 font-semibold">Summary</th>
                <th className="px-4 py-3 font-semibold text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-white/5 font-sans">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-stone-400">
                    <RefreshCw className="mx-auto h-6 w-6 animate-spin text-indigo-500 mb-2" />
                    Loading forensic audit trail...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-stone-400">
                    <Shield className="mx-auto h-8 w-8 text-stone-300 dark:text-stone-700 mb-2" />
                    No audit records match the current filters.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr
                    key={log.id}
                    onClick={() => setSelectedLog(log)}
                    className="cursor-pointer transition hover:bg-stone-50/80 dark:hover:bg-white/5"
                  >
                    {/* Timestamp */}
                    <td className="px-4 py-3 font-mono whitespace-nowrap text-stone-600 dark:text-stone-300">
                      <div>{new Date(log.timestamp).toLocaleDateString()}</div>
                      <div className="text-[10px] text-stone-400">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </div>
                    </td>

                    {/* Status & Severity */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex flex-col gap-1 items-start">
                        <span
                          className={`rounded border px-1.5 py-0.5 font-mono text-[10px] font-bold ${getStatusBadgeClass(
                            log.status
                          )}`}
                        >
                          {log.status}
                        </span>
                        <span
                          className={`rounded border px-1.5 py-0.5 font-mono text-[10px] font-bold ${getSeverityBadgeClass(
                            log.severity
                          )}`}
                        >
                          {log.severity}
                        </span>
                      </div>
                    </td>

                    {/* Action & Category */}
                    <td className="px-4 py-3">
                      <div className="font-mono font-bold text-stone-800 dark:text-stone-100">
                        {log.action}
                      </div>
                      <div className="text-[11px] font-mono text-stone-400">
                        {log.category}
                      </div>
                    </td>

                    {/* Actor */}
                    <td className="px-4 py-3">
                      <div className="font-medium text-stone-800 dark:text-stone-200 truncate max-w-[150px]">
                        {log.actorEmail || "SYSTEM / BOT"}
                      </div>
                      <div className="font-mono text-[10px] text-stone-400 truncate max-w-[150px]">
                        {log.ipAddress || "Internal"}
                      </div>
                    </td>

                    {/* Target Entity */}
                    <td className="px-4 py-3">
                      {log.targetType ? (
                        <>
                          <div className="font-mono text-[11px] font-semibold text-stone-700 dark:text-stone-300">
                            {log.targetType}
                          </div>
                          <div className="text-[11px] text-stone-500 dark:text-stone-400 truncate max-w-[140px]">
                            {log.targetName || log.targetId || "-"}
                          </div>
                        </>
                      ) : (
                        <span className="text-stone-400">-</span>
                      )}
                    </td>

                    {/* Summary */}
                    <td className="px-4 py-3 max-w-[280px]">
                      <p className="truncate text-stone-600 dark:text-stone-300" title={log.summary}>
                        {log.summary}
                      </p>
                    </td>

                    {/* Inspect Button */}
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLog(log);
                        }}
                        className="h-7 px-2 text-stone-500 hover:text-indigo-600 dark:hover:text-indigo-400"
                        title="View Full Forensic Inspection"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex items-center justify-between border-t border-stone-200 px-4 py-3 dark:border-white/10 sm:px-6">
          <div className="font-mono text-xs text-stone-500 dark:text-stone-400">
            Page <span className="font-bold text-stone-800 dark:text-stone-200">{page}</span> of{" "}
            <span className="font-bold text-stone-800 dark:text-stone-200">{totalPages}</span> ({total}{" "}
            total events)
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchLogs(page - 1)}
              disabled={page <= 1 || isLoading}
              className="h-8 px-2.5 text-xs"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              <span>Previous</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchLogs(page + 1)}
              disabled={page >= totalPages || isLoading}
              className="h-8 px-2.5 text-xs"
            >
              <span>Next</span>
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>

      {/* Legal & Compliance Safeguards Footer Banner */}
      <div className="rounded-xl border border-stone-200/80 bg-stone-50/80 p-4 dark:border-white/10 dark:bg-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 text-stone-600 dark:text-stone-300">
          <Lock className="h-4 w-4 text-indigo-500 shrink-0" />
          <span>
            <strong>Legal Notice & Privacy Integrity:</strong> All entries are logged under Legitimate
            Interests (Thai PDPA Section 24(5), GDPR Art 6(1)(f)) and preserved for 90 days in accordance
            with Section 26 of the Thai Computer Crime Act B.E. 2550/2560.
          </span>
        </div>
        <span className="shrink-0 rounded bg-indigo-500/10 px-2 py-1 font-mono text-[11px] font-semibold text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">
          Zero-PII Secrets Redaction Active
        </span>
      </div>

      {/* Slide-over Inspection Drawer */}
      <AuditDetailDrawer
        log={selectedLog}
        isOpen={Boolean(selectedLog)}
        onClose={() => setSelectedLog(null)}
      />
    </div>
  );
}
