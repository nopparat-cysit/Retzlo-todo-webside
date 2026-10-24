import Link from "next/link";
import { ArrowLeft, Sparkles, Settings as SettingsIcon, Sliders, Shield } from "lucide-react";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { OmikujiDeskSettings } from "@/components/settings/omikuji-desk-settings";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Settings & Omikuji Desk · Retzlo",
  description: "Global system configuration, feature toggles, and Omikuji Fortune Desk"
};

export default function GlobalSettingsPage() {
  return (
    <div className="min-h-screen bg-theme-base text-theme-foreground">
      {/* Top sticky navigation bar */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-theme-border bg-theme-panel/85 px-4 backdrop-blur-md sm:px-8">
        <div className="flex items-center gap-3">
          <Link
            href="/projects"
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-theme-muted hover:bg-theme-paper hover:text-theme-foreground transition"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>กลับสู่ Projects</span>
          </Link>
          <div className="h-4 w-[1px] bg-theme-border" />
          <div className="flex items-center gap-2">
            <SettingsIcon className="h-4 w-4 text-theme-muted" />
            <h1 className="text-sm font-semibold text-theme-foreground">
              System Settings & Feature Desks
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle variant="header" />
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        {/* Hero Banner */}
        <div className="mb-8 rounded-2xl border border-theme-border bg-gradient-to-br from-indigo-500/10 via-theme-panel to-amber-500/10 p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-700 dark:text-indigo-300 mb-2">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                <span>Feature Control & Content Engines</span>
              </div>
              <h2 className="text-xl font-bold tracking-tight text-theme-foreground sm:text-2xl">
                Creative Fortune & Omikuji Desk
              </h2>
              <p className="mt-1 max-w-xl text-xs sm:text-sm text-theme-muted">
                กำหนดการทำงานของระบบเซียมซี Asakusa Kannon 100 ใบ ควบคุมการเปิด/ปิด สลับภาษา และอัปเดตไฟล์ชุดข้อมูล CSV ประจำปีใหม่
              </p>
            </div>
          </div>
        </div>

        {/* Omikuji Desk Settings Section */}
        <OmikujiDeskSettings />
      </main>
    </div>
  );
}
