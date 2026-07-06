"use client";

import { Activity, CalendarClock, CheckCircle2, CircleDot, Coins, FileText, FolderKanban, HeartPulse, Inbox, Sparkles, WalletCards } from "lucide-react";
import { useState } from "react";

import { AppModal, AppModalFooter } from "@/components/ui/app-modal";
import { Button } from "@/components/ui/button";
import { DateTimeField, type DateTimeFieldValue } from "@/components/ui/date-time-field";
import { EntityCard } from "@/components/ui/entity-card";
import { FilterSelect } from "@/components/ui/filter-select";
import { Input, Textarea } from "@/components/ui/input";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/state";
import { Toolbar } from "@/components/ui/toolbar";
import { useToast } from "@/components/ui/toast";

const filterOptions = [
  { value: "all", label: "All" },
  { value: "today", label: "Today" },
  { value: "starred", label: "Starred" }
] as const;

const viewOptions = [
  { value: "board", label: "Board" },
  { value: "calendar", label: "Calendar" },
  { value: "notes", label: "Notes" }
] as const;

function Badge({ children, tone = "lavender" }: { children: React.ReactNode; tone?: "lavender" | "amber" | "cyan" | "rose" }) {
  const tones = {
    lavender: "border-dusk-lavender/25 bg-dusk-lavender/10 text-dusk-lavender",
    amber: "border-dusk-amber/25 bg-dusk-amber/10 text-dusk-amber",
    cyan: "border-dusk-cyan/25 bg-dusk-cyan/10 text-dusk-cyan",
    rose: "border-dusk-rose/25 bg-dusk-rose/10 text-dusk-rose"
  };

  return <span className={`rounded-full border px-2 py-1 text-[11px] font-semibold ${tones[tone]}`}>{children}</span>;
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-[11px] text-stone-500">
        <span>Progress</span>
        <span>{value}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-gradient-to-r from-dusk-lavender via-dusk-cyan to-dusk-amber" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export function DesignSystemPreview() {
  const [filter, setFilter] = useState<(typeof filterOptions)[number]["value"]>("all");
  const [view, setView] = useState<(typeof viewOptions)[number]["value"]>("board");
  const [selectValue, setSelectValue] = useState("member");
  const [dateValue, setDateValue] = useState<DateTimeFieldValue>({ date: "", time: "" });
  const [modalOpen, setModalOpen] = useState(false);
  const { toast } = useToast();

  return (
    <div className="grid gap-6">
      <Toolbar
        title="Toolbar pattern"
        description="Use this density for module headers, filters, and compact actions."
        actions={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(true)}>Open modal</Button>
            <Button onClick={() => toast({ message: "Toast feedback is ready.", type: "success" })}>Toast feedback</Button>
          </>
        }
      >
        <FilterSelect value={filter} options={[...filterOptions]} onValueChange={setFilter} label="Filter" />
        <SegmentedControl aria-label="Preview view" value={view} items={[...viewOptions]} onValueChange={setView} />
      </Toolbar>

      <section className="grid gap-4 lg:grid-cols-[1fr_0.85fr]">
        <div className="grid gap-4 rounded-2xl border border-white/10 bg-white/[0.025] p-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Buttons</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button>Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="danger">Danger</Button>
              <Button variant="subtle">Subtle</Button>
              <Button size="icon" aria-label="Icon action"><Sparkles className="h-4 w-4" /></Button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Input placeholder="Project title" />
            <Select value={selectValue} onValueChange={setSelectValue}>
              <SelectTrigger>
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="owner">Owner</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="member">Member</SelectItem>
              </SelectContent>
            </Select>
            <Textarea className="sm:col-span-2" placeholder="Shared textarea style" />
          </div>

          <DateTimeField value={dateValue} onChange={setDateValue} />
        </div>

        <div className="grid gap-4">
          <EmptyState
            tone="empty"
            icon={<Inbox className="h-5 w-5" />}
            visual={<div className="mx-auto h-16 w-24 rounded-2xl border border-dusk-lavender/25 bg-gradient-to-br from-dusk-lavender/20 to-dusk-cyan/10 shadow-[0_18px_40px_rgba(169,162,255,0.16)]" />}
            title="No quiet work yet"
            message="Start with one focused card, note, or diary item."
            action={<Button size="sm">Create item</Button>}
          />
          <ErrorState title="Could not sync" message="Check the connection and try again." action={<Button variant="outline" size="sm">Retry</Button>} />
          <LoadingState title="Syncing workspace" message="Keeping cards and dates aligned." />
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-4">
        <EntityCard
          tone="LAVENDER"
          title="Board card"
          description="Status, due date, and checklist progress stay scannable."
          badges={<><Badge>Todo</Badge><Badge tone="amber">High</Badge></>}
          progress={<ProgressBar value={64} />}
          meta={<><span className="inline-flex items-center gap-1"><CalendarClock className="h-3.5 w-3.5" /> Tomorrow</span><span>4/7 checks</span></>}
        />
        <EntityCard
          tone="CYAN"
          title="Note card"
          description="Starred notes should feel like saved context, not loose text."
          badges={<Badge tone="cyan">Starred</Badge>}
          meta={<span className="inline-flex items-center gap-1"><FileText className="h-3.5 w-3.5" /> Project note</span>}
        />
        <EntityCard
          tone="ROSE"
          title="Diary card"
          description="Daily task rows and mood signals share the same card language."
          badges={<Badge tone="rose">Today</Badge>}
          progress={<ProgressBar value={40} />}
          meta={<span className="inline-flex items-center gap-1"><CircleDot className="h-3.5 w-3.5" /> 3 items</span>}
        />
        <EntityCard
          tone="AMBER"
          title="Reward card"
          description="Image, price, and approval state stay readable at a glance."
          media={<div className="grid h-20 place-items-center rounded-lg bg-gradient-to-br from-dusk-amber/25 via-dusk-rose/12 to-dusk-lavender/15"><Coins className="h-7 w-7 text-dusk-amber" /></div>}
          badges={<Badge tone="amber">120 coins</Badge>}
          footer={<span className="inline-flex items-center gap-1 text-xs text-emerald-300"><CheckCircle2 className="h-3.5 w-3.5" /> Approval ready</span>}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-4">
        <EntityCard
          tone="LAVENDER"
          title="Project card"
          description="Workspace cards keep members, notes, board state, and next action in one compact hierarchy."
          media={<div className="grid h-20 place-items-center rounded-lg border border-dusk-lavender/20 bg-gradient-to-br from-dusk-lavender/20 to-white/[0.03]"><FolderKanban className="h-7 w-7 text-dusk-lavender" /></div>}
          badges={<><Badge>Workspace</Badge><Badge tone="cyan">Board ready</Badge></>}
          meta={<><span>3 members</span><span>12 cards</span></>}
        />
        <EntityCard
          tone="CYAN"
          title="Calendar event"
          description="Due cards, notes, and diary tasks share the same date-card treatment."
          badges={<Badge tone="cyan">Today</Badge>}
          meta={<span className="inline-flex items-center gap-1"><CalendarClock className="h-3.5 w-3.5" /> All day</span>}
        />
        <EntityCard
          tone="AMBER"
          title="Finance panel"
          description="Money surfaces use the same empty, card, badge, and action rhythm as work modules."
          media={<div className="grid h-20 place-items-center rounded-lg bg-gradient-to-br from-dusk-amber/25 to-dusk-rose/10"><WalletCards className="h-7 w-7 text-dusk-amber" /></div>}
          badges={<Badge tone="amber">Ledger</Badge>}
          footer={<span className="inline-flex items-center gap-1 text-xs text-stone-400"><Activity className="h-3.5 w-3.5" /> Recent activity ready</span>}
        />
        <EntityCard
          tone="ROSE"
          title="Vital panel"
          description="Health and routine widgets stay calm, readable, and aligned with the dashboard shell."
          media={<div className="grid h-20 place-items-center rounded-lg bg-gradient-to-br from-dusk-rose/22 to-dusk-lavender/12"><HeartPulse className="h-7 w-7 text-dusk-rose" /></div>}
          badges={<Badge tone="rose">Vital</Badge>}
          progress={<ProgressBar value={72} />}
        />
      </section>

      <AppModal open={modalOpen} onClose={() => setModalOpen(false)} labelledBy="design-system-modal-title" contentClassName="max-w-lg rounded-2xl border border-white/10 bg-ink-900/96 text-stone-100 shadow-floating backdrop-blur-xl">
        <div className="p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-dusk-amber">Modal layer</p>
          <h2 id="design-system-modal-title" className="mt-2 text-xl font-semibold">Shared AppModal</h2>
          <p className="mt-2 text-sm leading-6 text-stone-400">Clicks inside this panel stay inside the modal; Escape and backdrop close follow the same rule across modules.</p>
        </div>
        <AppModalFooter>
          <Button variant="secondary" onClick={() => setModalOpen(false)}>Close</Button>
          <Button onClick={() => toast({ message: "Modal action confirmed.", type: "info" })}>Confirm</Button>
        </AppModalFooter>
      </AppModal>
    </div>
  );
}
