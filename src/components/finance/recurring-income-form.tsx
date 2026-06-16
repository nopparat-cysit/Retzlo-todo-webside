"use client";

import { FormEvent, useMemo, useState } from "react";
import { Plus, X } from "lucide-react";

import { CategoryForm } from "@/components/finance/category-form";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
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
    const response = await fetch(
      recurringIncome ? `/api/finance/recurring-income/${recurringIncome.id}` : "/api/finance/recurring-income",
      {
        method: recurringIncome ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          amount: formData.get("amount"),
          incomeCycle: formData.get("incomeCycle"),
          nextIncomeDate: formData.get("nextIncomeDate"),
          categoryId: formData.get("categoryId") || null,
          accountId: formData.get("accountId") || null,
          isActive: recurringIncome?.isActive ?? true,
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
    <div className="fixed inset-0 z-[180] grid place-items-center bg-ink-950/80 px-4 backdrop-blur-sm">
      <form
        className="lofi-panel max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-lg p-5"
        onSubmit={(event) => {
          void handleSubmit(event);
        }}
      >
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-dusk-amber">Recurring Income</p>
            <h2 className="mt-1 text-2xl font-semibold">{isEditing ? "Edit Recurring Income" : "Add Recurring Income"}</h2>
            <p className="mt-1 text-sm text-stone-500">รายรับที่เข้าซ้ำ เช่น เงินเดือน ค่าจ้างรายเดือน หรือค่าเช่า</p>
          </div>
          <button className="rounded-md p-2 text-stone-400 hover:bg-white/10 hover:text-stone-100" type="button" onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </div>

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
            <span className="text-xs font-medium text-stone-400">ชื่อรายได้ประจำ</span>
            <Input defaultValue={recurringIncome?.name} name="name" placeholder="เช่น Salary, Freelance Retainer" required />
          </label>
          <label className="grid gap-1.5">
            <span className="text-xs font-medium text-stone-400">ยอดที่ได้รับต่อรอบ</span>
            <Input
              defaultValue={recurringIncome?.amount}
              min={0.01}
              name="amount"
              placeholder="เช่น 30000"
              required
              step="0.01"
              type="number"
              onChange={(event) => setAmount(event.target.value)}
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1.5">
              <span className="text-xs font-medium text-stone-400">รับซ้ำทุก</span>
              <select
                className="h-11 rounded-md border border-white/10 bg-ink-950/60 px-3 text-sm text-stone-100 outline-none focus:border-dusk-lavender/70"
                defaultValue={recurringIncome?.incomeCycle ?? "MONTHLY"}
                name="incomeCycle"
                onChange={(event) => setIncomeCycle(event.target.value as SerializedRecurringIncome["incomeCycle"])}
              >
                <option value="WEEKLY">ทุกสัปดาห์</option>
                <option value="MONTHLY">ทุกเดือน</option>
                <option value="YEARLY">ทุกปี</option>
                <option value="CUSTOM">กำหนดเอง</option>
              </select>
            </label>
            <label className="grid gap-1.5">
              <span className="text-xs font-medium text-stone-400">วันรับเงินครั้งถัดไป</span>
              <Input defaultValue={(recurringIncome?.nextIncomeDate ?? new Date().toISOString()).slice(0, 10)} name="nextIncomeDate" required type="date" />
            </label>
          </div>

          <div className="rounded-lg border border-emerald-300/20 bg-emerald-300/10 p-3 text-sm text-emerald-200">
            <p className="font-medium text-stone-100">ประมาณ {formatMoney(monthlyPreview)} / เดือน</p>
            <p className="mt-1 text-xs text-stone-500">วันรับเงินครั้งถัดไปคือวันที่รายได้นี้คาดว่าจะเข้าอีกครั้ง</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-2">
              <select className="h-11 rounded-md border border-white/10 bg-ink-950/60 px-3 text-sm text-stone-100 outline-none focus:border-dusk-lavender/70" defaultValue={recurringIncome?.category?.id ?? ""} name="categoryId">
                <option value="">No category</option>
                {availableCategories
                  .filter((category) => category.type === "INCOME")
                  .map((category) => (
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
            <select className="h-11 rounded-md border border-white/10 bg-ink-950/60 px-3 text-sm text-stone-100 outline-none focus:border-dusk-lavender/70" defaultValue={recurringIncome?.account?.id ?? ""} name="accountId">
              <option value="">No account</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </select>
          </div>

          <Textarea defaultValue={recurringIncome?.note ?? ""} name="note" placeholder="Note เช่น เงินเดือนเข้าบัญชีไหน หรือเงื่อนไขรายรับนี้" />
          {error ? <p className="text-sm text-red-300">{error}</p> : null}
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button>{isEditing ? "Save changes" : "Save recurring income"}</Button>
        </div>
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
    </div>
  );
}

function formatMoney(value: number) {
  return value.toLocaleString("en-US", {
    maximumFractionDigits: 2
  });
}
