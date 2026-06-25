"use client";

import { useMemo, useState } from "react";
import { Edit3, Landmark, Plus, Trash2 } from "lucide-react";
import Image from "next/image";

import { AccountForm } from "@/components/finance/account-form";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { useToast } from "@/components/ui/toast";
import { FinanceEmptyState } from "./finance-empty-state";
import { FinanceCategoryIcon } from "@/lib/finance/category-icons";
import type { SerializedFinanceAccount } from "@/types/finance";

interface FinanceAccountsPageProps {
  initialAccounts: SerializedFinanceAccount[];
}

export function FinanceAccountsPage({ initialAccounts }: FinanceAccountsPageProps) {
  const [accounts, setAccounts] = useState(initialAccounts);
  const { toast } = useToast();
  const [editingAccount, setEditingAccount] = useState<SerializedFinanceAccount | null>(null);
  const [deletingAccountId, setDeletingAccountId] = useState<string | null>(null);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const totalBalance = useMemo(() => accounts.reduce((sum, account) => sum + (account.balance ?? 0), 0), [accounts]);

  function upsertAccount(account: SerializedFinanceAccount) {
    const exists = accounts.some((item) => item.id === account.id);
    setAccounts((current) => {
      return exists ? current.map((item) => (item.id === account.id ? account : item)) : [...current, account];
    });
    toast({
      message: exists ? `Account "${account.name}" updated.` : `Account "${account.name}" created.`,
      type: "success"
    });
    setEditingAccount(null);
    setShowCreate(false);
    setError(null);
  }

  async function deleteAccount(accountId: string) {
    const accountName = accounts.find((a) => a.id === accountId)?.name || "";
    setIsDeletingAccount(true);
    const response = await fetch(`/api/finance/accounts/${accountId}`, { method: "DELETE" });
    setIsDeletingAccount(false);

    if (!response.ok) {
      const data = (await response.json()) as { error?: string };
      setError(data.error ?? "Could not delete account.");
      toast({ message: data.error ?? "Could not delete account.", type: "error" });
      return;
    }

    setAccounts((current) => current.filter((account) => account.id !== accountId));
    toast({ message: `Account "${accountName}" deleted.`, type: "success" });
  }

  return (
    <div className="grid gap-4">
      <section className="lofi-panel rounded-2xl p-5">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div className="flex flex-1 items-start gap-4">
            <div className="flex-1">
              <p className="text-xs uppercase tracking-[0.32em] text-dusk-amber">Money Places</p>
              <h1 className="mt-2 text-3xl font-semibold text-stone-100">Accounts</h1>
              <p className="mt-2 text-sm text-stone-400">Manage cash, banks, wallets, and credit cards used in your ledger.</p>
            </div>
            <Image
              alt=""
              aria-hidden="true"
              className="pointer-events-none hidden h-16 w-16 shrink-0 object-contain drop-shadow-[0_10px_14px_rgba(8,8,23,0.5)] sm:block xl:h-20 xl:w-20 transition-transform duration-300 hover:scale-105 hover:rotate-3 cursor-default"
              height={96}
              src="/stickers/retro/retro-sticker-01-coin-reward.png"
              width={96}
            />
          </div>
          <div className="flex shrink-0 items-center">
            <Button type="button" onClick={() => setShowCreate(true)}>
              <Plus className="h-4 w-4" />
              Add Account
            </Button>
          </div>
        </div>
      </section>

      {error ? <p className="rounded-lg border border-red-300/20 bg-red-400/10 p-3 text-sm text-red-200">{error}</p> : null}

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <article className="lofi-panel rounded-lg p-4">
          <div className="flex items-center gap-2 text-dusk-amber">
            <Landmark className="h-4 w-4" />
            <p className="text-[10px] uppercase tracking-[0.22em]">Total balance</p>
          </div>
          <p className="mt-3 text-2xl font-semibold text-dusk-cyan">{formatMoney(totalBalance)}</p>
          <p className="mt-1 text-xs text-stone-500">{accounts.length} accounts</p>
        </article>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {accounts.length === 0 ? (
          <div className="md:col-span-2 xl:col-span-3">
            <FinanceEmptyState
              stickerSrc="/stickers/retro/retro-sticker-01-coin-reward.png"
              title="No accounts yet"
              description="Create cash wallets, bank accounts, or credit cards to start tracking where your money goes."
              actionLabel="Add Account"
              onAction={() => setShowCreate(true)}
            />
          </div>
        ) : null}
        {accounts.map((account) => (
          <article key={account.id} className="lofi-panel rounded-lg p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <FinanceCategoryIcon className="text-dusk-lavender" icon={account.type === "CREDIT" ? "credit-card" : account.type.toLowerCase()} label={account.name} />
                  <h2 className="truncate text-lg font-semibold text-stone-100">{account.name}</h2>
                </div>
                <p className="mt-1 text-xs text-stone-500">{account.type}</p>
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="ghost" onClick={() => setEditingAccount(account)}>
                  <Edit3 className="h-4 w-4" />
                </Button>
                <Button type="button" variant="ghost" onClick={() => setDeletingAccountId(account.id)}>
                  <Trash2 className="h-4 w-4 text-red-300" />
                </Button>
              </div>
            </div>
            <p className="mt-5 text-2xl font-semibold text-dusk-cyan">{formatMoney(account.balance ?? 0)}</p>
          </article>
        ))}
      </section>

      {showCreate || editingAccount ? (
        <AccountForm
          account={editingAccount}
          error={error}
          onClose={() => {
            setShowCreate(false);
            setEditingAccount(null);
          }}
          onError={setError}
          onSubmit={upsertAccount}
        />
      ) : null}

      <ConfirmModal
        open={Boolean(deletingAccountId)}
        title="Delete Account?"
        message="Are you sure you want to delete this account? Any transactions linked to this account will remain, but their account reference will be removed."
        variant="danger"
        confirmLabel="Delete Account"
        isLoading={isDeletingAccount}
        onConfirm={async () => {
          if (deletingAccountId) {
            await deleteAccount(deletingAccountId);
            setDeletingAccountId(null);
          }
        }}
        onClose={() => {
          if (!isDeletingAccount) setDeletingAccountId(null);
        }}
      />
    </div>
  );
}

function formatMoney(value: number) {
  return value.toLocaleString("en-US", {
    maximumFractionDigits: 2
  });
}
