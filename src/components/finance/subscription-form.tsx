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
    const categoryId = formData.get("categoryId");
    const accountId = formData.get("accountId");

    const response = await fetch(
      subscription ? `/api/finance/subscriptions/${subscription.id}` : "/api/finance/subscriptions",
      {
        method: subscription ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountId: accountId && accountId !== "none" ? accountId : null,
          amount: formData.get("amount"),
          billingCycle: formData.get("billingCycle"),
          categoryId: categoryId && categoryId !== "none" ? categoryId : null,
          isActive: subscription?.isActive ?? true,
          ledgerId: activeLedgerId || null,
          name: formData.get("name"),
          nextBillingDate: formData.get("nextBillingDate"),
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
            <p className="text-xs uppercase tracking-[0.25em] text-dusk-amber">Recurring Bills</p>
            <DialogTitle>{isEditing ? "Edit Recurring Bill" : "Add Recurring Bill"}</DialogTitle>
            <DialogDescription>Track recurring expenses such as AI tools, internet, hosting, domains, and streaming.</DialogDescription>
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
              <Label className="text-xs text-stone-400">Bill name</Label>
              <Input defaultValue={subscription?.name} name="name" placeholder="Example: ChatGPT, Internet, Hosting" required />
            </label>

            <label className="grid gap-1.5">
              <Label className="text-xs text-stone-400">Amount per cycle</Label>
              <Input
                defaultValue={subscription?.amount}
                min={0.01}
                name="amount"
                onChange={(event) => setAmount(event.target.value)}
                placeholder="Example: 690"
                required
                step="0.01"
                type="number"
              />
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-1.5">
                <Label className="text-xs text-stone-400">Repeats every</Label>
                <Select
                  defaultValue={subscription?.billingCycle ?? "MONTHLY"}
                  name="billingCycle"
                  onValueChange={(value) => setBillingCycle(value as SerializedFinanceSubscription["billingCycle"])}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Billing cycle" />
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
                <Label className="text-xs text-stone-400">Next billing date</Label>
                <Input defaultValue={(subscription?.nextBillingDate ?? new Date().toISOString()).slice(0, 10)} name="nextBillingDate" required type="date" />
              </label>
            </div>

            <div className="rounded-lg border border-dusk-lavender/20 bg-dusk-lavender/10 p-3 text-sm text-stone-300">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium text-stone-100">Estimated monthly cost</span>
                <Badge variant="rose">{formatMoney(monthlyPreview)} THB</Badge>
              </div>
              <p className="mt-2 text-xs leading-5 text-stone-400">
                Next billing date means the next time this bill is expected to be paid, not the date you create this item.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-2">
                <Select defaultValue={subscription?.category?.id ?? "none"} name="categoryId">
                  <SelectTrigger>
                    <SelectValue placeholder="No category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No category</SelectItem>
                    {availableCategories
                      .filter((category) => category.type === "EXPENSE")
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
              <Select defaultValue={subscription?.account?.id ?? "none"} name="accountId">
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

            <Textarea defaultValue={subscription?.note ?? ""} name="note" placeholder="Note, card used, or service details" />
            {error ? <p className="text-sm text-red-300">{error}</p> : null}
          </div>

          <DialogFooter className="mt-5">
            <Button onClick={onClose} type="button" variant="ghost">
              Cancel
            </Button>
            <Button>{isEditing ? "Save changes" : "Save subscription"}</Button>
          </DialogFooter>
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
      </DialogContent>
    </Dialog>
  );
}

function formatMoney(value: number) {
  return value.toLocaleString("en-US", {
    maximumFractionDigits: 2
  });
}
