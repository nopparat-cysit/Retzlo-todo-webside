"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, type ReactNode, useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  Bot,
  Brain,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  DoorOpen,
  FileText,
  LayoutDashboard,
  MessageSquare,
  Music,
  Plus,
  Radio,
  Search,
  Send,
  Sparkles,
  X
} from "lucide-react";

import { AppModal } from "@/components/ui/app-modal";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import type { OfficePayload } from "@/lib/office/data";
import { cn } from "@/lib/utils";
import { PixelOffice } from "./PixelOffice";

export interface OfficeProject {
  id: string;
  name: string;
  description: string | null;
  type: string;
  updatedAt: string;
  boardId: string | null;
  counts: { boards: number; members: number; notes: number };
}

type ModalMode = "project" | "thread" | "task" | "report" | "routine" | "diary" | "memory" | "skill" | null;
type OfficeAgent = OfficePayload["agents"][number];
type OfficeThread = OfficePayload["threads"][number];

const agentAccentClasses: Record<string, string> = {
  AMBER: "border-[#e5bd72]/30 bg-[#e5bd72]/10 text-[#e5bd72]",
  CYAN: "border-[#89c7d6]/30 bg-[#89c7d6]/10 text-[#89c7d6]",
  LAVENDER: "border-[#a9a2ff]/30 bg-[#a9a2ff]/10 text-[#a9a2ff]",
  ROSE: "border-[#d59ab3]/30 bg-[#d59ab3]/10 text-[#d59ab3]"
};

export function OfficeModule({
  initialProjectId,
  projects,
  office,
  databaseError
}: {
  initialProjectId?: string;
  projects: OfficeProject[];
  office?: OfficePayload | null;
  databaseError?: string;
}) {
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [query, setQuery] = useState("");
  const selectedProject = projects.find((project) => project.id === initialProjectId) ?? null;
  const filteredProjects = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return projects;
    return projects.filter((project) => [project.name, project.description ?? "", project.type].join(" ").toLowerCase().includes(normalizedQuery));
  }, [projects, query]);

  return (
    <main className="min-h-screen overflow-hidden bg-[#060613] text-stone-100">
      <div className="relative min-h-screen px-3 py-4 sm:px-4 lg:px-5">
        <OfficeBackdrop />
        <header className="relative z-20 flex w-full items-center justify-between">
          <Link href="/select-module" className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-stone-300 transition hover:border-dusk-lavender/40 hover:text-white">
            Module Hub
          </Link>
          <div className="flex items-center gap-2 rounded-full border border-[#e5bd72]/20 bg-[#e5bd72]/10 px-3 py-2 text-xs uppercase tracking-[0.24em] text-[#e5bd72]">
            <Radio className="h-3.5 w-3.5" /> Office beta
          </div>
        </header>

        {databaseError ? (
          <DatabaseFallback message={databaseError} />
        ) : selectedProject ? (
          <OfficeWorkspace project={selectedProject} office={office} openModal={setModalMode} />
        ) : (
          <OfficeProjectSelector projects={projects} filteredProjects={filteredProjects} query={query} setQuery={setQuery} openCreate={() => setModalMode("project")} />
        )}

        {modalMode ? <OfficeActionModal mode={modalMode} project={selectedProject} office={office ?? null} onClose={() => setModalMode(null)} /> : null}
      </div>
    </main>
  );
}

function OfficeBackdrop() {
  return (
    <>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(169,162,255,0.20),transparent_28%),radial-gradient(circle_at_80%_20%,rgba(137,199,214,0.16),transparent_26%),linear-gradient(180deg,#070618_0%,#11102a_52%,#080713_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-[42%] bg-[linear-gradient(to_right,rgba(169,162,255,0.18)_1px,transparent_1px),linear-gradient(to_bottom,rgba(169,162,255,0.16)_1px,transparent_1px)] bg-[size:48px_48px] opacity-40 [transform:perspective(420px)_rotateX(62deg)] [transform-origin:top_center]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_80%,rgba(229,189,114,0.10),transparent_34%)]" />
    </>
  );
}

