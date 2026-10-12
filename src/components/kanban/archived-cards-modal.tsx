"use client";

import { useEffect, useMemo, useState } from "react";
import { Archive, ArrowUpRight, Clock, Loader2, RotateCcw, Search, Trash2, X } from "lucide-react";

import { AppModal } from "@/components/ui/app-modal";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { useToast } from "@/components/ui/toast";
import type { Card } from "@/types/kanban";
import { cn } from "@/lib/utils";

interface ArchivedCardsModalProps {
  open: boolean;
  onClose: () => void;
  boardId: string;
  onRestoreCard?: (card: Card) => void;
}

export function ArchivedCardsModal({
  open,
  onClose,
  boardId,
  onRestoreCard
}: ArchivedCardsModalProps) {
  const [cards, setCards] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [cardToDelete, setCardToDelete] = useState<Card | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!open) return;

    let isMounted = true;
    setIsLoading(true);

    fetch(`/api/boards/${boardId}/archived`)
      .then((res) => res.json())
      .then((data: { cards?: Card[] }) => {
        if (isMounted) {
          setCards(data.cards || []);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error("Failed to load archived cards:", err);
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [open, boardId]);

  const filteredCards = useMemo(() => {
    if (!searchQuery.trim()) return cards;
    const query = searchQuery.toLowerCase();
    return cards.filter(
      (c) =>
        c.title.toLowerCase().includes(query) ||
        (c.description && c.description.toLowerCase().includes(query))
    );
  }, [cards, searchQuery]);

  const handleRestore = async (card: Card) => {
    setRestoringId(card.id);
    try {
      const res = await fetch(`/api/cards/${card.id}/restore`, {
        method: "POST"
      });
      const data = await res.json();
      if (res.ok && data.card) {
        setCards((prev) => prev.filter((c) => c.id !== card.id));
        onRestoreCard?.(data.card);
        toast({ message: `Restored "${card.title}" to board.`, type: "success" });
      } else {
        toast({ message: data.error || "Failed to restore card.", type: "error" });
      }
    } catch {
      toast({ message: "Network error restoring card.", type: "error" });
    } finally {
      setRestoringId(null);
    }
  };

  const handleConfirmPermanentDelete = async () => {
    if (!cardToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/cards?cardId=${cardToDelete.id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setCards((prev) => prev.filter((c) => c.id !== cardToDelete.id));
        toast({ message: `Permanently deleted "${cardToDelete.title}".`, type: "success" });
        setCardToDelete(null);
      } else {
        const data = await res.json().catch(() => ({}));
        toast({ message: data.error || "Failed to delete card.", type: "error" });
      }
    } catch {
      toast({ message: "Network error deleting card.", type: "error" });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <AppModal
        open={open}
        onClose={onClose}
        contentClassName="max-w-2xl w-full mx-auto overflow-hidden rounded-2xl border border-stone-200/80 bg-white/98 text-stone-900 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-[#0e1025] dark:text-stone-100"
        labelledBy="archived-cards-modal-title"
      >
        <div className="flex h-full max-h-[85vh] flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-stone-200/70 p-5 dark:border-white/10">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-600 dark:border-dusk-lavender/30 dark:bg-dusk-lavender/20 dark:text-dusk-lavender">
                <Archive className="h-5 w-5" />
              </div>
              <div>
                <h2
                  id="archived-cards-modal-title"
                  className="text-base font-semibold text-stone-900 dark:text-stone-100"
                >
                  Archived Cards
                </h2>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Cards removed from the board are safely preserved here.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close archived cards modal"
              className="grid h-8 w-8 place-items-center rounded-lg text-stone-400 transition hover:bg-stone-100 hover:text-stone-600 dark:text-stone-500 dark:hover:bg-white/10 dark:hover:text-stone-200 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="border-b border-stone-200/60 p-3.5 dark:border-white/5">
            <div className="relative flex items-center">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
              <input
                type="text"
                placeholder="Search archived cards..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 w-full rounded-xl border border-stone-200/90 bg-stone-50 pl-9 pr-8 text-xs font-medium text-stone-900 placeholder:text-stone-400 shadow-xs outline-none transition focus:border-indigo-500 focus:bg-white dark:border-white/10 dark:bg-white/[0.04] dark:text-stone-100 dark:placeholder:text-stone-500 dark:focus:border-dusk-lavender/50 dark:focus:bg-white/10"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Card List */}
          <div className="scrollbar-soft flex-1 overflow-y-auto p-4 space-y-2.5">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16 text-stone-400">
                <Loader2 className="h-7 w-7 animate-spin text-indigo-500 dark:text-dusk-lavender" />
                <p className="mt-3 text-xs">Loading archived cards...</p>
              </div>
            ) : filteredCards.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-stone-200/80 py-14 text-center dark:border-white/10">
                <div className="grid h-12 w-12 place-items-center rounded-full bg-stone-100 text-stone-400 dark:bg-white/[0.04] dark:text-stone-500">
                  <Archive className="h-6 w-6" />
                </div>
                <h4 className="mt-3 text-sm font-semibold text-stone-700 dark:text-stone-300">
                  {searchQuery ? "No matching archived cards" : "No archived cards"}
                </h4>
                <p className="mt-1 max-w-xs text-xs text-stone-500 dark:text-stone-400">
                  {searchQuery
                    ? "Try a different search query."
                    : "Archived cards are kept here and can be restored back to the board at any time."}
                </p>
              </div>
            ) : (
              filteredCards.map((card) => {
                const isRestoring = restoringId === card.id;
                const formattedArchivedDate = card.archivedAt
                  ? new Date(card.archivedAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    })
                  : "Recently";

                return (
                  <div
                    key={card.id}
                    className="group flex items-center justify-between gap-3 rounded-xl border border-stone-200/80 bg-white p-3.5 shadow-xs transition hover:border-indigo-300/70 hover:shadow-sm dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-white/20"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="truncate text-sm font-semibold text-stone-900 dark:text-stone-100">
                          {card.title}
                        </h4>
                        <span className="shrink-0 rounded-md border border-stone-200/70 bg-stone-100 px-1.5 py-0.5 text-[10px] font-medium uppercase text-stone-600 dark:border-white/10 dark:bg-white/[0.05] dark:text-stone-400">
                          {card.status}
                        </span>
                      </div>
                      {card.description && (
                        <p className="mt-1 line-clamp-1 text-xs text-stone-500 dark:text-stone-400">
                          {card.description}
                        </p>
                      )}
                      <div className="mt-1.5 flex items-center gap-2 text-[11px] text-stone-400 dark:text-stone-500">
                        <Clock className="h-3 w-3" />
                        <span>Archived: {formattedArchivedDate}</span>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-1.5">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        disabled={isRestoring}
                        onClick={() => handleRestore(card)}
                        className="h-8 gap-1.5 text-xs font-semibold"
                      >
                        {isRestoring ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <RotateCcw className="h-3.5 w-3.5 text-teal-600 dark:text-dusk-cyan" />
                        )}
                        <span>Restore</span>
                      </Button>

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setCardToDelete(card)}
                        className="h-8 w-8 p-0 text-stone-400 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30 dark:hover:text-rose-400"
                        title="Delete permanently"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-stone-200/70 p-4 text-xs text-stone-500 dark:border-white/10 dark:text-stone-400">
            <span>{cards.length} card{cards.length === 1 ? "" : "s"} archived</span>
            <Button type="button" variant="ghost" onClick={onClose} className="cursor-pointer">
              Close
            </Button>
          </div>
        </div>
      </AppModal>

      <ConfirmModal
        open={Boolean(cardToDelete)}
        title="Delete Card Permanently"
        message={`Are you sure you want to permanently delete "${cardToDelete?.title}"? This cannot be undone.`}
        confirmLabel="Delete Permanently"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleConfirmPermanentDelete}
        onClose={() => setCardToDelete(null)}
      />
    </>
  );
}
