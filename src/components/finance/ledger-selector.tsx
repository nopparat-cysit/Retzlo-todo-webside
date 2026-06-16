"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Book, Plus, X } from "lucide-react";
import type { SerializedFinanceLedger } from "@/types/finance";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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

  async function handleAddLedger(e: React.FormEvent) {
    e.preventDefault();
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
        throw new Error(data.error || "Failed to create ledger");
      }

      setNewLedgerName("");
      setShowAddModal(false);
      handleSwitch(data.ledger.id);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-1.5">
        <Book className="h-4 w-4 text-dusk-lavender" />
        <span className="text-xs uppercase tracking-wider text-stone-400">Active Book:</span>
        <select
          value={activeLedgerId || ""}
          onChange={(e) => handleSwitch(e.target.value)}
          className="bg-transparent text-sm font-semibold text-stone-100 outline-none cursor-pointer"
        >
          {ledgers.map((ledger) => (
            <option key={ledger.id} value={ledger.id} className="bg-ink-950 text-stone-100">
              {ledger.name}
            </option>
          ))}
        </select>
      </div>

      <button
        type="button"
        onClick={() => setShowAddModal(true)}
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.02] text-stone-400 hover:bg-white/10 hover:text-stone-100 transition-all"
        title="Create New Ledger Book"
      >
        <Plus className="h-4 w-4" />
      </button>

      {showAddModal && (
        <div className="fixed inset-0 z-[200] grid place-items-center bg-ink-950/80 px-4 backdrop-blur-sm">
          <form
            onSubmit={(e) => {
              void handleAddLedger(e);
            }}
            className="lofi-panel w-full max-w-md rounded-lg p-5"
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-dusk-amber">New Book</p>
                <h3 className="text-xl font-semibold text-stone-100">Create Ledger Book</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="rounded-md p-1.5 text-stone-400 hover:bg-white/10 hover:text-stone-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {error && (
              <p className="mb-3 rounded bg-red-500/10 border border-red-500/20 p-2.5 text-xs text-red-200">
                {error}
              </p>
            )}

            <div className="grid gap-3">
              <Input
                placeholder="เช่น เงินส่วนตัว, ทริปญี่ปุ่น, Freelance"
                value={newLedgerName}
                onChange={(e) => setNewLedgerName(e.target.value)}
                required
                disabled={loading}
                autoFocus
              />
              <div className="flex justify-end gap-2 mt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowAddModal(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Creating..." : "Create Book"}
                </Button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
