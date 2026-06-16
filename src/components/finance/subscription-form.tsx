"use client";

import { FormEvent, useMemo, useState } from "react";
import { Plus, X } from "lucide-react";

import { CategoryForm } from "@/components/finance/category-form";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import type {
  SerializedFinanceAccount,
  SerializedFinanceCategory,
  SerializedFinanceSubscription
} from "@/types/finance";

const templates = ["AI Tool", "Internet", "Hosting", "Domain", "Software", "Streaming"];

interface SubscriptionFormProps {
  accounts: SerializedFinanceAccount[];
  categories: SerializedFinanceCategory[];
  error: string | null;
  subscription?: SerializedFinanceSubscription | null;
  activeLedgerId?: string | null;
  onClose: () => void;
  onCategoryCreated?: (category: SerializedFinanceCategory) => void;
  onError: (message: string | null) => void;
  onSubmit: (subscription: SerializedFinanceSubscription) => void;
}

export function SubscriptionForm({
  accounts,
  categories,
  error,
  subscription,
  activeLedgerId,
  onClose,
  onCategoryCreated,
  onError,
  onSubmit
}: SubscriptionFormProps) {
  const isEditing = Boolean(subscription);
  const [availableCategories, setAvailableCategories] = useState(categories);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [amount, setAmount] = useState(subscription?.amount ? String(subscription.amount) : "");
  const [billingCycle, setBillingCycle] = useState(subscription?.billingCycle ?? "MONTHLY");
  const monthlyPreview = useMemo(() => {
    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) return 0;
    if (billingCycle === "WEEKLY") return numericAmount * 4;
    if (billingCycle === "YEARLY") return numericAmount / 12;
    return numericAmount;
  }, [amount, billingCycle]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const response = await fetch(
      subscription ? `/api/finance/subscriptions/${subscription.id}` : "/api/finance/subscriptions",
      {
        method: subscription ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          amount: formData.get("amount"),
          billingCycle: formData.get("billingCycle"),
          nextBillingDate: formData.get("nextBillingDate"),
          categoryId: formData.get("categoryId") || null,
          accountId: formData.get("accountId") || null,
          ledgerId: activeLedgerId || null,
          isActive: subscription?.isActive ?? true,
          note: formData.get("note")
        })
      }
    );
    const data = (await response.json()) as { subscription?: SerializedFinanceSubscription; error?: string };

    if (!response.ok || !data.subscription) {
      onError(data.error ?? "Could not save subscription.");
      return;
    }

    onError(null);
    onSubmit(data.subscription);
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
            <p className="text-xs uppercase tracking-[0.25em] text-dusk-amber">Recurring Bills</p>
            <h2 className="mt-1 text-2xl font-semibold">{isEditing ? "Edit Recurring Bill" : "Add Recurring Bill"}</h2>
            <p className="mt-1 text-sm text-stone-500">รายจ่ายที่ตัดซ้ำ เช่น AI tools, ค่าเน็ต, hosting หรือ streaming</p>
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
            <span className="text-xs font-medium text-stone-400">ชื่อรายจ่ายประจำ</span>
            <Input defaultValue={subscription?.name} name="name" placeholder="เช่น ChatGPT, Internet, Hosting" required />
          </label>
          <label className="grid gap-1.5">
            <span className="text-xs font-medium text-stone-400">ยอดที่จ่ายต่อรอบ</span>
            <Input
              defaultValue={subscription?.amount}
              min={0.01}
              name="amount"
              placeholder="เช่น 690"
              required
              step="0.01"
              type="number"
              onChange={(event) => setAmount(event.target.value)}
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1.5">
              <span className="text-xs font-medium text-stone-400">จ่ายซ้ำทุก</span>
              <select
                className="h-11 rounded-md border border-white/10 bg-ink-950/60 px-3 text-sm text-stone-100 outline-none focus:border-dusk-lavender/70"
                defaultValue={subscription?.billingCycle ?? "MONTHLY"}
                name="billingCycle"
                onChange={(event) => setBillingCycle(event.target.value as SerializedFinanceSubscription["billingCycle"])}
              >
                <option value="WEEKLY">ทุกสัปดาห์</option>
                <option value="MONTHLY">ทุกเดือน</option>
                <option value="YEARLY">ทุกปี</option>
                <option value="CUSTOM">กำหนดเอง</option>
              </select>
            </label>
            <label className="grid gap-1.5">
              <span className="text-xs font-medium text-stone-400">วันตัดรอบครั้งถัดไป</span>
              <Input defaultValue={(subscription?.nextBillingDate ?? new Date().toISOString()).slice(0, 10)} name="nextBillingDate" required type="date" />
            </label>
          </div>
          <div className="rounded-lg border border-dusk-lavender/20 bg-dusk-lavender/10 p-3 text-sm text-stone-300">
            <p className="font-medium text-stone-100">ประมาณ {formatMoney(monthlyPreview)} / เดือน</p>
            <p className="mt-1 text-xs text-stone-500">
              วันตัดรอบครั้งถัดไปคือวันที่บิลนี้จะถึงรอบจ่ายอีกครั้ง ไม่ใช่วันที่สร้างรายการ
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-2">
              <select className="h-11 rounded-md border border-white/10 bg-ink-950/60 px-3 text-sm text-stone-100 outline-none focus:border-dusk-lavender/70" defaultValue={subscription?.category?.id ?? ""} name="categoryId">
                <option value="">No category</option>
                {availableCategories
                  .filter((category) => category.type === "EXPENSE")
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
            <select className="h-11 rounded-md border border-white/10 bg-ink-950/60 px-3 text-sm text-stone-100 outline-none focus:border-dusk-lavender/70" defaultValue={subscription?.account?.id ?? ""} name="accountId">
              <option value="">No account</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </select>
          </div>
          <Textarea defaultValue={subscription?.note ?? ""} name="note" placeholder="Note เช่น ใช้บัตรไหน จ่ายให้บริการอะไร" />
          {error ? <p className="text-sm text-red-300">{error}</p> : null}
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button>{isEditing ? "Save changes" : "Save subscription"}</Button>
        </div>
      </form>

      {showCategoryForm ? (
        <CategoryForm
          defaultType="EXPENSE"
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
