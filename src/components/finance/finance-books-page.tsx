"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Edit, Plus, Search, Trash2, X } from "lucide-react";
import type { SerializedFinanceLedger, SerializedFinanceTransaction } from "@/types/finance";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FinanceEmptyState } from "./finance-empty-state";

interface FinanceBooksPageProps {
  initialLedgers: SerializedFinanceLedger[];
  transactions: SerializedFinanceTransaction[];
}

export function FinanceBooksPage({ initialLedgers, transactions }: FinanceBooksPageProps) {
  const router = useRouter();
  const [ledgers, setLedgers] = useState(initialLedgers);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingLedger, setEditingLedger] = useState<SerializedFinanceLedger | null>(null);
  const [deletingLedger, setDeletingLedger] = useState<SerializedFinanceLedger | null>(null);
  
  // Form values
  const [ledgerName, setLedgerName] = useState("");
  const [ledgerColor, setLedgerColor] = useState("indigo");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Filter ledgers
  const filteredLedgers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return ledgers.filter((ledger) => ledger.name.toLowerCase().includes(query));
  }, [searchQuery, ledgers]);

  // Compute transaction counts and net balance for each ledger
  const ledgerStats = useMemo(() => {
    const stats: Record<string, { count: number; balance: number }> = {};
    
    // Initialize stats
    ledgers.forEach((ledger) => {
      stats[ledger.id] = { count: 0, balance: 0 };
    });

    transactions.forEach((t) => {
      // Legacy transactions without ledgerId are assigned to the first ledger (default)
      const ledgerId = t.ledgerId || (ledgers[0]?.id ?? "");
      if (stats[ledgerId]) {
        stats[ledgerId].count += 1;
        const amount = Number(t.amount);
        stats[ledgerId].balance += t.type === "INCOME" ? amount : -amount;
      }
    });

    return stats;
  }, [transactions, ledgers]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!ledgerName.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/finance/ledgers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: ledgerName, color: ledgerColor })
      });
      const data = (await response.json()) as { ledger?: SerializedFinanceLedger; error?: string };

      if (!response.ok || !data.ledger) {
        throw new Error(data.error || "Could not create book.");
      }

      setLedgers((current) => [...current, data.ledger!].sort((a, b) => a.name.localeCompare(b.name)));
      setShowCreateModal(false);
      setLedgerName("");
      setLedgerColor("indigo");
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingLedger || !ledgerName.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/finance/ledgers/${editingLedger.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: ledgerName, color: ledgerColor })
      });
      const data = (await response.json()) as { ledger?: SerializedFinanceLedger; error?: string };

      if (!response.ok || !data.ledger) {
        throw new Error(data.error || "Could not update book.");
      }

      setLedgers((current) =>
        current.map((l) => (l.id === editingLedger.id ? data.ledger! : l)).sort((a, b) => a.name.localeCompare(b.name))
      );
      setEditingLedger(null);
      setLedgerName("");
      setLedgerColor("indigo");
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!deletingLedger) return;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/finance/ledgers/${deletingLedger.id}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error || "Could not delete book.");
      }

      setLedgers((current) => current.filter((l) => l.id !== deletingLedger.id));
      setDeletingLedger(null);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setLedgerName("");
    setLedgerColor("indigo");
    setError(null);
    setShowCreateModal(true);
  }

  function openEdit(ledger: SerializedFinanceLedger) {
    setEditingLedger(ledger);
    setLedgerName(ledger.name);
    setLedgerColor(ledger.color || "indigo");
    setError(null);
  }

  return (
    <div className="flex flex-col gap-5 py-4">
      {/* Header Panel */}
      <section className="lofi-panel rounded-2xl p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-dusk-amber">Accounting Finance</p>
            <h1 className="mt-2 text-3xl font-semibold text-stone-100 sm:text-4xl">Finance Books</h1>
            <p className="mt-2 text-sm leading-6 text-stone-400">
              เลือกสมุดบัญชีเพื่อจดบันทึกรายรับ-รายจ่าย คุมงบประมาณ หรือจัดการเงินแยกตามโครงการ
            </p>
          </div>
          <Button type="button" onClick={openCreate} className="h-11">
            <Plus className="h-5 w-5 mr-1" />
            สร้างเล่มใหม่
          </Button>
        </div>
      </section>

      {/* Filter and Search */}
      <section className="lofi-panel rounded-lg p-4 flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
          <Input
            className="pl-9"
            placeholder="ค้นหาชื่อสมุดบัญชี..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </section>

      {/* Grid of books */}
      {filteredLedgers.length === 0 ? (
        <FinanceEmptyState
          icon={BookOpen}
          title="ไม่พบสมุดบัญชีที่ค้นหา"
          description="สร้างสมุดบัญชีแยกตามประเภทการใช้งาน เช่น บัญชีส่วนตัว รายจ่ายบริษัท หรือทริปท่องเที่ยว"
          actionLabel="สร้างสมุดบัญชีเล่มแรก"
          onAction={openCreate}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredLedgers.map((ledger) => {
            const stats = ledgerStats[ledger.id] || { count: 0, balance: 0 };
            const colorClass = 
              ledger.color === "emerald" ? "border-emerald-500/20 bg-emerald-500/5 hover:border-emerald-500/40" :
              ledger.color === "rose" ? "border-rose-500/20 bg-rose-500/5 hover:border-rose-500/40" :
              ledger.color === "amber" ? "border-amber-500/20 bg-amber-500/5 hover:border-amber-500/40" :
              "border-dusk-lavender/20 bg-dusk-lavender/5 hover:border-dusk-lavender/40";
            
            const badgeClass =
              ledger.color === "emerald" ? "bg-emerald-500/10 text-emerald-300" :
              ledger.color === "rose" ? "bg-rose-500/10 text-rose-300" :
              ledger.color === "amber" ? "bg-amber-500/10 text-amber-300" :
              "bg-dusk-lavender/10 text-dusk-lavender";

            return (
              <article
                key={ledger.id}
                className={`lofi-panel rounded-xl p-5 flex flex-col justify-between gap-4 border transition-all cursor-pointer active:scale-[0.99] transition-transform ${colorClass}`}
                onClick={() => router.push(`/finance?ledgerId=${ledger.id}`)}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className={`rounded-lg px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${badgeClass}`}>
                      Book
                    </span>
                    
                    {/* Action buttons */}
                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => openEdit(ledger)}
                        className="rounded p-1 text-stone-400 hover:bg-white/10 hover:text-stone-100 transition-all active:scale-[0.9] transition-transform"
                        title="แก้ไขข้อมูลเล่ม"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingLedger(ledger)}
                        className="rounded p-1 text-stone-400 hover:bg-red-500/15 hover:text-red-300 transition-all active:scale-[0.9] transition-transform"
                        title="ลบเล่มบัญชี"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  
                  <h3 className="mt-3 text-lg font-semibold text-stone-100 truncate">{ledger.name}</h3>
                  <p className="mt-1 text-xs text-stone-500">
                    มีรายการบันทึก {stats.count} รายการ
                  </p>
                </div>

                <div className="flex items-end justify-between border-t border-white/5 pt-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-stone-500">ยอดคงเหลือสุทธิ</p>
                    <p className={`mt-1 font-bold ${stats.balance >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                      {stats.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })} THB
                    </p>
                  </div>
                  <span className="flex items-center gap-1 text-xs text-dusk-lavender font-medium hover:underline">
                    เปิดสมุด <BookOpen className="h-3.5 w-3.5" />
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Modal - Create/Edit */}
      {(showCreateModal || editingLedger) && (
        <div className="fixed inset-0 z-[200] grid place-items-center bg-ink-950/80 px-4 backdrop-blur-sm">
          <form
            onSubmit={(e) => {
              void (editingLedger ? handleEdit(e) : handleCreate(e));
            }}
            className="lofi-panel w-full max-w-md rounded-lg p-5"
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-dusk-amber">
                  {editingLedger ? "Edit Book" : "New Book"}
                </p>
                <h3 className="text-xl font-semibold text-stone-100">
                  {editingLedger ? "แก้ไขสมุดบัญชี" : "สร้างสมุดบัญชีใหม่"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingLedger(null);
                }}
                className="rounded-md p-1.5 text-stone-400 hover:bg-white/10 hover:text-stone-100"
                disabled={loading}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {error && (
              <p className="mb-3 rounded bg-red-500/10 border border-red-500/20 p-2.5 text-xs text-red-200">
                {error}
              </p>
            )}

            <div className="grid gap-4">
              <label className="grid gap-1.5">
                <span className="text-xs font-medium text-stone-400">ชื่อสมุดบัญชี</span>
                <Input
                  placeholder="เช่น บัญชีส่วนตัว, กองกลางออฟฟิศ, เที่ยวเชียงใหม่"
                  value={ledgerName}
                  onChange={(e) => setLedgerName(e.target.value)}
                  required
                  disabled={loading}
                  autoFocus
                />
              </label>

              <label className="grid gap-1.5">
                <span className="text-xs font-medium text-stone-400">ป้ายสีกำกับ (Color Theme)</span>
                <select
                  value={ledgerColor}
                  onChange={(e) => setLedgerColor(e.target.value)}
                  className="h-11 rounded-md border border-white/10 bg-ink-950/60 px-3 text-sm text-stone-100 outline-none focus:border-dusk-lavender/70"
                  disabled={loading}
                >
                  <option value="indigo">Indigo (สีม่วงคราม)</option>
                  <option value="emerald">Emerald (สีเขียวมรกต)</option>
                  <option value="rose">Rose (สีชมพูกุหลาบ)</option>
                  <option value="amber">Amber (สีส้มอำพัน)</option>
                </select>
              </label>

              <div className="flex justify-end gap-2 mt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingLedger(null);
                  }}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Saving..." : editingLedger ? "Save Changes" : "Create Book"}
                </Button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Modal - Confirm Delete */}
      {deletingLedger && (
        <div className="fixed inset-0 z-[200] grid place-items-center bg-ink-950/80 px-4 backdrop-blur-sm">
          <div className="lofi-panel w-full max-w-md rounded-lg p-5">
            <h3 className="text-xl font-bold text-stone-100">ยืนยันการลบสมุดบัญชี?</h3>
            <p className="mt-2 text-sm text-stone-400 leading-normal">
              คุณกำลังลบสมุดบัญชี <strong className="text-red-300">&quot;{deletingLedger.name}&quot;</strong>
              <br />
              การลบเล่มนี้จะ**ลบรายการธุรกรรมการเงิน รายจ่ายประจำ งบประมาณ ทั้งหมด** ที่เชื่อมกับเล่มนี้ด้วยโดยถาวรและไม่สามารถกู้คืนได้!
            </p>

            {error && (
              <p className="mt-3 rounded bg-red-500/10 border border-red-500/20 p-2.5 text-xs text-red-200">
                {error}
              </p>
            )}

            <div className="mt-5 flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setDeletingLedger(null)}
                disabled={loading}
              >
                ยกเลิก
              </Button>
              <Button
                type="button"
                className="bg-red-500 hover:bg-red-600 text-white active:scale-[0.98] transition-transform"
                onClick={() => {
                  void handleDelete();
                }}
                disabled={loading}
              >
                {loading ? "Deleting..." : "ใช่, ฉันต้องการลบ"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
