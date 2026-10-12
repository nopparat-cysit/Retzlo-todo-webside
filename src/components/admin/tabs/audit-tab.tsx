"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
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
  SlidersHorizontal
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { FilterSelect, type FilterSelectOption } from "@/components/ui/filter-select";
import { Input } from "@/components/ui/input";
import { Panel } from "@/components/ui/panel";
import { Separator } from "@/components/ui/separator";
import { EmptyState, LoadingState } from "@/components/ui/state";
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

  const categoryOptions: FilterSelectOption[] = useMemo(
    () =>
      CATEGORIES.map((c) => ({
        value: c,
        label: c === "ALL" ? "All Categories" : c
      })),
    []
  );

  const severityOptions: FilterSelectOption[] = useMemo(
    () =>
      SEVERITIES.map((s) => ({
        value: s,
        label: s === "ALL" ? "All Severities" : s
      })),
    []
  );

  const statusOptions: FilterSelectOption[] = useMemo(
    () =>
      STATUSES.map((st) => ({
        value: st,
        label: st === "ALL" ? "All Statuses" : st
      })),
    []
  );

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

  const getSeverityBadgeVariant = (sev: string): "default" | "amber" | "rose" | "cyan" | "danger" | "muted" => {
    switch (sev.toUpperCase()) {
      case "CRITICAL":
        return "danger";
      case "ERROR":
        return "rose";
      case "WARNING":
        return "amber";
      case "NOTICE":
        return "default";
      case "INFO":
      default:
        return "cyan";
    }
  };

  const getStatusBadgeVariant = (stat: string): "default" | "amber" | "rose" | "cyan" | "danger" | "muted" => {
    switch (stat.toUpperCase()) {
      case "SUCCESS":
        return "cyan";
      case "DENIED":
        return "amber";
      case "FAILED":
      default:
        return "rose";
    }
  };

  return (
    <div className="space-y-6">
      {/* Metric Tiles using Global Panel Primitive */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Panel className="p-5">
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
          <div className="mt-3 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] text-stone-500 dark:text-stone-400">
              Neon PostgreSQL + Memory Buffer Active
            </span>
          </div>
        </Panel>

        <Panel className="p-5">
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
        </Panel>

        <Panel className="p-5">
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
        </Panel>
      </div>

      {/* Filter Presets Chips using Global Button & Badge Primitives */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 mr-1 flex items-center gap-1">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Presets:
        </span>
        <Button
          variant={category === "ALL" && status === "ALL" && severity === "ALL" ? "primary" : "outline"}
          size="sm"
          onClick={() => applyPreset("ALL")}
          className="h-7 text-xs"
        >
          All Activity
        </Button>
        <Button
          variant={category === "SECURITY" ? "primary" : "outline"}
          size="sm"
          onClick={() => applyPreset("SECURITY")}
          className="h-7 text-xs"
        >
          Security & Intrusion
        </Button>
        <Button
          variant={status === "FAILED" ? "danger" : "outline"}
          size="sm"
          onClick={() => applyPreset("FAILURES")}
          className="h-7 text-xs"
        >
          Errors & Failures
        </Button>
        <Button
          variant={category === "USER" ? "primary" : "outline"}
          size="sm"
          onClick={() => applyPreset("USERS")}
          className="h-7 text-xs"
        >
          User Modifications
        </Button>
        <Button
          variant={category === "AI" ? "primary" : "outline"}
          size="sm"
          onClick={() => applyPreset("AI")}
          className="h-7 text-xs"
        >
          AI Intelligence
        </Button>
      </div>

      {/* Forensic Search & Filter Bar with Global Primitives */}
      <Panel className="p-4 space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          {/* Search Input using Global Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by summary, email, action, IP, target..."
              className="pl-9 text-xs"
            />
          </div>

          {/* Export Actions & Refresh using Global Button */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport("csv")}
              className="h-9 text-xs font-medium"
              title="Export filtered logs as CSV"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 mr-1.5 text-emerald-600 dark:text-emerald-400" />
              <span>Export CSV</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport("json")}
              className="h-9 text-xs font-medium"
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
              className="h-9 w-9 p-0"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>

        <Separator />

        {/* Global FilterSelect & DatePicker Row */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Category FilterSelect */}
          <FilterSelect
            value={category}
            options={categoryOptions}
            onValueChange={setCategory}
            triggerClassName="h-9 text-xs min-w-[150px]"
          />

          {/* Severity FilterSelect */}
          <FilterSelect
            value={severity}
            options={severityOptions}
            onValueChange={setSeverity}
            triggerClassName="h-9 text-xs min-w-[140px]"
          />

          {/* Status FilterSelect */}
          <FilterSelect
            value={status}
            options={statusOptions}
            onValueChange={setStatus}
            triggerClassName="h-9 text-xs min-w-[130px]"
          />

          {/* Start Date using Global DatePicker */}
          <div className="flex items-center gap-1.5">
            <DatePicker
              value={startDate || null}
              onChange={(val) => setStartDate(val || "")}
              placeholder="From date"
              className="w-36"
              triggerClassName="h-9 text-xs"
              showShortcuts
            />
          </div>

          {/* End Date using Global DatePicker */}
          <div className="flex items-center gap-1.5">
            <DatePicker
              value={endDate || null}
              onChange={(val) => setEndDate(val || "")}
              placeholder="To date"
              className="w-36"
              triggerClassName="h-9 text-xs"
              showShortcuts
            />
          </div>

          {/* Clear Dates Button */}
          {(startDate || endDate) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setStartDate("");
                setEndDate("");
              }}
              className="h-8 px-2 text-xs font-mono text-stone-500 hover:text-stone-900 dark:hover:text-stone-200"
            >
              Clear Dates
            </Button>
          )}

          <div className="ml-auto flex items-center gap-1 font-mono text-xs text-stone-400">
            <span>Matches:</span>
            <Badge variant="muted" className="font-mono text-xs">
              {total}
            </Badge>
          </div>
        </div>
      </Panel>

      {/* Audit Log Table in Global Panel */}
      <Panel className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border/60 bg-stone-50/80 font-mono text-stone-500 dark:border-white/10 dark:bg-white/5 dark:text-stone-400">
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
            <tbody className="divide-y divide-border/40 dark:divide-white/5 font-sans">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-10">
                    <LoadingState
                      title="Loading forensic audit trail..."
                      message="Querying PostgreSQL table & circular buffer"
                    />
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-10">
                    <EmptyState
                      title="No audit records match the current filters"
                      message="Try broadening your search terms, preset filters, or date range."
                      icon={<Shield className="h-6 w-6 text-stone-400" />}
                    />
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

                    {/* Status & Severity with Global Badge */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex flex-col gap-1 items-start">
                        <Badge
                          variant={getStatusBadgeVariant(log.status)}
                          className="font-mono text-[10px] uppercase font-bold"
                        >
                          {log.status}
                        </Badge>
                        <Badge
                          variant={getSeverityBadgeVariant(log.severity)}
                          className="font-mono text-[10px] uppercase font-bold"
                        >
                          {log.severity}
                        </Badge>
                      </div>
                    </td>

                    {/* Action & Category */}
                    <td className="px-4 py-3">
                      <div className="font-mono font-bold text-stone-800 dark:text-stone-100">
                        {log.action}
                      </div>
                      <Badge variant="muted" className="mt-1 font-mono text-[10px]">
                        {log.category}
                      </Badge>
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

                    {/* Inspect Button with Global Button */}
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLog(log);
                        }}
                        className="h-8 w-8 p-0 text-stone-500 hover:text-indigo-600 dark:hover:text-indigo-400"
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
        <div className="flex items-center justify-between border-t border-border/60 px-4 py-3 dark:border-white/10 sm:px-6">
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
      </Panel>

      {/* Legal & Compliance Safeguards Footer Banner */}
      <Panel className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 text-stone-600 dark:text-stone-300">
          <Lock className="h-4 w-4 text-indigo-500 shrink-0" />
          <span>
            <strong>Legal Notice & Privacy Integrity:</strong> All entries are logged under Legitimate
            Interests (Thai PDPA Section 24(5), GDPR Art 6(1)(f)) and preserved for 90 days in accordance
            with Section 26 of the Thai Computer Crime Act B.E. 2550/2560.
          </span>
        </div>
        <Badge variant="cyan" className="font-mono text-[11px] shrink-0 font-semibold">
          Zero-PII Secrets Redaction Active
        </Badge>
      </Panel>

      {/* Slide-over Inspection Drawer */}
      <AuditDetailDrawer
        log={selectedLog}
        isOpen={Boolean(selectedLog)}
        onClose={() => setSelectedLog(null)}
      />
    </div>
  );
}