function DatabaseFallback({ message }: { message: string }) {
  return (
    <section className="relative z-10 mx-auto flex min-h-[72vh] max-w-3xl items-center justify-center pt-12">
      <div className="rounded-[28px] border border-white/10 bg-[#090817]/90 p-8 text-center shadow-[0_36px_110px_rgba(0,0,0,0.55)]">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-[#e5bd72]/25 bg-[#e5bd72]/10 text-[#e5bd72]"><Radio className="h-6 w-6" /></div>
        <h1 className="mt-5 text-2xl font-semibold text-white">Office is waiting for the database.</h1>
        <p className="mt-3 text-sm leading-6 text-stone-400">{message}</p>
      </div>
    </section>
  );
}
function OfficeProjectSelector({
  projects,
  filteredProjects,
  query,
  setQuery,
  openCreate
}: {
  projects: OfficeProject[];
  filteredProjects: OfficeProject[];
  query: string;
  setQuery: (value: string) => void;
  openCreate: () => void;
}) {
  return (
    <section className="relative z-10 grid w-full gap-8 pt-10 lg:grid-cols-[minmax(420px,0.9fr)_minmax(560px,1.1fr)] lg:items-start">
      <div className="space-y-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-dusk-lavender/20 bg-white/[0.04] px-4 py-2 text-xs uppercase tracking-[0.28em] text-dusk-lavender">
          <Music className="h-3.5 w-3.5 text-[#e5bd72]" /> Office project selector
        </div>
        <div className="space-y-4">
          <h1 className="max-w-xl text-4xl font-semibold leading-tight text-white sm:text-5xl">Choose which project office to enter.</h1>
          <p className="max-w-xl text-sm leading-7 text-stone-300 sm:text-base">Office starts with its own project picker. Pick a workspace, or create a new office project without leaving this module.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <label className="relative block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
            <input value={query} placeholder="Search office projects" className="h-11 w-full rounded-lg border border-white/10 bg-white/[0.055] pl-10 pr-3 text-sm text-white outline-none transition placeholder:text-stone-500 focus:border-dusk-lavender/50 focus:ring-2 focus:ring-dusk-lavender/20" onChange={(event) => setQuery(event.target.value)} />
          </label>
          <button type="button" onClick={openCreate} className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-dusk-lavender/25 bg-dusk-lavender px-4 text-sm font-medium text-ink-950 transition hover:bg-dusk-amber active:scale-[0.98]"><Plus className="h-4 w-4" />New Project</button>
        </div>
        <div className="grid gap-3">
          {filteredProjects.length > 0 ? filteredProjects.map((project) => <OfficeProjectCard key={project.id} project={project} />) : <div className="rounded-lg border border-dashed border-white/12 bg-white/[0.035] p-6 text-sm text-stone-400">No office project matches this search.</div>}
        </div>
      </div>
      <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#090817] p-6 shadow-[0_36px_110px_rgba(0,0,0,0.55)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(169,162,255,0.18),transparent_35%)]" />
        <div className="relative grid gap-4">
          <MetricCard label="Office queue" value={String(projects.length)} detail="Available project offices" />
          <OfficePreviewPanel />
        </div>
      </div>
    </section>
  );
}

function OfficeProjectCard({ project }: { project: OfficeProject }) {
  return (
    <Link href={`/office?projectId=${project.id}`} className="group rounded-lg border border-white/10 bg-white/[0.045] p-4 transition hover:-translate-y-0.5 hover:border-dusk-lavender/35 hover:bg-white/[0.07]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-dusk-lavender/20 bg-dusk-lavender/12 text-dusk-lavender"><DoorOpen className="h-4 w-4" /></span>
            <div className="min-w-0"><h2 className="truncate text-base font-semibold text-white">{project.name}</h2><p className="text-[10px] uppercase tracking-[0.22em] text-stone-500">{project.type === "DIARY" ? "Diary office" : "Work office"}</p></div>
          </div>
          <p className="mt-3 line-clamp-2 text-sm leading-6 text-stone-400">{project.description || "No description yet."}</p>
        </div>
        <ArrowRight className="mt-2 h-4 w-4 shrink-0 text-stone-500 transition group-hover:translate-x-1 group-hover:text-dusk-lavender" />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs text-stone-400">
        <span className="rounded-md border border-white/10 bg-black/15 px-2 py-2">{project.counts.boards} boards</span>
        <span className="rounded-md border border-white/10 bg-black/15 px-2 py-2">{project.counts.members} members</span>
        <span className="rounded-md border border-white/10 bg-black/15 px-2 py-2">{project.counts.notes} notes</span>
      </div>
    </Link>
  );
}

function OfficeWorkspace({ project, office, openModal }: { project: OfficeProject; office?: OfficePayload | null; openModal: (mode: ModalMode) => void }) {
  const [selectedAgentId, setSelectedAgentId] = useState(() => office?.agents[0]?.id ?? "");
  const [selectedThreadId, setSelectedThreadId] = useState(() => office?.threads[0]?.id ?? "");
  const selectedAgent = office?.agents.find((agent) => agent.id === selectedAgentId) ?? office?.agents[0] ?? null;
  const agentThreads = office?.threads.filter((thread) => thread.agentId === selectedAgent?.id) ?? [];
  const selectedThread = agentThreads.find((thread) => thread.id === selectedThreadId) ?? agentThreads[0] ?? null;
  const runningTasks = office?.tasks.filter((task) => ["QUEUED", "WORKING", "NEEDS_YOU"].includes(task.status)) ?? [];
  const needsYou = office?.tasks.filter((task) => task.status === "NEEDS_YOU" || task.status === "FAILED") ?? [];
  const todayBrief = office?.reports[0]?.summary ?? "No report yet. Ask Chief or Researcher to create the first brief.";

  return (
    <section className="relative z-10 grid w-full gap-4 pt-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-dusk-lavender/20 bg-white/[0.04] px-4 py-2 text-xs uppercase tracking-[0.28em] text-dusk-lavender"><LayoutDashboard className="h-3.5 w-3.5 text-[#e5bd72]" /> Office dashboard</div>
          <h1 className="mt-4 text-3xl font-semibold text-white sm:text-5xl">What should I know now?</h1>
          <p className="mt-2 max-w-4xl text-sm leading-7 text-stone-300">{project.name} office keeps chat, tasks, reports, routines, and agent learning in one project-scoped workspace.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/office" className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-stone-200 transition hover:border-dusk-lavender/35">Switch project</Link>
          <Link href={`/project/${project.id}/${project.type === "DIARY" ? "diary" : "board"}`} className="rounded-full bg-[#a9a2ff] px-4 py-2 text-sm font-semibold text-[#080817] transition hover:bg-[#e5bd72]">Open project</Link>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-4 xl:grid-cols-4">
        <MetricCard label="Needs You" value={String(needsYou.length)} detail="Blocked or waiting tasks" />
        <MetricCard label="Latest Reports" value={String(office?.reports.length ?? 0)} detail="Saved outputs" />
        <MetricCard label="Running Tasks" value={String(runningTasks.length)} detail="Queued / working" />
        <MetricCard label="Agents" value={String(office?.agents.length ?? 0)} detail="Project staff" />
      </div>

      <div className="grid min-h-[calc(100vh-245px)] gap-3 lg:grid-cols-[240px_260px_minmax(420px,1fr)_320px] xl:grid-cols-[260px_280px_minmax(520px,1fr)_340px]">
        <Panel title="Agents" action={<button type="button" onClick={() => openModal("memory")} className="text-xs text-dusk-amber hover:text-white">Save memory</button>}>
          <div className="grid gap-2">
            {(office?.agents ?? []).map((agent) => (
              <button key={agent.id} type="button" onClick={() => { setSelectedAgentId(agent.id); setSelectedThreadId(""); }} className={cn("rounded-lg border p-3 text-left transition", selectedAgent?.id === agent.id ? agentAccentClasses[agent.accent] ?? agentAccentClasses.LAVENDER : "border-white/10 bg-white/[0.035] hover:bg-white/[0.06]")}>
                <div className="flex items-center gap-2"><Bot className="h-4 w-4" /><span className="font-semibold text-white">{agent.name}</span></div>
                <p className="mt-1 text-xs leading-5 text-stone-400">{agent.role}</p>
              </button>
            ))}
          </div>
        </Panel>        <Panel title="Threads" action={<button type="button" onClick={() => openModal("thread")} className="text-xs text-dusk-amber hover:text-white">New thread</button>}>
          <div className="grid gap-2">
            {agentThreads.length > 0 ? agentThreads.map((thread) => (
              <button key={thread.id} type="button" onClick={() => setSelectedThreadId(thread.id)} className={cn("rounded-lg border p-3 text-left transition", selectedThread?.id === thread.id ? "border-dusk-lavender/40 bg-dusk-lavender/12" : "border-white/10 bg-white/[0.035] hover:bg-white/[0.06]")}>
                <div className="line-clamp-1 text-sm font-semibold text-white">{thread.title}</div>
                <div className="mt-1 text-[11px] text-stone-500">{thread._count.messages} messages / {thread._count.tasks} tasks / {thread._count.reports} reports</div>
              </button>
            )) : <EmptyText text="No thread yet. Start with New thread or send a message." />}
          </div>
        </Panel>

        <Panel title={selectedThread?.title ?? "Chat"} action={<span className="text-xs text-stone-500">web-only V1</span>}>
          <OfficeChat projectId={project.id} agent={selectedAgent} thread={selectedThread} />
        </Panel>

        <div className="grid gap-4">
          <Panel title="Today Brief" action={<button type="button" onClick={() => openModal("report")} className="text-xs text-dusk-amber hover:text-white">Create report</button>}>
            <p className="text-sm leading-6 text-stone-300">{todayBrief}</p>
          </Panel>
          <Panel title="Quick Actions">
            <div className="grid grid-cols-2 gap-2">
              <ActionButton icon={ClipboardList} label="Task" onClick={() => openModal("task")} />
              <ActionButton icon={FileText} label="Report" onClick={() => openModal("report")} />
              <ActionButton icon={CalendarClock} label="Routine" onClick={() => openModal("routine")} />
              <ActionButton icon={Brain} label="Diary" onClick={() => openModal("diary")} />
              <ActionButton icon={Sparkles} label="Skill" onClick={() => openModal("skill")} />
              <ActionButton icon={CheckCircle2} label="Memory" onClick={() => openModal("memory")} />
            </div>
          </Panel>
          <Panel title="Latest Reports">
            <div className="grid gap-2">
              {(office?.reports ?? []).slice(0, 4).map((report) => <MiniItem key={report.id} title={report.title} detail={report.summary} />)}
              {office?.reports.length ? null : <EmptyText text="No reports yet." />}
            </div>
          </Panel>
          <Panel title="Running Tasks">
            <div className="grid gap-2">
              {runningTasks.slice(0, 5).map((task) => <MiniItem key={task.id} title={task.title} detail={`${task.status} / ${task.agent.name}`} />)}
              {runningTasks.length ? null : <EmptyText text="No active task yet." />}
            </div>
          </Panel>
          <Panel title="Routines" action={<button type="button" onClick={() => openModal("routine")} className="text-xs text-dusk-amber hover:text-white">New</button>}>
            <RoutineList projectId={project.id} routines={office?.routines ?? []} />
          </Panel>
        </div>
      </div>

      <Panel title="Agent Docs / Skills / Diary"><AgentKnowledge agent={selectedAgent} /></Panel>
    </section>
  );
}

function OfficeChat({ projectId, agent, thread }: { projectId: string; agent: OfficeAgent | null; thread: OfficeThread | null }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!agent) return;
    const form = event.currentTarget;
    const formData = new FormData(form);
    setIsPending(true);
    try {
      const response = await fetch(`/api/office/${projectId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId: agent.id, threadId: thread?.id, content: formData.get("content") })
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error ?? "Could not send message.");
      toast({ message: "Message sent.", type: "success" });
      form.reset();
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not send message.";
      toast({ message, type: "error" });
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="flex h-full min-h-[calc(100vh-330px)] flex-col">
      <div className="flex-1 space-y-3 overflow-y-auto pr-1">
        {thread?.messages.length ? thread.messages.map((message) => (
          <div key={message.id} className={cn("max-w-[88%] rounded-lg border px-3 py-2 text-sm leading-6", message.authorType === "USER" ? "ml-auto border-dusk-lavender/30 bg-dusk-lavender/12 text-white" : "border-white/10 bg-white/[0.04] text-stone-300")}>
            <div className="mb-1 text-[10px] uppercase tracking-[0.18em] text-stone-500">{message.authorType === "USER" ? "You" : agent?.name ?? "Agent"}</div>
            <p className="whitespace-pre-wrap">{message.content}</p>
          </div>
        )) : <EmptyText text="Start the first thread by sending a message." />}
      </div>
      <form onSubmit={handleSubmit} className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto]">
        <Input name="content" placeholder={agent ? `Message ${agent.name}` : "Select an agent"} required disabled={!agent || isPending} />
        <Button disabled={!agent || isPending} className="gap-2"><Send className="h-4 w-4" />{isPending ? "Sending" : "Send"}</Button>
      </form>
    </div>
  );
}

function AgentKnowledge({ agent }: { agent: OfficeAgent | null }) {
  if (!agent) return <EmptyText text="Select an agent to inspect docs, skills, and diary." />;
  const profile = agent.documents.find((document) => document.type === "PROFILE");
  return (
    <div className="grid gap-3 lg:grid-cols-3">
      <DocBlock title="agent.md" content={profile?.content ?? "No profile yet."} />
      <DocBlock title="skills/*.md" content={agent.skills[0]?.content ?? "No skill yet."} />
      <DocBlock title="diary/latest" content={agent.diaryEntries[0]?.content ?? "No diary entry yet."} />
    </div>
  );
}

function RoutineList({ projectId, routines }: { projectId: string; routines: OfficePayload["routines"] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function callRoutine(routineId: string, action: "run" | "toggle", enabled?: boolean) {
    setPendingId(routineId);
    try {
      const response = await fetch(`/api/office/${projectId}/routines/${routineId}${action === "run" ? "/run" : ""}`, {
        method: action === "run" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: action === "run" ? undefined : JSON.stringify({ enabled })
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error ?? "Routine did not sync.");
      toast({ message: action === "run" ? "Routine report created." : "Routine updated.", type: "success" });
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Routine did not sync.";
      toast({ message, type: "error" });
    } finally {
      setPendingId(null);
    }
  }

  if (!routines.length) return <EmptyText text="No routine yet. Create AI Morning Brief or another recurring report." />;

  return (
    <div className="grid gap-2">
      {routines.slice(0, 4).map((routine) => (
        <div key={routine.id} className="rounded-lg border border-white/10 bg-white/[0.035] p-3">
          <div className="text-sm font-semibold text-white">{routine.title}</div>
          <p className="mt-1 text-xs leading-5 text-stone-400">{routine.scheduleLabel}{routine.timeOfDay ? ` at ${routine.timeOfDay}` : ""} / {routine.enabled ? "Enabled" : "Disabled"}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" disabled={pendingId === routine.id} onClick={() => callRoutine(routine.id, "run")} className="rounded-md border border-dusk-lavender/25 bg-dusk-lavender/12 px-2.5 py-1 text-xs font-semibold text-dusk-lavender transition hover:bg-dusk-lavender/20 disabled:opacity-50">Run now</button>
            <button type="button" disabled={pendingId === routine.id} onClick={() => callRoutine(routine.id, "toggle", !routine.enabled)} className="rounded-md border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs font-semibold text-stone-300 transition hover:bg-white/[0.07] disabled:opacity-50">{routine.enabled ? "Disable" : "Enable"}</button>
          </div>
        </div>
      ))}
    </div>
  );
}
function OfficeActionModal({ mode, project, office, onClose }: { mode: ModalMode; project: OfficeProject | null; office: OfficePayload | null; onClose: () => void }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, setIsPending] = useState(false);
  const defaultAgent = office?.agents[0];
  const defaultThread = office?.threads[0];

  if (mode === "project") return <OfficeCreateProjectModal onClose={onClose} />;
  if (!project || !office || !defaultAgent || !mode) return null;
  const activeProject = project;
  const activeOffice = office;
  const config = getModalConfig(mode);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    setIsPending(true);
    try {
      const response = await fetch(`/api/office/${activeProject.id}/${config.endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config.toPayload(formData))
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error ?? config.error);
      toast({ message: config.success, type: "success" });
      onClose();
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : config.error;
      toast({ message, type: "error" });
    } finally {
      setIsPending(false);
    }
  }

  return (
    <AppModal open onClose={onClose} labelledBy="office-action-title" contentClassName="max-w-xl">
      <form className="lofi-panel w-full max-w-xl rounded-lg p-5" onSubmit={handleSubmit}>
        <div className="mb-5 flex items-center justify-between gap-3">
          <div><p className="text-xs uppercase tracking-[0.25em] text-dusk-amber">Office</p><h2 id="office-action-title" className="mt-1 text-2xl font-semibold">{config.title}</h2></div>
          <button className="rounded-md p-2 text-stone-400 hover:bg-white/10 hover:text-stone-100" type="button" onClick={onClose}><X className="h-5 w-5" /></button>
        </div>
        <div className="space-y-3">
          <label className="grid gap-1 text-sm text-stone-300">Agent
            <select name="agentId" defaultValue={defaultAgent.id} className="h-11 rounded-lg border border-white/10 bg-[#111025] px-3 text-sm text-white outline-none">
              {activeOffice.agents.map((agent) => <option key={agent.id} value={agent.id}>{agent.name}</option>)}
            </select>
          </label>
          {config.renderFields(defaultThread?.id)}
        </div>
        <div className="mt-5 flex justify-end gap-2"><Button type="button" variant="ghost" onClick={onClose}>Cancel</Button><Button disabled={isPending}>{isPending ? "Saving..." : config.submit}</Button></div>
      </form>
    </AppModal>
  );
}

