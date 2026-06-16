"use client";

import { FormEvent, useState } from "react";
import { X } from "lucide-react";

import { FinanceStickerIcon, financeStickerIcons } from "@/components/finance/finance-sticker-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StickerButton } from "@/components/ui/sticker-surface";
import type { FinanceTransactionType, SerializedFinanceCategory } from "@/types/finance";

const iconOptions = [
  { label: "Food", value: "utensils" },
  { label: "Transport", value: "car" },
  { label: "Salary", value: "briefcase" },
  { label: "Health", value: "health" },
  { label: "Home/Rent", value: "home" },
  { label: "AI/Software", value: "bot" },
  { label: "Subscription", value: "repeat" },
  { label: "Water/Int", value: "droplets" },
  { label: "Pet", value: "paw" },
  { label: "Entertain", value: "film" },
  { label: "Bank", value: "bank" },
  { label: "Cash", value: "cash" },
  { label: "Special", value: "sparkles" },
  { label: "Music", value: "music" },
  { label: "Other", value: "circle" }
];

interface CategoryFormProps {
  defaultType: FinanceTransactionType;
  onClose: () => void;
  onError: (message: string | null) => void;
  onSubmit: (category: SerializedFinanceCategory) => void;
}

export function CategoryForm({ defaultType, onClose, onError, onSubmit }: CategoryFormProps) {
  const [selectedIcon, setSelectedIcon] = useState("circle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/finance/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.get("name"),
        type: formData.get("type"),
        color: formData.get("color") || null,
        icon: selectedIcon
      })
    });
    const data = (await response.json()) as { category?: SerializedFinanceCategory; error?: string };

    if (!response.ok || !data.category) {
      onError(data.error ?? "Could not save category.");
      return;
    }

    onError(null);
    onSubmit(data.category);
  }

  return (
    <div className="fixed inset-0 z-[190] grid place-items-center bg-ink-950/80 px-4 backdrop-blur-sm">
      <form
        className="lofi-panel w-full max-w-lg rounded-lg p-5"
        onSubmit={(event) => {
          void handleSubmit(event);
        }}
      >
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-dusk-amber">Category</p>
            <h2 className="mt-1 text-2xl font-semibold">Add Category</h2>
            <p className="mt-1 text-sm text-stone-500">Use it to group items like food, transport, salary, or AI tools.</p>
          </div>
          <button className="rounded-md p-2 text-stone-400 hover:bg-white/10 hover:text-stone-100" type="button" onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-4">
          <Input name="name" placeholder="Food, Transport, Water, Salary" required />

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label className="text-xs uppercase tracking-[0.2em] text-stone-400">Category Type</Label>
              <Select defaultValue={defaultType} name="type">
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Choose type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INCOME">Income category</SelectItem>
                  <SelectItem value="EXPENSE">Expense category</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs uppercase tracking-[0.2em] text-stone-400">Color Tag</Label>
              <Input className="mt-1" name="color" placeholder="amber, cyan, rose" />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-xs uppercase tracking-[0.2em] text-stone-400">Select Icon</Label>
            <div className="grid max-h-56 grid-cols-5 gap-2 overflow-y-auto rounded-md border border-white/10 bg-ink-950/60 p-3">
              {iconOptions.map((option) => {
                const isSelected = selectedIcon === option.value;

                return (
                  <StickerButton
                    key={option.value}
                    className="h-auto min-h-[4.5rem] w-full gap-1 p-2 text-stone-300"
                    selected={isSelected}
                    title={option.label}
                    type="button"
                    onClick={() => setSelectedIcon(option.value)}
                  >
                    <FinanceStickerIcon
                      className="h-9 w-9"
                      iconKey={(option.value in financeStickerIcons ? option.value : "circle") as keyof typeof financeStickerIcons}
                    />
                    <span className="max-w-full truncate text-[10px]">{option.label}</span>
                  </StickerButton>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button>Save category</Button>
        </div>
      </form>
    </div>
  );
}
