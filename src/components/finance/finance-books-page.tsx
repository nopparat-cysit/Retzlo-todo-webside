"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Edit, Plus, Search, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import Image from "next/image";
import { FinanceEmptyState } from "./finance-empty-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { useToast } from "@/components/ui/toast";
import type { SerializedFinanceLedger, SerializedFinanceTransaction } from "@/types/finance";

interface FinanceBooksPageProps {
  initialLedgers: SerializedFinanceLedger[];
  transactions: SerializedFinanceTransaction[];
}

export function FinanceBooksPage({ initialLedgers, transactions }: FinanceBooksPageProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [ledgers, setLedgers] = useState(initialLedgers);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingLedger, setEditingLedger] = useState<SerializedFinanceLedger | null>(null);
  const [deletingLedger, setDeletingLedger] = useState<SerializedFinanceLedger | null>(null);
  const [ledgerName, setLedgerName] = useState("");
  const [ledgerColor, setLedgerColor] = useState("indigo");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const filteredLedgers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return ledgers.filter((ledger) => ledger.name.toLowerCase().includes(query));
  }, [searchQuery, ledgers]);

  const ledgerStats = useMemo(() => {
    const stats: Record<string, { count: number; balance: number }> = {};
    ledgers.forEach((ledger) => {
      stats[ledger.id] = { balance: 0, count: 0 };
    });

    transactions.forEach((transaction) => {
      const ledgerId = transaction.ledgerId || (ledgers[0]?.id ?? "");
      if (!stats[ledgerId]) return;
      stats[ledgerId].count += 1;
      stats[ledgerId].balance += transaction.type === "INCOME" ? transaction.amount : -transaction.amount;
    });

    return stats;
  }, [transactions, ledgers]);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!ledgerName.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/finance/ledgers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ color: ledgerColor, name: ledgerName })
      });
      const data = (await response.json()) as { ledger?: SerializedFinanceLedger; error?: string };

      if (!response.ok || !data.ledger) {
        throw new Error(data.error || "Could not create book.");
      }

      setLedgers((current) => [...current, data.ledger!].sort((a, b) => a.name.localeCompare(b.name)));
      toast({ message: `Finance book "${data.ledger.name}" created.`, type: "success" });
      closeEditor();
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Something went wrong.";
      setError(msg);
      toast({ message: msg, type: "error" });
    } finally {
      setLoading(false);
    }
  }

  async function handleEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingLedger || !ledgerName.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/finance/ledgers/${editingLedger.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ color: ledgerColor, name: ledgerName })
      });
      const data = (await response.json()) as { ledger?: SerializedFinanceLedger; error?: string };

      if (!response.ok || !data.ledger) {
        throw new Error(data.error || "Could not update book.");
      }

      setLedgers((current) =>
        current.map((ledger) => (ledger.id === editingLedger.id ? data.ledger! : ledger)).sort((a, b) => a.name.localeCompare(b.name))
      );
      toast({ message: `Finance book "${data.ledger.name}" updated.`, type: "success" });
      closeEditor();
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Something went wrong.";
      setError(msg);
      toast({ message: msg, type: "error" });
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!deletingLedger) return;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/finance/ledgers/${deletingLedger.id}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error || "Could not delete book.");
      }

      const deletedName = deletingLedger.name;
      setLedgers((current) => current.filter((ledger) => ledger.id !== deletingLedger.id));
      toast({ message: `Finance book "${deletedName}" deleted.`, type: "success" });
      setDeletingLedger(null);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Something went wrong.";
      setError(msg);
      toast({ message: msg, type: "error" });
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setLedgerName("");
    setLedgerColor("indigo");
    setError(null);
    setShowCreateModal(true);
  }

  function openEdit(ledger: SerializedFinanceLedger) {
    setEditingLedger(ledger);
    setLedgerName(ledger.name);
    setLedgerColor(ledger.color || "indigo");
    setError(null);
  }

  function closeEditor() {
    setShowCreateModal(false);
    setEditingLedger(null);
    setLedgerName("");
    setLedgerColor("indigo");
  }

  const editorOpen = showCreateModal || Boolean(editingLedger);

  return (
    <div className="flex flex-col gap-5 py-4">
      <section className="lofi-panel rounded-2xl p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex flex-1 items-start gap-4">
            <div className="flex-1">
              <p className="text-xs uppercase tracking-[0.32em] text-dusk-amber">Accounting Finance</p>
              <h1 className="mt-2 text-3xl font-semibold text-stone-100 sm:text-4xl">Finance Books</h1>
              <p className="mt-2 text-sm leading-6 text-stone-400">
                Choose a finance book to separate personal money, trips, freelance work, or project budgets.
              </p>
            </div>
            <Image
              alt=""
              aria-hidden="true"
              className="pointer-events-none hidden h-16 w-16 shrink-0 object-contain drop-shadow-[0_10px_14px_rgba(8,8,23,0.5)] sm:block xl:h-20 xl:w-20 transition-transform duration-300 hover:scale-105 hover:rotate-3 cursor-default"
              height={96}
              src="/stickers/retro/retro-sticker-13-project-folder.png"
              width={96}
            />
          </div>
          <div className="flex shrink-0 items-center">
            <Button type="button" onClick={openCreate}>
              <Plus className="h-5 w-5" />
              Create Book
            </Button>
          </div>
        </div>
      </section>

      <section className="lofi-panel flex items-center gap-3 rounded-lg p-4">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
          <Input
            className="pl-9"
            placeholder="Search finance books..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </div>
      </section>

      {filteredLedgers.length === 0 ? (
        <FinanceEmptyState
          stickerSrc="/stickers/retro/retro-sticker-13-project-folder.png"
          title="No finance books found"
          description="Create a finance book for personal money, work budgets, travel, or any separate money context."
          actionLabel="Create First Book"
          onAction={openCreate}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredLedgers.map((ledger) => {
            const stats = ledgerStats[ledger.id] || { balance: 0, count: 0 };
            const color = getBookColor(ledger.color);

            return (
              <article
                key={ledger.id}
                className={`lofi-panel flex cursor-pointer flex-col justify-between gap-4 rounded-xl border p-5 transition active:scale-[0.99] ${color.card}`}
                onClick={() => router.push(`/finance?ledgerId=${ledger.id}`)}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <Badge variant={color.badge}>Book</Badge>
                    <div className="flex items-center gap-1.5" onClick={(event) => event.stopPropagation()}>
                      <Button type="button" variant="subtle" size="icon" onClick={() => openEdit(ledger)} aria-label="Edit finance book">
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button type="button" variant="subtle" size="icon" onClick={() => setDeletingLedger(ledger)} aria-label="Delete finance book">
                        <Trash2 className="h-3.5 w-3.5 text-red-300" />
                      </Button>
                    </div>
                  </div>

                  <h3 className="mt-3 truncate text-lg font-semibold text-stone-100">{ledger.name}</h3>
                  <p className="mt-1 text-xs text-stone-500">{stats.count} transaction records</p>
                </div>

                <div className="flex items-end justify-between border-t border-white/5 pt-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-stone-500">Net balance</p>
                    <p className={`mt-1 font-bold ${stats.balance >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                      {formatMoney(stats.balance)} THB
                    </p>
                  </div>
                  <span className="flex items-center gap-1 text-xs font-medium text-dusk-lavender">
                    Open <BookOpen className="h-3.5 w-3.5" />
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <Dialog open={editorOpen} onOpenChange={(open) => {
        if (!open && !loading) closeEditor();
      }}>
        <DialogContent className="max-w-md">
          <form
            onSubmit={(event) => {
              void (editingLedger ? handleEdit(event) : handleCreate(event));
            }}
          >
            <DialogHeader className="mb-4">
              <p className="text-xs uppercase tracking-wider text-dusk-amber">{editingLedger ? "Edit Book" : "New Book"}</p>
              <DialogTitle>{editingLedger ? "Edit Finance Book" : "Create Finance Book"}</DialogTitle>
              <DialogDescription>Name and color-code this money context.</DialogDescription>
            </DialogHeader>

            {error ? (
              <p className="mb-3 rounded-lg border border-red-500/20 bg-red-500/10 p-2.5 text-xs text-red-200">
                {error}
              </p>
            ) : null}

            <div className="grid gap-4">
              <label className="grid gap-1.5">
                <Label className="text-xs text-stone-400">Book name</Label>
                <Input
                  autoFocus
                  disabled={loading}
                  onChange={(event) => setLedgerName(event.target.value)}
                  placeholder="Personal, Office budget, Japan trip"
                  required
                  value={ledgerName}
                />
              </label>

              <label className="grid gap-1.5">
                <Label className="text-xs text-stone-400">Color theme</Label>
                <Select value={ledgerColor} onValueChange={setLedgerColor} disabled={loading}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose color" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="indigo">Indigo</SelectItem>
                    <SelectItem value="emerald">Emerald</SelectItem>
                    <SelectItem value="rose">Rose</SelectItem>
                    <SelectItem value="amber">Amber</SelectItem>
                  </SelectContent>
                </Select>
              </label>

              <DialogFooter className="mt-2">
                <Button type="button" variant="ghost" onClick={closeEditor} disabled={loading}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Saving..." : editingLedger ? "Save Changes" : "Create Book"}
                </Button>
              </DialogFooter>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmModal
        open={Boolean(deletingLedger)}
        title="Delete Finance Book?"
        message={`This will permanently delete "${deletingLedger?.name}" and all finance data connected to it.`}
        variant="danger"
        confirmLabel={loading ? "Deleting..." : "Delete Book"}
        isLoading={loading}
        onConfirm={handleDelete}
        onClose={() => {
          if (!loading) setDeletingLedger(null);
        }}
      />
    </div>
  );
}

function formatMoney(value: number) {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function getBookColor(color?: string | null): { card: string; badge: "default" | "amber" | "rose" | "cyan" } {
  if (color === "emerald") {
    return { badge: "cyan", card: "border-emerald-500/20 bg-emerald-500/5 hover:border-emerald-500/40" };
  }
  if (color === "rose") {
    return { badge: "rose", card: "border-rose-500/20 bg-rose-500/5 hover:border-rose-500/40" };
  }
  if (color === "amber") {
    return { badge: "amber", card: "border-amber-500/20 bg-amber-500/5 hover:border-amber-500/40" };
  }
  return { badge: "default", card: "border-dusk-lavender/20 bg-dusk-lavender/5 hover:border-dusk-lavender/40" };
}