function getModalConfig(mode: Exclude<ModalMode, "project" | null>) {
  return {
    thread: {
      title: "New thread", submit: "Create thread", endpoint: "threads", success: "Thread created.", error: "Could not create thread.",
      renderFields: () => <Input name="title" placeholder="Thread title" required />,
      toPayload: (formData: FormData) => ({ agentId: formData.get("agentId"), title: formData.get("title") })
    },
    task: {
      title: "Create task", submit: "Create task", endpoint: "tasks", success: "Task created.", error: "Could not create task.",
      renderFields: (threadId?: string) => <><input type="hidden" name="threadId" value={threadId ?? ""} /><Input name="title" placeholder="Task title" required /><Textarea name="description" placeholder="Task description" required /></>,
      toPayload: (formData: FormData) => ({ agentId: formData.get("agentId"), threadId: formData.get("threadId") || undefined, title: formData.get("title"), description: formData.get("description"), status: "QUEUED" })
    },
    report: {
      title: "Create report", submit: "Create report", endpoint: "reports", success: "Report created.", error: "Could not create report.",
      renderFields: (threadId?: string) => <><input type="hidden" name="threadId" value={threadId ?? ""} /><Input name="title" placeholder="Report title" required /><Textarea name="summary" placeholder="Summary" required /><Textarea name="content" placeholder="Content" required /></>,
      toPayload: (formData: FormData) => ({ agentId: formData.get("agentId"), threadId: formData.get("threadId") || undefined, title: formData.get("title"), summary: formData.get("summary"), content: formData.get("content") })
    },
    routine: {
      title: "Create routine", submit: "Create routine", endpoint: "routines", success: "Routine created.", error: "Could not create routine.",
      renderFields: () => <><Input name="title" placeholder="AI Morning Brief" required /><Input name="timeOfDay" placeholder="08:00" /><Input name="scheduleLabel" placeholder="Daily" /><Textarea name="prompt" placeholder="What should this routine produce?" required /></>,
      toPayload: (formData: FormData) => ({ agentId: formData.get("agentId"), title: formData.get("title"), prompt: formData.get("prompt"), scheduleLabel: formData.get("scheduleLabel") || "Daily", timeOfDay: formData.get("timeOfDay") || undefined, enabled: true })
    },
    diary: {
      title: "Save diary entry", submit: "Save diary", endpoint: "knowledge", success: "Diary entry saved.", error: "Could not save diary entry.",
      renderFields: (threadId?: string) => <><input type="hidden" name="threadId" value={threadId ?? ""} /><Textarea name="content" placeholder="What did this agent learn today?" required /></>,
      toPayload: (formData: FormData) => ({ kind: "DIARY", agentId: formData.get("agentId"), threadId: formData.get("threadId") || undefined, content: formData.get("content") })
    },
    memory: {
      title: "Save memory", submit: "Save memory", endpoint: "knowledge", success: "Memory saved.", error: "Could not save memory.",
      renderFields: () => <><Input name="title" placeholder="Preference title" required /><Textarea name="content" placeholder="Durable memory content" required /></>,
      toPayload: (formData: FormData) => ({ kind: "MEMORY", agentId: formData.get("agentId"), title: formData.get("title"), content: formData.get("content") })
    },
    skill: {
      title: "Create skill", submit: "Create skill", endpoint: "knowledge", success: "Skill saved.", error: "Could not save skill.",
      renderFields: () => <><Input name="name" placeholder="Skill name" required /><Input name="trigger" placeholder="Trigger" required /><Input name="description" placeholder="Description" required /><Textarea name="content" placeholder="Markdown skill content" required /></>,
      toPayload: (formData: FormData) => ({ kind: "SKILL", agentId: formData.get("agentId"), name: formData.get("name"), trigger: formData.get("trigger"), description: formData.get("description"), content: formData.get("content") })
    }
  }[mode];
}

function OfficeCreateProjectModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsPending(true);
    const formData = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/projects", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: formData.get("name"), description: formData.get("description"), type: "WORK" }) });
      const data = (await response.json()) as { project?: { id: string }; error?: string };
      if (!response.ok || !data.project) throw new Error(data.error ?? "Could not create project.");
      toast({ message: "Office project created.", type: "success" });
      onClose();
      router.push(`/office?projectId=${data.project.id}`);
      router.refresh();
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : "Could not create project.";
      setError(message);
      toast({ message, type: "error" });
    } finally {
      setIsPending(false);
    }
  }
  return (
    <AppModal open onClose={onClose} labelledBy="create-office-project-title" contentClassName="max-w-lg">
      <form className="lofi-panel w-full max-w-lg rounded-lg p-5" onSubmit={handleSubmit}>
        <div className="mb-5 flex items-center justify-between gap-3">
          <div><p className="text-xs uppercase tracking-[0.25em] text-dusk-amber">Office</p><h2 id="create-office-project-title" className="mt-1 text-2xl font-semibold">New Project</h2></div>
          <button className="rounded-md p-2 text-stone-400 hover:bg-white/10 hover:text-stone-100" type="button" onClick={onClose}><X className="h-5 w-5" /></button>
        </div>
        <div className="space-y-3"><Input name="name" placeholder="Project name" required /><Textarea name="description" placeholder="Description" />{error ? <p className="text-sm text-red-300">{error}</p> : null}</div>
        <div className="mt-5 flex justify-end gap-2"><Button type="button" variant="ghost" onClick={onClose}>Cancel</Button><Button disabled={isPending}>{isPending ? "Creating..." : "Create Project"}</Button></div>
      </form>
    </AppModal>
  );
}

