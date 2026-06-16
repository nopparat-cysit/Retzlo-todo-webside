"use client";

import { FormEvent, useMemo, useState } from "react";
import { Plus } from "lucide-react";

import { CategoryForm } from "@/components/finance/category-form";
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
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type {
  SerializedFinanceAccount,
  SerializedFinanceCategory,
  SerializedRecurringIncome
} from "@/types/finance";

const templates = ["Salary", "Freelance Retainer", "Rent Income", "Allowance", "Dividend", "Other Income"];

interface RecurringIncomeFormProps {
  accounts: SerializedFinanceAccount[];
  categories: SerializedFinanceCategory[];
  error: string | null;
  recurringIncome?: SerializedRecurringIncome | null;
  onCategoryCreated?: (category: SerializedFinanceCategory) => void;
  onClose: () => void;
  onError: (message: string | null) => void;
  onSubmit: (income: SerializedRecurringIncome) => void;
}

export function RecurringIncomeForm({
  accounts,
  categories,
  error,
  recurringIncome,
  onCategoryCreated,
  onClose,
  onError,
  onSubmit
}: RecurringIncomeFormProps) {
  const isEditing = Boolean(recurringIncome);
  const [availableCategories, setAvailableCategories] = useState(categories);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [amount, setAmount] = useState(recurringIncome?.amount ? String(recurringIncome.amount) : "");
  const [incomeCycle, setIncomeCycle] = useState(recurringIncome?.incomeCycle ?? "MONTHLY");

  const monthlyPreview = useMemo(() => {
    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) return 0;
    if (incomeCycle === "WEEKLY") return numericAmount * 4;
    if (incomeCycle === "YEARLY") return numericAmount / 12;
    return numericAmount;
  }, [amount, incomeCycle]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const categoryId = formData.get("categoryId");
    const accountId = formData.get("accountId");

    const response = await fetch(
      recurringIncome ? `/api/finance/recurring-income/${recurringIncome.id}` : "/api/finance/recurring-income",
      {
        method: recurringIncome ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountId: accountId && accountId !== "none" ? accountId : null,
          amount: formData.get("amount"),
          categoryId: categoryId && categoryId !== "none" ? categoryId : null,
          incomeCycle: formData.get("incomeCycle"),
          isActive: recurringIncome?.isActive ?? true,
          name: formData.get("name"),
          nextIncomeDate: formData.get("nextIncomeDate"),
          note: formData.get("note")
        })
      }
    );
    const data = (await response.json()) as { recurringIncome?: SerializedRecurringIncome; error?: string };

    if (!response.ok || !data.recurringIncome) {
      onError(data.error ?? "Could not save recurring income.");
      return;
    }

    onError(null);
    onSubmit(data.recurringIncome);
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
            <p className="text-xs uppercase tracking-[0.25em] text-dusk-amber">Recurring Income</p>
            <DialogTitle>{isEditing ? "Edit Recurring Income" : "Add Recurring Income"}</DialogTitle>
            <DialogDescription>Track recurring money coming in, such as salary, retainers, rent, or allowance.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            {!isEditing ? (
              <div className="flex flex-wrap gap-2">
                {templates.map((template) => (
                  <button
                    key={template}
                    className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-stone-300 transition hover:border-dusk-lavender/40 hover:text-stone-100"
                    type="button"
                    onClick={(event) => {
                      const form = event.currentTarget.closest("form");
                      const input = form?.elements.namedItem("name") as HTMLInputElement | null;
                      if (input) input.value = template;
                    }}
                  >
                    {template}
                  </button>
                ))}
              </div>
            ) : null}

            <label className="grid gap-1.5">
              <Label className="text-xs text-stone-400">Income name</Label>
              <Input defaultValue={recurringIncome?.name} name="name" placeholder="Example: Salary, Freelance Retainer" required />
            </label>

            <label className="grid gap-1.5">
              <Label className="text-xs text-stone-400">Amount per cycle</Label>
              <Input
                defaultValue={recurringIncome?.amount}
                min={0.01}
                name="amount"
                onChange={(event) => setAmount(event.target.value)}
                placeholder="Example: 30000"
                required
                step="0.01"
                type="number"
              />
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-1.5">
                <Label className="text-xs text-stone-400">Repeats every</Label>
                <Select
                  defaultValue={recurringIncome?.incomeCycle ?? "MONTHLY"}
                  name="incomeCycle"
                  onValueChange={(value) => setIncomeCycle(value as SerializedRecurringIncome["incomeCycle"])}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Income cycle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="WEEKLY">Weekly</SelectItem>
                    <SelectItem value="MONTHLY">Monthly</SelectItem>
                    <SelectItem value="YEARLY">Yearly</SelectItem>
                    <SelectItem value="CUSTOM">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </label>
              <label className="grid gap-1.5">
                <Label className="text-xs text-stone-400">Next income date</Label>
                <Input defaultValue={(recurringIncome?.nextIncomeDate ?? new Date().toISOString()).slice(0, 10)} name="nextIncomeDate" required type="date" />
              </label>
            </div>

            <div className="rounded-lg border border-emerald-300/20 bg-emerald-300/10 p-3 text-sm text-emerald-200">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium text-stone-100">Estimated monthly income</span>
                <Badge variant="cyan">{formatMoney(monthlyPreview)} THB</Badge>
              </div>
              <p className="mt-2 text-xs leading-5 text-stone-400">
                Next income date means the next time this income is expected to arrive.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-2">
                <Select defaultValue={recurringIncome?.category?.id ?? "none"} name="categoryId">
                  <SelectTrigger>
                    <SelectValue placeholder="No category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No category</SelectItem>
                    {availableCategories
                      .filter((category) => category.type === "INCOME")
                      .map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <button
                  className="inline-flex items-center gap-1 text-xs font-medium text-dusk-lavender hover:text-stone-100"
                  onClick={() => setShowCategoryForm(true)}
                  type="button"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add category
                </button>
              </div>
              <Select defaultValue={recurringIncome?.account?.id ?? "none"} name="accountId">
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

            <Textarea defaultValue={recurringIncome?.note ?? ""} name="note" placeholder="Note, account details, or income conditions" />
            {error ? <p className="text-sm text-red-300">{error}</p> : null}
          </div>

          <DialogFooter className="mt-5">
            <Button onClick={onClose} type="button" variant="ghost">
              Cancel
            </Button>
            <Button>{isEditing ? "Save changes" : "Save recurring income"}</Button>
          </DialogFooter>
        </form>

        {showCategoryForm ? (
          <CategoryForm
            defaultType="INCOME"
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

function formatMoney(value: number) {
  return value.toLocaleString("en-US", {
    maximumFractionDigits: 2
  });
}
