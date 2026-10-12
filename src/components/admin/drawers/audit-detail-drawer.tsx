"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Clock,
  Copy,
  Check,
  FileCode2,
  Info,
  Layers,
  Lock,
  PlusCircle,
  MinusCircle,
  Terminal,
  User,
  X
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/toast";
import type { AdminAuditLog } from "../types";

interface AuditDetailDrawerProps {
  log: AdminAuditLog | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AuditDetailDrawer({ log, isOpen, onClose }: AuditDetailDrawerProps) {
  const { toast } = useToast();
  const [copiedRaw, setCopiedRaw] = useState(false);
  const [showRawJson, setShowRawJson] = useState(false);

  if (!isOpen || !log) return null;

  const handleCopyJson = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(log, null, 2));
      setCopiedRaw(true);
      toast({ message: "Forensic Audit Log JSON copied to clipboard", type: "success" });
      setTimeout(() => setCopiedRaw(false), 2000);
    } catch {
      toast({ message: "Failed to copy JSON", type: "error" });
    }
  };

  const getSeverityBadgeVariant = (severity: string): "default" | "amber" | "rose" | "cyan" | "danger" | "muted" => {
    switch (severity.toUpperCase()) {
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

  const getStatusBadgeVariant = (status: string): "default" | "amber" | "rose" | "cyan" | "danger" | "muted" => {
    switch (status.toUpperCase()) {
      case "SUCCESS":
        return "cyan";
      case "DENIED":
        return "amber";
      case "FAILED":
      default:
        return "rose";
    }
  };

  // Extract structured diff details
  const diffData = log.diff as Record<string, unknown> | null;
  const isCreated = Boolean(diffData && diffData.created);
  const isDeleted = Boolean(diffData && diffData.deleted);
  const changedFields = (diffData?.changed || {}) as Record<string, { from: unknown; to: unknown }>;
  const addedFields = (diffData?.added || {}) as Record<string, unknown>;
  const removedFields = (diffData?.removed || {}) as Record<string, unknown>;

  const hasStructuralDiff =
    isCreated ||
    isDeleted ||
    Object.keys(changedFields).length > 0 ||
    Object.keys(addedFields).length > 0 ||
    Object.keys(removedFields).length > 0;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity"
      />

      {/* Slide-over Drawer Panel */}
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-xl flex-col bg-white shadow-2xl transition-all dark:bg-[#0c0d18] dark:border-l dark:border-white/10 sm:max-w-2xl">
        {/* Drawer Header */}
        <div className="flex items-start justify-between border-b border-border/60 px-6 py-4 dark:border-white/10">
          <div className="space-y-1.5 pr-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="muted" className="font-mono text-[11px] font-bold">
                AUDIT LOG
              </Badge>
              <Badge
                variant={getSeverityBadgeVariant(log.severity)}
                className="font-mono text-[11px] uppercase font-bold"
              >
                {log.severity}
              </Badge>
              <Badge
                variant={getStatusBadgeVariant(log.status)}
                className="font-mono text-[11px] uppercase font-bold"
              >
                {log.status}
              </Badge>
              <Badge variant="muted" className="font-mono text-[11px]">
                {log.category}
              </Badge>
            </div>
            <h2 className="font-mono text-base font-bold text-stone-900 dark:text-white break-all">
              {log.action}
            </h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
            aria-label="Close drawer"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-6 font-sans">
          {/* Summary Box with Global Panel */}
          <Panel className="p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-stone-500 dark:text-stone-400 mb-1.5">
              <Info className="h-4 w-4 text-indigo-500" />
              <span>Event Summary</span>
            </div>
            <p className="text-sm font-medium text-stone-800 dark:text-stone-100 leading-relaxed">
              {log.summary}
            </p>
          </Panel>

          {/* Timestamp & Legal Metadata Notice with Global Panel & Badge */}
          <Panel className="p-3 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-stone-600 dark:text-stone-300">
              <Clock className="h-4 w-4 text-stone-400" />
              <span className="font-mono">{new Date(log.timestamp).toLocaleString()}</span>
              <span className="text-[10px] text-stone-400">
                ({new Date(log.timestamp).toISOString()})
              </span>
            </div>
            <Badge variant="cyan" className="font-mono text-[11px] gap-1">
              <Lock className="h-3 w-3" />
              <span>PDPA Sec 24(5) & CCA Sec 26 Compliant</span>
            </Badge>
          </Panel>

          {/* Actor & Request Origin Card with Global Panel */}
          <Panel className="p-4 shadow-sm">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-3 flex items-center gap-2">
              <User className="h-4 w-4 text-indigo-500" />
              Actor & Request Context
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-stone-400 text-[11px]">Actor Identity</span>
                <p className="font-medium text-stone-800 dark:text-stone-200 truncate">
                  {log.actorEmail || "SYSTEM / ANONYMOUS"}
                </p>
                {log.actorName && (
                  <p className="text-stone-500 text-[11px] truncate">{log.actorName}</p>
                )}
              </div>

              <div>
                <span className="text-stone-400 text-[11px]">Actor Role & ID</span>
                <p className="font-mono text-stone-700 dark:text-stone-300">
                  {log.actorRole || "N/A"}
                </p>
                <p className="font-mono text-[10px] text-stone-400 truncate">
                  {log.actorId || "No ID"}
                </p>
              </div>

              <div>
                <span className="text-stone-400 text-[11px]">IP Address</span>
                <p className="font-mono font-medium text-stone-800 dark:text-stone-200">
                  {log.ipAddress || "Unknown"}
                </p>
              </div>

              <div>
                <span className="text-stone-400 text-[11px]">HTTP Method & Path</span>
                <p className="font-mono text-stone-800 dark:text-stone-200 truncate">
                  <Badge variant="muted" className="mr-1.5 font-bold uppercase text-[10px]">
                    {log.requestMethod || "INTERNAL"}
                  </Badge>
                  {log.requestPath || "-"}
                </p>
              </div>

              {log.userAgent && (
                <div className="sm:col-span-2 pt-2">
                  <Separator className="mb-2" />
                  <span className="text-stone-400 text-[11px]">User Agent</span>
                  <p className="font-mono text-[11px] text-stone-600 dark:text-stone-400 break-all leading-tight mt-0.5">
                    {log.userAgent}
                  </p>
                </div>
              )}
            </div>
          </Panel>

          {/* Target Entity Card with Global Panel */}
          {(log.targetType || log.targetId || log.targetName) && (
            <Panel className="p-4 shadow-sm">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-3 flex items-center gap-2">
                <Layers className="h-4 w-4 text-indigo-500" />
                Target Entity
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-stone-400 text-[11px]">Target Type</span>
                  <p className="font-mono font-semibold text-stone-800 dark:text-stone-200">
                    {log.targetType || "-"}
                  </p>
                </div>
                <div>
                  <span className="text-stone-400 text-[11px]">Target Name</span>
                  <p className="font-medium text-stone-800 dark:text-stone-200 truncate">
                    {log.targetName || "-"}
                  </p>
                </div>
                <div>
                  <span className="text-stone-400 text-[11px]">Target ID</span>
                  <p className="font-mono text-[11px] text-stone-500 truncate" title={log.targetId || ""}>
                    {log.targetId || "-"}
                  </p>
                </div>
              </div>
            </Panel>
          )}

          {/* Error Message / Stack Diagnostic Banner */}
          {log.errorMessage && (
            <div className="rounded-xl border border-rose-300 bg-rose-50/70 p-4 dark:border-rose-900/50 dark:bg-rose-950/20">
              <div className="flex items-center gap-2 text-xs font-bold text-rose-700 dark:text-rose-400 mb-1">
                <AlertTriangle className="h-4 w-4" />
                <span>Error Diagnostic & Failure Trace</span>
              </div>
              <p className="font-mono text-xs text-rose-800 dark:text-rose-300 break-all bg-rose-100/60 dark:bg-rose-950/40 p-2.5 rounded-lg border border-rose-200 dark:border-rose-900/40">
                {log.errorMessage}
              </p>
            </div>
          )}

          {/* Before vs After State Structural Diff */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 flex items-center gap-2">
                <Terminal className="h-4 w-4 text-indigo-500" />
                State Mutation Diff (Audit Trail)
              </h3>
              <Badge variant="muted" className="font-mono text-[10px]">
                Sanitized & PII Masked
              </Badge>
            </div>

            {hasStructuralDiff ? (
              <div className="space-y-2">
                {/* Created Entity Diff */}
                {isCreated && (
                  <div className="rounded-lg border border-emerald-300 bg-emerald-50/50 p-3 dark:border-emerald-900/40 dark:bg-emerald-950/20">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-2">
                      <PlusCircle className="h-4 w-4" />
                      <span>Entity Created</span>
                    </div>
                    <pre className="font-mono text-xs text-emerald-900 dark:text-emerald-300 overflow-x-auto whitespace-pre-wrap">
                      {JSON.stringify(diffData?.created, null, 2)}
                    </pre>
                  </div>
                )}

                {/* Deleted Entity Diff */}
                {isDeleted && (
                  <div className="rounded-lg border border-rose-300 bg-rose-50/50 p-3 dark:border-rose-900/40 dark:bg-rose-950/20">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-rose-700 dark:text-rose-400 mb-2">
                      <MinusCircle className="h-4 w-4" />
                      <span>Entity Deleted</span>
                    </div>
                    <pre className="font-mono text-xs text-rose-900 dark:text-rose-300 overflow-x-auto whitespace-pre-wrap">
                      {JSON.stringify(diffData?.deleted, null, 2)}
                    </pre>
                  </div>
                )}

                {/* Changed Fields (Side by Side Before -> After) */}
                {Object.keys(changedFields).length > 0 && (
                  <Panel className="p-3 space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                      Modified Attributes ({Object.keys(changedFields).length})
                    </span>
                    <div className="space-y-2">
                      {Object.entries(changedFields).map(([key, change]) => (
                        <div
                          key={key}
                          className="rounded-lg border border-border/70 bg-stone-50/70 p-2.5 dark:border-white/5 dark:bg-white/5 text-xs"
                        >
                          <div className="font-mono font-bold text-stone-700 dark:text-stone-300 mb-1">
                            {key}
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-[11px]">
                            <div className="rounded bg-rose-50 p-2 text-rose-700 border border-rose-200 dark:bg-rose-950/30 dark:text-rose-300 dark:border-rose-900/30">
                              <span className="text-[10px] uppercase font-bold text-rose-500 block">
                                Before
                              </span>
                              <span className="break-all">
                                {typeof change.from === "object"
                                  ? JSON.stringify(change.from)
                                  : String(change.from ?? "null")}
                              </span>
                            </div>
                            <div className="rounded bg-emerald-50 p-2 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-900/30">
                              <span className="text-[10px] uppercase font-bold text-emerald-500 block">
                                After
                              </span>
                              <span className="break-all">
                                {typeof change.to === "object"
                                  ? JSON.stringify(change.to)
                                  : String(change.to ?? "null")}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Panel>
                )}

                {/* Added Fields */}
                {Object.keys(addedFields).length > 0 && (
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50/40 p-3 dark:border-emerald-900/30 dark:bg-emerald-950/15">
                    <span className="text-[11px] font-bold uppercase text-emerald-600 dark:text-emerald-400 block mb-1">
                      New Attributes Added
                    </span>
                    <pre className="font-mono text-xs text-emerald-900 dark:text-emerald-300 overflow-x-auto whitespace-pre-wrap">
                      {JSON.stringify(addedFields, null, 2)}
                    </pre>
                  </div>
                )}

                {/* Removed Fields */}
                {Object.keys(removedFields).length > 0 && (
                  <div className="rounded-lg border border-rose-200 bg-rose-50/40 p-3 dark:border-rose-900/30 dark:bg-rose-950/15">
                    <span className="text-[11px] font-bold uppercase text-rose-600 dark:text-rose-400 block mb-1">
                      Attributes Removed
                    </span>
                    <pre className="font-mono text-xs text-rose-900 dark:text-rose-300 overflow-x-auto whitespace-pre-wrap">
                      {JSON.stringify(removedFields, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ) : (
              <Panel className="p-4 text-center text-xs text-stone-400">
                No state mutations recorded for this event (read/query or state identical).
              </Panel>
            )}
          </div>

          {/* Metadata Block if present */}
          {log.metadata && Object.keys(log.metadata).length > 0 && (
            <Panel className="p-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-2 flex items-center gap-2">
                <FileCode2 className="h-4 w-4 text-indigo-500" />
                Additional Audit Metadata
              </h3>
              <pre className="font-mono text-xs text-stone-700 dark:text-stone-300 bg-stone-50 dark:bg-white/5 p-3 rounded-lg overflow-x-auto whitespace-pre-wrap border border-stone-200/50 dark:border-white/5">
                {JSON.stringify(log.metadata, null, 2)}
              </pre>
            </Panel>
          )}

          {/* Raw Forensic JSON Toggle */}
          <div className="space-y-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowRawJson(!showRawJson)}
              className="text-xs font-mono h-8 px-2 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              {showRawJson ? "Hide Raw Record JSON" : "View Raw Record JSON"}
            </Button>

            {showRawJson && (
              <pre className="font-mono text-[11px] text-stone-700 dark:text-stone-300 bg-stone-900 text-stone-100 p-4 rounded-xl overflow-x-auto whitespace-pre-wrap border border-stone-800 max-h-60 overflow-y-auto">
                {JSON.stringify(log, null, 2)}
              </pre>
            )}
          </div>
        </div>

        {/* Drawer Footer Actions with Separator & Global Buttons */}
        <div className="border-t border-border/60 px-6 py-4 dark:border-white/10 bg-stone-50/50 dark:bg-[#07070e]">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyJson}
              className="text-xs font-mono flex items-center gap-1.5"
            >
              {copiedRaw ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy Forensic JSON</span>
                </>
              )}
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
