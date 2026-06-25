"use client";

import { useMemo, useState } from "react";
import { ArrowDownRight, ArrowUpRight, Edit3, Search, Trash2 } from "lucide-react";
import Image from "next/image";

import { TransactionForm } from "@/components/finance/transaction-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { useToast } from "@/components/ui/toast";
import { FinanceEmptyState } from "./finance-empty-state";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FinanceCategoryIcon } from "@/lib/finance/category-icons";
import { cn } from "@/lib/utils";
import type {
  FinanceTransactionType,
  SerializedFinanceAccount,
  SerializedFinanceCategory,
  SerializedFinanceTransaction
} from "@/types/finance";

interface FinanceLedgerPageProps {
  accounts: SerializedFinanceAccount[];
  categories: SerializedFinanceCategory[];
  initialTransactions: SerializedFinanceTransaction[];
  type: FinanceTransactionType;
}

export function FinanceLedgerPage({ accounts, categories, initialTransactions, type }: FinanceLedgerPageProps) {
  const [transactions, setTransactions] = useState(initialTransactions);
  const { toast } = useToast();
  const [availableCategories, setAvailableCategories] = useState(categories);
  const [editingTransaction, setEditingTransaction] = useState<SerializedFinanceTransaction | null>(null);
  const [deletingTransactionId, setDeletingTransactionId] = useState<string | null>(null);
  const [isDeletingTransaction, setIsDeletingTransaction] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    accountId: "",
    categoryId: "",
    month: new Date().toISOString().slice(0, 7),
    query: ""
  });
  const isIncome = type === "INCOME";
  const visibleCategories = availableCategories.filter((category) => category.type === type);
  const filteredTransactions = useMemo(() => {
    const query = filters.query.trim().toLowerCase();

    return transactions.filter((transaction) => {
      const transactionMonth = transaction.transactionDate.slice(0, 7);
      const matchesMonth = filters.month ? transactionMonth === filters.month : true;
      const matchesCategory = filters.categoryId ? transaction.category?.id === filters.categoryId : true;
      const matchesAccount = filters.accountId ? transaction.account?.id === filters.accountId : true;
      const matchesQuery = query
        ? [transaction.title, transaction.description, transaction.note, transaction.paymentMethod]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
            .includes(query)
        : true;

      return matchesMonth && matchesCategory && matchesAccount && matchesQuery;
    });
  }, [filters, transactions]);
  const total = filteredTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);

  function updateFilter(key: keyof typeof filters, value: string) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  function upsertTransaction(transaction: SerializedFinanceTransaction) {
    const exists = transactions.some((item) => item.id === transaction.id);
    setTransactions((current) => {
      return exists ? current.map((item) => (item.id === transaction.id ? transaction : item)) : [transaction, ...current];
    });
    toast({
      message: exists ? `Transaction "${transaction.title}" updated.` : `Transaction "${transaction.title}" recorded.`,
      type: "success"
    });
    setEditingTransaction(null);
    setShowCreate(false);
    setError(null);
  }

  async function deleteTransaction(transactionId: string) {
    const txTitle = transactions.find((t) => t.id === transactionId)?.title || "";
    setIsDeletingTransaction(true);
    const response = await fetch(`/api/finance/transactions/${transactionId}`, { method: "DELETE" });
    setIsDeletingTransaction(false);

    if (!response.ok) {
      const data = (await response.json()) as { error?: string };
      setError(data.error ?? "Could not delete transaction.");
      toast({ message: data.error ?? "Could not delete transaction.", type: "error" });
      return;
    }

    setTransactions((current) => current.filter((transaction) => transaction.id !== transactionId));
    toast({ message: `Transaction "${txTitle}" deleted.`, type: "success" });
  }

  function handleExportCSV() {
    if (filteredTransactions.length === 0) return;

    const headers = ["Date", "Title", "Category", "Account", "Payment Method", "Amount", "Note", "Description"];
    const rows = filteredTransactions.map((t) => [
      new Date(t.transactionDate).toLocaleDateString("en-US"),
      `"${t.title.replace(/"/g, '""')}"`,
      `"${(t.category?.name || "Uncategorized").replace(/"/g, '""')}"`,
      `"${(t.account?.name || "No Account").replace(/"/g, '""')}"`,
      `"${(t.paymentMethod || "").replace(/"/g, '""')}"`,
      t.amount,
      `"${(t.note || "").replace(/"/g, '""')}"`,
      `"${(t.description || "").replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    const blob = new Blob([`\ufeff${csvContent}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `finance_${type.toLowerCase()}_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="grid gap-4">
      <section className="lofi-panel rounded-2xl p-5">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div className="flex flex-1 items-start gap-4">
            <div className="flex-1">
              <p className="text-xs uppercase tracking-[0.32em] text-dusk-amber">{isIncome ? "Income" : "Expense"} History</p>
              <h1 className="mt-2 text-3xl font-semibold text-stone-100">{isIncome ? "Income" : "Expenses"}</h1>
              <p className="mt-2 text-sm text-stone-400">
                View, filter, edit, and clean up your {isIncome ? "income" : "expense"} records.
              </p>
            </div>
            <Image
              alt=""
              aria-hidden="true"
              className="pointer-events-none hidden h-16 w-16 shrink-0 object-contain drop-shadow-[0_10px_14px_rgba(8,8,23,0.5)] sm:block xl:h-20 xl:w-20 transition-transform duration-300 hover:scale-105 hover:rotate-3 cursor-default"
              height={96}
              src={isIncome ? "/stickers/retro/retro-sticker-01-coin-reward.png" : "/stickers/retro/retro-sticker-16-tape.png"}
              width={96}
            />
          </div>
          <div className="flex shrink-0 gap-4 items-center">
            <div className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3">
              <p className="text-[10px] uppercase tracking-[0.2em] text-stone-500">Filtered total</p>
              <p className={cn("mt-1 text-2xl font-semibold", isIncome ? "text-emerald-300" : "text-dusk-rose")}>
                {formatMoney(total)}
              </p>
            </div>
            <Button type="button" onClick={() => setShowCreate(true)}>
              {isIncome ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
              Add {isIncome ? "Income" : "Expense"}
            </Button>
          </div>
        </div>
      </section>

      {error ? <p className="rounded-lg border border-red-300/20 bg-red-400/10 p-3 text-sm text-red-200">{error}</p> : null}

      <section className="lofi-panel rounded-lg p-4">
        <div className="grid gap-3 lg:grid-cols-[minmax(180px,1fr)_150px_180px_180px_auto]">
          <label className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
            <Input
              className="pl-9"
              placeholder="Search title, note, method..."
              value={filters.query}
              onChange={(event) => updateFilter("query", event.target.value)}
            />
          </label>
          <Input value={filters.month} type="month" onChange={(event) => updateFilter("month", event.target.value)} />
          <Select value={filters.categoryId || "all"} onValueChange={(value) => updateFilter("categoryId", value === "all" ? "" : value)}>
            <SelectTrigger>
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {visibleCategories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
            </SelectContent>
          </Select>
          <Select value={filters.accountId || "all"} onValueChange={(value) => updateFilter("accountId", value === "all" ? "" : value)}>
            <SelectTrigger>
              <SelectValue placeholder="All accounts" />
            </SelectTrigger>
            <SelectContent>
            <SelectItem value="all">All accounts</SelectItem>
            {accounts.map((account) => (
              <SelectItem key={account.id} value={account.id}>
                {account.name}
              </SelectItem>
            ))}
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={handleExportCSV}
              className="h-11 flex-1 border border-white/10 text-stone-300 hover:text-stone-100"
              disabled={filteredTransactions.length === 0}
            >
              Export CSV
            </Button>
            {(filters.query || filters.categoryId || filters.accountId || filters.month !== new Date().toISOString().slice(0, 7)) && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => setFilters({ accountId: "", categoryId: "", month: new Date().toISOString().slice(0, 7), query: "" })}
                className="h-11 border border-white/10 text-stone-400 hover:border-dusk-rose/30 hover:text-dusk-rose"
                title="Clear all filters"
              >
                Clear
              </Button>
            )}
          </div>
        </div>
      </section>

      <section className="lofi-panel rounded-lg p-5">
        {filteredTransactions.length === 0 ? (
          <FinanceEmptyState
            stickerSrc="/stickers/retro/retro-sticker-12-paper-note.png"
            title={isIncome ? "No income records" : "No expense records"}
            description={isIncome ? "You haven't recorded any income matching these filters yet." : "You haven't recorded any expenses matching these filters yet."}
            actionLabel={isIncome ? "Add Income" : "Add Expense"}
            onAction={() => setShowCreate(true)}
          />
        ) : (
          <div className="space-y-2">
            {filteredTransactions.map((transaction) => {
              const Icon = isIncome ? ArrowUpRight : ArrowDownRight;

              return (
                <article key={transaction.id} className="rounded-lg border border-white/10 bg-white/[0.035] p-3">
                  <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Icon className={cn("h-4 w-4", isIncome ? "text-dusk-cyan" : "text-dusk-rose")} />
                        <FinanceCategoryIcon className="text-dusk-lavender" icon={transaction.category?.icon} label={transaction.category?.name} />
                        <h3 className="truncate text-sm font-semibold text-stone-100">{transaction.title}</h3>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        <Badge variant="muted">{transaction.category?.name ?? "Uncategorized"}</Badge>
                        <Badge variant="muted">{transaction.account?.name ?? "No account"}</Badge>
                        <Badge variant={isIncome ? "cyan" : "rose"}>{new Date(transaction.transactionDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-3 md:justify-end">
                      <p className={cn("text-sm font-semibold", isIncome ? "text-dusk-cyan" : "text-dusk-rose")}>
                        {isIncome ? "+" : "-"}
                        {formatMoney(transaction.amount)}
                      </p>
                      <div className="flex gap-2">
                        <Button type="button" variant="ghost" size="icon" onClick={() => setEditingTransaction(transaction)} aria-label="Edit transaction">
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button type="button" variant="ghost" size="icon" onClick={() => setDeletingTransactionId(transaction.id)} aria-label="Delete transaction">
                          <Trash2 className="h-4 w-4 text-red-300" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {showCreate || editingTransaction ? (
        <TransactionForm
          accounts={accounts}
          categories={availableCategories}
          defaultType={type}
          error={error}
          transaction={editingTransaction}
          onClose={() => {
            setEditingTransaction(null);
            setShowCreate(false);
          }}
          onCategoryCreated={(category) => setAvailableCategories((current) => [...current, category])}
          onError={setError}
          onSubmit={upsertTransaction}
        />
      ) : null}

      <ConfirmModal
        open={Boolean(deletingTransactionId)}
        title="Delete Transaction?"
        message="Are you sure you want to delete this transaction record? This cannot be undone."
        variant="danger"
        confirmLabel="Delete Transaction"
        isLoading={isDeletingTransaction}
        onConfirm={async () => {
          if (deletingTransactionId) {
            await deleteTransaction(deletingTransactionId);
            setDeletingTransactionId(null);
          }
        }}
        onClose={() => {
          if (!isDeletingTransaction) setDeletingTransactionId(null);
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
