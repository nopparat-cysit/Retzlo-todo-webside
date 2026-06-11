"use client";

import { FormEvent, useState } from "react";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import type {
  FinanceTransactionType,
  SerializedFinanceAccount,
  SerializedFinanceCategory,
  SerializedFinanceTransaction
} from "@/types/finance";

interface TransactionFormProps {
  accounts: SerializedFinanceAccount[];
  categories: SerializedFinanceCategory[];
  defaultType: FinanceTransactionType;
  error: string | null;
  onClose: () => void;
  onError: (message: string | null) => void;
  onSubmit: (transaction: SerializedFinanceTransaction) => void;
}

export function TransactionForm({
  accounts,
  categories,
  defaultType,
  error,
  onClose,
  onError,
  onSubmit
}: TransactionFormProps) {
  const [selectedType, setSelectedType] = useState<FinanceTransactionType>(defaultType);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const type = String(formData.get("type")) as FinanceTransactionType;
    const response = await fetch("/api/finance/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        title: formData.get("title"),
        description: formData.get("description"),
        amount: formData.get("amount"),
        categoryId: formData.get("categoryId") || null,
        accountId: formData.get("accountId") || null,
        transactionDate: formData.get("transactionDate"),
        paymentMethod: formData.get("paymentMethod") || null,
        note: formData.get("note")
      })
    });
    const data = (await response.json()) as { transaction?: SerializedFinanceTransaction; error?: string };

    if (!response.ok || !data.transaction) {
      onError(data.error ?? "Could not save transaction.");
      return;
    }

    onError(null);
    onSubmit(data.transaction);
  }

  return (
    <div className="fixed inset-0 z-[180] grid place-items-center bg-ink-950/80 px-4 backdrop-blur-sm">
      <form
        className="lofi-panel max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-lg p-5"
        onSubmit={(event) => {
          void handleSubmit(event);
        }}
      >
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-dusk-amber">Personal Finance</p>
            <h2 className="mt-1 text-2xl font-semibold">Add {defaultType === "INCOME" ? "Income" : "Expense"}</h2>
          </div>
          <button className="rounded-md p-2 text-stone-400 hover:bg-white/10 hover:text-stone-100" type="button" onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-4">
          <select
            className="h-11 rounded-md border border-white/10 bg-ink-950/60 px-3 text-sm text-stone-100 outline-none focus:border-dusk-lavender/70"
            defaultValue={defaultType}
            name="type"
            onChange={(event) => setSelectedType(event.target.value as FinanceTransactionType)}
          >
            <option value="INCOME">Income</option>
            <option value="EXPENSE">Expense</option>
          </select>
          <Input name="title" placeholder="Title" required />
          <Input min={0.01} name="amount" placeholder="Amount" required step="0.01" type="number" />
          <div className="grid gap-3 sm:grid-cols-2">
            <Input defaultValue={new Date().toISOString().slice(0, 10)} name="transactionDate" required type="date" />
            <Input name="paymentMethod" placeholder="Payment method" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <select className="h-11 rounded-md border border-white/10 bg-ink-950/60 px-3 text-sm text-stone-100 outline-none focus:border-dusk-lavender/70" name="categoryId">
              <option value="">No category</option>
              {categories
                .filter((category) => category.type === selectedType)
                .map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
            </select>
            <select className="h-11 rounded-md border border-white/10 bg-ink-950/60 px-3 text-sm text-stone-100 outline-none focus:border-dusk-lavender/70" name="accountId">
              <option value="">No account</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </select>
          </div>
          <Textarea name="description" placeholder="Description" />
          <Textarea name="note" placeholder="Note" />
          {error ? <p className="text-sm text-red-300">{error}</p> : null}
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button>Save transaction</Button>
        </div>
      </form>
    </div>
  );
}
