"use client";

import { FormEvent, useState } from "react";

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
import { Label } from "@/components/ui/label";
import type { SerializedFinanceBudget } from "@/types/finance";

interface BudgetFormProps {
  ledgerId: string;
  currentBudget: SerializedFinanceBudget | null;
  onClose: () => void;
  onSubmit: (budget: SerializedFinanceBudget) => void;
  onError: (message: string | null) => void;
}

export function BudgetForm({ ledgerId, currentBudget, onClose, onSubmit, onError }: BudgetFormProps) {
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState(currentBudget ? String(currentBudget.amount) : "");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!amount || Number(amount) <= 0) return;

    setLoading(true);
    onError(null);

    try {
      const response = await fetch("/api/finance/budgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(amount),
          categoryId: null,
          ledgerId
        })
      });

      const data = (await response.json()) as { budget?: SerializedFinanceBudget; error?: string };

      if (!response.ok || !data.budget) {
        throw new Error(data.error || "Failed to save budget.");
      }

      onSubmit(data.budget);
      onClose();
    } catch (error) {
      onError(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!currentBudget) return;

    setLoading(true);
    onError(null);

    try {
      const response = await fetch(`/api/finance/budgets/${currentBudget.id}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error || "Failed to delete budget.");
      }

      onSubmit({
        id: "",
        amount: 0,
        categoryId: null,
        ledgerId: null,
        userId: "",
        createdAt: "",
        updatedAt: ""
      });
      onClose();
    } catch (error) {
      onError(error instanceof Error ? error.message : "Failed to delete budget.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open onOpenChange={(open) => {
      if (!open && !loading) onClose();
    }}>
      <DialogContent className="max-w-md">
        <form
          onSubmit={(event) => {
            void handleSubmit(event);
          }}
        >
          <DialogHeader className="mb-5">
            <p className="text-xs uppercase tracking-[0.25em] text-dusk-amber">Budget Setting</p>
            <DialogTitle>Set Monthly Budget</DialogTitle>
            <DialogDescription>Set a spending limit for this finance book.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <label className="grid gap-1.5">
              <Label className="text-xs text-stone-400">Budget amount (THB)</Label>
              <Input
                autoFocus
                disabled={loading}
                min="1"
                onChange={(event) => setAmount(event.target.value)}
                placeholder="Example: 10000"
                required
                step="any"
                type="number"
                value={amount}
              />
            </label>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {currentBudget ? (
              <Button
                className="text-red-300 hover:bg-red-500/10 hover:text-red-200"
                disabled={loading}
                onClick={() => {
                  void handleDelete();
                }}
                type="button"
                variant="ghost"
              >
                Remove budget
              </Button>
            ) : (
              <span />
            )}
            <DialogFooter>
              <Button disabled={loading} onClick={onClose} type="button" variant="ghost">
                Cancel
              </Button>
              <Button disabled={loading}>{loading ? "Saving..." : "Save Budget"}</Button>
            </DialogFooter>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
