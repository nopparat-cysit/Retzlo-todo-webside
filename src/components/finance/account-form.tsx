"use client";

import { FormEvent } from "react";

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
import type { SerializedFinanceAccount } from "@/types/finance";

interface AccountFormProps {
  account?: SerializedFinanceAccount | null;
  error: string | null;
  onClose: () => void;
  onError: (message: string | null) => void;
  onSubmit: (account: SerializedFinanceAccount) => void;
}

export function AccountForm({ account, error, onClose, onError, onSubmit }: AccountFormProps) {
  const isEditing = Boolean(account);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const response = await fetch(account ? `/api/finance/accounts/${account.id}` : "/api/finance/accounts", {
      method: account ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.get("name"),
        type: formData.get("type"),
        balance: formData.get("balance") || 0,
        color: formData.get("color") || null
      })
    });
    const data = (await response.json()) as { account?: SerializedFinanceAccount; error?: string };

    if (!response.ok || !data.account) {
      onError(data.error ?? "Could not save account.");
      return;
    }

    onError(null);
    onSubmit(data.account);
  }

  return (
    <Dialog open onOpenChange={(open) => {
      if (!open) onClose();
    }}>
      <DialogContent className="max-w-xl">
      <form
        onSubmit={(event) => {
          void handleSubmit(event);
        }}
      >
        <DialogHeader className="mb-5">
            <p className="text-xs uppercase tracking-[0.25em] text-dusk-amber">Finance Account</p>
            <DialogTitle>{isEditing ? "Edit Account" : "Add Account"}</DialogTitle>
            <DialogDescription>Track where money is held or paid from.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <Input defaultValue={account?.name} name="name" placeholder="Cash, Bank, Wallet..." required />
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label className="text-xs text-stone-400">Account type</Label>
              <Select defaultValue={account?.type ?? "BANK"} name="type">
                <SelectTrigger>
                  <SelectValue placeholder="Account type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CASH">Cash</SelectItem>
                  <SelectItem value="BANK">Bank</SelectItem>
                  <SelectItem value="WALLET">Wallet</SelectItem>
                  <SelectItem value="CREDIT">Credit</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Input defaultValue={account?.balance ?? 0} name="balance" placeholder="Balance" step="0.01" type="number" />
          </div>
          <Input defaultValue={account?.color ?? ""} name="color" placeholder="Color label, e.g. amber" />
          {error ? <p className="text-sm text-red-300">{error}</p> : null}
        </div>

        <DialogFooter className="mt-5">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button>{isEditing ? "Save changes" : "Save account"}</Button>
        </DialogFooter>
      </form>
      </DialogContent>
    </Dialog>
  );
}
