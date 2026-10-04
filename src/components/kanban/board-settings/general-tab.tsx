"use client";

import { Check, Globe, Lock, Search, Users, X } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { BoardMemberInfo } from "./types";

export interface BoardGeneralTabProps {
  name: string;
  onNameChange: (val: string) => void;
  isPrivate: boolean;
  onPrivacyChange: (val: boolean) => void;
  canManage: boolean;
  selectedMemberCount?: number;
  totalProjectMembersCount?: number;
  onGoToAccessTab?: () => void;
  projectMembers?: BoardMemberInfo[];
  filteredMembers?: BoardMemberInfo[];
  selectedMemberIds?: string[];
  memberSearchQuery?: string;
  onSearchChange?: (val: string) => void;
  onToggleMember?: (userId: string) => void;
  onSelectAll?: () => void;
  onClearAll?: () => void;
}

export function BoardGeneralTab({
  name,
  onNameChange,
  isPrivate,
  onPrivacyChange,
  canManage,
  selectedMemberCount = 0,
  totalProjectMembersCount = 0,
  onGoToAccessTab,
  projectMembers = [],
  filteredMembers = [],
  selectedMemberIds = [],
  memberSearchQuery = "",
  onSearchChange,
  onToggleMember,
  onSelectAll,
  onClearAll
}: BoardGeneralTabProps) {
  const activeSelectedCount = selectedMemberIds.length || selectedMemberCount;
  const totalCount = projectMembers.length || totalProjectMembersCount;

  return (
    <div className="space-y-4 pt-3 mt-0">
      {/* Board Name */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <label htmlFor="board-name-input" className="font-semibold text-stone-700 dark:text-stone-200">
            ชื่อบอร์ด (Board Name)
          </label>
          <span className="text-stone-500 font-mono text-[11px]">{name.length}/80</span>
        </div>
        <Input
          id="board-name-input"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          maxLength={80}
          required
          placeholder="เช่น Sprint 1, Marketing Campaign, Backlog"
          disabled={!canManage}
          className="h-10 text-sm"
        />
      </div>

      {/* Privacy Selector */}
      <div className="rounded-xl border border-stone-200/90 bg-stone-100/60 p-4 space-y-3 dark:border-white/10 dark:bg-white/[0.03]">
        <div>
          <p className="text-xs font-semibold text-stone-800 dark:text-stone-200">
            ความเป็นส่วนตัวและสิทธิ์เข้าถึง (Privacy & Access Mode)
          </p>
          <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
            กำหนดว่าใครบ้างใน Workspace ที่สามารถมองเห็นและร่วมทำงานบนบอร์ดนี้ได้
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <button
            type="button"
            disabled={!canManage}
            onClick={() => onPrivacyChange(false)}
            className={cn(
              "flex items-start gap-3 rounded-xl border p-3.5 text-left transition cursor-pointer",
              !isPrivate
                ? "border-dusk-lavender/60 bg-dusk-lavender/15 text-stone-900 ring-2 ring-dusk-lavender/40 dark:text-white"
                : "border-stone-200/80 bg-white text-stone-600 hover:border-stone-300 hover:text-stone-900 dark:border-white/10 dark:bg-white/[0.02] dark:text-stone-400 dark:hover:border-white/20 dark:hover:text-stone-300"
            )}
          >
            <div
              className={cn(
                "grid h-8 w-8 shrink-0 place-items-center rounded-lg border",
                !isPrivate
                  ? "border-dusk-lavender/40 bg-dusk-lavender/25 text-dusk-lavender"
                  : "border-stone-200 bg-stone-100 text-stone-500 dark:border-white/10 dark:bg-white/5"
              )}
            >
              <Globe className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-bold text-stone-900 dark:text-stone-100">Public Workspace Board</p>
                {!isPrivate && (
                  <span className="rounded-full bg-dusk-lavender/20 px-1.5 py-0.2 text-[9px] font-bold text-dusk-lavender">
                    เลือกอยู่
                  </span>
                )}
              </div>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1 leading-relaxed">
                สมาชิกทุกคนในโปรเจกต์สามารถมองเห็นและร่วมทำงานบนบอร์ดนี้ได้ทันที
              </p>
            </div>
          </button>

          <button
            type="button"
            disabled={!canManage}
            onClick={() => onPrivacyChange(true)}
            className={cn(
              "flex items-start gap-3 rounded-xl border p-3.5 text-left transition cursor-pointer",
              isPrivate
                ? "border-dusk-amber/60 bg-dusk-amber/15 text-stone-900 ring-2 ring-dusk-amber/40 dark:text-white"
                : "border-stone-200/80 bg-white text-stone-600 hover:border-stone-300 hover:text-stone-900 dark:border-white/10 dark:bg-white/[0.02] dark:text-stone-400 dark:hover:border-white/20 dark:hover:text-stone-300"
            )}
          >
            <div
              className={cn(
                "grid h-8 w-8 shrink-0 place-items-center rounded-lg border",
                isPrivate
                  ? "border-dusk-amber/40 bg-dusk-amber/25 text-dusk-amber"
                  : "border-stone-200 bg-stone-100 text-stone-500 dark:border-white/10 dark:bg-white/5"
              )}
            >
              <Lock className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-bold text-stone-900 dark:text-stone-100">Private Sub-Board</p>
                {isPrivate && (
                  <span className="rounded-full bg-dusk-amber/20 px-1.5 py-0.2 text-[9px] font-bold text-dusk-amber">
                    เลือกอยู่
                  </span>
                )}
              </div>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1 leading-relaxed">
                บอร์ดส่วนตัว กำหนดเฉพาะสมาชิกที่เลือกเท่านั้นที่สามารถเข้าถึงได้
              </p>
            </div>
          </button>
        </div>

        {/* Public Notice */}
        {!isPrivate && (
          <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 text-xs text-emerald-600 dark:text-emerald-400">
            <Check className="h-3.5 w-3.5 shrink-0" />
            <span>
              บอร์ดนี้เปิดเป็นสาธารณะ สมาชิกทั้งหมด <strong>{totalCount}</strong> คนในโปรเจกต์สามารถเปิดใช้งานได้
            </span>
          </div>
        )}

        {/* Private Member Selector Panel */}
        {isPrivate && (
          <div className="pt-2 border-t border-stone-200/60 dark:border-white/10 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-dusk-amber" />
                <span className="text-xs font-semibold text-stone-800 dark:text-stone-200">
                  สมาชิกที่ได้รับสิทธิ์เข้าถึงบอร์ด (Authorized Members)
                </span>
                <span className="rounded-full bg-dusk-amber/20 px-2 py-0.5 text-[10px] font-bold font-mono text-dusk-amber">
                  {activeSelectedCount} / {totalCount} คน
                </span>
              </div>

              {canManage && onSelectAll && onClearAll && (
                <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-[11px]"
                    onClick={onSelectAll}
                  >
                    เลือกทุกคน
                  </Button>
                  <span className="text-stone-400 dark:text-stone-600">·</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-[11px]"
                    onClick={onClearAll}
                  >
                    ล้างทั้งหมด
                  </Button>
                </div>
              )}
            </div>

            {/* Search Members */}
            {onSearchChange && (
              <div className="relative flex items-center">
                <Search className="pointer-events-none absolute left-3 h-3.5 w-3.5 text-stone-400" />
                <input
                  type="text"
                  value={memberSearchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="ค้นหาสมาชิกด้วยชื่อ หรือ อีเมล..."
                  className="h-8.5 w-full rounded-lg border border-stone-200 bg-white pl-9 pr-8 text-xs text-stone-900 placeholder:text-stone-400 outline-none focus:border-dusk-amber/60 focus:ring-1 focus:ring-dusk-amber/30 dark:border-white/10 dark:bg-white/[0.04] dark:text-stone-200 dark:placeholder:text-stone-500"
                />
                {memberSearchQuery && (
                  <button
                    type="button"
                    onClick={() => onSearchChange("")}
                    className="absolute right-2.5 text-stone-400 hover:text-stone-200"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            )}

            {/* Members List */}
            {projectMembers.length > 0 && onToggleMember ? (
              <div className="max-h-52 overflow-y-auto rounded-xl border border-stone-200 bg-white p-1 divide-y divide-stone-100 scrollbar-soft dark:border-white/10 dark:bg-black/20 dark:divide-white/5">
                {filteredMembers.length === 0 ? (
                  <p className="py-6 text-center text-xs text-stone-500">
                    ไม่พบสมาชิกที่ตรงกับคำค้นหา &ldquo;{memberSearchQuery}&rdquo;
                  </p>
                ) : (
                  filteredMembers.map((member) => {
                    const isSelected = selectedMemberIds.includes(member.id);
                    return (
                      <div
                        key={member.id}
                        onClick={() => canManage && onToggleMember(member.id)}
                        className={cn(
                          "flex items-center justify-between gap-3 p-2 rounded-lg text-xs transition cursor-pointer select-none",
                          isSelected
                            ? "bg-dusk-amber/10 dark:bg-dusk-amber/10"
                            : "hover:bg-stone-50 dark:hover:bg-white/[0.03]"
                        )}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Avatar
                            user={{
                              id: member.id,
                              name: member.name,
                              email: member.email,
                              avatar: member.avatar
                            }}
                            size={28}
                            className="shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="font-semibold text-stone-900 truncate dark:text-stone-100">
                              {member.name || member.email.split("@")[0]}
                            </p>
                            <p className="text-[11px] text-stone-400 font-mono truncate">
                              {member.email}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {member.role && (
                            <span className="rounded bg-stone-100 px-1.5 py-0.5 text-[10px] font-medium text-stone-600 dark:bg-white/10 dark:text-stone-300">
                              {member.role}
                            </span>
                          )}
                          <div
                            className={cn(
                              "grid h-5 w-5 place-items-center rounded border transition",
                              isSelected
                                ? "border-dusk-amber bg-dusk-amber text-stone-950 font-bold"
                                : "border-stone-300 dark:border-white/20"
                            )}
                          >
                            {isSelected && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            ) : onGoToAccessTab ? (
              <div className="flex items-center justify-between rounded-lg border border-dusk-amber/30 bg-dusk-amber/10 px-3 py-2 text-xs text-dusk-amber">
                <span>🔒 กำหนดสิทธิ์แล้ว {selectedMemberCount} จาก {totalProjectMembersCount} คน</span>
                <button
                  type="button"
                  onClick={onGoToAccessTab}
                  className="font-semibold underline hover:text-stone-900 transition dark:hover:text-white"
                >
                  จัดการสมาชิก →
                </button>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
