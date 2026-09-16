"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import { Check, Plus, Search, UserCheck, Users, X } from "lucide-react";
import { AssigneeAvatar } from "./assignee-avatar";
import { cn } from "@/lib/utils";
import type { CardAssignee } from "@/types/kanban";

interface AssigneePickerProps {
  members: CardAssignee[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  disabled?: boolean;
}

export function AssigneePicker({
  members,
  selectedIds,
  onChange,
  disabled = false
}: AssigneePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const popoverRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      // Auto-focus search input
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const selectedMembers = useMemo(() => {
    const memberMap = new Map(members.map((m) => [m.id, m]));
    return selectedIds
      .map((id) => memberMap.get(id))
      .filter((m): m is CardAssignee => Boolean(m));
  }, [members, selectedIds]);

  const filteredMembers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return members;
    return members.filter(
      (m) =>
        (m.name && m.name.toLowerCase().includes(q)) ||
        (m.email && m.email.toLowerCase().includes(q))
    );
  }, [members, searchQuery]);

  function toggleMember(id: string) {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((item) => item !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  }

  function removeMember(id: string) {
    onChange(selectedIds.filter((item) => item !== id));
  }

  function selectAll() {
    onChange(members.map((m) => m.id));
  }

  function clearAll() {
    onChange([]);
  }

  return (
    <div className="space-y-2 text-sm text-stone-300" ref={popoverRef}>
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 font-medium">
          <Users className="h-4 w-4 text-dusk-lavender" />
          <span>ผู้รับผิดชอบ / คนดูแล (Assignees)</span>
        </span>
        <span className="text-xs text-stone-500">
          {selectedIds.length === 0 ? "ยังไม่มีคนดูแล" : `${selectedIds.length} คน`}
        </span>
      </div>

      {/* Selected Assignee Chips */}
      <div className="flex flex-wrap items-center gap-1.5 min-h-[36px]">
        {selectedMembers.map((member) => (
          <span
            key={member.id}
            className="inline-flex items-center gap-1.5 rounded-full border border-dusk-lavender/30 bg-dusk-lavender/15 pl-1.5 pr-2 py-0.5 text-xs text-stone-200 shadow-xs transition hover:border-dusk-lavender/50"
          >
            <AssigneeAvatar user={member} size={18} />
            <span className="max-w-[120px] truncate font-medium">
              {member.name?.trim() || member.email}
            </span>
            {!disabled && (
              <button
                type="button"
                onClick={() => removeMember(member.id)}
                className="text-stone-400 hover:text-stone-100 transition"
                title={`ลบ ${member.name || member.email}`}
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </span>
        ))}

        {!disabled && (
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="inline-flex items-center gap-1 rounded-md border border-dashed border-white/20 bg-white/[0.03] px-2.5 py-1 text-xs text-stone-400 hover:border-dusk-lavender/50 hover:bg-white/[0.08] hover:text-stone-200 transition"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>{selectedMembers.length === 0 ? "เลือกคนดูแล / ผู้รับผิดชอบ" : "เพิ่มอีก"}</span>
          </button>
        )}
      </div>

      {/* Dropdown Popover */}
      {isOpen && !disabled && (
        <div className="relative z-50">
          <div className="absolute left-0 top-1 w-full max-w-sm rounded-xl border border-white/15 bg-[#120f26] p-3 shadow-2xl backdrop-blur-xl animate-in fade-in-0 zoom-in-95 duration-150">
            {/* Search Input */}
            <div className="relative mb-2.5">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-stone-400" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="ค้นหาสมาชิกด้วยชื่อหรืออีเมล..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 w-full rounded-md border border-white/10 bg-white/5 pl-8 pr-3 text-xs text-stone-100 outline-none placeholder:text-stone-500 focus:border-dusk-lavender/60"
              />
            </div>

            {/* Quick Actions */}
            {members.length > 1 && (
              <div className="mb-2 flex items-center justify-between border-b border-white/10 pb-1.5 text-[11px]">
                <button
                  type="button"
                  onClick={selectAll}
                  className="text-dusk-lavender hover:underline"
                >
                  เลือกทุกคน ({members.length})
                </button>
                {selectedIds.length > 0 && (
                  <button
                    type="button"
                    onClick={clearAll}
                    className="text-stone-400 hover:text-red-400"
                  >
                    ล้างทั้งหมด
                  </button>
                )}
              </div>
            )}

            {/* Members List */}
            <div className="max-h-52 overflow-y-auto space-y-1 scrollbar-soft pr-1">
              {filteredMembers.length === 0 ? (
                <p className="py-4 text-center text-xs text-stone-500">
                  {searchQuery ? "ไม่พบสมาชิกที่ตรงกับการค้นหา" : "ยังไม่มีสมาชิกในโปรเจกต์ (เชิญสมาชิกได้ที่เมนูด้านบน)"}
                </p>
              ) : (
                filteredMembers.map((member) => {
                  const isSelected = selectedIds.includes(member.id);
                  return (
                    <button
                      key={member.id}
                      type="button"
                      onClick={() => toggleMember(member.id)}
                      className={cn(
                        "flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs transition",
                        isSelected
                          ? "bg-dusk-lavender/20 text-white font-medium"
                          : "text-stone-300 hover:bg-white/5 hover:text-white"
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <AssigneeAvatar user={member} size={24} />
                        <div className="min-w-0">
                          <p className="truncate">{member.name?.trim() || member.email}</p>
                          {member.name && (
                            <p className="truncate text-[10px] text-stone-500">{member.email}</p>
                          )}
                        </div>
                      </div>
                      <div
                        className={cn(
                          "grid h-4 w-4 shrink-0 place-items-center rounded border transition",
                          isSelected
                            ? "border-dusk-lavender bg-dusk-lavender text-ink-950 font-bold"
                            : "border-white/20 bg-transparent"
                        )}
                      >
                        {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Footer close button */}
            <div className="mt-2.5 border-t border-white/10 pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-md bg-white/10 px-3 py-1 text-xs text-stone-200 hover:bg-white/15 transition font-medium"
              >
                เรียบร้อย
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
