"use client";

import { FormEvent, useState } from "react";
import { Plus, X } from "lucide-react";

import { CategoryForm } from "@/components/finance/category-form";
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
  transaction?: SerializedFinanceTransaction | null;
  activeLedgerId?: string | null;
  error: string | null;
  onClose: () => void;
  onCategoryCreated?: (category: SerializedFinanceCategory) => void;
  onError: (message: string | null) => void;
  onSubmit: (transaction: SerializedFinanceTransaction) => void;
}

export function TransactionForm({
  accounts,
  categories,
  defaultType,
  transaction,
  activeLedgerId,
  error,
  onClose,
  onCategoryCreated,
  onError,
  onSubmit
}: TransactionFormProps) {
  const [selectedType, setSelectedType] = useState<FinanceTransactionType>(transaction?.type ?? defaultType);
  const [availableCategories, setAvailableCategories] = useState(categories);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const isEditing = Boolean(transaction);
  const visibleCategories = availableCategories.filter((category) => category.type === selectedType);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const type = String(formData.get("type")) as FinanceTransactionType;
    const response = await fetch(
      transaction ? `/api/finance/transactions/${transaction.id}` : "/api/finance/transactions",
      {
        method: transaction ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          title: formData.get("title"),
          description: formData.get("description"),
          amount: formData.get("amount"),
          categoryId: formData.get("categoryId") || null,
          accountId: formData.get("accountId") || null,
          ledgerId: activeLedgerId || null,
          transactionDate: formData.get("transactionDate"),
          paymentMethod: formData.get("paymentMethod") || null,
          note: formData.get("note")
        })
      }
    );
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
            <h2 className="mt-1 text-2xl font-semibold">
              {isEditing ? "Edit" : "Add"} {selectedType === "INCOME" ? "Income" : "Expense"}
            </h2>
          </div>
          <button className="rounded-md p-2 text-stone-400 hover:bg-white/10 hover:text-stone-100" type="button" onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-4">
          <select
            className="h-11 rounded-md border border-white/10 bg-ink-950/60 px-3 text-sm text-stone-100 outline-none focus:border-dusk-lavender/70"
            defaultValue={transaction?.type ?? defaultType}
            name="type"
            onChange={(event) => setSelectedType(event.target.value as FinanceTransactionType)}
          >
            <option value="INCOME">Income</option>
            <option value="EXPENSE">Expense</option>
          </select>
          <Input defaultValue={transaction?.title} name="title" placeholder="Title" required />
          <Input defaultValue={transaction?.amount} min={0.01} name="amount" placeholder="Amount" required step="0.01" type="number" />
          <div className="grid gap-3 sm:grid-cols-2">
            <Input defaultValue={(transaction?.transactionDate ?? new Date().toISOString()).slice(0, 10)} name="transactionDate" required type="date" />
            <Input defaultValue={transaction?.paymentMethod ?? ""} name="paymentMethod" placeholder="Payment method" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-2">
              <select className="h-11 rounded-md border border-white/10 bg-ink-950/60 px-3 text-sm text-stone-100 outline-none focus:border-dusk-lavender/70" defaultValue={transaction?.category?.id ?? ""} name="categoryId">
                <option value="">No category</option>
                {visibleCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <button
                className="inline-flex items-center gap-1 text-xs font-medium text-dusk-lavender hover:text-stone-100"
                type="button"
                onClick={() => setShowCategoryForm(true)}
              >
                <Plus className="h-3.5 w-3.5" />
                Add category
              </button>
            </div>
            <select className="h-11 rounded-md border border-white/10 bg-ink-950/60 px-3 text-sm text-stone-100 outline-none focus:border-dusk-lavender/70" defaultValue={transaction?.account?.id ?? ""} name="accountId">
              <option value="">No account</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </select>
          </div>
          <Textarea defaultValue={transaction?.description ?? ""} name="description" placeholder="Description" />
          <Textarea defaultValue={transaction?.note ?? ""} name="note" placeholder="Note" />
          {error ? <p className="text-sm text-red-300">{error}</p> : null}
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button>{isEditing ? "Save changes" : "Save transaction"}</Button>
        </div>
      </form>

      {showCategoryForm ? (
        <CategoryForm
          defaultType={selectedType}
          onClose={() => setShowCategoryForm(false)}
          onError={onError}
          onSubmit={(category) => {
            setAvailableCategories((current) => [...current, category].sort((a, b) => a.name.localeCompare(b.name)));
            onCategoryCreated?.(category);
            setShowCategoryForm(false);
          }}
        />
      ) : null}
    </div>
  );
}
