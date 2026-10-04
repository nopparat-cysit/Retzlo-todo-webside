"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import {
  FolderKanban,
  Layers,
  Palette,
  ShieldCheck,
  Sparkles,
  Volume2
} from "lucide-react";

import { ProjectBoardsManager } from "@/components/project/project-boards-manager";
import { SettingsForm } from "@/components/project/settings-form";
import { SoundToggle } from "@/components/project/sound-toggle";
import { cn } from "@/lib/utils";

export type SettingsTabId = "boards" | "identity" | "features" | "preferences" | "all";

interface TabItem {
  id: SettingsTabId;
  label: string;
  shortLabel: string;
  icon: typeof FolderKanban;
  badge?: string | number;
  description: string;
}

interface ProjectSettingsClientProps {
  projectId: string;
  project: {
    id: string;
    name: string;
    description: string | null;
    coverImage: string | null;
    themeColor: string | null;
    sticker: string | null;
    allowMemberPrivateItems: boolean;
    notesEnabled: boolean;
    members: { role: string }[];
  };
  formattedBoards: Array<{
    id: string;
    name: string;
    projectId: string;
    isPrivate: boolean;
    createdAt: string;
    memberUserIds: string[];
    members: Array<{
      userId: string;
      user: {
        id: string;
        name: string | null;
        email: string;
        avatar: string | null;
      };
    }>;
    cardCount: number;
  }>;
  projectMembers: Array<{
    id: string;
    userId: string;
    role: string;
    user: {
      id: string;
      name: string | null;
      email: string;
      avatar: string | null;
    };
  }>;
  canManage: boolean;
  initialTab?: string;
  themeToggleSlot?: ReactNode;
}

