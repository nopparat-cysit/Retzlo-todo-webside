"use client";

import { useState, useEffect, type FormEvent } from "react";
import Link from "next/link";
import {
  ExternalLink,
  Layers,
  Plus,
  Pencil,
  Trash2,
  X,
  Loader2,
  Check,
  Palette
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { ColumnIconGlyph, ColumnIconPicker } from "@/components/kanban/column-icon-picker";
import {
  columnThemeOptions,
  type ColumnThemeId,
  type ColumnIconId
} from "@/lib/kanban/column-settings";
import type { BoardColumnInfo } from "./types";

export interface BoardColumnsTabProps {
  columns: BoardColumnInfo[];
  totalCards?: number;
  projectId?: string;
  boardId?: string;
  canManage?: boolean;
  onColumnsChange?: (columns: BoardColumnInfo[]) => void;
}

const STATUS_PRESETS: Array<{
  value: "TODO" | "DOING" | "WAITING" | "DONE";
  label: string;
  desc: string;
  badgeClass: string;
  dotClass: string;
}> = [
  {
    value: "TODO",
    label: "TODO",
    desc: "รอเริ่มงาน",
    badgeClass: "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-400/30 dark:bg-indigo-400/10 dark:text-dusk-lavender",
    dotClass: "bg-indigo-600 dark:bg-dusk-lavender"
  },
  {
    value: "DOING",
    label: "DOING",
    desc: "กำลังทำ",
    badgeClass: "border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-400/30 dark:bg-teal-400/10 dark:text-dusk-cyan",
    dotClass: "bg-teal-600 dark:bg-dusk-cyan"
  },
  {
    value: "WAITING",
    label: "WAITING",
    desc: "รอตรวจ/ติดขัด",
    badgeClass: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-dusk-amber",
    dotClass: "bg-amber-600 dark:bg-dusk-amber"
  },
  {
    value: "DONE",
    label: "DONE",
    desc: "เสร็จสิ้น",
    badgeClass: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-300",
    dotClass: "bg-emerald-600 dark:bg-emerald-400"
  }
];

export function BoardColumnsTab({
  columns,
  totalCards,
  projectId,
  boardId,
  canManage = true,
  onColumnsChange
}: BoardColumnsTabProps) {
  const { toast } = useToast();
  const [localColumns, setLocalColumns] = useState<BoardColumnInfo[]>(columns);

  // Synchronize local columns with props
  useEffect(() => {
    setLocalColumns(columns);
  }, [columns]);

  // Total cards calculation
  const calculatedTotalCards =
    totalCards !== undefined
      ? totalCards
      : localColumns.reduce((acc, c) => acc + (c.cardCount ?? 0), 0);

  // New Column Form State
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");
  const [newColumnStatus, setNewColumnStatus] = useState<"TODO" | "DOING" | "WAITING" | "DONE">("TODO");
  const [newColumnColor, setNewColumnColor] = useState<ColumnThemeId>("default");
  const [newColumnIcon, setNewColumnIcon] = useState<ColumnIconId>("kanban");
  const [newColumnWipLimit, setNewColumnWipLimit] = useState("");
  const [showAddIconPicker, setShowAddIconPicker] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Edit Column State
  const [editingColumnId, setEditingColumnId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editStatus, setEditStatus] = useState<"TODO" | "DOING" | "WAITING" | "DONE">("TODO");
  const [editColor, setEditColor] = useState<ColumnThemeId>("default");
  const [editIcon, setEditIcon] = useState<ColumnIconId>("kanban");
  const [editWipLimit, setEditWipLimit] = useState("");
  const [showEditIconPicker, setShowEditIconPicker] = useState(false);
  const [confirmEditOpen, setConfirmEditOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Delete Column State
  const [columnToDelete, setColumnToDelete] = useState<BoardColumnInfo | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Reset Add Form
  const resetAddForm = () => {
    setNewColumnName("");
    setNewColumnStatus("TODO");
    setNewColumnColor("default");
    setNewColumnIcon("kanban");
    setNewColumnWipLimit("");
    setShowAddIconPicker(false);
    setIsAddingColumn(false);
  };

  // Start Editing a column
  const startEditColumn = (col: BoardColumnInfo) => {
    setEditingColumnId(col.id);
    setEditName(col.name);
    setEditStatus(
      (col.defaultCardStatus as "TODO" | "DOING" | "WAITING" | "DONE") || "TODO"
    );
    setEditColor((col.color as ColumnThemeId) || "default");
    setEditIcon((col.icon as ColumnIconId) || "kanban");
    setEditWipLimit(col.wipLimit ? String(col.wipLimit) : "");
    setShowEditIconPicker(false);
  };

  const cancelEdit = () => {
    setEditingColumnId(null);
    setShowEditIconPicker(false);
  };

  // Create Column Handler
  const handleCreateColumn = async (e: FormEvent) => {
    e.preventDefault();
    if (!boardId) {
      toast({ message: "กรุณาเลือกบอร์ดก่อนเพิ่มคอลัมน์", type: "error" });
      return;
    }
    const trimmedName = newColumnName.trim();
    if (!trimmedName) {
      toast({ message: "กรุณาระบุชื่อคอลัมน์", type: "error" });
      return;
    }

    const parsedWip = newColumnWipLimit.trim()
      ? parseInt(newColumnWipLimit.trim(), 10)
      : null;
    if (parsedWip !== null && (isNaN(parsedWip) || parsedWip < 1 || parsedWip > 99)) {
      toast({ message: "ขีดจำกัด WIP Limit ต้องเป็นตัวเลขระหว่าง 1 - 99", type: "error" });
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch("/api/columns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          boardId,
          name: trimmedName,
          color: newColumnColor,
          icon: newColumnIcon,
          defaultCardStatus: newColumnStatus,
          wipLimit: parsedWip
        })
      });

      const data = await response.json();
      if (!response.ok || !data.column) {
        throw new Error(data.error || "เกิดข้อผิดพลาดในการสร้างคอลัมน์");
      }

      const created: BoardColumnInfo = {
        id: data.column.id,
        name: data.column.name,
        position: data.column.position,
        color: data.column.color,
        icon: data.column.icon,
        defaultCardStatus: data.column.defaultCardStatus,
        wipLimit: data.column.wipLimit,
        cardCount: 0
      };

      const updatedColumns = [...localColumns, created];
      setLocalColumns(updatedColumns);
      onColumnsChange?.(updatedColumns);

      window.dispatchEvent(
        new CustomEvent("board-columns-updated", { detail: { boardId } })
      );

      toast({ message: `เพิ่มขั้นตอนงาน "${created.name}" เรียบร้อยแล้ว`, type: "success" });
      resetAddForm();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "ไม่สามารถสร้างคอลัมน์ได้";
      toast({ message: msg, type: "error" });
    } finally {
      setIsCreating(false);
    }
  };

  // Confirm and Execute Update Column
  const handleConfirmUpdate = async () => {
    if (!editingColumnId) return;
    const trimmedName = editName.trim();
    if (!trimmedName) {
      toast({ message: "กรุณาระบุชื่อคอลัมน์", type: "error" });
      return;
    }

    const parsedWip = editWipLimit.trim() ? parseInt(editWipLimit.trim(), 10) : null;
    if (parsedWip !== null && (isNaN(parsedWip) || parsedWip < 1 || parsedWip > 99)) {
      toast({ message: "ขีดจำกัด WIP Limit ต้องเป็นตัวเลขระหว่าง 1 - 99", type: "error" });
      return;
    }

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/columns/${editingColumnId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmedName,
          color: editColor,
          icon: editIcon,
          defaultCardStatus: editStatus,
          wipLimit: parsedWip
        })
      });

      const data = await response.json();
      if (!response.ok || !data.column) {
        throw new Error(data.error || "เกิดข้อผิดพลาดในการแก้ไขคอลัมน์");
      }

      const updatedColumns = localColumns.map((col) =>
        col.id === editingColumnId
          ? {
              ...col,
              name: data.column.name,
              color: data.column.color,
              icon: data.column.icon,
              defaultCardStatus: data.column.defaultCardStatus,
              wipLimit: data.column.wipLimit
            }
          : col
      );

      setLocalColumns(updatedColumns);
      onColumnsChange?.(updatedColumns);

      if (boardId) {
        window.dispatchEvent(
          new CustomEvent("board-columns-updated", { detail: { boardId } })
        );
      }

      toast({ message: `บันทึกการแก้ไขคอลัมน์ "${trimmedName}" เรียบร้อยแล้ว`, type: "success" });
      setConfirmEditOpen(false);
      setEditingColumnId(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "ไม่สามารถแก้ไขคอลัมน์ได้";
      toast({ message: msg, type: "error" });
    } finally {
      setIsUpdating(false);
    }
  };

  // Delete Column Handler
  const handleDeleteClick = (col: BoardColumnInfo) => {
    if (col.cardCount && col.cardCount > 0) {
      toast({
        message: `ไม่สามารถลบคอลัมน์ "${col.name}" ได้เนื่องจากมี ${col.cardCount} การ์ดอยู่ด้านใน กรุณาย้ายหรือลบการ์ดออกก่อน`,
        type: "error"
      });
      return;
    }
    setColumnToDelete(col);
    setConfirmDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!columnToDelete) return;
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/columns/${columnToDelete.id}`, {
        method: "DELETE"
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "เกิดข้อผิดพลาดในการลบคอลัมน์");
      }

      const updatedColumns = localColumns.filter((c) => c.id !== columnToDelete.id);
      setLocalColumns(updatedColumns);
      onColumnsChange?.(updatedColumns);

      if (boardId) {
        window.dispatchEvent(
          new CustomEvent("board-columns-updated", { detail: { boardId } })
        );
      }

      toast({ message: `ลบคอลัมน์ "${columnToDelete.name}" เรียบร้อยแล้ว`, type: "success" });
      setConfirmDeleteOpen(false);
      setColumnToDelete(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "ไม่สามารถลบคอลัมน์ได้";
      toast({ message: msg, type: "error" });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4 pt-1 mt-0">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
        <div>
          <p className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5 text-sm">
            <Layers className="h-4 w-4 text-dusk-lavender" />
            ขั้นตอนการทำงานของบอร์ด (Workflow Stages)
          </p>
          <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
            ภาพรวมคอลัมน์, สถานะเริ่มต้น, ขีดจำกัด WIP Limit, และจำนวนงานในแต่ละขั้นตอน
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <div className="rounded-lg border border-stone-200/90 bg-stone-100/80 px-2.5 py-1 text-right font-mono text-[11px] text-stone-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-stone-300 font-semibold">
            ทั้งหมด: {calculatedTotalCards} งาน
          </div>

          {canManage && boardId && (
            <Button
              type="button"
              size="sm"
              onClick={() => {
                setIsAddingColumn(true);
                setEditingColumnId(null);
              }}
              disabled={isAddingColumn}
              className="inline-flex items-center gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-xs h-7 px-3 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>เพิ่มคอลัมน์ใหม่</span>
            </Button>
          )}
        </div>
      </div>

      {/* NEW COLUMN CREATION FORM */}
      {isAddingColumn && (
        <form
          onSubmit={handleCreateColumn}
          className="rounded-2xl border-2 border-indigo-200 bg-indigo-50/20 p-4 sm:p-5 dark:border-dusk-lavender/30 dark:bg-ink-950/40 shadow-sm space-y-4 transition-all animate-in fade-in duration-200"
        >
          <div className="flex items-center justify-between border-b border-indigo-100 dark:border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <span className="grid h-6 w-6 place-items-center rounded-md bg-indigo-600 text-white">
                <Plus className="h-3.5 w-3.5" />
              </span>
              <span className="text-xs font-bold text-stone-900 dark:text-stone-100">
                เพิ่มคอลัมน์ใหม่ (New Workflow Stage)
              </span>
            </div>
            <button
              type="button"
              onClick={resetAddForm}
              className="rounded-md p-1 text-stone-400 hover:bg-stone-200/60 hover:text-stone-700 dark:hover:bg-white/10 dark:hover:text-stone-200 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Column Name */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300">
                ชื่อขั้นตอน / คอลัมน์ <span className="text-red-500">*</span>
              </label>
              <Input
                value={newColumnName}
                onChange={(e) => setNewColumnName(e.target.value)}
                placeholder="เช่น Testing, QA, Staging, Ready..."
                maxLength={80}
                autoFocus
                className="text-xs"
              />
            </div>

            {/* Default Status */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300">
                สถานะมาตรฐาน (Default Card Status)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {STATUS_PRESETS.map((status) => {
                  const isSelected = newColumnStatus === status.value;
                  return (
                    <button
                      key={status.value}
                      type="button"
                      onClick={() => setNewColumnStatus(status.value)}
                      className={`flex items-center justify-center gap-1.5 rounded-lg border py-1.5 px-2 text-[11px] font-bold transition cursor-pointer ${
                        isSelected
                          ? `${status.badgeClass} ring-2 ring-indigo-500/20`
                          : "border-stone-200 bg-white text-stone-600 hover:bg-stone-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-stone-400"
                      }`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${status.dotClass}`} />
                      <span>{status.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
            {/* Theme Color */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                <Palette className="h-3.5 w-3.5 text-stone-500" />
                <span>ธีมสีประจำขั้นตอน</span>
              </label>
              <div className="flex items-center gap-2 flex-wrap pt-0.5">
                {columnThemeOptions.map((theme) => {
                  const isSelected = newColumnColor === theme.id;
                  return (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => setNewColumnColor(theme.id)}
                      className={`group relative grid h-7 w-7 place-items-center rounded-lg border transition cursor-pointer ${
                        isSelected
                          ? "border-stone-900 ring-2 ring-indigo-500 ring-offset-2 dark:border-white dark:ring-offset-stone-900"
                          : "border-stone-200 hover:border-stone-400 dark:border-white/10"
                      }`}
                      title={theme.label}
                    >
                      <span className={`h-4 w-4 rounded-full ${theme.swatchClass}`} />
                      {isSelected && (
                        <Check className="absolute h-2.5 w-2.5 text-white drop-shadow-sm" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Icon Picker Toggle */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300">
                ไอคอนขั้นตอน
              </label>
              <div>
                <button
                  type="button"
                  onClick={() => setShowAddIconPicker(!showAddIconPicker)}
                  className="flex items-center gap-2 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs text-stone-700 hover:bg-stone-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-stone-300 cursor-pointer w-full justify-between"
                >
                  <div className="flex items-center gap-2">
                    <ColumnIconGlyph icon={newColumnIcon} className="h-4 w-4 text-dusk-lavender" />
                    <span className="capitalize">{newColumnIcon}</span>
                  </div>
                  <span className="text-[10px] text-stone-400">
                    {showAddIconPicker ? "ปิด" : "เลือก..."}
                  </span>
                </button>
              </div>
            </div>

            {/* WIP Limit */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300">
                WIP Limit (จำกัดจำนวนการ์ด)
              </label>
              <Input
                type="number"
                min={1}
                max={99}
                value={newColumnWipLimit}
                onChange={(e) => setNewColumnWipLimit(e.target.value)}
                placeholder="ไม่จำกัด (เว้นว่างได้)"
                className="text-xs"
              />
            </div>
          </div>

          {/* Collapsible Icon Picker Dropdown */}
          {showAddIconPicker && (
            <div className="rounded-xl border border-stone-200 bg-white p-3 dark:border-white/10 dark:bg-stone-900 shadow-md">
              <ColumnIconPicker
                value={newColumnIcon}
                onChange={(icon) => {
                  setNewColumnIcon(icon);
                  setShowAddIconPicker(false);
                }}
              />
            </div>
          )}

          {/* Form Submit & Cancel */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-indigo-100 dark:border-white/10">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={resetAddForm}
              className="text-xs h-8 px-3 cursor-pointer"
            >
              ยกเลิก
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={!newColumnName.trim() || isCreating}
              className="inline-flex items-center gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-medium h-8 px-4 cursor-pointer"
            >
              {isCreating && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>{isCreating ? "กำลังสร้าง..." : "สร้างคอลัมน์"}</span>
            </Button>
          </div>
        </form>
      )}

      {/* COLUMNS LIST */}
      <div className="space-y-2 rounded-xl border border-stone-200/90 bg-stone-100/70 p-2.5 max-h-[380px] overflow-y-auto scrollbar-soft dark:border-white/10 dark:bg-ink-950/40">
        {localColumns.length === 0 ? (
          <div className="py-8 text-center space-y-2">
            <p className="text-xs text-stone-500 font-mono">
              ยังไม่มีคอลัมน์ขั้นตอนงานบนบอร์ดนี้
            </p>
            {canManage && boardId && !isAddingColumn && (
              <Button
                type="button"
                size="sm"
                onClick={() => setIsAddingColumn(true)}
                className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                <span>เพิ่มคอลัมน์แรกเลย</span>
              </Button>
            )}
          </div>
        ) : (
          localColumns.map((col, index) => {
            const isEditingThis = editingColumnId === col.id;

            if (isEditingThis) {
              return (
                <div
                  key={col.id}
                  className="rounded-xl border-2 border-dusk-lavender/50 bg-white p-3 dark:border-dusk-lavender/30 dark:bg-ink-900/90 shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-stone-100 dark:border-white/5 pb-2">
                    <span className="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                      <Pencil className="h-3 w-3 text-dusk-lavender" />
                      <span>แก้ไขคอลัมน์ #{index + 1}</span>
                    </span>
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="rounded-md p-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 cursor-pointer"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-stone-600 dark:text-stone-400">
                        ชื่อคอลัมน์
                      </label>
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="text-xs h-8"
                        autoFocus
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-stone-600 dark:text-stone-400">
                        สถานะการ์ดเริ่มต้น
                      </label>
                      <div className="grid grid-cols-4 gap-1">
                        {STATUS_PRESETS.map((status) => (
                          <button
                            key={status.value}
                            type="button"
                            onClick={() => setEditStatus(status.value)}
                            className={`rounded-md py-1 text-[10px] font-bold border transition cursor-pointer ${
                              editStatus === status.value
                                ? status.badgeClass
                                : "border-stone-200 bg-stone-50 text-stone-600 dark:border-white/5 dark:bg-white/5"
                            }`}
                          >
                            {status.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Color Swatches */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-stone-600 dark:text-stone-400">
                        ธีมสี
                      </label>
                      <div className="flex items-center gap-1.5">
                        {columnThemeOptions.map((theme) => (
                          <button
                            key={theme.id}
                            type="button"
                            onClick={() => setEditColor(theme.id)}
                            className={`grid h-6 w-6 place-items-center rounded-md border cursor-pointer ${
                              editColor === theme.id
                                ? "border-stone-900 ring-2 ring-indigo-500 ring-offset-1 dark:border-white"
                                : "border-stone-200 dark:border-white/10"
                            }`}
                          >
                            <span className={`h-3.5 w-3.5 rounded-full ${theme.swatchClass}`} />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Icon Selector */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-stone-600 dark:text-stone-400">
                        ไอคอน
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowEditIconPicker(!showEditIconPicker)}
                        className="flex items-center justify-between rounded-lg border border-stone-200 bg-white px-2 py-1 text-xs text-stone-700 hover:bg-stone-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-stone-300 cursor-pointer w-full"
                      >
                        <div className="flex items-center gap-1.5">
                          <ColumnIconGlyph icon={editIcon} className="h-3.5 w-3.5 text-dusk-lavender" />
                          <span className="capitalize text-[11px]">{editIcon}</span>
                        </div>
                        <span className="text-[10px] text-stone-400">เปลี่ยน...</span>
                      </button>
                    </div>

                    {/* WIP Limit */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-stone-600 dark:text-stone-400">
                        WIP Limit
                      </label>
                      <Input
                        type="number"
                        min={1}
                        max={99}
                        value={editWipLimit}
                        onChange={(e) => setEditWipLimit(e.target.value)}
                        placeholder="ไม่จำกัด"
                        className="text-xs h-8"
                      />
                    </div>
                  </div>

                  {showEditIconPicker && (
                    <div className="rounded-xl border border-stone-200 bg-white p-2.5 dark:border-white/10 dark:bg-stone-900 shadow-md">
                      <ColumnIconPicker
                        value={editIcon}
                        onChange={(icon) => {
                          setEditIcon(icon);
                          setShowEditIconPicker(false);
                        }}
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-1 border-t border-stone-100 dark:border-white/5">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={cancelEdit}
                      className="text-xs h-7 px-2.5 cursor-pointer"
                    >
                      ยกเลิก
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => setConfirmEditOpen(true)}
                      disabled={!editName.trim()}
                      className="inline-flex items-center gap-1 text-xs bg-indigo-600 hover:bg-indigo-700 text-white h-7 px-3 cursor-pointer"
                    >
                      <Check className="h-3 w-3" />
                      <span>บันทึกการแก้ไข</span>
                    </Button>
                  </div>
                </div>
              );
            }

            const currentStatusPreset = STATUS_PRESETS.find(
              (s) => s.value === col.defaultCardStatus
            );

            return (
              <div
                key={col.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-stone-200/80 bg-white px-3 py-2 text-xs transition hover:border-stone-300 dark:border-white/10 dark:bg-white/[0.025] dark:hover:border-white/20"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-stone-100 font-mono text-xs font-bold text-stone-600 dark:bg-white/10 dark:text-stone-300">
                    {index + 1}
                  </span>

                  <div className="grid h-7 w-7 shrink-0 place-items-center rounded-md border border-stone-200/70 bg-stone-50 dark:border-white/10 dark:bg-white/5">
                    <ColumnIconGlyph icon={col.icon} className="h-3.5 w-3.5 text-stone-700 dark:text-stone-300" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-stone-900 truncate dark:text-stone-100">
                        {col.name}
                      </p>
                      {currentStatusPreset && (
                        <span
                          className={`rounded-md border px-1.5 py-0.2 text-[9px] font-bold ${currentStatusPreset.badgeClass}`}
                        >
                          {currentStatusPreset.label}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-stone-500 mt-0.5">
                      <span>สถานะ: {col.defaultCardStatus ?? "TODO"}</span>
                      {col.wipLimit ? (
                        <span className="text-amber-600 dark:text-dusk-amber font-semibold">
                          · WIP Limit: {col.wipLimit}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="rounded-full border border-stone-200/80 bg-stone-100 px-2 py-0.5 font-mono text-[10px] text-stone-700 font-semibold dark:border-white/10 dark:bg-white/[0.05] dark:text-stone-300">
                    {col.cardCount ?? 0} การ์ด
                  </span>

                  {canManage && (
                    <div className="flex items-center gap-1 pl-1">
                      <button
                        type="button"
                        onClick={() => startEditColumn(col)}
                        title="แก้ไขคอลัมน์"
                        className="rounded-md p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-white/10 dark:hover:text-stone-200 transition cursor-pointer"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteClick(col)}
                        title={
                          col.cardCount && col.cardCount > 0
                            ? "ไม่สามารถลบได้เนื่องจากมีการ์ดอยู่"
                            : "ลบคอลัมน์"
                        }
                        className={`rounded-md p-1.5 transition cursor-pointer ${
                          col.cardCount && col.cardCount > 0
                            ? "text-stone-300 hover:text-stone-400 dark:text-stone-600"
                            : "text-stone-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                        }`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer hint & Link to Kanban */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-1">
        <p className="text-[11px] text-stone-500 italic">
          💡 สามารถเพิ่ม, แก้ไขชื่อ, กำหนด WIP Limit ได้โดยตรงที่นี่ หรือเปิดไปยังหน้ากระดาน Kanban เพื่อลากจัดเรียง
        </p>
        {projectId ? (
          <Link
            href={`/project/${projectId}/board${boardId ? `?boardId=${boardId}` : ""}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-dusk-lavender hover:underline shrink-0"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            เปิดหน้าบอร์ด →
          </Link>
        ) : null}
      </div>

      {/* CONFIRM MODAL FOR EDIT */}
      <ConfirmModal
        open={confirmEditOpen}
        title="ยืนยันการแก้ไขคอลัมน์"
        message={`คุณต้องการบันทึกการแก้ไขของคอลัมน์ "${editName}" ใช่หรือไม่?`}
        confirmLabel="บันทึก"
        cancelLabel="ยกเลิก"
        isLoading={isUpdating}
        variant="default"
        onConfirm={handleConfirmUpdate}
        onClose={() => setConfirmEditOpen(false)}
      />

      {/* CONFIRM MODAL FOR DELETE */}
      <ConfirmModal
        open={confirmDeleteOpen}
        title="ยืนยันการลบคอลัมน์"
        message={`คุณต้องการลบคอลัมน์ "${columnToDelete?.name}" ออกจากบอร์ดนี้ใช่หรือไม่? การดำเนินการนี้ไม่สามารถย้อนกลับได้`}
        confirmLabel="ลบคอลัมน์"
        cancelLabel="ยกเลิก"
        isLoading={isDeleting}
        variant="danger"
        onConfirm={handleConfirmDelete}
        onClose={() => {
          setConfirmDeleteOpen(false);
          setColumnToDelete(null);
        }}
      />
    </div>
  );
}
