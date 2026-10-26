"use client";

import { useState, useEffect, type FormEvent, type ChangeEvent } from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, CornerDownLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface AdminPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
  itemLabel?: string;
  className?: string;
}

export function AdminPagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize = 20,
  onPageChange,
  isLoading = false,
  itemLabel = "items",
  className
}: AdminPaginationProps) {
  const [jumpInput, setJumpInput] = useState<string>(String(currentPage));

  // Sync input value when currentPage changes from external navigation
  useEffect(() => {
    setJumpInput(String(currentPage));
  }, [currentPage]);

  const safeTotalPages = Math.max(1, totalPages);
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  function handleJumpSubmit(e?: FormEvent) {
    e?.preventDefault();
    const parsed = parseInt(jumpInput.trim(), 10);
    if (!Number.isNaN(parsed)) {
      const clamped = Math.max(1, Math.min(parsed, safeTotalPages));
      setJumpInput(String(clamped));
      if (clamped !== currentPage) {
        onPageChange(clamped);
      }
    } else {
      setJumpInput(String(currentPage));
    }
  }

  function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
    setJumpInput(e.target.value);
  }

  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-stone-200/80 bg-stone-50/60 px-4 py-3 dark:border-white/10 dark:bg-white/[0.015]",
        className
      )}
    >
      {/* Summary Description */}
      <div className="font-mono text-xs text-stone-500 dark:text-stone-400">
        {totalItems > 0 ? (
          <>
            Showing{" "}
            <span className="font-bold text-stone-800 dark:text-stone-200">
              {startItem}–{endItem}
            </span>{" "}
            of{" "}
            <span className="font-bold text-stone-800 dark:text-stone-200">
              {totalItems.toLocaleString()}
            </span>{" "}
            {itemLabel}
          </>
        ) : (
          <>0 {itemLabel} found</>
        )}
      </div>

      {/* Navigation & Direct Numeric Page Jump Input */}
      <div className="flex flex-wrap items-center gap-2">
        {/* First & Previous Page Buttons */}
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onPageChange(1)}
            disabled={currentPage <= 1 || isLoading}
            className="h-8 w-8 p-0"
            title="First Page"
            aria-label="First page"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1 || isLoading}
            className="h-8 px-2 text-xs"
            title="Previous Page"
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4 sm:mr-1" />
            <span className="hidden sm:inline">Prev</span>
          </Button>
        </div>

        {/* Direct Page Jump Numeric Input Box */}
        <form onSubmit={handleJumpSubmit} className="flex items-center gap-1.5 font-mono text-xs">
          <span className="text-stone-500 dark:text-stone-400 select-none">Page</span>
          <div className="relative inline-flex items-center">
            <input
              type="number"
              min={1}
              max={safeTotalPages}
              value={jumpInput}
              onChange={handleInputChange}
              onBlur={() => handleJumpSubmit()}
              disabled={isLoading || safeTotalPages <= 1}
              className="h-8 w-14 rounded-lg border border-stone-200 bg-white px-2 text-center font-mono text-xs font-bold text-stone-900 shadow-2xs transition focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50 dark:border-white/15 dark:bg-white/5 dark:text-stone-100"
              title={`Enter page number (1-${safeTotalPages}) and press Enter`}
              aria-label="Go to page number"
            />
          </div>
          <span className="text-stone-500 dark:text-stone-400 select-none">
            of <span className="font-bold text-stone-800 dark:text-stone-200">{safeTotalPages}</span>
          </span>
          <Button
            type="submit"
            variant="ghost"
            size="sm"
            disabled={isLoading || safeTotalPages <= 1 || jumpInput === String(currentPage)}
            className="h-8 px-2 text-[11px] font-mono text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
            title="Jump to entered page"
          >
            <CornerDownLeft className="h-3 w-3" />
            <span className="hidden md:inline ml-1">Go</span>
          </Button>
        </form>

        {/* Next & Last Page Buttons */}
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= safeTotalPages || isLoading}
            className="h-8 px-2 text-xs"
            title="Next Page"
            aria-label="Next page"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="h-4 w-4 sm:ml-1" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onPageChange(safeTotalPages)}
            disabled={currentPage >= safeTotalPages || isLoading}
            className="h-8 w-8 p-0"
            title="Last Page"
            aria-label="Last page"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
