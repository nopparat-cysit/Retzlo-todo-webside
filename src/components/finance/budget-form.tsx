"use client";

import { FormEvent, useState } from "react";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;

    setLoading(true);
    onError(null);

    try {
      const response = await fetch("/api/finance/budgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(amount),
          ledgerId,
          categoryId: null // Overall budget
        })
      });

      const data = (await response.json()) as { budget?: SerializedFinanceBudget; error?: string };

      if (!response.ok || !data.budget) {
        throw new Error(data.error || "Failed to save budget");
      }

      onSubmit(data.budget);
      onClose();
    } catch (err: any) {
      onError(err.message || "Something went wrong.");
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
        throw new Error(data.error || "Failed to delete budget");
      }

      // Propose delete output by passing null equivalent
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
    } catch (err: any) {
      onError(err.message || "Failed to delete budget.");
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[190] grid place-items-center bg-ink-950/80 px-4 backdrop-blur-sm">
      <form
        className="lofi-panel w-full max-w-md rounded-lg p-5"
        onSubmit={(e) => {
          void handleSubmit(e);
        }}
      >
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-dusk-amber">Budget Setting</p>
            <h2 className="mt-1 text-2xl font-semibold">ตั้งงบประมาณรายเดือน</h2>
            <p className="mt-1 text-sm text-stone-500">กำหนดเป้าหมายวงเงินควบคุมค่าใช้จ่ายในแต่ละเดือน</p>
          </div>
          <button
            className="rounded-md p-2 text-stone-400 hover:bg-white/10 hover:text-stone-100"
            type="button"
            onClick={onClose}
            disabled={loading}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-4">
          <label className="grid gap-1.5">
            <span className="text-xs font-medium text-stone-400">จำนวนเงินงบประมาณ (บาท)</span>
            <Input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="เช่น 10000"
              required
              type="number"
              min="1"
              step="any"
              disabled={loading}
              autoFocus
            />
          </label>
        </div>

        <div className="mt-6 flex justify-between gap-2">
          {currentBudget ? (
            <Button
              type="button"
              variant="ghost"
              className="text-red-400 hover:bg-red-500/10 hover:text-red-300"
              onClick={() => {
                void handleDelete();
              }}
              disabled={loading}
            >
              ยกเลิกงบประมาณ
            </Button>
          ) : (
            <div />
          )}
          <div className="flex gap-2">
            <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button disabled={loading}>
              {loading ? "Saving..." : "Save Budget"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
