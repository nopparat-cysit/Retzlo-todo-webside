"use client";

import { FormEvent, useState } from "react";
import { Plus } from "lucide-react";

import { CategoryForm } from "@/components/finance/category-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
    const categoryId = formData.get("categoryId");
    const accountId = formData.get("accountId");
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
          categoryId: categoryId && categoryId !== "none" ? categoryId : null,
          accountId: accountId && accountId !== "none" ? accountId : null,
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
    <Dialog open onOpenChange={(open) => {
      if (!open) onClose();
    }}>
      <DialogContent className="max-h-[92vh] max-w-2xl overflow-y-auto">
      <form
        onSubmit={(event) => {
          void handleSubmit(event);
        }}
      >
        <DialogHeader className="mb-5">
            <p className="text-xs uppercase tracking-[0.25em] text-dusk-amber">Personal Finance</p>
            <DialogTitle>
              {isEditing ? "Edit" : "Add"} {selectedType === "INCOME" ? "Income" : "Expense"}
            </DialogTitle>
            <DialogDescription>Record one income or expense item in this finance book.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-1.5">
            <Label className="text-xs text-stone-400">Transaction type</Label>
            <Select
              defaultValue={transaction?.type ?? defaultType}
              name="type"
              onValueChange={(value) => setSelectedType(value as FinanceTransactionType)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Transaction type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INCOME">Income</SelectItem>
                <SelectItem value="EXPENSE">Expense</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Input defaultValue={transaction?.title} name="title" placeholder="Title" required />
          <Input defaultValue={transaction?.amount} min={0.01} name="amount" placeholder="Amount" required step="0.01" type="number" />
          <div className="grid gap-3 sm:grid-cols-2">
            <Input defaultValue={(transaction?.transactionDate ?? new Date().toISOString()).slice(0, 10)} name="transactionDate" required type="date" />
            <Input defaultValue={transaction?.paymentMethod ?? ""} name="paymentMethod" placeholder="Payment method" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-2">
              <Select defaultValue={transaction?.category?.id ?? "none"} name="categoryId">
                <SelectTrigger>
                  <SelectValue placeholder="No category" />
                </SelectTrigger>
                <SelectContent>
                <SelectItem value="none">No category</SelectItem>
                {visibleCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
                </SelectContent>
              </Select>
              <button
                className="inline-flex items-center gap-1 text-xs font-medium text-dusk-lavender hover:text-stone-100"
                type="button"
                onClick={() => setShowCategoryForm(true)}
              >
                <Plus className="h-3.5 w-3.5" />
                Add category
              </button>
            </div>
            <Select defaultValue={transaction?.account?.id ?? "none"} name="accountId">
              <SelectTrigger>
                <SelectValue placeholder="No account" />
              </SelectTrigger>
              <SelectContent>
              <SelectItem value="none">No account</SelectItem>
              {accounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.name}
                </SelectItem>
              ))}
              </SelectContent>
            </Select>
          </div>
          <Textarea defaultValue={transaction?.description ?? ""} name="description" placeholder="Description" />
          <Textarea defaultValue={transaction?.note ?? ""} name="note" placeholder="Note" />
          {error ? <p className="text-sm text-red-300">{error}</p> : null}
        </div>

        <DialogFooter className="mt-5">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button>{isEditing ? "Save changes" : "Save transaction"}</Button>
        </DialogFooter>
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
    </DialogContent>
    </Dialog>
  );
}
