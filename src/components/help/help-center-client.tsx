"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Bot,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Compass,
  Copy,
  FileText,
  FolderKanban,
  HelpCircle,
  Keyboard,
  Layers,
  ListChecks,
  Menu,
  Play,
  Search,
  Sparkles,
  Table,
  ThumbsDown,
  ThumbsUp,
  X,
  Zap,
  PanelLeft,
  PanelLeftClose,
  Workflow,
  Shield,
} from "lucide-react";
import { BackButton } from "@/components/ui/back-button";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { useLanguage } from "@/lib/i18n/language-context";
import { useAiChat } from "@/components/ai/ai-chat-context";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import type { GuideTopic } from "./data/types";
import { CATEGORY_THEME_MAP, CATEGORIES_EN, CATEGORIES_TH, SYSTEM_PILLARS_EN, SYSTEM_PILLARS_TH } from "./data/categories";
import { TOPICS_EN } from "./data/topics-en";
import { TOPICS_TH } from "./data/topics-th";
import {
  KEYBOARD_SHORTCUTS_LIST_EN,
  KEYBOARD_SHORTCUTS_LIST_TH,
  FAQ_ITEMS_EN,
  FAQ_ITEMS_TH,
  KANBAN_VS_TABLE_MATRIX_EN,
  KANBAN_VS_TABLE_MATRIX_TH,
  RBAC_PERMISSIONS_MATRIX_EN,
  RBAC_PERMISSIONS_MATRIX_TH,
  AI_PROMPT_RECIPES,
} from "./data/reference";
import { InteractiveAiDemo, InteractiveKanbanTableDemo, InteractivePrioritiesDemo, InteractiveCoffeeDemo } from "./sandboxes";
import {
  DocsHeading,
  DocsCallout,
  DocsSandboxDeck,
  TapeCounter,
  MixtapeLogoMark,
  FeatureTakeaways,
  WorkflowTimeline,
  SpecsLedger,
  ComparisonMatrix,
  PromptCookbook,
} from "./docs-primitives";
import { RetzloHubDiagram } from "./hub-diagram";

