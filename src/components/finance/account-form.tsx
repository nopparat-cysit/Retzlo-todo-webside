"use client";

import { FormEvent } from "react";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    <div className="fixed inset-0 z-[180] grid place-items-center bg-ink-950/80 px-4 backdrop-blur-sm">
      <form
        className="lofi-panel w-full max-w-xl rounded-lg p-5"
        onSubmit={(event) => {
          void handleSubmit(event);
        }}
      >
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-dusk-amber">Finance Account</p>
            <h2 className="mt-1 text-2xl font-semibold">{isEditing ? "Edit Account" : "Add Account"}</h2>
          </div>
          <button className="rounded-md p-2 text-stone-400 hover:bg-white/10 hover:text-stone-100" type="button" onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-4">
          <Input defaultValue={account?.name} name="name" placeholder="Cash, Bank, Wallet..." required />
          <div className="grid gap-3 sm:grid-cols-2">
            <select
              className="h-11 rounded-md border border-white/10 bg-ink-950/60 px-3 text-sm text-stone-100 outline-none focus:border-dusk-lavender/70"
              defaultValue={account?.type ?? "BANK"}
              name="type"
            >
              <option value="CASH">Cash</option>
              <option value="BANK">Bank</option>
              <option value="WALLET">Wallet</option>
              <option value="CREDIT">Credit</option>
              <option value="OTHER">Other</option>
            </select>
            <Input defaultValue={account?.balance ?? 0} name="balance" placeholder="Balance" step="0.01" type="number" />
          </div>
          <Input defaultValue={account?.color ?? ""} name="color" placeholder="Color label, e.g. amber" />
          {error ? <p className="text-sm text-red-300">{error}</p> : null}
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button>{isEditing ? "Save changes" : "Save account"}</Button>
        </div>
      </form>
    </div>
  );
}