function Panel({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return <div className="rounded-lg border border-white/10 bg-[#090817]/86 p-4 shadow-[0_20px_70px_rgba(0,0,0,0.28)]"><div className="mb-3 flex items-center justify-between gap-3"><h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-200">{title}</h2>{action}</div>{children}</div>;
}

function MetricCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return <div className="rounded-lg border border-white/10 bg-white/[0.045] p-4"><div className="text-xs uppercase tracking-[0.24em] text-dusk-amber">{label}</div><div className="mt-2 text-3xl font-semibold text-white">{value}</div><div className="mt-1 text-sm text-stone-400">{detail}</div></div>;
}

function ActionButton({ icon: Icon, label, onClick }: { icon: LucideIcon; label: string; onClick: () => void }) {
  return <button type="button" onClick={onClick} className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-left text-sm text-stone-200 transition hover:border-dusk-lavender/35 hover:bg-white/[0.07]"><Icon className="h-4 w-4 text-dusk-amber" />{label}</button>;
}

function MiniItem({ title, detail }: { title: string; detail: string }) {
  return <div className="rounded-lg border border-white/10 bg-white/[0.035] p-3"><div className="line-clamp-1 text-sm font-semibold text-white">{title}</div><p className="mt-1 line-clamp-2 text-xs leading-5 text-stone-400">{detail}</p></div>;
}

