"use client";

import { FormEvent, useState } from "react";

import { FinanceStickerIcon, financeStickerIcons } from "@/components/finance/finance-sticker-icons";
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
    <Dialog open onOpenChange={(open) => {
      if (!open) onClose();
    }}>
      <DialogContent className="max-h-[92vh] max-w-lg overflow-y-auto">
      <form
        onSubmit={(event) => {
          void handleSubmit(event);
        }}
      >
        <DialogHeader className="mb-5">
            <p className="text-xs uppercase tracking-[0.25em] text-dusk-amber">Category</p>
            <DialogTitle>Add Category</DialogTitle>
            <DialogDescription>Group items like food, transport, salary, or AI tools.</DialogDescription>
        </DialogHeader>

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

        <DialogFooter className="mt-5">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button>Save category</Button>
        </DialogFooter>
      </form>
      </DialogContent>
    </Dialog>
  );
}