export function HelpCenterClient() {
  const { language } = useLanguage();
  const isEn = language === "en";

  const categories = isEn ? CATEGORIES_EN : CATEGORIES_TH;
  const pillars = isEn ? SYSTEM_PILLARS_EN : SYSTEM_PILLARS_TH;
  const topics = isEn ? TOPICS_EN : TOPICS_TH;
  const shortcutsList = isEn ? KEYBOARD_SHORTCUTS_LIST_EN : KEYBOARD_SHORTCUTS_LIST_TH;
  const faqList = isEn ? FAQ_ITEMS_EN : FAQ_ITEMS_TH;

  const [activeTopicId, setActiveTopicId] = useState<string>(topics[0].id);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"docs" | "interactive" | "shortcuts" | "faq">("docs");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeHeadingId, setActiveHeadingId] = useState<string>("overview");
  const [copiedShortcut, setCopiedShortcut] = useState<string | null>(null);
  const [feedbackVote, setFeedbackVote] = useState<"helpful" | "unhelpful" | null>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const readerTopRef = useRef<HTMLDivElement>(null);
  const { openAiChat } = useAiChat();
  const { toast } = useToast();

  // Keyboard shortcut listener (Ctrl+K focuses search, [ toggles sidebar)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === "[" && !["input", "textarea"].includes((e.target as HTMLElement)?.tagName?.toLowerCase())) {
        e.preventDefault();
        setIsSidebarCollapsed((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Scroll progress listener for top hairline bar and TOC circular ring
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop || document.body.scrollTop;
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (windowHeight > 0) {
        const scroll = Math.min(100, Math.max(0, (totalScroll / windowHeight) * 100));
        setScrollProgress(scroll);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // IntersectionObserver for Section Scroll-Spy in Table of Contents
  useEffect(() => {
    const sectionIds = [
      "core-pillars",
      "architecture-hub",
      "live-demo",
      "overview",
      "capabilities",
      "workflow",
      "technical-specs",
      "prompt-cookbook",
      "view-comparison",
      "rbac-matrix",
      "tips",
      "shortcuts",
    ];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveHeadingId(entry.target.id);
          }
        });
      },
      { rootMargin: "-80px 0px -50% 0px" }
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [activeTopicId, viewMode]);

  // Filter topics based on search query
  const filteredTopics = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return topics;
    return topics.filter((topic) => {
      return (
        topic.title.toLowerCase().includes(query) ||
        topic.summary.toLowerCase().includes(query) ||
        topic.highlights.some((h) => h.toLowerCase().includes(query)) ||
        (topic.codeOrShortcut && topic.codeOrShortcut.toLowerCase().includes(query))
      );
    });
  }, [topics, searchQuery]);

  // Group topics by category for Handoff-style collapsible tree sidebar
  const topicsByCategory = useMemo(() => {
    const map: Record<string, GuideTopic[]> = {};
    topics.forEach((t) => {
      if (!map[t.category]) map[t.category] = [];
      map[t.category].push(t);
    });
    return map;
  }, [topics]);

  const toggleCategoryCollapse = (catId: string) => {
    setCollapsedCategories((prev) => ({
      ...prev,
      [catId]: !prev[catId],
    }));
  };

  // Current active topic in reader view
  const activeTopic = useMemo(() => {
    return (
      topics.find((t) => t.id === activeTopicId) ||
      filteredTopics[0] ||
      topics[0]
    );
  }, [topics, activeTopicId, filteredTopics]);

  // Pagination: Previous and Next topics
  const currentTopicIndex = useMemo(() => {
    return topics.findIndex((t) => t.id === activeTopic.id);
  }, [topics, activeTopic]);

  const prevTopic = currentTopicIndex > 0 ? topics[currentTopicIndex - 1] : null;
  const nextTopic = currentTopicIndex < topics.length - 1 ? topics[currentTopicIndex + 1] : null;
  const categoryTheme = CATEGORY_THEME_MAP[activeTopic.category] || CATEGORY_THEME_MAP.overview;

  // Jump to topic
  const selectTopic = (topicId: string) => {
    setActiveTopicId(topicId);
    setFeedbackVote(null);
    setIsMobileSidebarOpen(false);
    setViewMode("docs");
    if (readerTopRef.current) {
      readerTopRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Copy shortcut
  const handleCopyShortcut = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedShortcut(code);
    toast({
      message: isEn ? `Copied shortcut "${code}"` : `คัดลอกคีย์ลัด "${code}" เรียบร้อยแล้ว`,
      type: "success",
    });
    setTimeout(() => setCopiedShortcut(null), 2000);
  };

  // Feedback vote
  const handleFeedback = (type: "helpful" | "unhelpful") => {
    setFeedbackVote(type);
    toast({
      message:
        type === "helpful"
          ? isEn
            ? "Thank you! Glad to hear this article was helpful."
            : "ขอบคุณสำหรับข้อเสนอแนะ! ดีใจที่บทความนี้มีประโยชน์กับคุณ"
          : isEn
          ? "Thank you! We will improve this guide further."
          : "ขอบคุณสำหรับข้อเสนอแนะ! เราจะนำไปพัฒนาเนื้อหาให้ดียิ่งขึ้น",
      type: "success",
    });
  };

  const ActiveIcon = activeTopic.icon;

  return (
    <main className="soft-grid-bg min-h-screen w-full text-stone-900 dark:text-stone-100 flex flex-col">
      {/* ── Top Header / Navbar ── */}
      <header className="sticky top-0 z-40 border-b border-stone-200/80 bg-white/95 backdrop-blur-md dark:border-white/10 dark:bg-ink-950/95 transition-colors shadow-xs">
        <div className="mx-auto flex h-16 max-w-[1600px] w-full items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Left: Back & Title */}
          <div className="flex items-center gap-3">
            <BackButton />

            {/* Mobile Sidebar Toggle Button */}
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
              className="lg:hidden flex items-center justify-center h-9 w-9 rounded-xl border border-stone-200/80 bg-stone-100/80 text-stone-700 hover:bg-stone-200 dark:border-white/10 dark:bg-white/[0.05] dark:text-stone-300 dark:hover:bg-white/10 transition cursor-pointer"
              aria-label="Toggle docs navigation"
              title="Toggle docs navigation"
            >
              {isMobileSidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>

            {/* Desktop Sidebar Toggle Button */}
            <button
              type="button"
              onClick={() => setIsSidebarCollapsed((prev) => !prev)}
              className="hidden lg:flex items-center justify-center h-9 w-9 rounded-xl border border-stone-200/80 bg-stone-100/80 text-stone-700 hover:bg-stone-200 dark:border-white/10 dark:bg-white/[0.05] dark:text-stone-300 dark:hover:bg-white/10 transition cursor-pointer"
              aria-label={isEn ? "Toggle sidebar ([)" : "ย่อ/ขยายแถบข้าง ([)"}
              title={isEn ? "Toggle sidebar ([)" : "ย่อ/ขยายแถบข้าง ([)"}
            >
              {isSidebarCollapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            </button>

            <div className="flex items-center gap-3">
              <MixtapeLogoMark className="h-8 w-auto drop-shadow-xs" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-600 dark:text-dusk-amber">
                    Retzlo Field Manual
                  </span>
                  <span className="hidden sm:inline-flex rounded-full bg-indigo-50 border border-indigo-200/80 dark:bg-white/10 dark:border-white/10 px-2 py-0.2 font-mono text-[9px] font-bold text-indigo-700 dark:text-stone-300">
                    REV 2026.10
                  </span>
                </div>
                <h1 className="text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100 leading-tight">
                  {isEn ? "System Guide & Knowledge Base" : "ข้อมูลระบบ & คู่มือการใช้งาน"}
                </h1>
              </div>
            </div>
          </div>

          {/* Center: Global Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-6">
            <div className="relative w-full">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  isEn
                    ? "Search docs, AI, Spreadsheet, 10 Priorities, shortcuts..."
                    : "ค้นหา เช่น AI, Spreadsheet, 10 Priorities, คีย์ลัด..."
                }
                className="w-full h-9 rounded-xl border border-stone-200/90 bg-stone-100/70 pl-10 pr-14 text-xs text-stone-900 placeholder:text-stone-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500/20 dark:border-white/10 dark:bg-black/30 dark:text-stone-100 dark:placeholder:text-stone-500 dark:focus:border-dusk-lavender/60 dark:focus:ring-dusk-lavender/30 transition"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="p-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                    title="Clear search"
                  >
                    <X className="h-3 w-3" />
                  </button>
                ) : (
                  <kbd className="hidden lg:inline-flex items-center rounded border border-stone-300/80 bg-stone-200/50 px-1.5 py-0.5 font-mono text-[9px] text-stone-500 dark:border-white/10 dark:bg-white/10 dark:text-stone-400">
                    Ctrl K
                  </kbd>
                )}
              </div>
            </div>
          </div>

          {/* Right: View Switcher, Language Switcher & AI Launcher */}
          <div className="flex items-center gap-2">
            {/* View Mode Switcher */}
            <div className="hidden sm:flex items-center rounded-xl border border-stone-200/90 bg-stone-100/70 p-0.5 dark:border-white/10 dark:bg-white/[0.04]">
              <button
                type="button"
                onClick={() => setViewMode("docs")}
                className={cn(
                  "flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition cursor-pointer",
                  viewMode === "docs"
                    ? "border border-stone-200/80 bg-white text-stone-900 shadow-xs dark:border-white/10 dark:bg-stone-800 dark:text-stone-100"
                    : "text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200"
                )}
                title="Documentation mode"
              >
                <BookOpen className="h-3.5 w-3.5" />
                <span>{isEn ? "Docs" : "คู่มือ"}</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("interactive")}
                className={cn(
                  "flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition cursor-pointer",
                  viewMode === "interactive"
                    ? "border border-stone-200/80 bg-white text-stone-900 shadow-xs dark:border-white/10 dark:bg-stone-800 dark:text-stone-100"
                    : "text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200"
                )}
                title="Live Playground mode"
              >
                <Play className="h-3.5 w-3.5 text-indigo-500 dark:text-dusk-lavender" />
                <span>{isEn ? "Playground" : "จำลองสด"}</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("shortcuts")}
                className={cn(
                  "flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition cursor-pointer",
                  viewMode === "shortcuts"
                    ? "border border-stone-200/80 bg-white text-stone-900 shadow-xs dark:border-white/10 dark:bg-stone-800 dark:text-stone-100"
                    : "text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200"
                )}
                title="Keyboard Shortcuts matrix"
              >
                <Keyboard className="h-3.5 w-3.5" />
                <span>{isEn ? "Shortcuts" : "คีย์ลัด"}</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("faq")}
                className={cn(
                  "flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition cursor-pointer",
                  viewMode === "faq"
                    ? "border border-stone-200/80 bg-white text-stone-900 shadow-xs dark:border-white/10 dark:bg-stone-800 dark:text-stone-100"
                    : "text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200"
                )}
                title="Frequently Asked Questions"
              >
                <HelpCircle className="h-3.5 w-3.5" />
                <span>FAQ</span>
              </button>
            </div>

            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* Quick AI Trigger Button */}
            <button
              type="button"
              onClick={openAiChat}
              className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 dark:border-dusk-lavender/40 dark:bg-dusk-lavender/15 dark:text-dusk-lavender dark:hover:bg-dusk-lavender dark:hover:text-ink-950 transition cursor-pointer shadow-sm"
              title="Open Retzlo AI"
            >
              <Bot className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{isEn ? "Ask AI" : "ถาม AI"}</span>
              <Sparkles className="h-3 w-3 text-amber-500 dark:text-dusk-amber" />
            </button>

            {/* Link to Workspaces */}
            <Link
              href="/projects"
              className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200/90 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50 hover:border-stone-300 dark:border-white/10 dark:bg-white/[0.04] dark:text-stone-300 dark:hover:border-white/20 dark:hover:bg-white/[0.08] transition shadow-sm"
              title="Return to Workspaces"
            >
              <FolderKanban className="h-3.5 w-3.5 text-stone-500 dark:text-stone-400" />
              <span className="hidden md:inline">Workspace</span>
            </Link>
          </div>
        </div>

        {/* Hairline Reading Scroll Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-stone-200/50 dark:bg-white/5 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 dark:from-dusk-lavender dark:via-purple-400 dark:to-dusk-amber transition-all duration-150"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>
      </header>

      {/* ── Main Layout Body ── */}
      <div className="mx-auto flex w-full max-w-[1600px] flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 gap-8 lg:gap-10 items-start">
        {/* ── Left Sidebar (Only in Docs view) ── */}
        {viewMode === "docs" && (
          <aside
            className={cn(
              "fixed inset-y-0 left-0 z-40 w-72 transform bg-white/95 p-5 border-r border-stone-200/80 backdrop-blur-xl transition-all duration-200 ease-in-out dark:bg-ink-950/95 dark:border-white/10 lg:sticky lg:top-20 lg:z-20 lg:border-none lg:bg-transparent lg:p-0 lg:backdrop-blur-none lg:h-[calc(100vh-5.5rem)] lg:flex lg:flex-col lg:self-start",
              isMobileSidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:translate-x-0",
              isSidebarCollapsed ? "lg:hidden" : "lg:w-72 lg:shrink-0"
            )}
          >
            {/* Mobile Sidebar Header */}
            <div className="flex lg:hidden items-center justify-between pb-4 border-b border-stone-200 dark:border-white/10 mb-4 shrink-0">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-indigo-600 dark:text-dusk-lavender" />
                <span className="font-bold text-sm text-stone-900 dark:text-stone-100">
                  {isEn ? "Documentation Hub" : "ศูนย์คู่มือการใช้งาน"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileSidebarOpen(false)}
                className="p-1 rounded-lg text-stone-500 hover:bg-stone-100 dark:hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Quick Filter Search Bar */}
            <div className="relative shrink-0 mb-3">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isEn ? "Quick filter docs..." : "ค้นหาในคู่มือ..."}
                className="w-full h-8.5 rounded-xl border border-stone-200/90 bg-stone-100/70 pl-9 pr-8 text-xs text-stone-900 placeholder:text-stone-400 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-white/10 dark:bg-white/[0.04] dark:text-stone-100 dark:placeholder:text-stone-500 transition"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer"
                  title={isEn ? "Clear filter" : "ล้างการค้นหา"}
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>

            {/* Document Topics Navigation (Collapsible Folders) */}
            <div className="flex-1 min-h-0 overflow-y-auto pr-1.5 space-y-3 scrollbar-thin">
                {!searchQuery ? (
                  categories
                    .filter((c) => c.id !== "all")
                    .map((cat) => {
                      const catTopics = topicsByCategory[cat.id] || [];
                      if (catTopics.length === 0) return null;
                      const isCollapsed = !!collapsedCategories[cat.id];

                      return (
                        <div key={cat.id} className="space-y-1">
                          {/* Category Folder Header */}
                          <button
                            type="button"
                            onClick={() => toggleCategoryCollapse(cat.id)}
                            className="group flex w-full items-center justify-between rounded-lg px-2 py-1 text-[11px] font-bold text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 hover:bg-stone-100/60 dark:hover:bg-white/[0.04] transition cursor-pointer"
                          >
                            <span className="flex items-center gap-1.5 truncate">
                              {isCollapsed ? (
                                <ChevronRight className="h-3 w-3 text-stone-400 group-hover:text-stone-600 dark:group-hover:text-stone-300 shrink-0 transition" />
                              ) : (
                                <ChevronDown className="h-3 w-3 text-stone-400 group-hover:text-stone-600 dark:group-hover:text-stone-300 shrink-0 transition" />
                              )}
                              <span className="uppercase tracking-wider">{cat.label.replace(/^[\p{Emoji}\s]+/u, "")}</span>
                            </span>
                            <span className="rounded-full bg-stone-100 px-1.5 py-0.2 text-[9px] font-mono text-stone-500 dark:bg-white/10 dark:text-stone-400">
                              {catTopics.length}
                            </span>
                          </button>

                          {/* Topics List within Category */}
                          {!isCollapsed && (
                            <div className="flex flex-col gap-0.5 pl-2 border-l border-stone-200/80 dark:border-white/10 ml-2.5 my-1">
                              {catTopics.map((topic) => {
                                const isActive = activeTopic.id === topic.id;
                                const Icon = topic.icon;

                                return (
                                  <button
                                    key={topic.id}
                                    type="button"
                                    onClick={() => selectTopic(topic.id)}
                                    className={cn(
                                      "group relative flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs transition-colors cursor-pointer text-left",
                                      isActive
                                        ? "bg-indigo-50/90 text-indigo-700 font-semibold dark:bg-dusk-lavender/15 dark:text-dusk-lavender shadow-2xs"
                                        : "text-stone-600 hover:bg-stone-100/80 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-white/[0.04] dark:hover:text-stone-200"
                                    )}
                                  >
                                    {isActive && (
                                      <div className="absolute -left-2.5 top-1/2 -translate-y-1/2 h-4 w-1 rounded-full bg-indigo-600 dark:bg-dusk-lavender" />
                                    )}
                                    <Icon
                                      className={cn(
                                        "h-3.5 w-3.5 shrink-0 transition-colors",
                                        isActive
                                          ? "text-indigo-600 dark:text-dusk-lavender"
                                          : "text-stone-400 group-hover:text-stone-600 dark:group-hover:text-stone-300"
                                      )}
                                    />
                                    <span className="flex-1 truncate">{topic.title}</span>
                                    {topic.badge && (
                                      <span className={cn("rounded px-1.5 py-0.2 text-[9px] font-medium shrink-0", topic.badgeColor)}>
                                        {topic.badge}
                                      </span>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })
                ) : (
                  /* Flat search filtered list */
                  <div className="space-y-1">
                    <div className="flex items-center justify-between px-1 py-1 text-[11px] text-stone-500 dark:text-stone-400 font-medium">
                      <span>{isEn ? `Matching (${filteredTopics.length})` : `พบบทความ (${filteredTopics.length})`}</span>
                      <button
                        type="button"
                        onClick={() => setSearchQuery("")}
                        className="text-indigo-600 hover:underline dark:text-dusk-lavender text-[10px] cursor-pointer"
                      >
                        {isEn ? "Clear" : "ล้างค้นหา"}
                      </button>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      {filteredTopics.map((topic) => {
                        const isActive = activeTopic.id === topic.id;
                        const Icon = topic.icon;

                        return (
                          <button
                            key={topic.id}
                            type="button"
                            onClick={() => selectTopic(topic.id)}
                            className={cn(
                              "group relative flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs transition-colors cursor-pointer text-left",
                              isActive
                                ? "bg-indigo-50/90 text-indigo-700 font-semibold dark:bg-dusk-lavender/15 dark:text-dusk-lavender shadow-2xs"
                                : "text-stone-600 hover:bg-stone-100/80 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-white/[0.04] dark:hover:text-stone-200"
                            )}
                          >
                            {isActive && (
                              <div className="absolute -left-1 top-1/2 -translate-y-1/2 h-4 w-1 rounded-full bg-indigo-600 dark:bg-dusk-lavender" />
                            )}
                            <Icon
                              className={cn(
                                "h-3.5 w-3.5 shrink-0 transition-colors",
                                isActive
                                  ? "text-indigo-600 dark:text-dusk-lavender"
                                  : "text-stone-400 group-hover:text-stone-600 dark:group-hover:text-stone-300"
                              )}
                            />
                            <span className="flex-1 truncate">{topic.title}</span>
                            {topic.badge && (
                              <span className={cn("rounded px-1.5 py-0.2 text-[9px] font-medium shrink-0", topic.badgeColor)}>
                                {topic.badge}
                              </span>
                            )}
                          </button>
                        );
                      })}

                      {filteredTopics.length === 0 && (
                        <div className="p-4 text-center text-xs text-stone-500 dark:text-stone-400 rounded-xl border border-dashed border-stone-200 dark:border-white/10 my-2">
                          {isEn ? "No matching articles found" : "ไม่พบบทความที่ค้นหา"}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

            {/* System Guide Reference Footer */}
            <div className="shrink-0 pt-3 border-t border-stone-200/80 dark:border-white/10 mt-2">
              <div className="rounded-xl border border-stone-200/70 bg-stone-50/60 p-2.5 text-[11px] text-stone-500 dark:border-white/10 dark:bg-white/[0.02] dark:text-stone-400 flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-mono text-[10px]">
                  <FileText className="h-3 w-3 text-indigo-500 dark:text-dusk-lavender" />
                  <span>system-guide.md</span>
                </span>
                <span className="rounded bg-stone-200/60 dark:bg-white/10 px-1.5 py-0.2 text-[9px] font-semibold text-stone-600 dark:text-stone-300">
                  v2.4 LTS
                </span>
              </div>
            </div>
          </aside>
        )}

        {/* ── Main Content Area ── */}
        <div className="flex-1 min-w-0">
          <div ref={readerTopRef} />

          {/* VIEW MODE 1: Documentation Reader */}
          {viewMode === "docs" && (
            <div className="flex flex-col xl:flex-row gap-8 items-start">
              {/* Document Article Body */}
              <article
                key={activeTopic.id}
                className="flex-1 min-w-0 max-w-[980px] xl:max-w-[1020px] pb-24 space-y-9 sm:space-y-10 animate-in fade-in-50 slide-in-from-bottom-1 duration-200 ease-out"
              >
                {/* Breadcrumbs */}
                <nav className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
                  <Link href="/projects" className="hover:text-stone-900 dark:hover:text-stone-200">
                    Home
                  </Link>
                  <ChevronRight className="h-3 w-3 text-stone-400" />
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      selectTopic("welcome-overview");
                    }}
                    className="hover:text-stone-900 dark:hover:text-stone-200 cursor-pointer"
                  >
                    Documentation
                  </button>
                  <ChevronRight className="h-3 w-3 text-stone-400" />
                  <span className="font-semibold text-indigo-600 dark:text-dusk-lavender truncate max-w-[200px] sm:max-w-none">
                    {activeTopic.title}
                  </span>
                </nav>

                {/* Article Header & Lead Hero Card */}
                <header className="space-y-5 border-b border-stone-200/80 pb-7 sm:pb-8 dark:border-white/10">
                  {/* Category Eyebrow Pill + Meta Badges */}
                  <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider shadow-2xs",
                        categoryTheme.eyebrowBadge
                      )}
                    >
                      <ActiveIcon className="h-3 w-3" />
                      <span>{isEn ? categoryTheme.eyebrowEn : categoryTheme.eyebrowTh}</span>
                    </span>

                    {activeTopic.badge && (
                      <span
                        className={cn(
                          "rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",
                          activeTopic.badgeColor
                        )}
                      >
                        {activeTopic.badge}
                      </span>
                    )}
                    {activeTopic.scopeBadge && (
                      <span className="rounded-full bg-stone-100 dark:bg-white/10 px-2.5 py-0.5 text-[11px] font-semibold text-stone-700 dark:text-stone-300">
                        {activeTopic.scopeBadge}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 rounded-full bg-stone-100/90 dark:bg-white/5 px-2.5 py-0.5 text-[11px] text-stone-600 dark:text-stone-400 font-mono">
                      <Clock className="h-3 w-3" />
                      {activeTopic.readingTime || (isEn ? "3 min read" : "อ่าน 3 นาที")}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-stone-100/90 dark:bg-white/5 px-2.5 py-0.5 text-[11px] text-stone-600 dark:text-stone-400 font-mono">
                      <Calendar className="h-3 w-3" />
                      {activeTopic.lastUpdated || (isEn ? "Oct 7, 2026" : "อัปเดต: 7 ต.ค. 2026")}
                    </span>
                  </div>

                  {/* Title & Category Icon Box */}
                  <div className="flex items-start gap-3.5 sm:gap-4 pt-1">
                    <div
                      className={cn(
                        "grid h-10 w-10 sm:h-11 sm:w-11 shrink-0 place-items-center rounded-xl border shadow-2xs transition-all duration-200",
                        categoryTheme.iconBox
                      )}
                    >
                      <ActiveIcon className="h-5 w-5 sm:h-5.5 sm:w-5.5" />
                    </div>
                    <div className="space-y-1 flex-1 min-w-0">
                      <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900 dark:text-stone-100 leading-tight">
                        {activeTopic.title}
                      </h1>
                    </div>
                  </div>

                  {/* Lead Summary Callout Banner with Category Theme */}
                  <div
                    className={cn(
                      "rounded-2xl border p-4 sm:p-5 text-xs sm:text-sm text-stone-700 leading-relaxed dark:text-stone-200 shadow-xs transition-all",
                      categoryTheme.summaryCard
                    )}
                  >
                    <div className="flex items-start gap-3.5">
                      <div
                        className={cn(
                          "grid h-7 w-7 place-items-center rounded-xl shrink-0 mt-0.5 shadow-2xs",
                          categoryTheme.summaryIconBox
                        )}
                      >
                        <Sparkles className={cn("h-4 w-4", categoryTheme.summarySparkleColor)} />
                      </div>
                      <div className="space-y-1 flex-1">
                        <p className="font-bold text-stone-900 dark:text-stone-100">
                          {isEn ? "Executive Summary" : "สรุปสาระสำคัญ (Executive Summary)"}
                        </p>
                        <p className="leading-relaxed text-stone-600 dark:text-stone-300">{activeTopic.summary}</p>
                      </div>
                    </div>
                  </div>
                </header>

                {/* ── 6 Core Architectural Pillars (Featured on Welcome Overview) ── */}
                {activeTopic.id === "welcome-overview" && (
                  <section id="core-pillars" className="space-y-4 scroll-mt-24 pt-2">
                    <DocsHeading
                      id="core-pillars"
                      title={isEn ? "6 Core Architectural Pillars" : "6 เสาหลักสถาปัตยกรรมระบบ Retzlo"}
                      subtitle={isEn ? "Foundational platform capabilities united in one cohesive system" : "ขุมพลังสถาปัตยกรรมหลักที่รวมเป็นหนึ่งเดียวบนแพลตฟอร์ม"}
                      icon={Layers}
                      badgeClass={categoryTheme.sectionBadge}
                      isEn={isEn}
                    />

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-3.5">
                      {pillars.map((pillar) => {
                        const PillarIcon = pillar.icon;
                        return (
                          <button
                            key={pillar.id}
                            type="button"
                            onClick={() => selectTopic(pillar.id)}
                            className="group relative flex flex-col justify-between p-4 rounded-2xl border border-stone-200/80 bg-stone-50/50 hover:border-indigo-300 hover:bg-white hover:shadow-xs dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-dusk-lavender/40 dark:hover:bg-white/[0.06] text-left transition cursor-pointer min-h-[115px] shadow-2xs"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className={cn("grid h-7 w-7 place-items-center rounded-lg border", pillar.color)}>
                                <PillarIcon className="h-4 w-4" />
                              </div>
                              <span className="text-[9px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">
                                {pillar.tag}
                              </span>
                            </div>
                            <div className="space-y-0.5 min-w-0">
                              <span className="block text-xs font-bold text-stone-900 dark:text-stone-100 group-hover:text-indigo-600 dark:group-hover:text-dusk-lavender transition truncate">
                                {pillar.title}
                              </span>
                              <span className="block text-[10px] text-stone-500 dark:text-stone-400 line-clamp-1 leading-snug">
                                {pillar.subtitle}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </section>
                )}

                {/* ── Architecture Data Hub (Featured on Welcome Overview) ── */}
                {activeTopic.id === "welcome-overview" && (
                  <section id="architecture-hub" className="scroll-mt-24 space-y-3 pt-2">
                    <RetzloHubDiagram isEn={isEn} />
                  </section>
                )}

                {/* ── Welcome Overview Live Pipeline Demo ── */}
                {activeTopic.id === "welcome-overview" && (
                  <section id="live-demo" className="scroll-mt-24">
                    <DocsSandboxDeck
                      title={isEn ? "RETZLO PIPELINE ARCHITECTURE" : "RETZLO PIPELINE ARCHITECTURE"}
                      subtitle={isEn ? "Next.js App Router • Optimistic UI • Pusher WS • Neon Postgres" : "สถาปัตยกรรมการประมวลผลและการซิงก์ข้อมูล"}
                      badgeText="PIPELINE BENCH"
                      techSpecs="NEXT.JS 14 • POSTGRES NEON • PUSHER WS • PRISMA ORM"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 text-center text-xs">
                        <div className="p-3.5 rounded-xl border border-stone-200/90 bg-white dark:border-white/10 dark:bg-stone-900/80 space-y-1">
                          <span className="font-mono font-bold text-indigo-600 dark:text-dusk-lavender">01. App Router</span>
                          <p className="text-[10px] text-stone-500 leading-relaxed">{isEn ? "React Server & Client Components" : "Next.js React Client Components"}</p>
                        </div>
                        <div className="p-3.5 rounded-xl border border-stone-200/90 bg-white dark:border-white/10 dark:bg-stone-900/80 space-y-1">
                          <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">02. Optimistic UI</span>
                          <p className="text-[10px] text-stone-500 leading-relaxed">{isEn ? "0ms State Transitions & Rollback" : "0ms State Sync & Auto Rollback"}</p>
                        </div>
                        <div className="p-3.5 rounded-xl border border-stone-200/90 bg-white dark:border-white/10 dark:bg-stone-900/80 space-y-1">
                          <span className="font-mono font-bold text-amber-600 dark:text-dusk-amber">03. Pusher WS</span>
                          <p className="text-[10px] text-stone-500 leading-relaxed">{isEn ? "Live Teammate Collaboration" : "Live Team Collaboration Broadcast"}</p>
                        </div>
                        <div className="p-3.5 rounded-xl border border-stone-200/90 bg-white dark:border-white/10 dark:bg-stone-900/80 space-y-1">
                          <span className="font-mono font-bold text-indigo-600 dark:text-dusk-lavender">04. Neon & AI</span>
                          <p className="text-[10px] text-stone-500 leading-relaxed">{isEn ? "PostgreSQL & Built-in Intelligence" : "PostgreSQL + Built-in Intelligence"}</p>
                        </div>
                      </div>
                    </DocsSandboxDeck>
                  </section>
                )}

                {/* Section 1: Overview & Concept */}
                {activeTopic.concept && (
                  <section id="overview" className="space-y-3.5 scroll-mt-24">
                    <DocsHeading
                      id="overview"
                      title={isEn ? "Overview & Architectural Concept" : "ภาพรวมและแนวคิดของฟีเจอร์"}
                      icon={Compass}
                      badgeClass={categoryTheme.sectionBadge}
                      isEn={isEn}
                      trackNumber="§ 01"
                    />
                    <div className="rounded-2xl border border-stone-200/80 bg-stone-50/50 p-4 sm:p-5 text-xs sm:text-sm text-stone-700 dark:border-white/10 dark:bg-white/[0.02] dark:text-stone-300 leading-relaxed">
                      {activeTopic.concept}
                    </div>
                  </section>
                )}

                {/* ── Interactive Feature Sandbox Deck (Placed immediately after Concept) ── */}
                {activeTopic.demoType && activeTopic.id !== "welcome-overview" && (
                  <section id="live-demo" className="scroll-mt-24">
                    {activeTopic.demoType === "ai-chat" && (
                      <DocsSandboxDeck
                        title={isEn ? "RETZLO COPILOT SIMULATOR" : "RETZLO COPILOT SIMULATOR"}
                        subtitle={isEn ? "Interactive AI task breakdown engine" : "จำลองการแตกงานด้วย AI"}
                        badgeText="COPILOT BENCH"
                        techSpecs="MODEL: DEEPSEEK-V4-PRO • LATENCY: ~320MS • STREAM: CHUNKED"
                      >
                        <InteractiveAiDemo isEn={isEn} />
                      </DocsSandboxDeck>
                    )}
                    {activeTopic.demoType === "kanban-table" && (
                      <DocsSandboxDeck
                        title={isEn ? "DUAL-VIEW ENGINE BENCH" : "DUAL-VIEW ENGINE BENCH"}
                        subtitle={isEn ? "Kanban board & spreadsheet table reactive sync" : "สลับมุมมองคันบัน & ตารางสเปรดชีต"}
                        badgeText="VIEWPORT BENCH"
                        techSpecs="MEMORY CACHE • REACT OPTIMISTIC MUTATION • DENSITY: NORMAL/COMPACT"
                      >
                        <InteractiveKanbanTableDemo isEn={isEn} />
                      </DocsSandboxDeck>
                    )}
                    {activeTopic.demoType === "priorities" && (
                      <DocsSandboxDeck
                        title={isEn ? "10-LEVEL PRIORITY MATRIX" : "10-LEVEL PRIORITY MATRIX"}
                        subtitle={isEn ? "Custom priority scales & Retro Lofi color tokens" : "ทดสอบระดับความสำคัญ 10 ระดับ"}
                        badgeText="PALETTE BENCH"
                        techSpecs="SCALE: 1-10 • COLOR MATRIX: RETRO-LOFI INDIGO • LOCAL OVERRIDE"
                      >
                        <InteractivePrioritiesDemo isEn={isEn} />
                      </DocsSandboxDeck>
                    )}
                    {activeTopic.demoType === "coffee" && (
                      <DocsSandboxDeck
                        title={isEn ? "COFFEE CHEERS & COIN TRANSACTOR" : "COFFEE CHEERS & COIN TRANSACTOR"}
                        subtitle={isEn ? "Social morale cheers & store checkout" : "จำลองการส่งกาแฟและใช้เหรียญ"}
                        badgeText="ECONOMY BENCH"
                        techSpecs="LEDGER: AUDIT-COMPLIANT • PEER-TO-PEER MORALE • BALANCE: 120 COINS"
                      >
                        <InteractiveCoffeeDemo isEn={isEn} />
                      </DocsSandboxDeck>
                    )}
                  </section>
                )}

                {/* Section 2: Key Capabilities & Highlights */}
                <section id="capabilities" className="space-y-4 scroll-mt-24">
                  <DocsHeading
                    id="capabilities"
                    title={isEn ? "Key Capabilities" : "คุณสมบัติและความสามารถหลัก (Key Capabilities)"}
                    subtitle={`${activeTopic.highlights.length} ${isEn ? "highlights" : "รายการ"}`}
                    icon={Layers}
                    badgeClass={categoryTheme.sectionBadge}
                    isEn={isEn}
                  />

                  <FeatureTakeaways items={activeTopic.highlights} isEn={isEn} />
                </section>

                {/* Section 3: Step-by-Step Workflow Guide */}
                {activeTopic.workflowSteps && activeTopic.workflowSteps.length > 0 && (
                  <section id="workflow" className="space-y-4 scroll-mt-24">
                    <DocsHeading
                      id="workflow"
                      title={isEn ? "Step-by-Step Workflow Guide" : "ขั้นตอนการใช้งานจริง (Step-by-Step Workflow Guide)"}
                      icon={ListChecks}
                      badgeClass={categoryTheme.sectionBadge}
                      isEn={isEn}
                    />

                    <WorkflowTimeline steps={activeTopic.workflowSteps} isEn={isEn} />
                  </section>
                )}

                {/* Section 4: Technical Specifications */}
                {activeTopic.technicalSpecs && activeTopic.technicalSpecs.length > 0 && (
                  <section id="technical-specs" className="space-y-3.5 scroll-mt-24">
                    <DocsHeading
                      id="technical-specs"
                      title={isEn ? "Technical Specifications" : "ข้อมูลจำเพาะทางเทคนิค (Technical Specifications)"}
                      icon={Zap}
                      badgeClass={categoryTheme.sectionBadge}
                      isEn={isEn}
                    />

                    <SpecsLedger specs={activeTopic.technicalSpecs} isEn={isEn} />
                  </section>
                )}

                {/* ── Topic-Specific Rich Dynamic Modules ── */}

                {/* AI Module: Prompt Cookbook */}
                {(activeTopic.category === "ai" || activeTopic.id === "ai-assistant") && (
                  <section id="prompt-cookbook" className="space-y-4 scroll-mt-24 pt-2">
                    <DocsHeading
                      id="prompt-cookbook"
                      title={isEn ? "Curated Prompt Cookbook & Recipes" : "ตำราคำสั่งและสูตรพรอมต์สำเร็จรูป (Prompt Cookbook)"}
                      subtitle={isEn ? "Battle-tested prompt templates optimized for deepseek-v4-pro" : "สูตรคำสั่งที่ผ่านการทดสอบและปรับจูนเพื่อ deepseek-v4-pro"}
                      icon={Bot}
                      badgeClass={categoryTheme.sectionBadge}
                      isEn={isEn}
                    />
                    <PromptCookbook recipes={AI_PROMPT_RECIPES} isEn={isEn} />
                  </section>
                )}

                {/* Kanban / Table Module: Viewport Comparison Matrix */}
                {(activeTopic.id === "kanban-boards" || activeTopic.id === "spreadsheet-table-view") && (
                  <section id="view-comparison" className="space-y-4 scroll-mt-24 pt-2">
                    <DocsHeading
                      id="view-comparison"
                      title={isEn ? "Dual-View Comparison: Kanban vs Spreadsheet Table" : "ตารางเปรียบเทียบ: Kanban Board vs Spreadsheet Table"}
                      subtitle={isEn ? "Choosing the optimal view for your workflow density" : "เลือกมุมมองที่เหมาะสมกับความหนาแน่นและลักษณะงานของคุณ"}
                      icon={Table}
                      badgeClass={categoryTheme.sectionBadge}
                      isEn={isEn}
                    />
                    <ComparisonMatrix
                      title={isEn ? "Viewport Architecture Matrix" : "ตารางเปรียบเทียบมุมมองสถาปัตยกรรม"}
                      primaryColumn={isEn ? "Kanban Board View" : "มุมมอง Kanban Board"}
                      secondaryColumn={isEn ? "Spreadsheet Table View" : "มุมมอง Spreadsheet Table"}
                      rows={isEn ? KANBAN_VS_TABLE_MATRIX_EN : KANBAN_VS_TABLE_MATRIX_TH}
                      isEn={isEn}
                    />
                  </section>
                )}

                {/* Security Module: Role-Based Access Control (RBAC) Matrix */}
                {activeTopic.id === "member-roles-security" && (
                  <section id="rbac-matrix" className="space-y-4 scroll-mt-24 pt-2">
                    <DocsHeading
                      id="rbac-matrix"
                      title={isEn ? "Role-Based Access Control (RBAC) Matrix" : "ตารางสิทธิ์การเข้าถึงตามบทบาท (RBAC Permission Matrix)"}
                      subtitle={isEn ? "Workspace Owner vs Project Member privilege boundaries" : "ขอบเขตอำนาจหน้าที่ระหว่าง Workspace Owner และสมาชิกโปรเจกต์"}
                      icon={Shield}
                      badgeClass={categoryTheme.sectionBadge}
                      isEn={isEn}
                    />
                    <ComparisonMatrix
                      title={isEn ? "Access Governance Matrix" : "ตารางกำกับดูแลสิทธิ์การเข้าถึง"}
                      primaryColumn={isEn ? "Workspace Owner / Admin" : "Workspace Owner / ผู้ดูแล"}
                      secondaryColumn={isEn ? "Project Member / Contributor" : "สมาชิกโปรเจกต์ / ผู้ร่วมงาน"}
                      rows={isEn ? RBAC_PERMISSIONS_MATRIX_EN : RBAC_PERMISSIONS_MATRIX_TH}
                      isEn={isEn}
                    />
                  </section>
                )}

                {/* Section 5: Pro Tips Callout */}
                {activeTopic.tips && (
                  <div id="tips" className="scroll-mt-24">
                    <DocsCallout
                      type="tip"
                      title={isEn ? "Pro Tip & Best Practice" : "เคล็ดลับจากผู้เชี่ยวชาญ (Pro Tip)"}
                    >
                      <p>{activeTopic.tips}</p>
                    </DocsCallout>
                  </div>
                )}

                {/* Section 6: Code / Keyboard Shortcut (if available) */}
                {activeTopic.codeOrShortcut && (
                  <section id="shortcuts" className="space-y-3.5 scroll-mt-24">
                    <DocsHeading
                      id="shortcuts"
                      title={isEn ? "Keyboard Shortcut" : "คีย์ลัดด่วน (Keyboard Shortcut)"}
                      icon={Keyboard}
                      badgeClass={categoryTheme.sectionBadge}
                      isEn={isEn}
                    />

                    <div className="flex items-center justify-between rounded-2xl border border-stone-200/80 bg-stone-900 p-4 text-white dark:border-white/10 dark:bg-ink-950 shadow-inner">
                      <div className="flex items-center gap-2 font-mono text-xs sm:text-sm text-amber-300">
                        <Zap className="h-4 w-4 text-amber-400" />
                        <span>{activeTopic.codeOrShortcut}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopyShortcut(activeTopic.codeOrShortcut!)}
                        className="flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/10 px-2.5 py-1 text-xs font-medium text-stone-200 hover:bg-white/20 transition cursor-pointer"
                        title={isEn ? "Copy shortcut" : "คัดลอกคีย์ลัด"}
                      >
                        {copiedShortcut === activeTopic.codeOrShortcut ? (
                          <>
                            <Check className="h-3 w-3 text-emerald-400" />
                            <span>{isEn ? "Copied" : "คัดลอกแล้ว"}</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" />
                            <span>{isEn ? "Copy" : "คัดลอก"}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </section>
                )}

                {/* Section 7: Related Topics Navigation */}
                {activeTopic.relatedTopicIds && activeTopic.relatedTopicIds.length > 0 && (
                  <section className="space-y-3.5 pt-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                        {isEn ? "Related Modules & Articles" : "บทความและโมดูลที่เกี่ยวข้อง"}
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {activeTopic.relatedTopicIds.map((relId) => {
                        const relTopic = topics.find((t) => t.id === relId);
                        if (!relTopic) return null;
                        const RelIcon = relTopic.icon;
                        const relTheme = CATEGORY_THEME_MAP[relTopic.category] || CATEGORY_THEME_MAP.overview;

                        return (
                          <button
                            key={relId}
                            type="button"
                            onClick={() => selectTopic(relId)}
                            className="group flex items-center gap-3 p-3.5 rounded-2xl border border-stone-200/80 bg-stone-50/50 hover:bg-white hover:border-indigo-300 hover:shadow-xs dark:border-white/10 dark:bg-white/[0.02] dark:hover:border-dusk-lavender/30 dark:hover:bg-white/[0.04] transition cursor-pointer text-left"
                          >
                            <div className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-xl border", relTheme.sectionBadge)}>
                              <RelIcon className="h-4 w-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-semibold text-stone-900 dark:text-stone-100 group-hover:text-indigo-600 dark:group-hover:text-dusk-lavender transition truncate">
                                {relTopic.title}
                              </p>
                              <p className="text-[10px] text-stone-500 dark:text-stone-400 truncate">
                                {relTopic.summary}
                              </p>
                            </div>
                            <ArrowRight className="h-3.5 w-3.5 text-stone-400 group-hover:text-indigo-600 dark:group-hover:text-dusk-lavender shrink-0 transition" />
                          </button>
                        );
                      })}
                    </div>
                  </section>
                )}

                {/* ── Article Feedback Widget ── */}
                <div className="rounded-2xl border border-stone-200/80 bg-stone-50/60 p-4 sm:p-5 dark:border-white/10 dark:bg-white/[0.02] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h3 className="text-xs sm:text-sm font-semibold text-stone-900 dark:text-stone-100">
                      {isEn ? "Was this article helpful?" : "บทความนี้มีประโยชน์กับคุณหรือไม่?"}
                    </h3>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400">
                      {isEn ? "Your feedback helps us refine the system guide." : "คำติชมของคุณช่วยให้เราปรับปรุงคู่มือระบบได้ดียิ่งขึ้น"}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {feedbackVote ? (
                      <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                        <Check className="h-3.5 w-3.5" />
                        {isEn ? "Thanks for your feedback!" : "ขอบคุณสำหรับข้อเสนอแนะ!"}
                      </span>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => handleFeedback("helpful")}
                          className="flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50 hover:border-emerald-300 hover:text-emerald-700 dark:border-white/10 dark:bg-white/5 dark:text-stone-300 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-400 transition cursor-pointer shadow-sm"
                        >
                          <ThumbsUp className="h-3.5 w-3.5" />
                          <span>{isEn ? "Helpful" : "มีประโยชน์"}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleFeedback("unhelpful")}
                          className="flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50 hover:border-rose-300 hover:text-rose-700 dark:border-white/10 dark:bg-white/5 dark:text-stone-300 dark:hover:bg-rose-500/10 dark:hover:text-rose-400 transition cursor-pointer shadow-sm"
                        >
                          <ThumbsDown className="h-3.5 w-3.5" />
                          <span>{isEn ? "Needs work" : "ต้องปรับปรุง"}</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* ── Prev / Next Navigation Buttons ── */}
                <footer className="pt-4 border-t border-stone-200/80 dark:border-white/10">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {prevTopic ? (
                      <button
                        type="button"
                        onClick={() => selectTopic(prevTopic.id)}
                        className="group flex flex-col items-start p-4 rounded-xl border border-stone-200/80 bg-stone-50/50 hover:bg-white hover:border-indigo-300 dark:border-white/10 dark:bg-white/[0.02] dark:hover:border-dusk-lavender/30 dark:hover:bg-white/[0.05] transition cursor-pointer text-left shadow-sm"
                      >
                        <span className="flex items-center gap-1 text-[11px] font-medium text-stone-500 dark:text-stone-400 group-hover:text-indigo-600 dark:group-hover:text-dusk-lavender">
                          <ChevronLeft className="h-3.5 w-3.5" />
                          {isEn ? "Previous Article" : "บทความก่อนหน้า"}
                        </span>
                        <span className="mt-1 text-xs sm:text-sm font-semibold text-stone-900 dark:text-stone-100 group-hover:text-indigo-600 dark:group-hover:text-dusk-lavender truncate w-full">
                          {prevTopic.title}
                        </span>
                      </button>
                    ) : (
                      <div />
                    )}

                    {nextTopic && (
                      <button
                        type="button"
                        onClick={() => selectTopic(nextTopic.id)}
                        className="group flex flex-col items-end p-4 rounded-xl border border-stone-200/80 bg-stone-50/50 hover:bg-white hover:border-indigo-300 dark:border-white/10 dark:bg-white/[0.02] dark:hover:border-dusk-lavender/30 dark:hover:bg-white/[0.05] transition cursor-pointer text-right shadow-sm"
                      >
                        <span className="flex items-center gap-1 text-[11px] font-medium text-stone-500 dark:text-stone-400 group-hover:text-indigo-600 dark:group-hover:text-dusk-lavender">
                          {isEn ? "Next Article" : "บทความถัดไป"}
                          <ChevronRight className="h-3.5 w-3.5" />
                        </span>
                        <span className="mt-1 text-xs sm:text-sm font-semibold text-stone-900 dark:text-stone-100 group-hover:text-indigo-600 dark:group-hover:text-dusk-lavender truncate w-full">
                          {nextTopic.title}
                        </span>
                      </button>
                    )}
                  </div>
                </footer>
              </article>

              {/* ── Right Column: Table of Contents & Support (Desktop Only) ── */}
              <aside className="hidden xl:block w-64 shrink-0 sticky top-20 self-start space-y-5">
                {/* On This Page Widget */}
                <div className="lofi-panel rounded-2xl border border-stone-200/80 bg-white/70 p-4 dark:border-white/10 dark:bg-ink-950/40 space-y-3 shadow-2xs">
                  <div className="flex items-center justify-between pb-2 border-b border-stone-200/80 dark:border-white/10">
                    <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400">
                      {isEn ? "On This Page" : "ในบทความนี้"}
                    </p>
                    <TapeCounter value={scrollProgress} label="TAPE" isEn={isEn} />
                  </div>

                  <nav className="flex flex-col gap-1 text-xs">
                    {activeTopic.id === "welcome-overview" && (
                      <>
                        <a
                          href="#core-pillars"
                          className={cn(
                            "transition truncate flex items-center gap-1.5 py-1 px-1 rounded-md",
                            activeHeadingId === "core-pillars"
                              ? "text-indigo-600 dark:text-dusk-lavender font-semibold border-l-2 border-indigo-600 dark:border-dusk-lavender pl-2 bg-indigo-50/50 dark:bg-dusk-lavender/10"
                              : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200"
                          )}
                        >
                          <Layers className="h-3 w-3 shrink-0" />
                          <span>{isEn ? "6 Core Pillars" : "6 เสาหลักระบบ"}</span>
                        </a>
                        <a
                          href="#architecture-hub"
                          className={cn(
                            "transition truncate flex items-center gap-1.5 py-1 px-1 rounded-md",
                            activeHeadingId === "architecture-hub"
                              ? "text-indigo-600 dark:text-dusk-lavender font-semibold border-l-2 border-indigo-600 dark:border-dusk-lavender pl-2 bg-indigo-50/50 dark:bg-dusk-lavender/10"
                              : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200"
                          )}
                        >
                          <Workflow className="h-3 w-3 shrink-0" />
                          <span>{isEn ? "Data Hub Diagram" : "ผังสถาปัตยกรรม Data Hub"}</span>
                        </a>
                        <a
                          href="#live-demo"
                          className={cn(
                            "transition truncate flex items-center gap-1.5 py-1 px-1 rounded-md",
                            activeHeadingId === "live-demo"
                              ? "text-indigo-600 dark:text-dusk-lavender font-semibold border-l-2 border-indigo-600 dark:border-dusk-lavender pl-2 bg-indigo-50/50 dark:bg-dusk-lavender/10"
                              : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200"
                          )}
                        >
                          <Play className="h-3 w-3 shrink-0" />
                          <span>{isEn ? "Pipeline Bench" : "ตัวอย่าง Pipeline สด"}</span>
                        </a>
                      </>
                    )}
                    {activeTopic.concept && (
                      <a
                        href="#overview"
                        className={cn(
                          "transition truncate flex items-center gap-1.5 py-1 px-1 rounded-md",
                          activeHeadingId === "overview"
                            ? "text-indigo-600 dark:text-dusk-lavender font-semibold border-l-2 border-indigo-600 dark:border-dusk-lavender pl-2 bg-indigo-50/50 dark:bg-dusk-lavender/10"
                            : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200"
                        )}
                      >
                        <Compass className="h-3 w-3 shrink-0" />
                        <span className="truncate">{isEn ? "Overview & Concept" : "ภาพรวมและแนวคิด"}</span>
                      </a>
                    )}
                    {activeTopic.demoType && activeTopic.id !== "welcome-overview" && (
                      <a
                        href="#live-demo"
                        className={cn(
                          "transition truncate flex items-center gap-1.5 py-1 px-1 rounded-md",
                          activeHeadingId === "live-demo"
                            ? "text-indigo-600 dark:text-dusk-lavender font-semibold border-l-2 border-indigo-600 dark:border-dusk-lavender pl-2 bg-indigo-50/50 dark:bg-dusk-lavender/10"
                            : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200"
                        )}
                      >
                        <Play className="h-3 w-3 shrink-0" />
                        <span>{isEn ? "Interactive Bench" : "แท่นทดลองจำลองสด"}</span>
                      </a>
                    )}
                    <a
                      href="#capabilities"
                      className={cn(
                        "transition truncate flex items-center gap-1.5 py-1 px-1 rounded-md",
                        activeHeadingId === "capabilities"
                          ? "text-indigo-600 dark:text-dusk-lavender font-semibold border-l-2 border-indigo-600 dark:border-dusk-lavender pl-2 bg-indigo-50/50 dark:bg-dusk-lavender/10"
                          : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200"
                      )}
                    >
                      <span>•</span>
                      <span className="truncate">{isEn ? "Key Capabilities" : "คุณสมบัติและความสามารถ"}</span>
                    </a>
                    {activeTopic.workflowSteps && activeTopic.workflowSteps.length > 0 && (
                      <a
                        href="#workflow"
                        className={cn(
                          "transition truncate flex items-center gap-1.5 py-1 px-1 rounded-md",
                          activeHeadingId === "workflow"
                            ? "text-indigo-600 dark:text-dusk-lavender font-semibold border-l-2 border-indigo-600 dark:border-dusk-lavender pl-2 bg-indigo-50/50 dark:bg-dusk-lavender/10"
                            : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200"
                        )}
                      >
                        <span>•</span>
                        <span className="truncate">{isEn ? "Workflow Steps" : "ขั้นตอนการใช้งานจริง"}</span>
                      </a>
                    )}
                    {activeTopic.technicalSpecs && activeTopic.technicalSpecs.length > 0 && (
                      <a
                        href="#technical-specs"
                        className={cn(
                          "transition truncate flex items-center gap-1.5 py-1 px-1 rounded-md",
                          activeHeadingId === "technical-specs"
                            ? "text-indigo-600 dark:text-dusk-lavender font-semibold border-l-2 border-indigo-600 dark:border-dusk-lavender pl-2 bg-indigo-50/50 dark:bg-dusk-lavender/10"
                            : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200"
                      )}
                    >
                      <span>•</span>
                      <span className="truncate">{isEn ? "Technical Specs" : "ข้อมูลจำเพาะทางเทคนิค"}</span>
                    </a>
                    )}
                    {(activeTopic.category === "ai" || activeTopic.id === "ai-assistant") && (
                      <a
                        href="#prompt-cookbook"
                        className={cn(
                          "transition truncate flex items-center gap-1.5 py-1 px-1 rounded-md",
                          activeHeadingId === "prompt-cookbook"
                            ? "text-indigo-600 dark:text-dusk-lavender font-semibold border-l-2 border-indigo-600 dark:border-dusk-lavender pl-2 bg-indigo-50/50 dark:bg-dusk-lavender/10"
                            : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200"
                        )}
                      >
                        <Bot className="h-3 w-3 shrink-0" />
                        <span className="truncate">{isEn ? "Prompt Recipes" : "สูตรคำสั่ง AI"}</span>
                      </a>
                    )}
                    {(activeTopic.id === "kanban-boards" || activeTopic.id === "spreadsheet-table-view") && (
                      <a
                        href="#view-comparison"
                        className={cn(
                          "transition truncate flex items-center gap-1.5 py-1 px-1 rounded-md",
                          activeHeadingId === "view-comparison"
                            ? "text-indigo-600 dark:text-dusk-lavender font-semibold border-l-2 border-indigo-600 dark:border-dusk-lavender pl-2 bg-indigo-50/50 dark:bg-dusk-lavender/10"
                            : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200"
                        )}
                      >
                        <Table className="h-3 w-3 shrink-0" />
                        <span className="truncate">{isEn ? "Dual-View Matrix" : "ตารางเปรียบเทียบมุมมอง"}</span>
                      </a>
                    )}
                    {activeTopic.id === "member-roles-security" && (
                      <a
                        href="#rbac-matrix"
                        className={cn(
                          "transition truncate flex items-center gap-1.5 py-1 px-1 rounded-md",
                          activeHeadingId === "rbac-matrix"
                            ? "text-indigo-600 dark:text-dusk-lavender font-semibold border-l-2 border-indigo-600 dark:border-dusk-lavender pl-2 bg-indigo-50/50 dark:bg-dusk-lavender/10"
                            : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200"
                        )}
                      >
                        <Shield className="h-3 w-3 shrink-0" />
                        <span className="truncate">{isEn ? "RBAC Matrix" : "ตารางสิทธิ์เข้าถึง RBAC"}</span>
                      </a>
                    )}
                    {activeTopic.tips && (
                      <a
                        href="#tips"
                        className={cn(
                          "transition truncate flex items-center gap-1.5 py-1 px-1 rounded-md",
                          activeHeadingId === "tips"
                            ? "text-indigo-600 dark:text-dusk-lavender font-semibold border-l-2 border-indigo-600 dark:border-dusk-lavender pl-2 bg-indigo-50/50 dark:bg-dusk-lavender/10"
                            : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200"
                        )}
                      >
                        <span>•</span>
                        <span className="truncate">{isEn ? "Pro Tips" : "เคล็ดลับจากผู้เชี่ยวชาญ"}</span>
                      </a>
                    )}
                    {activeTopic.codeOrShortcut && (
                      <a
                        href="#shortcuts"
                        className={cn(
                          "transition truncate flex items-center gap-1.5 py-1 px-1 rounded-md",
                          activeHeadingId === "shortcuts"
                            ? "text-indigo-600 dark:text-dusk-lavender font-semibold border-l-2 border-indigo-600 dark:border-dusk-lavender pl-2 bg-indigo-50/50 dark:bg-dusk-lavender/10"
                            : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200"
                        )}
                      >
                        <span>•</span>
                        <span className="truncate">{isEn ? "Quick Shortcut" : "คีย์ลัดด่วน"}</span>
                      </a>
                    )}
                  </nav>
                </div>

                {/* Need Help AI Card */}
                <div className="lofi-panel rounded-2xl border border-indigo-200 bg-indigo-50/60 p-4 text-stone-800 dark:border-dusk-lavender/30 dark:bg-dusk-lavender/10 dark:text-stone-200 space-y-2.5">
                  <div className="flex items-center gap-2 font-bold text-xs text-indigo-700 dark:text-dusk-lavender">
                    <Bot className="h-4 w-4" />
                    <span>{isEn ? "Need More Assistance?" : "ต้องการความช่วยเหลือเพิ่มเติม?"}</span>
                  </div>
                  <p className="text-[11px] text-stone-600 dark:text-stone-400 leading-relaxed">
                    {isEn
                      ? "Inquire about features, shortcuts, or board health directly with Retzlo AI."
                      : "ถามคำถามเกี่ยวกับฟีเจอร์หรือการใช้งานกับผู้ช่วย Retzlo AI ได้ทันทีในระบบ"}
                  </p>
                  <button
                    type="button"
                    onClick={openAiChat}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700 dark:bg-dusk-lavender dark:text-ink-950 dark:hover:bg-dusk-lavender/90 transition cursor-pointer shadow-sm"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-amber-300 dark:text-ink-950" />
                    <span>{isEn ? "Ask Retzlo AI" : "ถาม AI Assistant"}</span>
                  </button>
                </div>

                {/* Quick Share Link */}
                <div className="rounded-xl border border-stone-200/80 bg-stone-50/50 p-3 text-[11px] text-stone-500 dark:border-white/10 dark:bg-white/[0.02] dark:text-stone-400 flex items-center justify-between">
                  <span>Retzlo Docs</span>
                  <span className="font-mono font-semibold text-stone-700 dark:text-stone-300">2.4 Stable</span>
                </div>
              </aside>
            </div>
          )}

          {/* VIEW MODE 2: Interactive Feature Playground */}
          {viewMode === "interactive" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-stone-200 dark:border-white/10 pb-4">
                <div>
                  <h2 className="text-xl font-extrabold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                    <Play className="h-5 w-5 text-indigo-600 dark:text-dusk-lavender" />
                    <span>{isEn ? "Interactive Feature Playground" : "ศูนย์จำลองฟีเจอร์สด (Interactive Playground)"}</span>
                  </h2>
                  <p className="text-xs text-stone-600 dark:text-stone-300 mt-1">
                    {isEn
                      ? "Experience Retzlo's core innovations live to master the system before starting production work."
                      : "ทดลองสัมผัสระบบสำคัญของ Retzlo แบบสดๆ เพื่อทำความเข้าใจก่อนเริ่มทำงานจริง"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setViewMode("docs")}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-50 dark:border-white/10 dark:bg-white/5 dark:text-stone-300"
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>{isEn ? "Return to Docs" : "กลับไปยังคู่มือบทความ"}</span>
                </button>
              </div>

              <div className="grid gap-6">
                {/* 1. Kanban & Spreadsheet Table */}
                <DocsSandboxDeck
                  title={isEn ? "DUAL-VIEW ENGINE BENCH" : "DUAL-VIEW ENGINE BENCH"}
                  subtitle={isEn ? "Kanban Board & Spreadsheet Table Dual-View" : "ระบบมุมมองคู่ Kanban & ตาราง Spreadsheet"}
                  badgeText="VIEWPORT BENCH"
                  techSpecs="MEMORY CACHE • REACT OPTIMISTIC MUTATION • DENSITY: NORMAL/COMPACT"
                >
                  <InteractiveKanbanTableDemo isEn={isEn} />
                </DocsSandboxDeck>

                {/* 2. Retzlo AI */}
                <DocsSandboxDeck
                  title={isEn ? "RETZLO COPILOT SIMULATOR" : "RETZLO COPILOT SIMULATOR"}
                  subtitle={isEn ? "Autonomous task decomposition engine" : "ผู้ช่วย Retzlo AI แตกงานอัตโนมัติ"}
                  badgeText="COPILOT BENCH"
                  techSpecs="MODEL: DEEPSEEK-V4-PRO • LATENCY: ~320MS • STREAM: CHUNKED"
                >
                  <InteractiveAiDemo isEn={isEn} />
                </DocsSandboxDeck>

                {/* 3. Custom Priorities */}
                <DocsSandboxDeck
                  title={isEn ? "10-LEVEL PRIORITY MATRIX" : "10-LEVEL PRIORITY MATRIX"}
                  subtitle={isEn ? "Custom priority scales & Retro Lofi color tokens" : "ปรับแต่งระดับความสำคัญ 10 ระดับ"}
                  badgeText="PALETTE BENCH"
                  techSpecs="SCALE: 1-10 • COLOR MATRIX: RETRO-LOFI INDIGO • LOCAL OVERRIDE"
                >
                  <InteractivePrioritiesDemo isEn={isEn} />
                </DocsSandboxDeck>

                {/* 4. Coffee Cheers */}
                <DocsSandboxDeck
                  title={isEn ? "COFFEE CHEERS & COIN TRANSACTOR" : "COFFEE CHEERS & COIN TRANSACTOR"}
                  subtitle={isEn ? "Social morale cheers & gamified coin economy" : "ระบบ Coffee Cheers และ Coins Wallet"}
                  badgeText="ECONOMY BENCH"
                  techSpecs="LEDGER: AUDIT-COMPLIANT • PEER-TO-PEER MORALE • BALANCE: 120 COINS"
                >
                  <InteractiveCoffeeDemo isEn={isEn} />
                </DocsSandboxDeck>
              </div>
            </div>
          )}

          {/* VIEW MODE 3: Keyboard Shortcuts Cheatsheet Matrix */}
          {viewMode === "shortcuts" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-stone-200 dark:border-white/10 pb-4">
                <div>
                  <h2 className="text-xl font-extrabold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                    <Keyboard className="h-5 w-5 text-indigo-600 dark:text-dusk-lavender" />
                    <span>{isEn ? "Keyboard Shortcuts Matrix" : "คลังคีย์ลัดระบบ (Keyboard Shortcuts Matrix)"}</span>
                  </h2>
                  <p className="text-xs text-stone-600 dark:text-stone-300 mt-1">
                    {isEn
                      ? "Operate at peak velocity with power-user shortcuts without lifting hands from the keyboard."
                      : "เพิ่มความเร็วในการทำงานระดับ Power User ควบคุมระบบได้โดยไม่ต้องยกมือจากคีย์บอร์ด"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setViewMode("docs")}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-50 dark:border-white/10 dark:bg-white/5 dark:text-stone-300"
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>{isEn ? "Return to Docs" : "กลับไปยังคู่มือบทความ"}</span>
                </button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {shortcutsList.map((sc, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 rounded-2xl border border-stone-200/80 bg-white dark:border-white/10 dark:bg-ink-950/70 shadow-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100">
                          {sc.title}
                        </span>
                        <span className="rounded-full bg-stone-100 dark:bg-white/10 px-2 py-0.2 text-[9px] font-semibold text-stone-600 dark:text-stone-400">
                          {sc.cat}
                        </span>
                      </div>
                      <p className="text-xs text-stone-500 dark:text-stone-400">
                        {sc.desc}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopyShortcut(sc.key)}
                      className="ml-3 flex items-center gap-1.5 rounded-xl border border-stone-200 bg-stone-50 px-2.5 py-1.5 font-mono text-xs font-bold text-indigo-600 hover:bg-indigo-50 dark:border-white/10 dark:bg-white/[0.05] dark:text-dusk-amber transition cursor-pointer"
                      title={isEn ? "Click to copy shortcut" : "คลิกเพื่อคัดลอกคีย์ลัด"}
                    >
                      {copiedShortcut === sc.key ? (
                        <Check className="h-3.5 w-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="h-3.5 w-3.5 text-stone-400" />
                      )}
                      <span>{sc.key}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIEW MODE 4: Interactive FAQ Hub */}
          {viewMode === "faq" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-stone-200 dark:border-white/10 pb-4">
                <div>
                  <h2 className="text-xl font-extrabold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                    <HelpCircle className="h-5 w-5 text-indigo-600 dark:text-dusk-lavender" />
                    <span>{isEn ? "Frequently Asked Questions" : "คำถามที่พบบ่อย (Frequently Asked Questions)"}</span>
                  </h2>
                  <p className="text-xs text-stone-600 dark:text-stone-300 mt-1">
                    {isEn ? "Instant solutions for common inquiries and system troubleshooting." : "คำตอบสำหรับคำถามยอดนิยมและแนวทางการแก้ปัญหาเบื้องต้น"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setViewMode("docs")}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-50 dark:border-white/10 dark:bg-white/5 dark:text-stone-300"
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>{isEn ? "Return to Docs" : "กลับไปยังคู่มือบทความ"}</span>
                </button>
              </div>

              <div className="space-y-3">
                {faqList.map((faq, idx) => {
                  const isOpen = openFaqIndex === idx;
                  return (
                    <div
                      key={idx}
                      className="rounded-2xl border border-stone-200/80 bg-white dark:border-white/10 dark:bg-ink-950/70 overflow-hidden shadow-xs transition"
                    >
                      <button
                        type="button"
                        onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                        className="w-full flex items-center justify-between p-4 sm:p-5 text-left cursor-pointer hover:bg-stone-50/50 dark:hover:bg-white/[0.02]"
                      >
                        <div className="flex items-center gap-3">
                          <span className="grid h-6 w-6 place-items-center rounded-lg bg-indigo-50 font-bold text-xs text-indigo-600 dark:bg-dusk-lavender/15 dark:text-dusk-lavender shrink-0">
                            Q
                          </span>
                          <span className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100">
                            {faq.q}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="hidden sm:inline-block rounded-full bg-stone-100 dark:bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-stone-600 dark:text-stone-400">
                            {faq.tag}
                          </span>
                          <ChevronDown
                            className={cn(
                              "h-4 w-4 text-stone-400 transition transform",
                              isOpen && "rotate-180 text-indigo-600 dark:text-dusk-lavender"
                            )}
                          />
                        </div>
                      </button>

                      {isOpen && (
                        <div className="p-4 sm:p-5 pt-0 border-t border-stone-100 dark:border-white/5 bg-stone-50/40 dark:bg-white/[0.01] text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
                          <div className="pt-3">{faq.a}</div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="rounded-2xl border border-stone-200/80 bg-white/80 p-4 text-xs text-stone-600 dark:border-white/10 dark:bg-ink-950/60 dark:text-stone-400">
                <span className="font-semibold text-stone-900 dark:text-stone-200">
                  {isEn ? "Live Mockup Preview System:" : "ระบบจำลองตัวอย่างแบบเรียลไทม์ (Live Mockup Preview):"}
                </span>{" "}
                {isEn
                  ? "Every creation and configuration modal—including Create Board, Board Settings (General, Access, Columns, Statuses, Priorities), Edit Card Attributes, Diary Routines, Note Folders, and Notes—includes a real-time interactive preview card before you save."
                  : "ทุกหน้าต่างการสร้างและตั้งค่า ไม่ว่าจะเป็นการสร้างบอร์ด ตั้งค่าคอลัมน์ สถานะ ความสำคัญ การ์ดงาน ไดอารี่ โฟลเดอร์ และโน้ต มีระบบแสดงภาพตัวอย่าง (Mockup Preview) แบบเรียลไทม์ให้ตรวจสอบก่อนกดบันทึกเสมอ"}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

