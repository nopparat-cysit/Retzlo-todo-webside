"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Book, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { SerializedFinanceLedger } from "@/types/finance";

interface LedgerSelectorProps {
  ledgers: SerializedFinanceLedger[];
  activeLedgerId: string | null;
}

export function LedgerSelector({ ledgers, activeLedgerId }: LedgerSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newLedgerName, setNewLedgerName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function handleSwitch(ledgerId: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("ledgerId", ledgerId);
    router.push(`?${params.toString()}`);
  }

  async function handleAddLedger(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!newLedgerName.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/finance/ledgers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newLedgerName })
      });
      const data = (await response.json()) as { ledger?: SerializedFinanceLedger; error?: string };

      if (!response.ok || !data.ledger) {
        throw new Error(data.error || "Failed to create ledger.");
      }

      setNewLedgerName("");
      setShowAddModal(false);
      handleSwitch(data.ledger.id);
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-1.5">
        <Book className="h-4 w-4 text-dusk-lavender" />
        <span className="text-xs uppercase tracking-wider text-stone-400">Active Book</span>
        <Select value={activeLedgerId || ledgers[0]?.id} onValueChange={handleSwitch}>
          <SelectTrigger className="h-8 min-w-40 border-transparent bg-transparent px-1 font-semibold">
            <SelectValue placeholder="Choose book" />
          </SelectTrigger>
          <SelectContent align="start">
            {ledgers.map((ledger) => (
              <SelectItem key={ledger.id} value={ledger.id}>
                {ledger.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button type="button" variant="ghost" size="icon" onClick={() => setShowAddModal(true)} aria-label="Create ledger book">
        <Plus className="h-4 w-4" />
      </Button>

      <Dialog open={showAddModal} onOpenChange={(open) => {
        if (!open && !loading) setShowAddModal(false);
      }}>
        <DialogContent className="max-w-md">
          <form
            onSubmit={(event) => {
              void handleAddLedger(event);
            }}
          >
            <DialogHeader className="mb-4">
              <p className="text-xs uppercase tracking-wider text-dusk-amber">New Book</p>
              <DialogTitle>Create Ledger Book</DialogTitle>
              <DialogDescription>Create a separate finance book for personal money, trips, freelance work, or other contexts.</DialogDescription>
            </DialogHeader>

            {error ? (
              <p className="mb-3 rounded-lg border border-red-500/20 bg-red-500/10 p-2.5 text-xs text-red-200">
                {error}
              </p>
            ) : null}

            <div className="grid gap-3">
              <Input
                autoFocus
                disabled={loading}
                onChange={(event) => setNewLedgerName(event.target.value)}
                placeholder="Personal, Japan trip, Freelance"
                required
                value={newLedgerName}
              />
              <DialogFooter className="mt-2">
                <Button type="button" variant="ghost" onClick={() => setShowAddModal(false)} disabled={loading}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Creating..." : "Create Book"}
                </Button>
              </DialogFooter>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