export function ProjectSettingsClient({
  projectId,
  project,
  formattedBoards,
  projectMembers,
  canManage,
  initialTab,
  themeToggleSlot
}: ProjectSettingsClientProps) {
  const [activeTab, setActiveTab] = useState<SettingsTabId>(() => {
    if (initialTab && ["boards", "identity", "features", "preferences", "all"].includes(initialTab)) {
      return initialTab as SettingsTabId;
    }
    return "boards";
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const boardIdParam = params.get("boardId");
      const tabParam = params.get("tab");
      if (boardIdParam) {
        setActiveTab("boards");
      } else if (tabParam && ["boards", "identity", "features", "preferences", "all"].includes(tabParam)) {
        setActiveTab(tabParam as SettingsTabId);
      }
    }
  }, []);

  const handleTabChange = (tabId: SettingsTabId) => {
    setActiveTab(tabId);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", tabId);
      window.history.replaceState(null, "", url.toString());
    }
  };

  const tabs: TabItem[] = [
    {
      id: "boards",
      label: "บอร์ด & ย่อย",
      shortLabel: "Boards",
      icon: FolderKanban,
      badge: formattedBoards.length,
      description: "จัดการบอร์ดทั้งหมดในโปรเจกต์ สร้างบอร์ดใหม่ และกำหนดสิทธิ์การเข้าถึง"
    },
    {
      id: "identity",
      label: "ข้อมูลโปรเจกต์",
      shortLabel: "Identity",
      icon: Sparkles,
      description: "แก้ไขชื่อ รายละเอียด และภาพปกของโปรเจกต์"
    },
    {
      id: "features",
      label: "สิทธิ์ & ฟีเจอร์",
      shortLabel: "Features",
      icon: ShieldCheck,
      description: "เปิด/ปิดแถบบันทึก โหมดซ่อนไอเทมส่วนตัว และจัดการการลบโปรเจกต์"
    },
    {
      id: "preferences",
      label: "การตั้งค่าส่วนตัว",
      shortLabel: "Preferences",
      icon: Palette,
      description: "ปรับแต่งธีมการแสดงผลและระบบเสียงตามที่คุณต้องการ"
    },
    {
      id: "all",
      label: "แสดงทั้งหมด",
      shortLabel: "All",
      icon: Layers,
      description: "ดูภาพรวมและจัดการการตั้งค่าทุกส่วนพร้อมกันในหน้าเดียว"
    }
  ];

  const currentTabInfo = tabs.find((t) => t.id === activeTab) ?? tabs[0];

  return (
    <div className="scrollbar-soft h-full min-h-0 overflow-y-auto pr-1">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 pb-8">
        {/* Top Header Card */}
        <section className="rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3.5 sm:px-5 sm:py-4">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-dusk-amber">Workspace</p>
              <h1 className="mt-1 text-2xl font-semibold text-stone-100">Project settings</h1>
              <p className="mt-1 max-w-3xl text-sm leading-6 text-stone-500">
                จัดการการตั้งค่าของ &ldquo;{project.name}&rdquo; อย่างเป็นระเบียบ แบ่งหมวดหมู่ชัดเจน
              </p>
            </div>
            <div className="mt-3 flex items-center gap-2 sm:mt-0">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-stone-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                {formattedBoards.length} บอร์ดในโปรเจกต์
              </span>
            </div>
          </div>

          {/* Navigation Tab Bar */}
          <div className="mt-4 flex overflow-x-auto border-t border-white/10 pt-3 pb-1 gap-2 scrollbar-none sm:gap-2.5">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabChange(tab.id)}
                  className={cn(
                    "flex items-center gap-2 shrink-0 rounded-xl px-3.5 py-2 text-xs font-medium transition cursor-pointer",
                    isActive
                      ? "bg-dusk-lavender/20 text-dusk-lavender border border-dusk-lavender/40 shadow-sm font-semibold"
                      : "bg-white/[0.03] text-stone-400 border border-white/5 hover:text-stone-200 hover:bg-white/[0.07] hover:border-white/10"
                  )}
                  title={tab.description}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && (
                    <span
                      className={cn(
                        "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                        isActive
                          ? "bg-dusk-lavender text-stone-900"
                          : "bg-white/10 text-stone-300"
                      )}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab Description Banner */}
          <div className="mt-2.5 flex items-center gap-2 rounded-lg bg-white/[0.02] px-3 py-1.5 text-xs text-stone-400">
            <span className="font-semibold text-dusk-lavender">{currentTabInfo.label}:</span>
            <span>{currentTabInfo.description}</span>
          </div>
        </section>

        {/* Tab 1: Boards Management */}
        {(activeTab === "boards" || activeTab === "all") && (
          <div className="space-y-4">
            {activeTab === "all" && (
              <div className="flex items-center gap-2 border-b border-white/10 pb-2 pt-2">
                <FolderKanban className="h-4 w-4 text-dusk-lavender" />
                <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-300">
                  1. บอร์ดและโปรเจกต์ย่อย (Boards & Sub-projects)
                </h2>
              </div>
            )}
            <ProjectBoardsManager
              projectId={projectId}
              canManage={canManage}
              initialBoards={formattedBoards}
              projectMembers={projectMembers}
            />
          </div>
        )}

        {/* Tab 2: Workspace Identity */}
        {(activeTab === "identity" || activeTab === "all") && (
          <div className="space-y-4">
            {activeTab === "all" && (
              <div className="flex items-center gap-2 border-b border-white/10 pb-2 pt-4">
                <Sparkles className="h-4 w-4 text-dusk-amber" />
                <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-300">
                  2. ข้อมูลโปรเจกต์ (Workspace Identity)
                </h2>
              </div>
            )}
            <SettingsForm
              project={project}
              canManagePrivacy={canManage}
              viewMode={activeTab === "all" ? "identity" : "identity"}
            />
          </div>
        )}

        {/* Tab 3: Features & Permissions */}
        {(activeTab === "features" || activeTab === "all") && (
          <div className="space-y-4">
            {activeTab === "all" && (
              <div className="flex items-center gap-2 border-b border-white/10 pb-2 pt-4">
                <ShieldCheck className="h-4 w-4 text-dusk-cyan" />
                <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-300">
                  3. สิทธิ์และฟีเจอร์ (Features & Access)
                </h2>
              </div>
            )}
            <SettingsForm
              project={project}
              canManagePrivacy={canManage}
              viewMode={activeTab === "all" ? "features" : "features"}
            />
          </div>
        )}

        {/* Tab 4: Preferences */}
        {(activeTab === "preferences" || activeTab === "all") && (
          <div className="space-y-4">
            {activeTab === "all" && (
              <div className="flex items-center gap-2 border-b border-white/10 pb-2 pt-4">
                <Palette className="h-4 w-4 text-dusk-rose" />
                <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-300">
                  4. การตั้งค่าส่วนบุคคล (Personal Preferences)
                </h2>
              </div>
            )}
            <section className={cn("lofi-panel rounded-2xl p-5 sm:p-6", activeTab === "preferences" && "max-w-4xl")}>
              <div className="flex items-start gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-dusk-lavender/20 bg-dusk-lavender/10 text-dusk-lavender">
                  <Palette className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-dusk-amber">Personal preferences</p>
                  <h3 className="mt-1 text-base font-semibold text-stone-100">Theme mode & Sound effects</h3>
                  <p className="mt-1 text-sm leading-6 text-stone-500">
                    ตั้งค่าการแสดงผลและเสียงตอบสนองเฉพาะเบราว์เซอร์นี้
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-6">
                <div>
                  <h4 className="text-sm font-semibold text-stone-200">Theme mode</h4>
                  <p className="mb-3 mt-1 text-xs leading-5 text-stone-500">
                    เลือกสไตล์ภาพของ Retzlo สำหรับเครื่องของคุณ (บันทึกเฉพาะในเบราว์เซอร์นี้)
                  </p>
                  {themeToggleSlot}
                </div>

                <div className="border-t border-white/10 pt-5">
                  <div className="flex items-center gap-2">
                    <Volume2 className="h-4 w-4 text-dusk-lavender" />
                    <h4 className="text-sm font-semibold text-stone-200">Sound feedback</h4>
                  </div>
                  <p className="mb-4 mt-1 text-xs leading-5 text-stone-500">
                    เปิด/ปิดเสียงและปรับระดับเสียงแจ้งเตือนเมื่อทำงานเสร็จ
                  </p>
                  <SoundToggle />
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