function EmptyText({ text }: { text: string }) {
  return <div className="rounded-lg border border-dashed border-white/12 bg-white/[0.025] p-4 text-sm leading-6 text-stone-500">{text}</div>;
}

function DocBlock({ title, content }: { title: string; content: string }) {
  return <div className="min-h-52 rounded-lg border border-white/10 bg-black/20 p-3"><div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-dusk-amber">{title}</div><pre className="whitespace-pre-wrap text-xs leading-5 text-stone-300">{content}</pre></div>;
}

function OfficePreviewPanel() {
  return (
    <div className="relative mx-auto aspect-[16/10] w-full max-w-4xl overflow-hidden rounded-[28px] border border-white/10 bg-[#090817] shadow-[0_36px_110px_rgba(0,0,0,0.55)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(169,162,255,0.18),transparent_33%),linear-gradient(180deg,rgba(255,255,255,0.06),transparent_18%,rgba(0,0,0,0.18))]" />
      <div className="office-room-floor absolute left-1/2 top-[54%] h-[66%] w-[88%] -translate-x-1/2 rounded-[34px] border border-[#a9a2ff]/18 bg-[#11102a]" />
      <div className="absolute left-[11%] top-[8%] h-[33%] w-[78%] rounded-[24px] border border-white/10 bg-[#060612]/72 shadow-[inset_0_0_42px_rgba(169,162,255,0.12)]" />
      <div className="absolute left-[14%] top-[12%] text-[10px] uppercase tracking-[0.32em] text-[#e5bd72]">Office view layer</div>
      <div className="office-neon-line absolute left-[18%] top-[29%] h-px w-[64%]" />
      <div className="office-zone absolute left-[12%] top-[23%] z-10 w-[150px] rounded-[18px] border border-white/10 bg-[#0b0a1d]/88 p-3 shadow-[0_16px_42px_rgba(0,0,0,0.38)]"><div className="text-sm font-semibold text-white">Queued</div><p className="mt-2 text-[11px] leading-5 text-stone-400">Agent waiting</p></div>
      <div className="office-zone absolute left-[42%] top-[16%] z-10 w-[150px] rounded-[18px] border border-white/10 bg-[#0b0a1d]/88 p-3 shadow-[0_16px_42px_rgba(0,0,0,0.38)]"><div className="text-sm font-semibold text-white">Working</div><p className="mt-2 text-[11px] leading-5 text-stone-400">Tasks in motion</p></div>
      <div className="office-zone absolute left-[64%] top-[42%] z-10 w-[150px] rounded-[18px] border border-white/10 bg-[#0b0a1d]/88 p-3 shadow-[0_16px_42px_rgba(0,0,0,0.38)]"><div className="text-sm font-semibold text-white">Needs You</div><p className="mt-2 text-[11px] leading-5 text-stone-400">Review lane</p></div>
      <div className="office-agent absolute left-[47%] top-[42%] z-20 flex w-24 flex-col items-center gap-2">
        <div className="relative h-16 w-16"><div className="absolute inset-x-2 bottom-0 h-3 rounded-full bg-black/35 blur-sm" /><div className="absolute left-1/2 top-0 h-14 w-12 -translate-x-1/2 rounded-[18px] border-2 border-[#f5f0b8] bg-[#a9a2ff] shadow-[0_0_24px_rgba(169,162,255,0.32)]"><div className="absolute left-2 top-5 h-1.5 w-1.5 rounded-full bg-[#15132a]" /><div className="absolute right-2 top-5 h-1.5 w-1.5 rounded-full bg-[#15132a]" /><div className="absolute left-1/2 top-8 h-1 w-4 -translate-x-1/2 rounded-full bg-[#15132a]/70" /><div className="absolute -bottom-3 left-1/2 h-5 w-8 -translate-x-1/2 rounded-lg border border-[#f5f0b8]/60 bg-[#89c7d6]" /></div></div>
        <div className="rounded-full border border-white/10 bg-[#050511]/82 px-2.5 py-1 text-center text-[9px] uppercase tracking-widest text-stone-300">visual only</div>
      </div>
      <div className="absolute bottom-5 left-5 z-20 flex items-center gap-3 rounded-lg border border-white/10 bg-[#050511]/84 px-4 py-3"><MessageSquare className="h-5 w-5 text-[#e5bd72]" /><div><div className="text-sm font-semibold text-white">Chat first</div><div className="text-[11px] text-stone-500">Room follows real task state later.</div></div></div>
    </div>
  );
}